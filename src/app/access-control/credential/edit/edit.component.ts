import { Component, EventEmitter, Input, OnInit, Output, SimpleChange } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../../services/api.service';
import { HeaderService } from '../../../services/header.service';
import { AuthService } from 'src/app/services/auth/auth.service';

import { TranslocoService } from '@ngneat/transloco';
import { RecursiveSearchPipe } from 'src/app/shared/pipes/recursive-search.pipe';
import { raceWith } from 'rxjs';

declare var bootstrap: any;
declare var $: any;

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css']
})
export class EditComponent {
  passwordBoxTypeText = false;
  add_form: any = false;
  titlePage: any = '';
  showEdit: boolean = false;
  manageCredential!: FormGroup;
  add: any = '';
  edit: any = '';
  selected_area: any;
  parentLevel: any;
  showTooltip: any;
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
rowId:any='';
allCountryList:any=[];

  allStatesRoles:any = [
    //   {
    //       id:'Antigua and Barbuda',
    //       name:'Antigua and Barbuda'
    //   },
    //   {
    //       id:'Barbados',
    //       name:'Barbados'
    //   },
    //   {
    //       id:'Grenada',
    //       name:'Grenada'
    //   },
    //   {
    //       id:'Anguilla',
    //       name:'Anguilla'
    //   },
    //   {
    //       id:'Montserrat',
    //       name:'Montserrat'
    //   },
  
    ];

  constructor(
    private search: RecursiveSearchPipe, 
    private formBuilder: FormBuilder, 
    private translocoservice: TranslocoService,
    private apiService: ApiService, 
    private toastr: ToastrService,
    private headerService: HeaderService,
    private authService: AuthService
    ) { }
  @Output() eventList = new EventEmitter<object>();
  @Input() data: any;
    userDetails:any
    

// =============country select all dropdown===========
    options: string[] = ['Option 1', 'Option 2', 'Option 3', 'Option 4'];
    selectedOptionscountry = new FormControl<string[]>([]);
    allSelected = false;
  
    toggleSelectAll() {
      this.allSelected = !this.allSelected;
        if (this.allSelected){
            this.manageCredential.patchValue({
                cid: ['all selected', ...this.allCountryList.map((item: any) => item.country_id)]
            })

        }else{
            this.manageCredential.patchValue({
                cid: []
            })
        }
        // this.manageCredential.setValue(this.allSelected ? [...this.options] : []);
    }
  
    onSelectionChange(event:any) {
        console.log(this.allCountryList.length == this.manageCredential.value.cid.length,"000")
        let length1=0;
        if (this.manageCredential.value.cid.includes('all selected')){
            length1 = this.manageCredential.value.cid.length-1;
        }else{
            length1 = this.manageCredential.value.cid.length;
        }


        if (this.allCountryList.length == length1){
            this.allSelected=true;
            this.manageCredential.patchValue({
                cid: ['all selected', ...this.allCountryList.map((item: any) => item.country_id)]
            })
        }else{
            let araId = this.manageCredential?.value?.cid?.filter((ele: any) => ele !='all selected');
            this.manageCredential.patchValue({
                cid: araId
            })

            this.allSelected = false;
        }
    //   const selectedValues = this.selectedOptionscountry.value || [];
    //   this.allSelected = selectedValues.length === this.options.length;
    }
// =============country select all dropdown===========
    
  ngOnInit(): void {
    this.userDetails = this.authService.getUserDetails();
    //   this.getCountryList();
      this.createCredientialForm();
      this.headerService.getAllAreas().subscribe((res:any) => {
        setTimeout(() => {
            if(res?.area?.status && res?.area?.data){
                console.log("2233", res)
                this.allCountryList= res?.area?.data?.map((item: any) => ({
                    country_name: item.country_name,
                    country_id: item.country_id,
                    country_area_code: item.country_area_code
                }))
                // if (this.userDetails?.data?.data?.user_role==1){
                //     console.log(this.userDetails?.data?.data?.user_role,"000");
                //     // this.allSelected=true;
                //     this.toggleSelectAll();
                // }
            }
        },100)
      });

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

    ngAfterViewInit() {
    }

    

    // countryListData:any=[];
    currentChangeData:any=[];
    ngOnChanges(changes: { [property: string]: SimpleChange }) {
        let change: SimpleChange = changes['data'];
        if (change.currentValue) {
            let data=change?.currentValue;
            if(data?.row){
                this.showForm(data.row);
            }
        }
    }


  genders = [
    { value: 'male', viewValue: 'Male' },
    { value: 'female', viewValue: 'Female' },
    { value: 'non-binary', viewValue: 'Non-binary' },
    { value: 'other', viewValue: 'Other' },
    { value: 'prefer-not-to-say', viewValue: 'Prefer not to say' }
  ];

    availableLanguages = [
      { code: 'en', label: 'English' },
      { code: 'es', label: 'Spanish' },
      { code: 'fr', label: 'French' },
      { code: 'de', label: 'German' }
    ];

 


 



  createCredientialForm() {
      this.manageCredential = this.formBuilder.group({
          username: ['', [Validators.required, Validators.pattern('^(?!null).*$'), Validators.pattern('^(?!Null).*$'), Validators.pattern('^(?!NULL).*$')]],
          email: ['', [Validators.required,
          Validators.pattern('[A-Za-z0-9._%+-]{2,}@[a-zA-Z]{3,}([.]{1}[a-zA-Z]{2,}|[.]{1}[a-zA-Z]{2,}[.]{1}[a-zA-Z]{2,})')]],
          cid: ['', Validators.required],
          password: ['', [Validators.required, Validators.required, Validators.minLength(7), Validators.maxLength(20), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)]],
        //   role:['',Validators.required]
      }, {});
  }

