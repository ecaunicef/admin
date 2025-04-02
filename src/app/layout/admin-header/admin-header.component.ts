import { Component, OnInit } from '@angular/core';
import { HeaderService } from '../../services/header.service';
import { ApiService } from 'src/app/services/api.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { TranslocoService } from '@ngneat/transloco';
import { Idle, DEFAULT_INTERRUPTSOURCES } from '@ng-idle/core';
import { Keepalive } from '@ng-idle/keepalive';
import { CommonService } from 'src/app/services/common.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { LoadingService } from 'src/app/services/loader.service';
import { head } from 'underscore';

declare var $: any;
declare var bootstrap: any;
@Component({
    selector: 'app-admin-header',
    templateUrl: './admin-header.component.html',
    styleUrls: ['./admin-header.component.css']
})
export class AdminHeaderComponent implements OnInit {

    userAdminOption: boolean = false;
    titleData: any = {};

    idleState = 'Not started.';
    timedOut = false;
    lastPing: any = null;
    userDetails: any
    something_wrong: any
    confirm_password_not_matched: any
    reset_pass_success: any
    current_password_not_matched: any
    changePasswordForm: any = FormGroup;
    locale: any
    showBurgerMenuBox: boolean = false;
    uploadedPath: any = environment.resourceImgUrl;
    dashboardUrl:any = environment.dashboardUrl;
    countryList: any = [];
    otpForm: any = FormGroup;
    AreaForm: any = FormGroup;
    copyareaByCountryList: any;
    selectParentAreaCode: any = null;
    selectParentAreaName: any = null;
    areaByCountryList: any[] = [
        {
          region_name: {
            en: "EASTERN AFRICA",
            fr: "#EASTERN AFRICA"
          },
          area_name: "Ethiopia",
          area_code: "ETH"
        },
        {
          region_name: {
            en: "WESTERN AFRICA",
            fr: "#WESTERN AFRICA"
          },
          area_name: "Mali",
          area_code: "MLI"
        }
      ];

      selectedAreaCode: any = {
        parent_name: "",
        parent_code: "",
        code: '',
        area_name: ''
      };
    // countryControl = new FormControl('all'); // Default value is 'All'
    // countryControl = new FormControl('all');






//============================== life cycle start  =============================//
    constructor(
        public route: Router, private loadingService: LoadingService, private formBuilder: FormBuilder, private authservice: AuthService, private translocoservice: TranslocoService, private headerService: HeaderService,
        private idle: Idle, private keepalive: Keepalive, private common: CommonService,
        private apiservice: ApiService, private toastr: ToastrService, private router: Router) { }

    ngOnInit(): void {

        if (localStorage.getItem('locale')) {
            this.locale = localStorage.getItem('locale');
        } else {
            this.locale = 'en';
        }

        this.translocoservice.selectTranslateObject('change_passwords').subscribe(res => {
            this.something_wrong = res.something_wrong,
                this.confirm_password_not_matched = res.confirm_password_not_matched,
                this.reset_pass_success = res.reset_pass_success
            this.current_password_not_matched = res.current_password_not_matched
        })


        this.headerService.getTitle().subscribe((res: any) => {
            let tempTitle = res
            const pieces = tempTitle.breadcrumb?.split('>')
            pieces[pieces.length - 1] = "<span >"+pieces[pieces.length - 1]+"</span>";

            this.titleData.breadcrumb = pieces.join(' > ')

            this.getUserDetails()
        })

        this.startIdleTime();
        this.createPasswrodForm();

        $("#edit_profile_popup").on('hide.bs.modal', function () {
            $("#upload_prf_img").val('')
        });

        // this.createOtpForm()
        this.getCountryList();
        this.createAreaForm();
    }
//====================================== lifecycle end================================//




//=======================================country selection handler start ===============================//
    getCountryList(){
        this.apiservice.getAll('api/data-retrieval/area/list').subscribe((res:any)=>{
            if(res.status){

                this.countryList = res?.data.sort((a: any, b: any) => a.country_name.localeCompare(b.country_name));

                if(this.countryList.length==1){

                    this.countryList?.forEach((country: any) => {
                        this.seletedDistrictCount[country.country_id] = country.districts;
                        country['toggle'] = true;
                        country['active'] = true;
                        country?.districts?.forEach((dist: any) => {
                            dist['active'] = true;
                        })
                    })
                }else{

                    this.countryList?.forEach((country:any)=>{
                        this.seletedDistrictCount[country.country_id] = country.districts;
                        country['toggle'] = false;
                        country['active'] = true;
                        country?.districts?.forEach((dist:any)=>{
                            dist['active'] = true;
                        })
                    })
                }
                this.copyareaByCountryList=this.countryList;
                this.selectedCountry=this.countryList;
                this.headerService.setAreaList({ 'district_selected': this.seletedDistrictCount, 'country_selected': this.selectedCountry,area: res});
                this.viewAreaFunction();
            }else{
                this.toastr.error(res.message);
            }
        })
    }

