import { Component, EventEmitter, Input, OnInit, Output, SimpleChange } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

import { HeaderService } from 'src/app/services/header.service';

import { TranslocoService } from '@ngneat/transloco';
import { RecursiveSearchPipe } from 'src/app/shared/pipes/recursive-search.pipe';
import { ApiService } from 'src/app/services/api.service';


declare var $: any;

@Component({
    selector: 'app-add-edit',
    templateUrl: './add-edit.component.html',
    styleUrls: ['./add-edit.component.css']
})
export class AddEditComponent {
    @Output('setPage') setPage: EventEmitter<any> = new EventEmitter();
    helplineForm!: FormGroup;
    add: any = 'Add';
    // show form on click
    add_form: any = false;
    titlePage: any = '';
    showEdit: boolean = false;
    edit: any = '';
    showTooltip: any;
    departments: any = [];
    countryList:any;
    categoryList:any
    userInfo: any;
    userAssignedAreas: any;

    constructor(private search: RecursiveSearchPipe, 
        private headerService: HeaderService,
        private formBuilder: FormBuilder, private translocoservice: TranslocoService, private toastr: ToastrService, private apiService: ApiService) { }
    @Output() eventList = new EventEmitter<object>();

    ngOnInit(): void {
        this.headerService.getAllAreas().subscribe((res:any)=>{
            let areas:any = [];
            if(res.area){
                this.countryList = res?.area?.data.map((item: any) => {
                    return {
                        name: item.country_name,
                        area_code: item.country_area_code
                    }
                })
                res?.area?.data?.forEach((item:any)=>{
                    areas.push(item.country_name);
                })
            }
        })
        this.createHelplineForm();
        // this.getCountryList();
        // this.getCategories();
        // this.getHelplineClassification('helpline_category');

    }


    @Input('data') set data(data: any) {
        if (data != undefined && !(Object.keys(data).length === 0)) {
            this.categoryList =data.data;
            this.classificationList = data?.data;
            this.filteredData = data.data;
            this.filteredDataClassificationList = data.data;

        }
    }

    emergencyService = [
      { value: 'yes', name: 'Yes' },
      { value: 'no', name: 'No' }
    ];

    // getCategories() {
    //     this.apiService.getAll('api/data-retrieval/category/get-all-category').subscribe((res: any) => {
    //         this.categoryList = res.data;
    //     })
    // }


    createHelplineForm() {
        this.helplineForm = this.formBuilder.group({
            id:[''],
            organization:['', [Validators.required]],
            place: ['', [Validators.required]],
            helplinenumber: ['', [
                Validators.required,
                Validators.pattern(/^\d+$/)
            ]],
            emergency_service:['',[Validators.required]],
            email: [''],
            add1: [''],
            add2: [''],
            tel1: ['', [Validators.pattern(/^\d+$/)]],
            tel2: [''],
            classification_id:['',[Validators.required]],
            website:[''],
            geolocation: [''],
            area_level1:[''],
        }, {});
    }


    showForm(rowData: any) {
        this.helplineForm.reset();
        this.add_form = !this.add_form;
        this.showTooltip = !this.showTooltip;

        if (rowData != undefined) {
            this.titlePage = 'Edit';
            this.showEdit = true;
            this.patchFormData(rowData);
            this.getAreaLevel2()
        } else {
            this.titlePage = 'Add';
            this.showEdit = false;
        }
        this.toggleOverlay();
    }

    patchFormData(rowData: any) {
        console.log(rowData)
        const { id, helplinenumber, email, add1, add2, tel1, tel2, classification_id, website, area_code, geolocation, emergency_service, area_level1, organization } = rowData;

        this.helplineForm.patchValue({
            id: id,
            place: area_code,
            helplinenumber: helplinenumber,
            email: email,
            add1: add1,
            add2: add2,
            tel1: tel1,
            tel2: tel2,
            classification_id: classification_id,
            website: website,
            geolocation: geolocation,
            emergency_service: emergency_service,
            area_level1: area_level1,
            organization: organization

        });

    }

    createHelpline() {
        this.helplineForm.patchValue({ area_level1: this.helplineForm.get('place')?.value})
        const payload = this.helplineForm.value;

        this.apiService
            .post('api/data-import/helpline/add', payload)
            .subscribe((response: any) => {
                if (response.status) {
                    this.toastr.success(response.message);
                    this.setPage.emit({ offset: 0 });
                    this.showForm('');
                } else {
                    this.toastr.error(response.message);
                }
            });
    }

    updateHelpline(){
        this.helplineForm.patchValue({ area_level1: this.helplineForm.get('place')?.value})
        const payload = this.helplineForm.value;

        this.apiService
            .post('api/data-import/helpline/update', payload).subscribe((response: any) => {
                if (response.status) {
                    this.toastr.success(response.message);
                    this.setPage.emit({ offset: 0 });
                    this.showForm('');
                } else {
                    this.toastr.error(response.message);
                }
            });

    }



    toggleOverlay() {
        $('.overlay').toggleClass('d-block');
        $('body').toggleClass('overflow-hidden');
    }



    //  ============================== country list

    // getCountryList() {
    //     this.apiService.getAll('api/data-retrieval/country/get-country').subscribe((res: any) => {
    //         if (res.status) {

    //             this.countryList = res?.data;
    //         } else {
    //             this.toastr.error(res.message);
    //         }
    //     })
    // }

    getCountryList() {
        this.apiService.getAll('api/data-retrieval/area/get-area-level').subscribe((res: any) => {
            if (res.status) {
                this.countryList = res?.data?.filter((item:any)=> this.userAssignedAreas.includes(item.name))
            } else {
                this.toastr.error(res.message);
            }
        })
    }

    rows:any=[];
    classificationList:any=[];
    filteredData:any=[];
    filteredDataClassificationList:any=[];

    getHelplineClassification(type: any) {
        this.apiService.post('api/data-retrieval/classification/all', { classificationType: type }).subscribe((res: any) => {
            this.categoryList = res.data;
            this.classificationList = res.data;
            this.filteredData = res.data;
            this.filteredDataClassificationList = res.data;
        })

    }
    arealevel2List:any=[]

    getAreaLevel2(){
        const selectedPlace = this.helplineForm.get('place')?.value;
        if(selectedPlace)
            this.getArea(selectedPlace)
    }
    getArea(areaCode:any){
        this.apiService.post('api/data-retrieval/area/get-second-level-data',{areaCode}).subscribe((res: any) => {
            if (res.status) {
                this.arealevel2List = res?.data
            } else {
                this.toastr.error(res.message);
            }
        })

    }

    onlyAllowNumbers(event: KeyboardEvent): void {
        const charCode = event.keyCode;
        if (
            charCode > 31 &&
            (charCode < 48 || charCode > 57)
        ) {
            event.preventDefault();
        }
    }




    
}