  passwordKeyUp() {
      let typedPass = this.manageCredential.get('password')?.value
      const passwordControl: any = this.manageCredential.get('password');
      if (typedPass.length > 0) {

          passwordControl.setValidators([
              Validators.required,
              Validators.required,
              Validators.minLength(8),
              Validators.maxLength(20),
              Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
          ]);
          passwordControl.updateValueAndValidity()

      } else {
          passwordControl.setValidators();
          passwordControl.updateValueAndValidity()
      }


  }

  showForm(rowData: any) {    
      this.manageCredential.reset();
      this.add_form = !this.add_form;
      this.showTooltip = !this.showTooltip;
    
      if (rowData != undefined) {
          this.rowId=rowData.id;
          this.titlePage = this.edit;
          this.showEdit = true;
          this.disableEmail = true;
          const passwordControl = this.manageCredential.get('password');

          if (passwordControl) {
              passwordControl.setValidators([]);
              passwordControl.updateValueAndValidity()
          }
          let countries = JSON?.parse(rowData?.area_level1) ;
          let countryList=[];
          if(countries.length==this.allCountryList.length){
            countryList = ['all selected',...countries.map((item:any)=>Number(item.country_id)  )];
              this.toggleSelectAll();
          }else{
              countryList = countries.map((item: any) => Number(item.country_id));
          }
          this.manageCredential.patchValue({
              username: rowData?.username,
              email: rowData?.email,
              cid: countryList,
              role:rowData?.user_role
            });
      } else {

        const passwordControl = this.manageCredential.get('password');

        if (passwordControl) {
            passwordControl.setValidators([
                Validators.required, Validators.required, Validators.minLength(8), Validators.maxLength(20), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
            ]);
            passwordControl.updateValueAndValidity()
        }

        this.titlePage = this.add;
        this.showEdit = false;
    }
      this.toggleOverlay();
  }

  toggleOverlay() {
      $('.overlay').toggleClass('d-block');
      $('body').toggleClass('overflow-hidden');
  }

  // for overlay on click

    updateCredential(){
        let payload = {
            username: this.manageCredential.value.username,
            email: this.manageCredential.value.email,
            password: this.manageCredential.value.password,
            cid: this.allCountryList.filter((item: any) => this.manageCredential?.value?.cid?.includes(item.country_id)),
        }

        console.log("payload", this.allCountryList, payload)
        // return

        this.apiService.post('api/data-import/credential/update', { id: this.rowId, payload: payload }).subscribe((data: any) => {
            this.toastr.success('Update successfully');
            this.eventList.emit({ edit: 'edit' });
        })
        this.showForm(undefined);

    }

    addCredential(){
        let payload={
            username: this.manageCredential.value.username,
            email:this.manageCredential.value.email,
            cid:this.allCountryList?.filter((item:any)=>this.manageCredential?.value?.cid.includes(item?.country_id)),  
            password:this.manageCredential?.value?.password
        }
    
        this.apiService.post('api/data-import/credential/save', { user: payload}).subscribe((data: any) => {
            this.toastr.success(data.message);
            this.eventList.emit({ edit: 'add' });
        })
        this.showForm(undefined);
    }

    closeForm() {
        // this.eventList.emit({});
        this.showForm(undefined);   
    }



//=================== get country name accn to area id ==========================//
    getCountryName(areaCode: string): string | undefined {
        const country = this.allCountryList.find((c:any) => c?.country_id === areaCode);
        return country ? country.country_name : undefined;
    }


}
