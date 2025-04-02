import {
  Component,
  ViewChild
} from '@angular/core';
import { ColumnMode, SelectionType } from '@swimlane/ngx-datatable';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { TranslocoService } from '@ngneat/transloco';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/services/auth/auth.service';
import { DeleteDialogComponent } from 'src/app/shared/components/delete-dialog/delete-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { HeaderService } from 'src/app/services/header.service';
import { ApiService } from 'src/app/services/api.service';
declare var $: any;
var logInterval:any;

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent {
  editData: any = undefined;
  url: string = '';
  logFiles: string = '';
  contentLoaded: boolean = true;
  importProgress: boolean = false;
  showFileName: any = '';
  fileExist: boolean = false;
  fileName: string = '';
  page: any = {
    size: 0,
    totalElements: 0,
    totalPages: 0,
    pageNumber: 0,
    filterKeyWord: "",
    userId: "",
  };
  loggedUserId:any
  levelStatus: any = 2;
  dataStatus: any = 2;
  levelRequest: any = [2]
  selectedUserFrameworkCode: any = 0;
  timePeriodList: any;
  showEdit: boolean = false;
  sourceList: any;
  deleteDialogMsg: any;
  selectedItems: never[] | any;

  showProcess: any = 0;
  
  constructor(
    private transloco: TranslocoService,
    private dataService: ApiService,
    private dialog:MatDialog,
    private toastr: ToastrService,
    private authService:AuthService,
    private headerService: HeaderService,
  ) {
    this.url = environment.apiUrl;
    this.logFiles = environment.rootPath + '/logs';
    this.page.pageNumber = 0;
    this.page.size = 10;
    // this.setPage({ offset: 0 });
  }

  ngOnInit(): void {
    this.setPage({ offset: 0 });
    this.transloco.selectTranslateObject('log').subscribe((res:any) => {
      this.headerService.setTitle({title:res.title, breadcrumb: res.breadcrumb});
     });
    this.getUserInfo()
    this.getImportLogData()
  }


  getUserInfo(){
    this.loggedUserId =  this.authService.authDetails.data.id
  }

  columnMode = ColumnMode;
  rows = []

  @ViewChild(DatatableComponent, { static: true }) table!: DatatableComponent;

  // changePageSizee():any {
  //   let newpPageSize = $("#mySelectId").val();
  //   this.table.recalculate();
  //   if (this.page.size == newpPageSize) {
  //     return false;

  //   }
  //   this.page.size = newpPageSize;
  //   if (this.page.size > this.page.totalElements) {
  //     this.page.size = this.page.totalElements;
  //   }
  //   if (this.dataFrom == "filter") {
  //     this.rows = this.rows;
  //     $(".page-count").html(
  //       "Showing " +
  //       this.page.size +
  //       " of " +
  //       this.page.totalElements.toLocaleString()
  //     );
  //   } else {
  //     this.setPage({ offset: 0 });
  //   }
  // }

  changePageSize():any {
    let newpPageSize = $("#mySelectId").val();
    this.table.recalculate();
    this.page.size = Number(newpPageSize);
    if (this.page.size > this.page.totalElements) {
      this.page.size = this.page.totalElements;
    }
    if (this.dataFrom == "filter") {
      this.rows = this.rows;
      $(".page-count").html(
        "Showing " +
        this.page.size +
        " of " +
        this.page.totalElements.toLocaleString()
      );
    } else {
      this.setPage({ offset: 0 });
    }
  }

  filterData: any = [];
  updateFilter(event: any) {
    const val = event.target.value.toLowerCase();
    const temp = this.filterData.filter(function (d: any) {
      return Object.keys(d).some(function (key) {
        return d[key].toString().toLowerCase().indexOf(val) !== -1 || !val;
      });
    });
    this.rows = temp;
    this.table.offset = 0;
  }

  clearAllSearch() {
    this.rows = this.filterData;
    this.table.offset = 0;
  }

  search = ""
  seacrinput: boolean = false;
  searchBar() {
    this.search = ""
    this.seacrinput = !this.seacrinput;
  }

  getImportLogData(){
    this.dataService.getAll('api/data-retrieval/upload-info/get-log-list').subscribe((res:any)=>{
      console.log(res, "sadsadasdsadsad1234");
      this.rows = res?.data;
      this.filterData = res?.data;
    })
  }

  selected: any = [];
  SelectionType = SelectionType;
  onSelect(rows: any) {
    /* this.selectedItems = [];
    for (let i = 0; i < selected.length; i++) {
      if (typeof selected[i]._id == "undefined") {
        let getVal = $(
          ".data_" +
          selected[i].ius_id +
          "_" +
          selected[i].area_code +
          "_" +
          selected[i].time_period.start_time_period +
          "_" +
          selected[i].source_value
        ).data("dataid");

        if (typeof getVal != "undefined" && getVal != "") {
          this.selectedItems.push(getVal);
        }
      } else {
        this.selectedItems.push(selected[i]._id);
      }
    } */


    this.selected.splice(0, this.selected.length);
    this.selected.push(...rows.selected);
  
  }
  // ===========================================================

  dataFrom = "main";
  totalDataForexport: any;
  dataCountStatus = false;

  setPage(pageInfo:any) {
    
    $("#loaders").fadeIn();
    $(".loaders ol li").css("display", "block");

    // // this.getAuthDetails(); // working
    // if (this.selectedUserFrameworkCode == undefined) {
    //   this.selectedUserFrameworkCode = 0;
    // }
    this.rows = [];
    this.page.pageNumber = pageInfo.offset;
    const start = this.page.pageNumber * this.page.size;
    const end = Math.min(start + Number(this.page.size), this.page.totalElements);
    this.page.startOffset = start;
    this.page.endOffset = end;
    // console.log('setPagepage',typeof(start),typeof(this.page.totalElements),typeof(this.page.size), Math.min(start + Number(this.page.size), this.page.totalElements))
    this.page.status = this.levelRequest; // data  level status  1:Approved, 2:Pending, 3:Disapproved, 4:All
    // this.page.framework_code = this.selectedUserFrameworkCode;


    //check if entry is generated from filter modal
    if (this.dataFrom == "filter") {
      setTimeout(() => {
        $('input[name="data_value"]').val("");
        $("#loaders").fadeOut();
        $(".loaders ol li").fadeOut();
      }, 500);

      return;
    }

    if (this.page.size == 0) {
      this.page.size = 10;
    }

    
    // this.dataService
    // .getAll<any[]>("api/data-retrieval/importlog/get-log-list").subscribe((response: any) => {
    //     // console.log(response)
    //     this.totalDataForexport = response.totalData
    //     this.page.totalElements = response.totalElements;
    //     this.page.totalPages = response.totalPages;
    //     let i = 0;

    //     this.rows = response.data;
    //     this.rows = [...this.rows]
    //     this.filterData = [...response.data];
    //     if (this.page.size > this.page.totalElements) {
    //       this.page.size = this.page.totalElements;
    //     }
    //     if (this.page.totalElements > 0) {
    //       this.dataCountStatus = true;
    //     }
    //     else {
    //       this.dataCountStatus = false;
    //     }
    //   });
  }


  downloadData(rowData:any){
    let a = document.createElement("a");
    let  filepath = environment.logPath+rowData.error_file;
     a.href = filepath;
     a.download = rowData.error_file;
     document.body.appendChild(a);
     setTimeout(() => {
       a.click();
     }, 1000); 
     document.body.removeChild(a);
  }

  deleteLog(row:any) {
    const id = row.id;
    let alertMsg;
    this.transloco.selectTranslateObject('sure_deleted_msg').subscribe(res=>{
      alertMsg = res
    })
    
    const dialog = this.dialog.open(DeleteDialogComponent, {
      width: '350px',
      data: {   messageDialog: alertMsg, delete: true }
    });
    dialog.afterClosed()
      .subscribe(selection => {
        if (selection) {
          this.dataService.deleteAll('api/data-import/upload-info/delete', {id: id}).subscribe((response: any) => {
            this.toastr.success(response.message);
            this.selectedItems = [];
            this.getImportLogData();
            // this.setPage({ offset: 0 });
          })
        } else {
          this.selectedItems = [];
        }
      });

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