    districtList:any=[];
    onSelectCountry(){
        let formData:any = this.AreaForm.value || '';
        console.log(formData);
        let data:any = this.countryList.find((country: any) => country.country_name == formData?.country)?.districts;
        if(data){
            this.districtList = data?.sort((a: any, b: any) => a?.localeCompare(b));
        }
      if (formData?.country=='all'){
          this.districtList=[];
      }
        this.AreaForm.patchValue({
            district:'all'
        })
        this.headerService.setArea(formData);
        console.log(this.AreaForm);
    }


    onSelectDistrict(){
        let formData: any = this.AreaForm.value || '';
        this.headerService.setArea(formData);

    }

//========================================= country selection handler End ===================================//










    createAreaForm() {
        this.AreaForm = this.formBuilder.group({
            country: ['all'],
            district:['all'],
        });
    }



    createOtpForm(){
        this.otpForm = this.formBuilder.group({
            otp: ['', [Validators.required, Validators.minLength(6)]]
          });
          
    }

    openBurgerMenuBox() {
        this.showBurgerMenuBox = true;
    }

    closeBurgerMenuBox() {
        this.showBurgerMenuBox = false;
    }

    toggleUserAdminOption() {
        this.userAdminOption = !this.userAdminOption;
    }


    logout() {
        this.common.logOut();
    }

    last_login_time: any
    formattedDate: any
    uploadedProfileImage: any
    getUserDetails() {
        this.userDetails = this.authservice.getUserDetails();
        // const loginTime = this.userDetails.last_login_time
        // this.last_login_time = new Date(loginTime);
        // const options = { day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true };
        // this.formattedDate = this.last_login_time.toLocaleString('en-US', options);
    }


    resetIdleTime() {
        // this.idle.watch();
        // this.idleState = 'Started.';
        this.timedOut = false;
    }

    startIdleTime() {
        this.idle.setIdle(environment.ngIdleStartTime); //idle time will start after 5 sec
        this.idle.setTimeout(environment.ngIdleLogoutTime); // will perform further action after 30 minutes
        this.idle.setInterrupts(DEFAULT_INTERRUPTSOURCES);

        this.idle.onIdleEnd.subscribe(() => this.idleState = 'No longer idle.');

        this.idle.onTimeout.subscribe(() => {
            // this.idleState = 'Timed out!';
            this.timedOut = true;
            //logout User
            this.logout();
        });

        // this.idle.onIdleStart.subscribe(() => this.idleState = 'You\'ve gone idle!'); // display message on resume idle
        // this.idle.onTimeoutWarning.subscribe((countdown) => this.idleState = 'You will time out in ' + countdown + ' seconds!'); //display message on idle

        this.keepalive.interval(1); //time after resume will be aborted on any activity

        this.keepalive.onPing.subscribe(() => this.lastPing = new Date());
        this.resetIdleTime();
    }

