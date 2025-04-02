import {
  Component,
  ViewChild,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { ColumnMode, SelectionType } from '@swimlane/ngx-datatable';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { ApiService } from 'src/app/services/api.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TranslocoService } from '@ngneat/transloco';
import { AuthService } from 'src/app/services/auth/auth.service';
import { environment } from 'src/environments/environment';
import { HeaderService } from 'src/app/services/header.service';
import { DeleteDialogComponent } from 'src/app/shared/components/delete-dialog/delete-dialog.component';
import { MatDialog } from '@angular/material/dialog';
declare var $: any;
var logInterval:any;

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css'],
})
export class ListComponent {
  editData: any = undefined;

  rows: any = [];
  ColumnMode = ColumnMode;
  page: any = {
    size: 0,
    totalElements: 0,
    totalPages: 0,
    pageNumber: 0,
    filterKeyWord: '',
  };
  filterData: any = [];
  seacrinput: boolean = false;
  temp: any = [];

  today = new Date();
  currentYear = this.today.getFullYear();
  currentMonth =
    this.today.getMonth() + 1 < 10
      ? '0' + (this.today.getMonth() + 1)
      : this.today.getMonth() + 1;
  currentDate =
    this.today.getDate() < 10
      ? '0' + this.today.getDate()
      : this.today.getDate();
  todaysDate =
    String(this.currentYear) +
    String(this.currentMonth) +
    String(this.currentDate);

  logPath: string;
  url: string = '';
  fileName: string = '';
  createdAt:any = '';
  uploadStatus: any = '';
  totalUploadCount: any = '';
  totalCount: any = 0;
  importProgress: boolean= false;
  showFileName:any = '';
  fileExist:boolean = false;
  levelList: any = [];
  updateDataANDimportData: any;
  errorData: any;
  userName: any = 'Admin';
   selectedLanguageList: any = "Geographical Area"
  logFiles: string = '';


  constructor(
    private dataService: ApiService,
    private toastr: ToastrService,
    private translocoservice: TranslocoService,
    private route: Router,
    private authService: AuthService,
    private headerService: HeaderService,
    private dialog:MatDialog
  ) {
		this.logFiles = environment.logPath;

    //production url and local url handling
    if(environment.production) {
      this.url = environment.apiUrl;
    } else {
      this.url = `${window.location.protocol}//${window.location.host}/`
    }
  

    this.logPath = environment.logPath;
  }

  @ViewChild(DatatableComponent, { static: true }) table!: DatatableComponent;

  ngOnInit() {
    this.getAreas();
    this.translocoservice.selectTranslateObject('area').subscribe((res:any) => {
      this.headerService.setTitle({ title: res.title, breadcrumb: 'Admin > Geographical Area' });
     });
  }

  getAreas(){
    this.dataService.getAll('api/data-retrieval/area/get-area-list').subscribe((res:any)=>{
      this.rows = res.data;
      this.filterData = res.data;
    })
  }

  changePageSize(newPageSize: any) {
    this.table.limit = parseInt(newPageSize, 10);
    this.table.offset = 0; // Reset to the first page
    this.table.recalculate();
}





  setPage(pageInfo: any){
    this.getAreas()
  }

