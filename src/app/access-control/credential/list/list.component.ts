import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import { ColumnMode, DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';
import { ToastrService } from 'ngx-toastr';
import { HeaderService } from '../../../services/header.service';
import { ApiService } from '../../../services/api.service';
import { DeleteDialogComponent } from 'src/app/shared/components/delete-dialog/delete-dialog.component';
import { MatDialog } from '@angular/material/dialog';

declare var bootstrap: any;
declare var $: any;
@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent {
  addActive: boolean = false;
  add: any = '';
  edit: any = '';
  isStatus:any  =1;
  deleteMsg: any;
  statusMsg: any;
  somethingError: any;
  importProgress: boolean= false;
  deleteDialogMsg: any;
Array: any;
  constructor(
    private apiService: ApiService, 
    private dialog:MatDialog,
     private headerService:HeaderService, 
     private toastr: ToastrService, 
     private translocoservice: TranslocoService
    ) { }
  row: any ={
    'row':undefined,
    // "tableData":undefined
  }
  @Input()
  rows: any = []
  columnMode = ColumnMode;
  // ======================================= NGX Datatbale Checkbox
  selected: any = [];
  seacrinput: boolean = false;
  filterData:any = []
  SelectionType = SelectionType;
  @ViewChild(DatatableComponent, { static: true }) table!: DatatableComponent;

  // ======================================= NGX Datatbale Checkbox
  openImportModal() {
    this.importProgress = false;
    
  }
  selectedHeaderArea:any='';
  ngOnInit(): void {
    this.headerService.getAllAreas().subscribe((data: any) => {
      if (data?.country_selected){
        this.selectedHeaderArea = data;
        this.getCredentialData();
      }
    })
    this.headerService.setTitle({ breadcrumb: 'Admin > Admin Users' });
  }


  getCredentialData(){
    this.apiService.post('api/data-retrieval/credential/get-credential', {payload:this.selectedHeaderArea }).subscribe((res: any) => {
      if (res.status) {
          // this.rows = res?.data.forEach((element:any) => {
          //    element.area_level1=JSON?.parse(element?.area_level1)?.map((item:any)=>item?.country_name)?.join(',');
          // });
        this.rows =res?.data?.map((element: any) => {
          return {
            ...element,
            country: JSON?.parse(element?.area_level1)?.map((item: any) => item?.country_name)?.join(','),
            // area_level1: JSON?.parse(element?.area_level1)?.map((item: any) => item?.country_name)?.join(',')
          };
        });
        
          this.filterData =this.rows;
        // this.row['tableData']=res?.data;
      } else {
        this.toastr.error(res.message);
      }
    })
  }

  
  clearSearch(){
    this.rows = this.filterData
  }

  searchBar() {
    this.seacrinput = !this.seacrinput;
  }





 

  updateFilter(event: any) {
    const val = event?.target?.value?.toLowerCase();
    const temp = this.filterData?.filter(function (d: any) {
      return (
        d?.username?.toString()?.toLowerCase()?.includes(val?.toLowerCase()) ||
        d?.email?.toLowerCase()?.includes(val?.toLowerCase()) ||
        d?.cid?.toLowerCase()?.includes(val?.toLowerCase()) ||
        d?.password?.toLowerCase()?.includes(val?.toLowerCase())
      );
    });

    // console.log(temp,"00")
    this.rows = temp;
  }


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

  
  editCrediential(row:any){
    this.row={
      'row':row,
      // "tableData": this.rows 
    };
  }

  emitData(data: any) {
    this.getCredentialData();
  }

  deleteCrediential(row:any){

    const dialog = this.dialog.open(DeleteDialogComponent, {
      width: "350px",
      data: {
        messageDialog: "Are you sure to delete?",
        delete: true,
      },
    });

    dialog.afterClosed().subscribe((selection: any) => {
      if (selection) {
        this.apiService.post('api/data-import/credential/delete', { id: row.id }).subscribe((data: any) => {
          if (data.status) {
            this.toastr.success("User deleted successfully")
          } else {
            this.toastr.success("Error during deletion")
          }
          this.getCredentialData();
        })
      }
    });




    
  }

  changeStatus(row:any){
    console.log({ status: !row.status, id: row?.id })
    this.apiService.post('api/data-import/credential/status', {status:!row.status,id:row?.id}).subscribe((data: any) => {
      if (data.status) {
        this.toastr.success(data.message)
      } else {
        this.toastr.success("Error during deletion")
      }
      this.getCredentialData(); 
    })
  }

}
