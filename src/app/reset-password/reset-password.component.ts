import { Component } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslocoService } from '@ngneat/transloco';
import { ToastrService } from 'ngx-toastr';

import { CommonService } from 'src/app/services/common.service';
import { HeaderService } from 'src/app/services/header.service';

import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent {


  something_wrong:any
  confirm_password_not_matched:any
  reset_pass_success:any
  current_password_not_matched:any
  userData:any=null
  tokenUrl: any  ='';
  resetPasswordMessage: string = '';
  
  constructor ( private headerService:HeaderService,
    private formBuilder: FormBuilder, 
    private translocoservice: TranslocoService,
    private toastr: ToastrService,
    private route: Router,
    private authService: AuthService,
    private commonService: CommonService,
    private apiService: ApiService,
    private activeRoute: ActivatedRoute){}
  
    changePasswordForm: any = FormGroup;

  ngOnInit(): void {
    this.apiService.getAll("api/data-retrieval/users/details").subscribe((res:any) => {
      if(res.status == 0){
        
        this.tokenUrl =  this.activeRoute?.snapshot?.paramMap.get('token')
      

        this.check()
      }else{
        this.check()
      }
      });
      this.createPasswrodForm();
  }

  check(){

    let payload:any = {   
      token: this.tokenUrl
      };
    this.apiService.post('api/data-retrieval/credential/check-token', payload).subscribe((res: any) => {
      if (res.status == 0) { 
        this.route.navigate(['/404']); 
      }

    });
  }
  
  createPasswrodForm() {
    this.changePasswordForm = this.formBuilder.group({
      email: ['',[Validators.required,Validators.maxLength(50),Validators.email]],
      newPassword: ['',[Validators.required, Validators.minLength(8), Validators.maxLength(20), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)]],
      confirmPassword: ['',[Validators.required] ],
      
    }, { validator: this.matchingPasswords('newPassword', 'confirmPassword') });
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
  
  changePassword(){
  
    if (!this.changePasswordForm.valid) {
      this.toastr.error(this.something_wrong)
    }
    if(this.changePasswordForm.value.newPassword != this.changePasswordForm.value.confirmPassword){
      this.toastr.error(this.confirm_password_not_matched)
      return
    }
  
    const passwordString = this.createRandomChars(10) + this.changePasswordForm.get('newPassword').value
    const password = btoa(passwordString);
  
  
    const payload:any = {
      
      newPassword: password,
    };
  
    if (this.userData.forNewUser == undefined) {
      this.apiService.post('api/data-import/users/change-password', payload).subscribe((res: any) => {
        if (res.success) {
          this.commonService.logOut();
          this.toastr.success(this.reset_pass_success)
          this.route.navigate(['/']);
        } else {
          this.toastr.error(this.current_password_not_matched)
        }
      })
    } else {
      payload["_id"] = this.userData.forNewUser
      this.apiService.post('api/data-import/users/change-password-for-new-user', payload).subscribe((res: any) => {
        if (res.success) {
          this.commonService.logOut();
          this.toastr.success(this.reset_pass_success)
          this.route.navigate(['/']);
        } else {
          this.toastr.error(this.current_password_not_matched)
        }
      })
    }
  
  
    
  }
  
  createRandomChars(length: number) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < length; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
  }

  // changepassword = false;
  // newpassword = false;
  newpassword: boolean = false;
  changepassword: boolean = false;

  toggleNewPasswordVisibility() {
    this.newpassword = !this.newpassword;
}

toggleConfirmPasswordVisibility() {
    this.changepassword = !this.changepassword;
}


  getRestPassword(){
    const passwordString = this.createRandomChars(10) + this.changePasswordForm.value.confirmPassword
    const password = btoa(passwordString);
    const payload = {
      token: this.tokenUrl,
      email: this.changePasswordForm.value.email,
      password: password

    };
    this.apiService.post("api/data-import/credential/user-reset-password",payload).subscribe((res:any) => {
      if (res.success === true) {
        // this.toastr.success(res.message)
        this.resetPasswordMessage = res.message;
        // this.route.navigate(['/']);
      } else {
        this.toastr.error(res.message)
      }

    });
  }

}