  ngAfterViewInit() {
    let that = this;
    this.showFileName = '';
    var url = this.url + 'api/data-import/file-upload';
    $(document).on("change", "#fileupload_area",  (e:any) => {
      that.detectFiles(e);
      this.fileExist = true;
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

  deleteArea(row: any) {

    this.dataService.getAll(`api/data-import/area/associate-user/${row.id}`).subscribe((response: any) => {
      if(response.status){
        const dialog = this.dialog.open(DeleteDialogComponent, {
            width: "350px",
            data: {
                messageDialog: "Are you sure to delete?",
                delete: true,
            },
        });
    
        dialog.afterClosed().subscribe((selection: any) => {
            if (selection) {
                // const payload = {
                //   row: row
                // }
                this.dataService.getAll(`api/data-import/area/delete/${row.id}`).subscribe((response: any) => {
                    if (response.status) {
                        this.setPage({ offset: 0 })
                        this.toastr.success(response.message);
                      this.editData={};
                    } else {
                        this.toastr.error(response.message)
                    }
                });
            }
        });

      }else{
        this.toastr.error(response.message);
      }
    })




};


  deleteInvalidLogFile(importId:any) {
    this.importProgress = false;

    this.dataService.getAll('api/data-import/area/deleteInvalidLogFile/' + importId).subscribe((response: any) => {
      console.log(`Invalid log file Deleted`);
    })
  }

  inValidFileUploadMsg(msg:any) {
    this.toastr.error(msg);
  }

  eventFromChild(data: any) {
    if (data.status == true) {
      this.getAreas();
      $('.loaders ol li').fadeIn();

      // if (data.type == 'add') {
      //   this.getData('add');
      // } else if (data.type == 'update') {
      //   this.getData('update');
      // }
    }
  }

  // getData(val: any) {
  //   $('.loaders ol li').fadeIn();
    
  // }

  selected: any = [];
  SelectionType = SelectionType;
  onSelect(rows: any) {
    this.selected.splice(0, this.selected.length);
    this.selected.push(...rows.selected);
  }

  updateFilter(event: any) {
    const val = event?.target?.value?.toLowerCase();
    console.log("err")
    const temp = this.filterData.filter((d: any) => {
      return d.name?.toString().toLowerCase().includes(val.toLowerCase()) ||
        d.area_code?.toString().toLowerCase().includes(val.toLowerCase()) ||
        d.parent_area_code?.toString().toLowerCase().includes(val.toLowerCase()) ||
        d.status?.toString().toLowerCase().includes(val.toLowerCase()) ||
        d.level?.toString().toLowerCase().includes(val.toLowerCase()) ||
        !val;
    });

    console.log('Filtered data:', temp);
    this.rows = temp;
    // this.table.offset = 0;
    //  if(this.rows.length>25){
    //  $('.page-count').html(this.translate.instant("showing")+' '+ this.page.size +' '+this.translate.instant("of")+' '+this.rows.length);
    //  }else{

    //  $('.page-count').html(this.translate.instant("showing")+' '+ this.rows.length +' '+this.translate.instant("of")+' '+this.rows.length);
    //  }
  }

  clearSearch(){
    this.rows = this.filterData
  }



  searchBar() {
    this.seacrinput = !this.seacrinput;
  }




  

  detectFiles(event:any) {
    this.showFileName = event.target.files[0].name;
  }

  areaId: any

  selectAreaLevel:any='All';
  selectLevel(event: any){
    this.selectAreaLevel=event.value;
  }
  

  rowEdit(row:any){
    this.editData = Object.assign({}, row);
  }


  changeStatus(row:any){
    this.dataService.post('api/data-import/area/status',{rowId:row.id,status:(row.status)?0:1}).subscribe((res:any)=>{
      if(res.status){
        this.getAreas();
        this.toastr.success(res.message);
      }else{
        this.toastr.error(res.message);
      }
    });
  }


  //================================ Import and export file system ===================================//
  isFileExist:boolean = false;
  totalUpdated:any='';
  totalImported:any='';
  errorRecord:any='';

  isImportCompleted:any=false;

  chooseFile() {
      (<HTMLInputElement>document.getElementById("fileupload_language")).click();
      this.startImport();
  }


  startImport(){
      let that = this;
      this.fileName = '';
      var url = this.url + 'api/data-import/file-upload';
      $(document).on("change", "#fileupload_language", (e: any) => {
          that.detectFiles(e);
          this.isFileExist = true;
      });
      $('#fileupload_language').fileupload({
          maxChunkSize: 2000000,
          acceptFileTypes: /(\.|\/)(csv)$/i,
          url: this.url + "api/data-import/file-upload",
          replaceFileInput: false,
          dataType: "json",
          formData: {
              import_for:4,
              user_id: that.authService.getUserDetails()['data']['data']['id']

          },
          add: function (e: any, data: any) {
              $('#upload')
                  .off('click')
                  .on('click', function () {
                      that.uploadStatus = 'In process',
                          that.totalCount = '',
                          that.totalUpdated = '';
                      that.totalImported = '';
                      that.errorRecord = '';
                      that.isFileExist = false;
                      that.totalUploadCount = '',
                          that.importProgress = true;
                      data.submit();
                  });
          },
          beforeSend: function (xhr: any, data: any) {
              xhr.setRequestHeader('Accept', 'application/json');
              xhr.setRequestHeader(
                  'Authorization',
                  `Bearer ${localStorage.getItem('auth_token')}`
              );
          },

          done: function (e: any, data: any) {
              if (data._response.textStatus == 'success') {
              }
              that.fileName = data.result.name;
              clearInterval(logInterval);

              logInterval = setInterval(function () {
                  that.getImportLog('progress_' + data.result.import_id + '.txt');
              }, 3000);
          },
          error: function (jqXHR: any, textStatus: any, errorThrown: any) {
              if (errorThrown == "Bad Request") {
                  let errorMsg = jqXHR.responseJSON.message;
                  let importId = jqXHR.responseJSON.import_id;

                  // that.deleteInvalidLogFile(importId);
                  that.inValidFileUploadMsg(errorMsg);

              }
          },
          progressall: function (e: any, data: any) { },
      });
      
  }

 




  getImportLog(fileName: any) {

      var elem: any = document.getElementById("myBar");
      var widthelem: any = document.getElementById("progress_bar");
      var width = 0;

      var elem1: any = document.getElementById("myBar1");
      var widthelem1: any = document.getElementById("progress_bar1");
      var width1 = 0;

      var elem2 = document.getElementById("myBar2");
      var widthelem2 = document.getElementById("progress_bar2");
      var width2 = 0;

      let obj = this;
      this.dataService.getAll('api/data-import/uploadedFile/get_import_progress/' + fileName)
          .subscribe((response: any) => {
              // console.log("🚀 ~ file: list.component.ts:201 ~ ListComponent ~ .subscribe ~ response:", response)
              var result = response
              //Total Record

              var total = result['Total record']
              var imported = result['Import Record']
              var updated = result['Update Record']
              var error = result['Error Record']

              var totalData = +total;
              var totalUpdated = +updated
              var errorRecord = +error;
              var totalImported = +imported
              this.totalCount = totalData;
              this.totalUpdated = totalUpdated;
              this.totalImported = totalImported;
              this.errorRecord = errorRecord;
              var importData = result['Import Record'];
              var width = (importData * 100) / totalData;
              width = Math.round(width);

              var errorData = result['Error Record'];
              var width1 = (errorData * 100) / totalData;
              width1 = Math.round(width1);
              widthelem1.style.width = width1 + '%';
              elem1.innerHTML = errorData;
              var updateData = result['Update Record'];
              var width2 = (updateData * 100) / totalData;
              width2 = Math.round(width2);
              var status = result['Complete Record'];
              width = width + width2;
              widthelem.style.width = width + '%';
              elem.innerHTML = String(Number(importData) + Number(updateData));

              $(".count_imported").html(String(parseInt(importData) + parseInt(updateData)));
              if (status == '0') {
                  $(".statusFailed").hide();
                  $(".statusComplete").hide();
              } else if (status == '1') {
                  clearInterval(logInterval);
                  $(".statusFailed").hide();
                  this.uploadStatus="Completed";
                  $(".statusComplete").show();
                  this.isImportCompleted = true;
                  // this.getFileInfo()
                  $(document).on('hidden.bs.modal', '#import-popup', function () {
                      location.reload();
                  });
              } else if (status == '2') {
                  $(".statusFailed").show();
                  $(".statusComplete").hide();
              }

          })

  }

  downloadEmptyFile(){
 
      let a = document.createElement('a');
      let filepath = '';
    filepath = `assets/lib/data-template/Geographical_area_template.csv`;
      a.href = filepath;
      
    a.download = environment.prefixDownloadFile + `Geographical_area_template` + this.todaysDate + '.csv';
      document.body.appendChild(a);
      setTimeout(() => {
          a.click();
      }, 1000);
      document.body.removeChild(a);

      $('#export-popup').modal('toggle');
  };

  downloadWithData() {
    this.dataService.getAll('api/data-retrieval/area/exportData')
      .subscribe((res: any) => {
        console.log("🚀 ~ file: list.component.ts:321 ~ ListComponent ~ .subscribe ~ res:", res)
        setTimeout(() => {
          let filepath = this.logFiles + "/" + res.filepath;
          let filename = res.filepath.replace(/\.[^/.]+$/, "");
          let a = document.createElement("a");
          a.href = filepath;
          a.download = environment.prefixDownloadFile + filename + this.todaysDate + '.csv';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }, 1000);
      });

    $('#export-popup').modal('toggle');
  }


  ngViewAfterViewInit() {
      this.startImport();
  }

 
}
