import { Component, EventEmitter, Input, OnInit, Output, SimpleChange } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../../services/api.service';
import { HeaderService } from '../../../services/header.service';

import { TranslocoService } from '@ngneat/transloco';
import { RecursiveSearchPipe } from 'src/app/shared/pipes/recursive-search.pipe';

declare var $: any;

@Component({
    selector: 'app-add-edit',
    templateUrl: './add-edit.component.html',
    styleUrls: ['./add-edit.component.css']
})
export class AddEditComponent implements OnInit {
    // show form on click
    passwordBoxTypeText = false;
    add_form: any = false;
    titlePage: any = '';
    showEdit: boolean = false;
    manageUser!: FormGroup;
    add: any = '';
    edit: any = '';
    selected_area: any;
    parentLevel: any;
    showTooltip:boolean =false;
    areaDropdown: any = [];
    nodes: any;
    nodeJsonData: any;
    node: any = [];
    checkedUserArea: any = [];
    isAreaChecked: boolean = false;
    totalAreaCount: any = 0;
    addUserForm: any;
    area: any = []
    disableEmail: boolean = false;
    saveMsg: any;
    updateMsg: any;
    somethingError: any;
    allRoles: any;
    departments: any = [];
    designation: any = []
    selectedDepartments: string[] = [];
    orgDepartments: any


    selectedOptions = new FormControl([]);
    filteredOptions: string[] = [];
    searchText = '';
    orgAllRoles:any
    viewForm: boolean = false
    allCountryList:any=[];

    allStatesRoles:any = [
        {
            id:'Antigua and Barbuda',
            name:'Antigua and Barbuda'
        },
        {
            id:'Barbados',
            name:'Barbados'
        },
        {
            id:'Grenada',
            name:'Grenada'
        },
        {
            id:'Anguilla',
            name:'Anguilla'
        },
        {
            id:'Montserrat',
            name:'Montserrat'
        },
    
      ];

//======================================= lifeCycle  Start ====================================//
    constructor(
        private search: RecursiveSearchPipe, 
        private formBuilder: FormBuilder, 
        private translocoservice: TranslocoService, 
        private apiService: ApiService, 
        private toastr: ToastrService,
        private headerService: HeaderService, 
    ) { }
    @Output() eventList = new EventEmitter<object>();
    @Input() data: any;

    ngOnInit(): void {

        this.headerService.getAllAreas().subscribe((res: any) => {
            setTimeout(() => {
                if (res?.status && res?.data) {
                    this.allCountryList = res.data;
                }
            }, 100)
        });
        this.createUserForm();

        this.translocoservice.selectTranslateObject('user').subscribe((res: any) => {
            this.add = res.add
            this.edit = res.edit
            this.saveMsg = res.save_msg
            this.updateMsg = res.update_msg
        });

        this.translocoservice.selectTranslateObject('common').subscribe((res: any) => {
            this.somethingError = res.something_error
        });
    }


    ngOnChanges(changes: { [property: string]: SimpleChange }) {
        let change: SimpleChange = changes['data'];
        if (change.currentValue) {
            this.showForm(change.currentValue)
        }
    }

    ngAfterViewInit() {

    }
//======================================= lifeCycle  End ====================================//

    genderList = [
      { value: 'male', viewValue: 'Male' },
      { value: 'female', viewValue: 'Female' },
      { value: 'non-binary', viewValue: 'Non-binary' },
      { value: 'other', viewValue: 'Other' },
      { value: 'prefer-not-to-say', viewValue: 'Prefer not to say' }
    ];

    availableLanguages = [
        { code: "en", label: 'English' },
        { code: "es", label: 'Spanish' },
        { code: "fr", label: 'French' },
        { code: "de", label: 'German' }
      ];
   

  

    createUserForm() {
        this.manageUser = this.formBuilder.group({
            name: ['', [Validators.required, Validators.pattern('^(?!null).*$'), Validators.pattern('^(?!Null).*$'), Validators.pattern('^(?!NULL).*$')]],
            language: ['',Validators.required],
            place:['',Validators.required],
            gender: ['',Validators.required],
            age: ['',Validators.required]
        }, {});
    }


    rowId:any
    showForm(rowData: any) {
       
        // this.titlePage="Add"
        this.add_form = !this.add_form;
        this.showTooltip = !this.showTooltip;
        if(rowData!=undefined){
            this.rowId=rowData.id;
            this.titlePage = "Edit"
            this.manageUser.patchValue({
                name: rowData.name,
                language:rowData.language,
                place:rowData.place,
                gender:rowData.gender,
                age:rowData.age
            })
            console.log(this.manageUser.value,"00");

        }
        this.toggleOverlay();
    }





    // for overlay on click
  
    toggleOverlay() {
        $('.overlay').toggleClass('d-block');
        $('body').toggleClass('overflow-hidden');
    }


    updateUser(){
        this.apiService.post('api/data-import/users/update', { id: this.rowId, payload: this.manageUser.value }).subscribe((data:any)=>{
            this.toastr.success('Update successfully');
            this.eventList.emit({edit:'edit'});
        })
       this.showForm(undefined);
       
    }
    closeForm(){
        this.add_form = !this.add_form;
        this.showTooltip = !this.showTooltip;
        this.eventList.emit({});
        this.toggleOverlay();
    }
   
}
