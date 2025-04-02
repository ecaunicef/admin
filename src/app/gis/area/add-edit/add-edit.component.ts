import {
  Component,
  Output,
  EventEmitter,
  ViewChild,
  Input,
  SimpleChange,
  HostListener
} from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ColumnMode, SelectionType } from '@swimlane/ngx-datatable';
import { Router } from '@angular/router';
import { HeaderService } from '../../../services/header.service';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormGroupDirective,
  FormArray,
  AbstractControl,
} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { TranslocoService } from '@ngneat/transloco';
import { TREE_ACTIONS, KEYS, IActionMapping, ITreeOptions, TreeComponent, ITreeState, TreeModel } from '@circlon/angular-tree-component';


declare var $: any;
@Component({
  selector: 'app-add-edit',
  templateUrl: './add-edit.component.html',
  styleUrls: ['./add-edit.component.css'],
})
export class AddEditComponent {


  rows: any;
  add_form: boolean = false;
  showEdit: boolean = false;
  showTooltip: any = true;
  ColumnMode = ColumnMode;
  validationError: any = [];
  titlePage: string = 'Add';
  addAreaForm: any = FormGroup;

  areaDropdown: any = [];
  nodes: any = [];
  node: any = [];
  nodeJsonData: any;

  areaCodeList: any = [];
  filterSourceList: any = [];
  parentLevel: any = null;
  oldAreaCode: any = null;
  selected_area: any = {
    name: null,
    areaCode: null,

  }
  selectParentArea: String = "Select";
  countryList:any=[];

  parentAreaCode: any = [];
  showDropDown: boolean = false;
  options: ITreeOptions = {
    actionMapping: {
      mouse: {
        click: (tree: any, node: any) => {
          this.selectParentArea = node.data.name;
          this.showDropDown = false;
          this.parentAreaCode = node.data._id;
          this.addAreaForm.controls['parentID'].setValue(node.data._id);
        }
      },
    },
    animateExpand: true,
    animateSpeed: 30,
    animateAcceleration: 1.2,
  }


  @Output() emitAddUpdate = new EventEmitter<object>();
  nodesFilter: any;
  viewForm: boolean = false

  @Input('data') set data(data: any) {
    this.getCountryList();
    if (data != undefined && !(Object.keys(data).length === 0)) {
      this.showForm(data);
    }
  }

  constructor(
    public formBuilder: FormBuilder,
    private dataService: ApiService,
    private toastr: ToastrService,
    private transloco: TranslocoService,
    private route: Router,
    private authService: AuthService,
    private headerService: HeaderService
  ) { }

  ngAfterViewInit(){
    // var toggler = document.getElementsByClassName("caret");
    // var i;

    // for (i = 0; i < toggler.length; i++) {
    //   toggler[i].addEventListener("click", function (this: any) {
    //     this.parentElement.querySelector(".nested").classList.toggle("active");
    //     this.classList.toggle("caret-down");
    //   });
    // }

    // $(document).on('click', '.data-parent', function (this:any) { 
    //   $(this).toggleClass('rotate')
    //   $(this).next('.child').toggleClass('hide');
    // });

    // $(document).on('click', '.data-parent2', function (this:any) { 
    //   $(this).toggleClass('rotate')
    //   $(this).next('.child2').toggleClass('hide');
    // });

    $(document).on('click', '.data-parent', function (this: HTMLElement) {
      $(this).toggleClass('rotate'),
      $(this).next('.data-child').toggleClass('nested');
      // $(this).stopPropagation();
    });
  }


  ngOnInit() {
    // this.getAreaList()
    this.createForm();
    // this.getCountryList();
  }

  // areahaveChilds:any = false

  // checkAreaChilds(id:any){
  //   this.areahaveChilds = false
  //   this.dataService.post('api/data-import/area/check-area-childs',{id}).subscribe((response: any) => {
  //     this.areahaveChilds = response.chidExists
  //   })
  // }



  getCountryList() {
    this.dataService.getAll('api/data-retrieval/area/get-area-level').subscribe((res: any) => {
      if (res.status) {
        this.countryList = res?.data
        // this.headerService.setAreaList(res);
      } else {
        this.toastr.error(res.message);
      }
    })
  }






