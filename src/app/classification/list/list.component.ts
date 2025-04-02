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
import { AddEditComponent } from '../add-edit/add-edit.component';
import { CommonService } from 'src/app/services/common.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

declare var $: any;
declare var bootstrap: any;

@Component({
    selector: 'app-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.css']
})
export class ListComponent {

    @ViewChild(DatatableComponent, { static: true }) table!: DatatableComponent;
    @ViewChild(AddEditComponent, { static: true }) addEditComponent: AddEditComponent | undefined;

    row: any = {};
    filteredData: any;
    rows: any = [];
    addedit: any = [];
    categoryTypeList: any = []
    selectedValue: any = ''
    filterForm!: FormGroup;
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
        this.headerService.setTitle({ breadcrumb: 'Admin > Classification' });
    }
    getCategories(type: any) {
        this.apiService.post('api/data-retrieval/classification/all', { classificationType: type }).subscribe((res: any) => {
            this.rows = res.data;
            this.categoryList = res.data;
            this.filteredData = res.data;
            this.filteredDataCategoryList = res.data;
        })

    }
    getCategoryType() {
        this.apiService.getAll('api/data-retrieval/classification/get-classification-type').subscribe((res: any) => {
            if (res.data) {
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

    openForm(rowData: any) {
        console.log('openForm', rowData)
        if (rowData !== undefined) {
            //   this.showEdit = true;
            if (this.addEditComponent) {
                this.addEditComponent.showForm(rowData);
            }
        } else {
            //   this.showEdit = false;
            if (this.addEditComponent) {
                this.addEditComponent.showForm(rowData);
            }
        }
    }

    deleteData(id: any) {
        this.apiService.getAll(`api/data-import/classification/associated-classification/${id}`).subscribe((response: any) => {
            if (response.status) {
                const dialog = this.dialog.open(DeleteDialogComponent, {
                    width: "350px",
                    data: {
                        messageDialog: "Are you sure to delete?",
                        delete: true,
                    },
                });

                dialog.afterClosed().subscribe((selection: any) => {
                    if (selection) {
                        const payload = {
                          id: id
                        }
                        this.apiService.post(`api/data-import/classification/delete-classification`, payload).subscribe((response: any) => {
                            if (response.status) {
                                this.setPage({ offset: 0 })
                                this.toastr.success(response.message);
                            } else {
                                this.toastr.error(response.message)
                            }
                        });
                    }
                });

            } else {
                this.toastr.error(response.message);
            }
        })
    };

    setPage(pageInfo: any) {
        this.getCategories(this.selectedValue);
        
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
        const searchValue = event.target.value.toLowerCase();
    
        const filteredResults = this.filteredDataCategoryList.filter((item: any) => {
            return Object.keys(item).some((key) => {
                const fieldValue = item[key] !== null && item[key] !== undefined
                    ? item[key].toString().toLowerCase()
                    : '';
                return fieldValue.includes(searchValue);
            });
        });
    
        this.categoryList = filteredResults;
    }
    clearSearchList() {
        this.categoryList = this.filteredDataCategoryList;
    }
    handleMasterCategory(key: any) {
        this.selectedValue = key;
        this.getCategories(this.selectedValue);
        this.filteredDataCategoryList = this.rows;
        this.categoryList = this.rows;
    }
    checkFormValidity(): boolean {
        const values = this.filterForm.value;
        console.log(Object.values(values).some(value => value !== null && value !== '' && value !== undefined),"666666666")
        return Object.values(values).some(value => value !== null && value !== '' && value !== undefined);
      }

}
