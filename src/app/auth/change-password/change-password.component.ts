import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslocoService } from '@ngneat/transloco';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/services/api.service';
import { CommonService } from 'src/app/services/common.service';
import { HeaderService } from 'src/app/services/header.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent {

  something_wrong:any
  confirm_password_not_matched:any
  reset_pass_success:any
  current_password_not_matched:any
  userData:any=null

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
    this.createPasswrodForm();
    this.translocoservice.selectTranslateObject('change_passwords').subscribe((res:any)=>{
      // console.log(res, "isssss")
      this.something_wrong = res.something_wrong,
      this.confirm_password_not_matched = res.confirm_password_not_matched,
      this.reset_pass_success = res.reset_pass_success
      this.current_password_not_matched= res.current_password_not_matched
    })

    
    this.userData = this.authService.getUserDetailsForNewUserAndPaaswordExpired();
    console.log('getUserDetails',this.userData)

    if(this.userData == null){
      this.route.navigate(['/']);
    }
    
    console.log('getUserDetails',this.userData)

  }
  createPasswrodForm() {
    this.changePasswordForm = this.formBuilder.group({
      currentPassword: ['', Validators.required],
      newPassword: ['',[Validators.required, Validators.minLength(8), Validators.maxLength(20), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)]],
      confirmPassword: ['',[Validators.required] ],
    },  {
      validator: this.matchingPasswords('newPassword', 'confirmPassword'),
    });
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
    // console.log(this.changePasswordForm.value);
    if(this.changePasswordForm.value.newPassword != this.changePasswordForm.value.confirmPassword){
      this.toastr.error(this.confirm_password_not_matched)
      return
    }

    const passwordString = this.createRandomChars(10) + this.changePasswordForm.get('newPassword').value
    const password = btoa(passwordString);

     const currentPasswordString = this.createRandomChars(10) + this.changePasswordForm.get('currentPassword').value
    const currentPassword = btoa(currentPasswordString);


    const payload:any = {
      currentPassword: currentPassword,
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
  changepassword = false;
  currentpassword = false;
  newpassword = false;
}
