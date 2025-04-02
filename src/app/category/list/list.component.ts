import { Component, OnInit, ViewChild } from '@angular/core';
import { ColumnMode, SelectionType } from '@swimlane/ngx-datatable';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { ApiService } from 'src/app/services/api.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TranslocoService } from '@ngneat/transloco';
import { AuthService } from 'src/app/services/auth/auth.service';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { HeaderService } from 'src/app/services/header.service';
// import { Fileupload } from "blueimp-file-upload/js/jquery.fileupload";
import { MatDialog } from '@angular/material/dialog';
import { DeleteDialogComponent } from 'src/app/shared/components/delete-dialog/delete-dialog.component';
import { EditComponent } from '../edit/edit.component';
import { CommonService } from 'src/app/services/common.service';


declare var $: any;
declare var bootstrap: any;

@Component({
    selector: 'app-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.css']
})
export class ListComponent {

    @ViewChild(DatatableComponent, { static: true }) table!: DatatableComponent;
  @ViewChild(EditComponent, {static : true}) addEditComponent : EditComponent | undefined;

    row: any = {};
    filteredData: any;
    rows: any = [];
    addedit: any = [];
    categoryTypeList:any=[]
    selectedValue: any =''

    columnMode = ColumnMode;
    filteredDataCategoryList: any = [];
    seacrinput: boolean = false;
    selected: any = [];
    seacrinputInner: boolean = false;
    filterData: any = [];
    page: any = {
        size: 0,
        totalElements: 0,
        totalPages: 0,
        pageNumber: 0,
        startOffset: 0,
        filterKeyWord: '',
        userId: '',
    };


    categoryList: any = [];
    constructor(
        private apiService: ApiService,
        private toastr: ToastrService,
        private transloco: TranslocoService,
        private route: Router,
        private authService: AuthService,
        private http: HttpClient,
        private headerService: HeaderService,
        private dialog: MatDialog,
        private commonService: CommonService,
        private translocoservice: TranslocoService
    ) {

    }

    ngOnInit(): void {
      this.getCategoryType();
      this.headerService.setTitle({ breadcrumb: 'Admin > Category' });
    }
    getCategories(type:any){
        this.apiService.post('api/data-retrieval/category/get-category', {type}).subscribe((res:any)=>{
            this.rows = res.data;
            this.categoryList = res.data;
            this.filteredData = res.data;
            this.filteredDataCategoryList = res.data;
        })

      }
      getCategoryType(){
        this.apiService.getAll('api/data-retrieval/category/get-category-type').subscribe((res:any)=>{
          if(res.data){
           let data = JSON.parse(res.data);
           this.categoryTypeList = Object.entries(data).map(([key, value]) => ({
             value: key,
             key: value
            }));
            this.selectedValue = this.categoryTypeList[0].value;
            this.getCategories(this.selectedValue);
          }
        })
    }

    changePageSize(): any {
        let newpPageSize: any = $('#mySelectId').val();
        this.table.limit = parseInt(newpPageSize);
        this.table.recalculate();
        this.page.size = Number(newpPageSize);
        if (this.page.size > this.page.totalElements) {
            this.page.size = this.page.totalElements;
        }

        this.setPage({ offset: 0 });
    }

    openForm(rowData:any){
        console.log('openForm',rowData)
        if(rowData !== undefined){
        //   this.showEdit = true;
          if (this.addEditComponent) {
          this.addEditComponent.showForm(rowData);
        }
        }else{
        //   this.showEdit = false;
          if (this.addEditComponent) {
          this.addEditComponent.showForm(rowData);
        }
        }
      }

      deleteData(id:any){
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
            this.apiService.post(`api/data-import/category/delete-category`, payload).subscribe((response: any) => {
              if (response.status) {
                this.setPage({ offset: 0 })
                this.toastr.success(response.message)
              } else{
                this.toastr.error(response.message)
              }
            });
          }
        });
      };

    setPage(pageInfo: any) {
      this.getCategories(this.selectedValue);
        // try {
        //     $('#loaders').fadeIn();
        //     $('.loaders ol li').css('display', 'block');

        //     this.rows = [];
        //     this.page.pageNumber = pageInfo.offset;
        //     const start = this.page.pageNumber * this.page.size;
        //     const end = Math.min(
        //         start + Number(this.page.size),
        //         this.page.totalElements
        //     );
        //     this.page.startOffset = start;
        //     this.page.endOffset = end;
        //     if (this.page.size == 0) {
        //         this.page.size = 10;
        //     }

        //     this.apiService
        //         .post('api/data-retrieval/category-master/get-list', {
        //             key: this.selectedValue,
        //         })
        //         .subscribe((response: any) => {
        //             this.page.totalElements = response?.count;
        //             this.page.totalPages = response?.totalPages;
        //             this.rows = response?.data;
        //             this.filteredData = response.data;
        //         });

        //     $('#loaders').fadeOut();
        //     $('.loaders ol li').fadeOut();

        //     setTimeout(() => {
        //         $('.page-count').html(
        //             'Showing ' + this.page.size + ' of ' + this.page.totalElements
        //         );
        //     }, 1000);
        // } catch (error) {
        //     console.log('response', error);
        // }
    }
    ncSearchToggle: any = false
    ncSearch() {
        this.seacrinputInner = !this.seacrinputInner;
        if (!this.seacrinputInner) {
            $('.seacrinputInner').val('');
            this.clearSearch();
        }
    }
    clearAllSearch() {
        this.rows = this.filterData;
        this.table.offset = 0;
    }
    searchBar() {
        this.seacrinput = !this.seacrinput;
        if (!this.seacrinput) {
            $('.seacrinput').val('');
            this.clearSearch();
        }
    }



    updateFilter(event: any) {
        const val = event.target.value.toLowerCase();
        const temp = this.filterData.filter(function (d: any) {
          return Object.keys(d).some(function (key) {
            return d[key]?.toString()?.toLowerCase()?.indexOf(val) !== -1 || !val;
          });
        });
        this.rows = temp;
      }

    clearSearch() {
        this.rows = this.filteredData;
        this.table.offset = 0;
    }

    updateFilterList(event: any) {
        const val = event.target.value.toLowerCase();
        const temp = this.filteredDataCategoryList.filter(function (d: any) {
            return Object.keys(d).some(function (key) {
                return d[key].toString().toLowerCase().indexOf(val) !== -1 || !val;
            });
        });
        this.categoryList = temp;
    }

    clearSearchList() {
        this.categoryList = this.filteredDataCategoryList;
    }
    handleMasterCategory(key: any) {
      this.selectedValue=key;
      this.getCategories(this.selectedValue);
    }


}
