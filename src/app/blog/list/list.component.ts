import { Component, OnInit, ViewChild } from '@angular/core';
import { ColumnMode, SelectionType } from '@swimlane/ngx-datatable';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { ApiService } from 'src/app/services/api.service';
import { ToastrService } from 'ngx-toastr';
import { TranslocoService } from '@ngneat/transloco';
// import { Fileupload } from "blueimp-file-upload/js/jquery.fileupload";
import { MatDialog } from '@angular/material/dialog';
import { DeleteDialogComponent } from 'src/app/shared/components/delete-dialog/delete-dialog.component';
import { EditComponent } from '../edit/edit.component';
import { HeaderService } from 'src/app/services/header.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

declare var $: any;
declare var bootstrap: any;

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css'],
})
export class ListComponent {
  @ViewChild(DatatableComponent, { static: true }) table!: DatatableComponent;
  @ViewChild(EditComponent) addEditComponent: EditComponent | undefined;

  rows: any = [];
  addedit: any = [];
  filterForm!: FormGroup;
  columnMode = ColumnMode;
  seacrinput: boolean = false;
  filterData: any = [];
  filteredData: any;

  categoryList: any = [];
  filterSelected:any = false
  constructor(
    private apiService: ApiService,
    private toastr: ToastrService,
    private transloco: TranslocoService,
    private dialog: MatDialog,
    private translocoservice: TranslocoService,
    private headerService: HeaderService,
    private formBuilder: FormBuilder, 

  ) {}

  allCountryList:any;
  ngOnInit(): void {
    this.getListData();
    this.getBroadcastCategory();
    this.createFilterForm();
    this.headerService.setTitle({ breadcrumb: 'Admin > Broadcast' });
    this.headerService.getAllAreas().subscribe((res: any) => {
      setTimeout(() => {
        if (res?.area?.status && res?.area?.data) {
          this.allCountryList = res?.area?.data;
        }
      },100)
    });
  }

  applyFilter(){
    console.log("sd", this.filterForm.value)
    const payload = {
      category: this.filterForm.value?.category,
      country:  (![null, ''].includes(this.filterForm.value?.country) ? [this.filterForm.value?.country] : []),
      sent_date: this.filterForm.value?.sent_date
    }
    this.apiService.post('api/data-retrieval/blog/filter',payload).subscribe((res:any)=>{
      const data = res?.data;
      this.rows = data;
      this.filterData = data;

    })
    this.filterSelected = true
    $('.filter_sec').removeClass('show');
    $('.filter_drop').removeClass('show');
  }


  resetForm(){

    this.filterForm.reset();
    $('.filter_sec').removeClass('show');
    $('.filter_drop').removeClass('show');
    this.getListData();
    this.filterSelected = false
  }

  onCloseFilterModel(){
    $('.filter_sec').removeClass('show');
  }

  createFilterForm(){
    this.filterForm = this.formBuilder.group({
      category: [''],
      country: [''],
      sent_date: this.formBuilder.group({
          start: [''],
          end: ['']
      })
    })
}

  changePageSize() {
    let newpPageSize: any = $('#mySelectId').val();
    this.table.limit = parseInt(newpPageSize);
    this.table.recalculate();
  }

  setPage(pageInfo: any) {
    this.getListData();
  }

  selectAll = false;
  genderSelection = {
    male: false,
    female: false,
    other: false,
  };

  toggleSelectAll() {
    this.selectAll = !this.selectAll;
    this.genderSelection = {
      male: this.selectAll,
      female: this.selectAll,
      other: this.selectAll,
    };
  }

  updateSelectAll() {
    const { male, female, other } = this.genderSelection;
    this.selectAll = male && female && other;
  }

  getSelectedOptions(): string[] {
    return Object.entries(this.genderSelection)
      .filter(([key, value]) => value)
      .map(([key]) => key.charAt(0).toUpperCase() + key.slice(1));
  }
  ngAfterViewInit() {

    $('.filter-close').click(function(){
      $('.filter_drop').removeClass('show')
    });
  }
  searchBar() {
    this.seacrinput = !this.seacrinput;
    if (!this.seacrinput) {
      $('.seacrinput').val('');
      this.clearSearch();
    }
  }

  clearSearch() {
    this.rows = [...this.filterData];
    this.table.offset = 0;
  }

  getListData() {
    this.apiService
      .getAll('api/data-retrieval/blog/get-all-blogs')
      .subscribe((res: any) => {
        this.rows = res.data;
        this.filterData = res.data;
      });
  }

  updateFilter(event: any) {
    const val = event?.target?.value?.toLowerCase();
    const temp = this.filterData?.filter((d: any) => {
      return Object.keys(d).some((key) => {
        const fieldValue = d[key] !== null && d[key] !== undefined ? d[key].toString().toLowerCase() : '';
        return fieldValue.indexOf(val) !== -1;
      });
    });
    this.rows = temp;
    this.table.offset = 0;
  }

  handleEdit(row: any) {
    this.addEditComponent?.showForm(row);
  }

  deleteBlog(id:any){
    console.log("deleteBlog",id);
    const dialog = this.dialog.open(DeleteDialogComponent, {
      width: "350px",
      data: {
        messageDialog: "Are you sure to delete?",
        delete: true,
      },
    });

    dialog.afterClosed().subscribe((selection: any) => {
      if (selection) {
        const payload={
          id:id
        }
        this.apiService.post(`api/data-import/blog/delete-blog`, payload).subscribe((response: any) => {
          if (response.success) {
            this.setPage({ offset: 0 })
            this.toastr.success(response.message)
          } else{
            this.toastr.error(response.message)
          }
        });
      }
    });
  };

  messageCategory:any=[];
  getBroadcastCategory(){
    this.apiService.getAll('api/data-retrieval/blog/get-broadcast-category').subscribe((res:any)=>{
      if(res.success){
        this.messageCategory = res?.data;
      }
    })
  };

  //================ Message Model =============================//
  viewMessageData:any='';
  onOpenMessageModel(row:any){
    this.viewMessageData=row;
  }


//========================= sedule for send message =============================//
  sendUser(row:any){
    let payload: any = row
    this.apiService.post(`api/data-import/blog/send-manually`, payload).subscribe((response: any) => {
      if (response.success) {
        this.setPage({ offset: 0 })
        this.toastr.success(response.message)
      } else {
        this.toastr.error(response.message)
      }
    });
  }

}
