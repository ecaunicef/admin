import { Component } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { Router,ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validator, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { TranslocoService } from '@ngneat/transloco';
import { LoadingService } from 'src/app/services/loader.service';
import { CommonService } from 'src/app/services/common.service';
import { environment } from 'src/environments/environment';
import CryptoJS from 'crypto-js';

declare var bootstrap: any;
declare var $: any;
// const CryptoJS = require("crypto-js");
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  passwordBoxTypeText = false;
  loginForm: any = FormGroup;
  forgetPasswordForm: any = FormGroup;
  showLoginForm:boolean = true;

  resetPasswordMessage: string = '';

  logAttempt: number = 0
  error: string = '';
  isMatched: boolean = false;
  code: any = '';
  uuid: any = '';
  enteredCaptcha: any = '';
  captchaData: any;
  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private route: Router,
    private formbuilder: FormBuilder,
    private toastr: ToastrService,
    private translocoservice: TranslocoService,
    public loaderService: LoadingService,
    private redirectService: CommonService,
    private router: Router,
    private activeRoute: ActivatedRoute
  ) { 


    this.activeRoute.queryParams.subscribe(params => {
        if(params['message'] != undefined) {
          this.toastr.error(params['message']);
        }
    });
  }

  ngOnInit() {
    this.loginForm = this.formbuilder.group({
      email: ['', [Validators.required, Validators.maxLength(50)]],
      password: ['', [Validators.required, Validators.maxLength(30)]],
      captcha: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
    });
    
    this.forgetPasswordForm = this.formbuilder.group({
      email: ['', [Validators.required, Validators.maxLength(50),Validators.email]],
    });
  }

  ngAfterViewInit(){
    window.history.replaceState(null, '', window.location.pathname);
    this.createCaptcha('captcha');
  }
  

  createRandomChars(length: number) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < length; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
  }

  setFailedLoginIntervel() {
    var self = this
    this.loginForm.disable()
    this.loginForm.reset()
    setTimeout(()=> { // working
      this.loginForm.enable()
      this.logAttempt = 0
    }, 300000);
  }

  login() {
    this.loaderService.show();
    const email = this.loginForm.get('email').value;
    const passwordString = this.loginForm.get('password').value;
    const password = CryptoJS.AES.encrypt(passwordString, environment.privateKey).toString() ;

    const payload = {
      email: email,
      password: password,
      enteredCaptcha : this.loginForm.value.captcha,
      uuid : this.uuid
    };

 
    let resp = {}
    this.apiService
      .post('api/data-retrieval/users/login', payload) 
      .subscribe({
        next: (res: any) => {
          if(res.status == 2){
            // this.translocoservice.selectTranslateObject('not_authorized').subscribe((res:any)=>{
            // })
            this.toastr.error(res.message);
            this.createCaptcha('captcha');
            this.loginForm.get('captcha').reset();
            return
          }else if(res.status == 0){
            // You are not authorized
            // this.translocoservice.selectTranslateObject('invalid_details').subscribe((res:any)=>{
            // })
            this.toastr.error(res.message);
            this.createCaptcha('captcha');
            this.loginForm.get('captcha').reset();
            return
          }

          // if(res.data.isPasswordResetRequired){
          //   if(res.data.isPasswordExpired){
          //   this.toastr.error(res.data.msg)
          //   }
          //   this.authService.setUsetDetailsForNewUserAndPaaswordExpired({forNewUser:res.data._id})
          //   this.route.navigate(['/change-password']);
          //   return
          // }

        this.loaderService.hide();
          this.error = '';
          this.translocoservice.selectTranslateObject('success_login').subscribe((result: any) => {
            this.toastr.success(result)
          });
          // this.authService.setUsetDetailsForNewUserAndPaaswordExpired(null)

          
          this.loaderService.hide();

          let isUserGranted = false;
          let firstModule:any = {}

          // if(res.data.role.length == 0){
            this.route.navigate(['/landing']);
            this.authService.setUsetDetails(res);
            // this.authService.setUsetDetails(res);
            // return
          // }

          // res.data.role.permissions.every((element:any) => {
          
          //   let check = element.actions.find((e:any)=>(e.add_edit == true || e.delete == true|| e.view == true || e.show_hide == true));

          //   if(check && (check.add_edit || check.delete || check.view || check.show_hide)){
          //     firstModule = element
          //     return false;
          //   }
					// 	return true;

          // });

            // this.redirectFun(firstModule?.subModule);



          
        },
        error: (error: any) => {
          // console.log("🚀 ~  file: login.component.ts:134 ~  LoginComponent ~  login ~  error:", error)
          this.loaderService.hide();
          ++this.logAttempt
          if (this.logAttempt == 5) {
            this.setFailedLoginIntervel();
          }
          this.translocoservice.selectTranslateObject('error_message').subscribe((result: any) => {
            if( error.error.message == "blocked"){
              this.toastr.error(result.blocked)
            }else{
              this.toastr.error(result.invalid_login)
            }

            // console.log("🚀 ~  file: login.component.ts:80 ~  LoginComponent ~  login ~  res:", error)
            // You've exceeded the maximum login attempts. Please try again after 30 minutes
            this.createCaptcha('captcha');
            this.loginForm.get('captcha').reset();
          });
          // this.createCaptcha('captcha');
        },
        complete: () => {
          this.loaderService.hide();
          
        }
      });
      
  }

  // forget password

  forgetPassword() {
    if (this.forgetPasswordForm.invalid) { 
      return;
    }
    const email = this.forgetPasswordForm.get('email').value;
    const payload = {
      email: email,
    };
    this.apiService.post('api/data-import/credential/forget-password',payload).subscribe((res:any)=>{
      if (res.status === 1) {
        this.resetPasswordMessage = res.message;
        // this.toastr.success(res.message)
      } else {
        this.toastr.error(res.message)
      }
   })
     
  }

  toggleLoginFormVisibility() {
    this.resetPasswordMessage = ''
    this.showLoginForm = !this.showLoginForm;
    setTimeout(() => {
      $('#captcha').html(this.captchaData.captcha)
    }, 200);
    this.forgetPasswordForm.reset()
  }

  isGuestUser(){
    // return;
      this.apiService.getAll("api/data-retrieval/users/details").subscribe((res:any) => {
        if (res.status == 1) {
          this.authService.setUsetDetails(res);
          if (res.data.role.length == 0) {
            this.route.navigate(['/landing']);
            // this.authService.setUsetDetails(res);
            return
          }
          let firstModule: any = {}
          res.data.role.permissions.every((element: any) => {

            let check = element.actions.find((e: any) => (e.add_edit == true || e.delete == true || e.view == true || e.show_hide == true));

            if (check && (check.add_edit || check.delete || check.view || check.show_hide)) {
              firstModule = element
              return false;
            }
            return true;

          });

          this.redirectFun(firstModule?.subModule);
        }
              
    });
    // this.apiService.()
    
  }

  redirectFun(subModule:any){
    this.redirectService.redirect(subModule)
  }


  compareCaptcha(event: any) {
    if (event.target.value != this.code) {
      this.isMatched = false
    } else {
      this.isMatched = true
      this.enteredCaptcha = event.target.value
    }
  }

  captchaMatchValidator(group: FormGroup): any {
    if (group.value.captcha != this.code) {
      return { captchaMisMatch: true };
    }
    else {
      return { captchaMisMatch: false };
    }
  }



  createCaptcha(divId: any) {
    try {
      this.loginForm.get('captcha').setValue('')
      this.isMatched = false;
    //clear the contents of captcha div first 
    (<HTMLInputElement>document.getElementById(divId)).innerHTML = '';
    
    this.apiService.getAll('api/data-retrieval/users/generate-captcha').subscribe((res:any)=>{
      this.captchaData = res.captcha
      this.uuid = res.uuid

      // new code 

      var canv = document.createElement("canvas");
      canv.id = divId;
      canv.width = 143;
      canv.height = 48;

      var ctx: any = canv.getContext("2d");
      ctx.font = "20px Poppins, sans-serif";
      ctx.fillStyle = "#333333";
      ctx.strokeStyle = "#333333";
      //storing captcha so that can validate you can save it somewhere else according to your specific requirements
      var imageObj = new Image();
      imageObj.onload = () => {
        ctx.beginPath();
        ctx.moveTo(0, 30);
        ctx.beginPath();
        ctx.moveTo(0, 65);
        ctx.strokeText(res.captcha, 40 ,30);
      };

      imageObj.src = 'assets/images/captchabg.png';
      (<HTMLInputElement>document.getElementById(divId)).appendChild(canv);
    // $('#captcha').html(res.captcha)
  })

    } catch (error:any) {
        return
    }

  }


  changeLanguage($event: Event): void {

    const locale = ($event.target as HTMLInputElement).value;
    this.translocoservice.setActiveLang(locale);
    localStorage.setItem("locale", locale);

  }



}