    filterowner() {
        const myModal = new bootstrap.Modal(document.getElementById("edit_profile_popup"), {
            keyboard: false,
        });
        myModal.show();
    }

    ngAfterViewInit() {





        window.history.replaceState(null, '', window.location.pathname);


        var $count = 0;

        // var $eb = $('.edit-button');
        // var $ei = $('.editable-input');
        // var $ec = $('.editable-cell');

        // //Editable input fields
        // $eb.on('click', () => {
        //   $count++
        //   if ($count < 2) {
        //     $ei.prop('readonly', false).focus();
        //     $ei.prop('placeholder','');
        //     $ei.val('');
        //     $(this).addClass('hide');
        //     $ec.addClass('editing');
        //   } else {
        //     $ei.prop('readonly', false).focus();
        //     $eb.addClass('hide');
        //     $ec.addClass('editing');
        //   }
        // });


        // $ei.on('blur', function() {
        //   $eb.removeClass('hide');
        //   $ei.prop('readonly', true);
        //   $ec.removeClass('editing');
        // });

        this.fetchDetails()
    }

    async fetchDetails() {
        await this.authservice.fetchUserCredentials();
        this.getUserDetails()
    }

    createPasswrodForm() {
        this.changePasswordForm = this.formBuilder.group({
            currentPassword: ['', Validators.required],
            newPassword: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(20), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)]],
            confirmPassword: ['',Validators.required],
        }, {
            validator: this.matchingPasswords('newPassword', 'confirmPassword'),
        });
    }

    resetForm() {
        this.changePasswordForm.reset()
    }

    matchingPasswords(passwordKey: string, confirmPasswordKey: string) {
        return (group: FormGroup) => {
            const passwordControl = group.controls[passwordKey];
            const confirmPasswordControl = group.controls[confirmPasswordKey];

            if (passwordControl.value !== confirmPasswordControl.value) {
                confirmPasswordControl.setErrors({ passwordMismatch: true });
            } else {
                confirmPasswordControl.setErrors(null);
            }
        };
    }

    changePassword() {

        if (!this.changePasswordForm.valid) {
            this.toastr.error(this.something_wrong)
        }
        if (this.changePasswordForm.value.newPassword != this.changePasswordForm.value.confirmPassword) {
            this.toastr.error(this.confirm_password_not_matched)
            return
        }

        const passwordString = this.createRandomChars(10) + this.changePasswordForm.get('newPassword').value
        const password = btoa(passwordString);

        const currentPasswordString = this.createRandomChars(10) + this.changePasswordForm.get('currentPassword').value
        const currentPassword = btoa(currentPasswordString);


        const payload = {
            currentPassword: currentPassword,
            newPassword: password,
        };

        setTimeout(() => {
            this.loadingService.customShow()
          },0.5)

        this.apiservice.post('api/data-retrieval/users/change-password', payload).subscribe((res: any) => {
            if (res.success) {
                this.common.logOut();
                this.toastr.success(this.reset_pass_success)
                this.router.navigate(['/']);
                window.location.reload();

                setTimeout(() => {
                    this.loadingService.customHide()
                  },0.5)
            } else {
                this.toastr.error(this.current_password_not_matched)
                setTimeout(() => {
                    this.loadingService.customHide()
                  },0.5)

            }
        })
    }

    createRandomChars(length: number) {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (var i = 0; i < length; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        return text;
    }


    changeLanguage($event: Event): void {
        const locale = ($event.target as HTMLInputElement).value;
        this.translocoservice.setActiveLang(locale);
        localStorage.setItem("locale", locale);
        window.location.reload();
    }

    handleFileInput(event: any): void {
        this.profileUserDetailsInputs['id'] = this.userDetails?.data?.id
        const file = event.target.files[0];

        if (file) {
            const allowedExtensions = ['jpg', 'jpeg', 'png'];
            const fileExtension = file.name.split('.').pop()?.toLowerCase();
            console.log(fileExtension);
            if (fileExtension && allowedExtensions.includes(fileExtension)) {
                // if (file) {
                const maxSize = 2 * 1024 * 1024; // 2MB in bytes

                if (file.size <= maxSize) {
                    const reader = new FileReader();

                    reader.onload = (e) => {
                        const base64String = reader.result as string;
                        console.log('Base64 encoded image:', base64String);
                        this.profileUserDetailsInputs['img'] = base64String
                    };

                    reader.readAsDataURL(file);
                } else {
                    this.toastr.error('Image size should not be more than 2 MB')
                    $("#upload_prf_img").val('')
                }
                // }
            } else {
                this.toastr.error('Please Select Valid File Format')
                $("#upload_prf_img").val('')

            }
        }

    }

    profileUserDetailsInputs: any = {}
    handleProfileUserDetailsInput(inputFor: any, value: any) {

    

        switch (inputFor) {
            case 'name':
                this.profileUserDetailsInputs['name'] = value
                break;

            // case 'phone':
            //     this.profileUserDetailsInputs['phone'] = value
            //     break;

            // case 'department':
            //   this.profileUserDetailsInputs['department'] = value
            //   break;

            // case 'designation':
            //   this.profileUserDetailsInputs['designation'] = value
            //   break;

            default:
                break;
        }
    }

    handleSaveProfile() {
        try {
            setTimeout(() => {
                this.loadingService.customShow()
              },0.5)

            if (Object.keys(this.profileUserDetailsInputs).length === 0) {
                this.profileUserDetailsInputs['id'] = this.userDetails?.data?.data?.id
                this.profileUserDetailsInputs['name'] = this.userDetails?.data?.data?.name
                // this.profileUserDetailsInputs['phone'] = this.userDetails?.data?.data?.phone
                this.profileUserDetailsInputs['img'] = this.userDetails?.data?.data?.img
            }

            const keys = Object.keys(this.profileUserDetailsInputs)
            // console.log('img', keys);

            if (!keys.includes('id')) {
                this.profileUserDetailsInputs = this.userDetails?.data?.data?.id;
            }

            if (!keys.includes('name')) {
                this.profileUserDetailsInputs['name'] = this.userDetails?.data?.data?.name
            }

            // if (!keys.includes('phone')) {
            //     this.profileUserDetailsInputs['phone'] = this.userDetails?.data.data?.phone
            // }

            if (!keys.includes('img')) {
                console.log('img');
                this.profileUserDetailsInputs['img'] = this.userDetails?.data.data?.img
            }
            this.profileUserDetailsInputs['id'] = this.userDetails?.data?.data?.id
            this.apiservice.post('api/data-import/users/update-profile', this.profileUserDetailsInputs).subscribe(async (res: any) => {
                    // console.log('profileUserDetailsInputs', res.success)
                if (res.success) {
                    await this.authservice.fetchUserCredentials();
                    this.getUserDetails()
                    this.toastr.success(res.message)
                    $('#OTP-modal').modal('hide');
                    $('#edit_profile_popup').modal('toggle')
                    $('#profile_popup').modal('toggle')
                    $("#upload_prf_img").val('')

                    setTimeout(() => {
                        this.loadingService.customHide()
                      },500)
                } else {
                    this.toastr.error('Not Updated')
                    setTimeout(() => {
                        this.loadingService.customHide()
                      },500)
                }
            })
        } catch (error) {
            console.log(error)
        }
    }
    newpassword = false;
    currentpassword = false;
    confirmpassword = false;

typeForOtp:any = 0

 saveOtp(type:any){
    this.typeForOtp = type
        this.apiservice.getAll('api/data-import/users/generate-otp/1').subscribe(async (res: any) => {

                if (res.status == 1) {
                     this.toastr.success(res.message)
                    $('#OTP-modal').modal('toggle')
                  } else {
                    this.toastr.error('Error generating OTP');
                  }
        })
 }


 verifyOtp() {
 
    const otp =  this.otpForm.value.otp

      this.apiservice.post('api/data-import/users/verify-otp', { otp: otp ,type:1, userDataUpdated:this.profileUserDetailsInputs }).subscribe((res: any) => {
        // handleSaveProfile
          if (res.success) {
              this.otpForm.reset()
              if (this.typeForOtp == 1) {
                  this.handleSaveProfile();
              } else {
                  this.changePassword()
              }
              // $('#otpClear').val('');
          } else {
              this.toastr.error(res.message)

          }
      });
   
  }

  closeOtpModal(){
    this.otpForm.reset()
  }


  

//=============================== area dropdown start ================================//
    selectAllList:boolean = true;
    isViewChecked: boolean = false;
    deepCopyOfCountryList: any = [];
    allCountrySelected: boolean = false;
    viewSelectedCountryDistrict: any;
    selectedCountry: any = [];
    seletedDistrictCount: any = {};


    selectAllcountry(){
        this.selectAllList = !this.selectAllList;
        this.countryList.forEach((country:any) =>{
            country.active = this.selectAllList;
            country.districts.forEach((district:any) =>{
                district.active = this.selectAllList;
            })
        })

        this.selectedCountry = this.countryList?.filter((element:any)=>element.active==true);
    }
    togglecaret(country:any) {
        country.toggle = !country?.toggle;
    }
    toogleCountry(districtData:any,country:any,event:any) {
        country.active = event?.target?.checked;
        districtData?.forEach((district: any) => {
            district.active = event?.target?.checked;
        })
        let isCountryActive=this.countryList?.every((ele:any)=>ele?.active==true);
        this.selectAllList = isCountryActive;
        this.selectedCountry = this.countryList?.filter((item: any) => item?.active==true);
        if(this.selectedCountry.length==1){
            this.countryList.forEach((element:any) => {
                if (country?.country_area_code != element?.country_area_code){
                 let isChecked=element?.districts?.some((ele:any)=>ele.active);
                   if (isChecked){
                       element.districts.forEach((item:any) =>{
                           item.active=true;
                       })
                   }
                   element.active=isChecked;
             }

            });
            this.selectedCountry = this.countryList?.filter((item: any) => item?.active == true);
        }
        
       
    }

    onCheckDistrict(country:any,distrct:any,event:any){
        distrct.active = event?.target?.checked;
        const data = country?.districts?.every((item:any)=>item?.active==true);
        country.active = data;
        if (country.active){
            let isCountryActive = this.countryList.every((ele: any) => ele?.active == true);
            this.selectedCountry = this.countryList?.filter((item:any)=>item?.active==true)
            this.selectAllList = isCountryActive;
        }
        if (!country.active){

            let isDistrictActive = country?.districts.some((item: any) => item.active == true && !this.ObjisDistrictActive?.includes(country?.country_id) && !this.selectedCountry.includes(country));
            if (isDistrictActive) {
                this.selectedCountry.push(country);
                this.ObjisDistrictActive.push(country.country_id);
            }else{
                let isActive = country?.districts.every((item: any) => item.active == false && this.ObjisDistrictActive.includes(country.country_id));
                if (isActive){
                    this.ObjisDistrictActive=[];
                    this.selectedCountry=[];    

                }
            }
        }
    }

 
    viewSelectedCountry(){
        this.isViewChecked = !this.isViewChecked;
        if (this.isViewChecked){
            this.deepCopyOfCountryList=JSON.stringify(this.countryList);
            this.countryList=this.countryList?.filter((country:any) => country?.active);
            this.countryList.forEach((country:any) =>{
                country.districts = country?.districts?.filter((district: any) => district.active);
            })

        }else{
            this.countryList = JSON.parse(this.deepCopyOfCountryList);
        }
    }

    onCloseAreaModel() {
        this.selectedCountry?.forEach((elet: any) => {
            this.seletedDistrictCount[elet.country_id] = elet.districts.filter((dist: any) => dist.active);
        })
        this.headerService.setAreaList({ 'district_selected': this.seletedDistrictCount, 'country_selected': this.selectedCountry, "area": { status: true, data: this.copyareaByCountryList } });
        this.viewAreaFunction()
    }

//  view Area after country get selected 
orgOfCountryList:any=[];
    viewAreaFunction() {
        this.orgOfCountryList = JSON.stringify(this.countryList);
        if (!this.selectedCountry || !Array.isArray(this.selectedCountry)) {
            this.viewSelectedCountryDistrict = '';
            return;
        }
        const countries = this.selectedCountry?.map((country: any) => {
            const districtCount = country.districts?.filter((item:any)=>item.active==true).length;
            return districtCount
                ? `${country?.country_name} (+${districtCount} districts)`
                : `${country?.country_name}`;
        });

        const maxDisplayCount = 2; // Number of countries to display
        const remainingCount = countries.length - maxDisplayCount;

        if (countries.length > maxDisplayCount) {
            const displayedCountries = countries.slice(0, maxDisplayCount).join(', ');
            this.viewSelectedCountryDistrict = `${displayedCountries} and (+${remainingCount} more)`;
        } else {
            this.viewSelectedCountryDistrict = countries.join(', ');
        }
    }



//search area accn to the dropdown area list

    searchArea(event: any) {
        const value = event.target?.value?.toLowerCase();
        this.countryList.forEach((country: any) => {
            country.toggle= false;
        });
        if(value!=''){
            $('#menu-list').find('.level').hide();
            $('#menu-list').find('ul li span').each((idx: any, obj: any) => {
                if ($(obj).text().toLowerCase().indexOf(value) !== -1) {
                    // Show the parent elements
                    $(obj).parentsUntil('#menu-list').not('ul').not().css('display', 'block');
                    $(obj).parent('span').css('display', 'inline-flex');
    
                    // Activate matched country/district
                    const matchedText = $(obj).text().toLowerCase();
                    this.countryList.forEach((country: any) => {
                        if (country.country_name.toLowerCase() === matchedText) {
                            country.toggle= true;
                        }
                        country.districts.forEach((district: any) => {
                            if (district.district_name?.toLowerCase() === matchedText) {
                                // district.toggle = true;
                                country.toggle = true; // Activate parent if district matches
                            }
                        });
                    });
                }
            });

        }else{
            if (this.countryList.length==1){
                this.countryList.forEach((country: any) => {
                    country.toggle = true;
                });
            }else{

                this.countryList.forEach((country: any) => {
                    country.toggle = false;
                });
            }
            $('#menu-list').find('.level').show();
        }
    }

//================== close area pop
    ObjisDistrictActive:any=[];
    onOpenAreaPopup(){
        let data = JSON.parse(this.orgOfCountryList);
        if(data && data.length>0){

            this.countryList = data;
            let isCountryActive = this.countryList.every((ele: any) => ele?.active == true);
            this.selectedCountry = this.countryList?.filter((item: any) => item?.active == true)
            this.selectAllList = isCountryActive;
            this.countryList.forEach((ele:any) => {
                if (!ele.active) {
                    let isDistrictActive = ele?.districts.some((item: any) => item.active == true && !this.selectedCountry?.includes(ele));
                    if (isDistrictActive) {
                        this.selectedCountry.push(ele)
                        this.ObjisDistrictActive.push(ele.country_id);
                    }
                }
                // this.isDistrictSelected(ele);
                
            });
        }
        $('#search_id').val('');
    }
    isDistrictSelected(country:any){
        if (this.ObjisDistrictActive.length > 0 && this.selectedCountry.length<=1){
            if (this.ObjisDistrictActive.includes(country.country_id)){
                return false;
            }else{
                return true;
            }

        }else{
            if (this.selectedCountry.length == 1 && this.ObjisDistrictActive.lenth==0){
                if(this.selectedCountry.includes(country)){
                    return false;
                }else{
                    return true;
                }

            }else{

                return false;
            }
        }
    }

}

