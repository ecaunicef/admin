import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import { ColumnMode, DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';
import { ToastrService } from 'ngx-toastr';
import { HeaderService } from '../../../services/header.service';
import { ApiService } from '../../../services/api.service';
import { DeleteDialogComponent } from 'src/app/shared/components/delete-dialog/delete-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
declare var $: any;
@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent implements OnInit {

  maxDate:any = new Date();
  addActive: boolean = false;
  add: any = '';
  edit: any = '';
  isStatus:any  =1;
  deleteMsg: any;
  statusMsg: any;
  somethingError: any;
  importProgress: boolean= false;
  deleteDialogMsg: any;
  selectedHeaderArea:any={
    'country':'all',
    'district':'all'
  };

  viewForm: boolean = false
  rows: any = []
  row: any = undefined
  filterForm!: FormGroup;




// ======================================= NGX Datatbale Checkbox =====================================//
  selected: any = [];
  seacrinput: boolean = false;
  filterData:any = []
  columnMode = ColumnMode;
  @Input()
  SelectionType = SelectionType;
  @ViewChild(DatatableComponent, { static: true }) table!: DatatableComponent;


  // ======================================= NGX Datatbale Checkbox
  openImportModal() {
    this.importProgress = false;
    
  }

  allCountryList:any =[];

 selectAll = false;
  genderSelection:any = {
    all: false,
    Male: false,
    Female: false,
    Other: false,
  };

  // toggleSelectAll() {
    
  // }

  updateSelectAll(event:any) {
    this.selectAll = !this.selectAll;
    if(event.checked){
      this.filterForm.patchValue({
        gender:'all'
      })

    }else{
      this.filterForm.patchValue({
        gender:null
      })
    }
    this.genderSelection = {
      all: this.selectAll,
      Male: this.selectAll,
      Female: this.selectAll,
      Other: this.selectAll,
    };
  }
  updateSelect(val:any,event:any){
    let gender:any=[];
    if (val in this.genderSelection) {
      this.genderSelection[val] = !this.genderSelection[val];
      const { all, Male, Female, Other } = this.genderSelection;
      this.genderSelection.all =Male && Female && Other;
      this.selectAll =Male && Female && Other;
    } else {
      console.error(`Invalid key: ${val}`);
    }

    for (let key of Object.keys(this.genderSelection)){
      if (this.genderSelection[key]){
        gender.push(key);
      }
    }

  

    if (gender.length>0){

      this.filterForm.patchValue({
        gender: gender
      })
    }else{
      this.filterForm.patchValue({
        gender: null
      })
    }
  }

  getSelectedOptions(): string[] {
    return Object.entries(this.genderSelection)
      .filter(([key, value]) => value)
      .map(([key]) => key.charAt(0).toUpperCase() + key.slice(1));
  }
  languageOptions = [
    { code: "en", label: 'English' },
    { code: "es", label: 'Spanish' },
    { code: "fr", label: 'French' },
    { code: "nl", label: 'Dutch' }
  ];

  // languageOptions: string[] = ['English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese', 'Korean', 'Hindi'];
  selectedLanguages: string[] = [];

//===================================== lifecycle of angular start =========================//

  constructor(
    private apiService: ApiService,
    private dialog: MatDialog,
    private headerService: HeaderService,
    private toastr: ToastrService,
    private formBuilder: FormBuilder, 
    private translocoservice: TranslocoService
  ) { }
  isFormValid: boolean = false;
  ngOnInit(): void {
    this.createFilterForm();
    this.headerService.getAllAreas().subscribe((res: any) => {
        if (res?.area?.status && res?.area?.data) {
          this.allCountryList = res?.area?.data;
        }
        if (res?.district_selected && res?.country_selected){
          this.selectedHeaderArea['country'] = JSON.stringify(res?.country_selected);
          this.selectedHeaderArea['district']=JSON.stringify(res.district_selected);
          // this.getUserList();
          this.onClickFilter();
        }
    });
    this.filterForm.valueChanges.subscribe(() => {
      this.isFormValid = this.checkFormValidity();
    });
    this.headerService.setTitle({ breadcrumb: 'Mobile Data > Mobile App User' });
  }
//===================================== lifecycle of angular start =========================//


//======================================user table handle start =================================//
  // getUserList() {
  //   this.apiService.post('api/data-retrieval/users/get-user', this.selectedHeaderArea).subscribe((res: any) => {
  //     if (res.status) {
  //       this.rows= res?.data;
  //       this.filterData=res?.data;
  //     } else {
  //       this.toastr.error(res.message);
  //     }
  //   })
  // }


  updateFilter(event: any) {
    const val = event?.target?.value?.toLowerCase();
    const temp = this.filterData?.filter(function (d: any) {
      return (
        d?.age?.toString()?.toLowerCase()?.includes(val?.toLowerCase()) ||
        d?.gender?.toLowerCase()?.includes(val?.toLowerCase()) ||
        d?.language?.toLowerCase()?.includes(val?.toLowerCase()) ||
        d?.area?.ParentArea?.name?.toLowerCase()?.includes(val?.toLowerCase()) || d?.area?.name?.toLowerCase()?.includes(val?.toLowerCase())
      );
    });

    // console.log(temp,"00")
    this.rows = temp;
  }

  clearSearch(){
    this.rows = this.filterData
  }
  searchBar() {
    this.seacrinput = !this.seacrinput;
  }

getLocation(latlongt:any) {
  if (latlongt != "0") {
    const geo = JSON.parse(latlongt);
    return `https://maps.google.com/?q=${geo.latitude},${geo.longitude}`;
  } else return `https://maps.google.com/?q=0,0`
}


//======================================user table handle End =================================//




 

  
  userStatus(resObj:any){
      if (resObj.status == 1) {
        return true;
      }
      return false;
  
  }
  changePageSize() {
    let newpPageSize: any = $("#mySelectId").val();
    this.table.limit = parseInt(newpPageSize);
    this.table.recalculate();
  }

  ngAfterViewInit() {

    $('.filter-close').click(function(){
      $('.filter_drop').removeClass('show')
    });

	  // ========================================================== Search Bar outer click close
      let th = this
      $(document).click(function (event:any) {
        var searchBar = $('.searchBar');
        if (!searchBar.is(event.target) && searchBar.has(event.target).length === 0) {
            searchBar.removeClass('fullWidth');
            th.seacrinput = false;
        }
      });
    // ========================================================== Search Bar outer click close
  }

  editForm(row:any){
    this.row=row;
  }


  deletForm(row:any){

    this.apiService.post('api/data-import/users/delete',{id:row.id}).subscribe((data:any)=>{
      if(data.status){
        this.toastr.success("User deleted successfully")
      }else{
        this.toastr.success("Error during deletion")
      }
      // this.getUserList();
      this.onClickFilter();
    })

  }


  getCountryList() {
    this.apiService.getAll('api/data-retrieval/country/get-country').subscribe((res: any) => {
      if (res.status) {

        this.allCountryList = res?.data;
      } else {
        this.toastr.error(res.message);
      }
    })
  }
  createFilterForm(){
    this.filterForm = this.formBuilder.group({
      age: [''],
      gender: [''],
      // country: ['',Validators.required],
      // district:[''],
      language: [''],
      startDate: [null], // FormControl for start date
      endDate: [null],
    });
  }

  emitData(data: any) {
    if(data?.edit=='edit'){
    }
    // this.getUserList();
    this.onClickFilter();
  }

  onClickRestFilter(){
    this.filterForm.reset();
    this.selectAll = false;
    this.genderSelection= {
      all: false,
      Male: false,
      Female: false,
      Other: false,
    };
    this.onClickFilter()
    this.filterSelected = false
    this.onExit();
    // this.getUserList();
  }


  filterSelected: any = false
  onClickFilter(){
    this.apiService.post('api/data-retrieval/users/filter', { filter: this.filterForm.value, area: this.selectedHeaderArea}).subscribe((res:any)=>{
      if(res.status){
        this.rows=res.data;
        this.filterData=res.data;
      }else{
         this.toastr.error("Something went wrong");
      }
    })
    this.onExit();

  }

  onExit(){
    $('#filter_drop').removeClass('show');
    $('.filter_sec').removeClass('show');
  }


  districtList:any=[];
  onChangeCountryList(event:any){
    let value=event?.value;
    this.districtList = this.allCountryList?.find((country: any) => country?.country_id == value.country_id)?.districts;
  }

  onChangeDistrictList(event:any){
    let value=event.value;
  }

  checkFormValidity(): boolean {
    const values = this.filterForm.value;
    console.log(Object.values(values) ,Object.values(values).some(value => value !== null && value !== '' && value !== undefined),"666666666")
    return Object.values(values).some(value => value !== null && value !== '' && value !== undefined);
  }


  onApplyFilter(){
    this.onClickFilter();
    this.filterSelected=true;
  }



}