  rowId:any;
  showForm(rowData: any) {
    if(rowData.view == true){
      this.viewForm = true
    }else{
      this.viewForm = false
    }

    // this.areahaveChilds = false
    this.showEdit = false;
    this.showTooltip = false;
    this.add_form = !this.add_form;
    this.addAreaForm.reset();

    if (rowData !== '') {
      this.showEdit=true;
      this.rowId=rowData.id;
      this.addAreaForm.patchValue({
        parent_area_code:rowData.parent_area_code,
        area_code:rowData.area_code,
        name:rowData.name,
      });
    } else {
      this.transloco.selectTranslateObject('titlePageAdd').subscribe((result: any) => {
        this.titlePage = result;
      });
    }
    this.toggleOverlay();

  }

  
  createForm() {
    this.addAreaForm = this.formBuilder.group({
      parent_area_code: [''],
      area_code: ['', Validators.required],
      name: ['', Validators.required]
    }, {});

  }


  toggleOverlay() {
    // $('#areaFilter').val('');
    // $('#menu-list').find('.area_list').show();
    $('.overlay').toggleClass('d-block');
    $('body').toggleClass('overflow-hidden');

  }


  getAreaList() {
    $(".loaders ol li").fadeIn();
    // aracode => IND for India
    // this.areaDropdown = []
    // this.dataService.getAll('api/data-retrieval/data/area-list').subscribe((response: any) => {
    //   // $(".loaders ol li").fadeOut();
    //   // console.log(response.data);
    //   // response.data.forEach((element: any) => {
    //   //   this.areaDropdown.push({ 'areaName': element.name, 'areaCode': element.area_code })
    //   // })
    
    //   this.nodes = response.data;

    //   this.nodesFilter = response.data;
     

    //   this.nodeJsonData = JSON.stringify(this.nodes);
    //   this.showFilteredAreaList();
    // })

  }


  showFilteredAreaList() {
    // this.filteredArea = [];
    this.node = [];
    this.node = JSON.parse(this.nodeJsonData);
  }

  areaFilter(target:any){
  let serachText = target.value.toLowerCase();
  if (serachText.length > 0) {

      $('#menu-list').find('.area_list').hide();
      $('#menu-list').find('ul li span').each(function (idx: any, obj: any) {
          if ($(obj).text().toLowerCase().indexOf(serachText) !== -1) {
              $(obj).parentsUntil('#menu-list').not('label').css('display', 'block');
              $(obj).parent('label').css('display', 'inline-flex');
          }

      });
  } else {
      $('#menu-list').find('.area_list').show();
  }
  }

  claerSearch(){
    $('#menu-list').find('.area_list').show();
  }


  filterInputData(param: any) {
    if (param.length < 1) {
      this.filterSourceList = [];
    } else {
      this.filterSourceList = this.areaCodeList.filter((element: any) => element.toLowerCase().startsWith(param.toLowerCase()));
    }
  }

  addNewArea() {

    this.dataService.post('api/data-import/area/save', this.addAreaForm.value).subscribe((res: any)=>{
      if(res.status){
        this.toastr.success(res.message);
        this.addAreaForm.reset();
        this.showForm('');
        this.emitAddUpdate.emit({ status: true, type: 'add' })
        this.getCountryList();
      }
      else{
        this.toastr.error(res.message);

      }
    })
  }




  editSelectedArea(formVal: any) {
    this.dataService.post('api/data-import/area/update', {id:this.rowId,payload: this.addAreaForm.value}).subscribe((response: any) => {

      if (response.status == false) {
        this.validationError = response.error;
        this.toastr.error(response.message);
      }
      else {
        this.toastr.success(response.message);
        this.addAreaForm.reset();
        this.add_form = !this.add_form;
        this.emitAddUpdate.emit({ status: response.status, type: 'update' });
        this.toggleOverlay();
      }
    })
  }



  cancelParentArea() {
    this.selected_area.name = null;
    this.selected_area.areaCode = null;
    this.parentLevel = null
  }

  showHideTreeFilter(event: any) {
    if (event.target.value.length > 0) {
      $("#tree-search-close").show();
      return;
    }
    $("#tree-search-close").hide();
  }

  openDropDown() {
    if (this.showDropDown) {
      this.showDropDown = false;
    }
    else {
      this.showDropDown = true;
    }
  }

  clearSearchField() {
    $("#filter").val("");
    $("#tree-search-close").hide();
  }

  ngOnDestroy(){
    $(document).off("click", ".data-parent");
   }




  onSelectionChange(event:any){
    console.log(event?.value,"99999");
  }

}