import { Component, ViewChild } from '@angular/core';
import { ColumnMode, SelectionType } from '@swimlane/ngx-datatable';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { ApiService } from 'src/app/services/api.service';
import { ToastrService } from 'ngx-toastr';
import { TranslocoService } from '@ngneat/transloco';
import { HeaderService } from 'src/app/services/header.service';
import { DeleteDialogComponent } from 'src/app/shared/components/delete-dialog/delete-dialog.component';
import { MatDialog } from '@angular/material/dialog';
declare var $: any;

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css'],
})
export class ListComponent {
  filterData: any = [];
  rows: any = [];
  showEdit: boolean = false;
  page: any = {
    size: 0,
    totalElements: 0,
    totalPages: 0,
    pageNumber: 0,
    filterKeyWord: '',
  };
  editData: any = [];
  ColumnMode = ColumnMode;
  statusMsg: any;
  somethingError: any;
  deleteDialogMsg: any;
  translate: any;
  constructor(
    private dataService: ApiService,
    private toastr: ToastrService,
    private translocoservice: TranslocoService,
    private headerService: HeaderService,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.getAllGisData();
    this.translocoservice.selectTranslateObject('gis_map').subscribe((res:any) => {
      this.headerService.setTitle({title:res.title, breadcrumb: res.breadcrumb});
     });
     this.translocoservice.selectTranslateObject('common').subscribe((res:any) => {
      this.statusMsg = res.update_status_success
      this.somethingError = res.something_error
      this.deleteDialogMsg = res.delete_dialog_msg
     });
  }

  // ======================================= NGX Datatable Checkbox
  selected: any = [];
  SelectionType = SelectionType;
  onSelect(rows: any) {
    console.log('Select Event', rows.selected, this.selected);

    this.selected.splice(0, this.selected.length);
    this.selected.push(...rows.selected);
  }
  // ======================================= NGX Datatable Checkbox
  // ======================================= NGX Datatable Search
  @ViewChild(DatatableComponent, { static: true }) table!: DatatableComponent;
  temp: any = [...this.rows];



  
  updateFilter(event: any) {
    const val = event.target.value.toLowerCase();
    const temp = this.filterData.filter(function (d: any) {
      return Object.keys(d).some(function (key) {
        return d[key].toString().toLowerCase().indexOf(val) !== -1 || !val;
      });
    });
    this.rows = temp;
  }

  seacrinput = false;
  searchBar() {
    this.seacrinput = !this.seacrinput;
  }

  clearAllSearch(){
    this.rows = []
    this.rows = this.rowsForFilter
  }
  // ======================================= NGX Datatable Search

  rowsForFilter:any=[]
  getAllGisData() {
    // alert('this is form gis Data')
    this.dataService
      .getAll('api/data-retrieval/gisData/list')
      .subscribe((res: any) => {
        this.rows = res.data;
        this.rowsForFilter = res.data
        this.page.totalElements = res.data.length;
        this.filterData = [...res.data];
        if (this.page.size > res.data.length) {
          this.page.size = res.data.length;
        }
      });
  }

  changePageSize() {
    let newpPageSize: any = $("#mySelectId").val();
    this.table.limit = parseInt(newpPageSize);
    this.table.recalculate();
  }

  deleteRow(id: any) {
    let dataToSend = {
      id: id,
    };
     const dialog = this.dialog.open(DeleteDialogComponent, {
      width: "350px",
      data: {
        messageDialog: this.deleteDialogMsg,
        delete: true,
      },
    });

    dialog.afterClosed().subscribe((selection) => {
      if (selection) {
        // this.validationError = [];
    this.dataService
      .post('api/data-import/manage-gis/delete-gis', dataToSend)
      .subscribe((resp: any) => {
        // console.log("response", resp);
        if (resp.success == false) {
          // this.validationError = resp.error;
          // this.dbError = true;
          this.toastr.error(this.somethingError)
        } else {
          // this.dbError = false;
          this.translocoservice.selectTranslateObject('gis_deleted_successfully').subscribe(res=>{
            this.toastr.success(res);
          })
          
          //function to get the list of resorces after adding a resource
          this.getAllGisData();
        }
      });
    } else {
        // User clicked 'Cancel' or clicked outside the dialog
      }
    }); 
  }

  eventFromChild(data: any) {
    // console.log('data-- ',data)
    if (data == true) {
      this.getAllGisData();
    }
  }

  editRow(row: any) {
    row.view = false
    this.editData = Object.assign({}, row);
  }
  viewRow(row: any) {
    row.view = true
    this.editData = Object.assign({}, row);
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
}
