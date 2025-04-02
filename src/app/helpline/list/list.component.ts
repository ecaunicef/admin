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
import { CommonService } from 'src/app/services/common.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AddEditComponent } from '../add-edit/add-edit.component';


declare var $: any;
declare var bootstrap: any;

@Component({
    selector: 'app-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.css']
})
export class ListComponent {

    @ViewChild(DatatableComponent, { static: true }) table!: DatatableComponent;
    @ViewChild(AddEditComponent) addEditComponent: AddEditComponent | undefined;
    rows: any = [];
    addedit: any = [];
    row: any = {};
    selectedValue: any = '';
    columnMode = ColumnMode;
    filteredDataCategoryList: any = [];
    seacrinput: boolean = false;
    selected: any = [];
    seacrinputInner: boolean = false;
    filterData: any = [];
    filterForm!: FormGroup;
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
    allCountryList: any;
    selectedArea: any = {
        country: 'all'
    };
    userInfo: any;
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
        private translocoservice: TranslocoService,
        private formBuilder: FormBuilder
    ) {

    }

    emergencyOptions = [
        { value: 'yes', viewValue: 'Yes' },
        { value: 'no', viewValue: 'No' }
    ];

    checkFormValidity(): boolean {
        const values = this.filterForm.value;
        return Object.values(values).some(value => value !== null && value !== '' && value !== undefined);
      }    

    isFormValid: boolean = false;
    userAssignedAreas: any;
    ngOnInit(): void {
        this.createFilterForm();
        this.filterForm.valueChanges.subscribe(() => {
            this.isFormValid = this.checkFormValidity();
          });
        // this.getListData();
        this.headerService.getAllAreas().subscribe((res:any)=>{
            let areas:any = [];
            if(res.area){
                this.countryList = res?.area?.data.map((item:any)=>{
                    return {name: item.country_name,
                        area_code: item.country_area_code}
                })

                console.log(this.countryList)
                res?.area?.data?.forEach((item:any)=>{
                    areas.push(item.country_name);
                })

            }

            console.log("area", areas)
            this.userAssignedAreas = areas
        })
        this.getFilteredData();

        this.headerService.setTitle({ breadcrumb: 'Admin > Helpline' });
    
        this.getHelplineClassification('helpline_category');
        // this.getCountryList();
    }

    changePageSize() {
        let newpPageSize: any = $('#mySelectId').val();
        this.table.limit = parseInt(newpPageSize);
        this.table.recalculate();
    }

    setPage(pageInfo: any) {
        // this.getListData();
        this.getFilteredData()
    }
    ngAfterViewInit() {

        // $('.filter-close').click(function(){
        //   $('.filter_drop').removeClass('show')
        // });
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

    onExit() {
        $('.filter_sec').removeClass('show');
        $('.filter_drop').removeClass('show');
    }

    getListData() {
        console.log("get-list-data", this.filterForm.value)
        this.apiService.post('api/data-retrieval/helpline/get-filtered-data', this.filterForm.value).subscribe((res: any) => {
            this.rows = res.data;
            this.filterData = res.data;
        });
    }


    filteredData: any;
    updateFilter(event: any) {
        const val = event.target.value.toLowerCase();
        const temp = this.filterData.filter((d: any) => {
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

    handleDelete(id: any) {
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
                this.apiService.post(`api/data-import/helpline/delete`, payload).subscribe((response: any) => {
                    if (response.status) {
                        this.setPage({ offset: 0 })
                        this.toastr.success(response.message)
                        this.getListData()
                    } else {
                        this.toastr.error(response.message)
                    }
                });
            }
        });
    };

    createFilterForm() {
        this.filterForm = this.formBuilder.group({
            category: [''],
            area_level1: [''],
            emergency_service: ['']
        })
    }

    categoryObj:any
    getHelplineClassification(type: any) {
        this.apiService.post('api/data-retrieval/classification/all', { classificationType: type }).subscribe((res: any) => {
            this.categoryList = res.data;
            this.categoryObj=res;
        })
        

    }
    countryList: any = []

    getCountryList() {
        this.apiService.getAll('api/data-retrieval/area/get-area-level').subscribe((res: any) => {
            if (res.status) {
                this.countryList = res?.data?.filter((item:any)=> this.userAssignedAreas.includes(item.name))
            } else {
                this.toastr.error(res.message);
            }
        })
    }

    arealevel2List: any = []

    // getAreaLevel2() {
    //     const selectedPlace = this.filterForm.get('area_level1')?.value;
    //     if (selectedPlace)
    //         this.getArea(selectedPlace)
    // }
    getArea(areaCode: any) {
        this.apiService.post('api/data-retrieval/area/get-second-level-data', { areaCode }).subscribe((res: any) => {
            if (res.status) {
                this.arealevel2List = res?.data
            } else {
                this.toastr.error(res.message);
            }
        })

    }

    filterSelected: any = false
    clearFilterForm(){
        this.filterForm.reset();
        // this.closeModal();
        this.getFilteredData();
        this.filterSelected = false
        this.onExit();
    }

    getFilteredData(){
        console.log("get-filter-data",this?.filterForm?.value)
        const payload = this?.filterForm?.value;        
        this.apiService.post('api/data-retrieval/helpline/get-filtered-data', payload).subscribe((res:any)=>{
            if(res.status){
                // console.log("qqqq", this.userAssignedAreas)
                // this.rows = res.data?.filter((item:any)=> this.userAssignedAreas?.includes(item?.place));
                // console.log(this.rows)
                this.rows = res.data
                this.filterData= res.data;
            }
            // this.closeModal();
        })
        this.onExit();
    };

    ApplyFilter(){
        this.filterSelected = true
        this.getFilteredData();

    }

    openModal() {
        // const modalElement = document.getElementById('filterModal');
        // if (modalElement) {
        //     modalElement.classList.add('show');
        //     modalElement.style.display = 'block';
        // }
        // $('#filter_drop').removeClass('show');
        // $('.filter_sec').removeClass('show');
    }


    closeModal(){
        // const modalElement = document.getElementById('filterModal');
        // if (modalElement) {
        //     modalElement.classList.remove('show');
        //     modalElement.style.display = 'none';
        // }
        // $('#filter_drop').removeClass('show');
        // $('.filter_sec').removeClass('show');
    }


}
