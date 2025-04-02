import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login.component';
import { AuthRoutingModule } from './auth-routing.module';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslocoModule } from '@ngneat/transloco';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { MatInputModule } from '@angular/material/input';



@NgModule({
  declarations: [
    LoginComponent,
    ChangePasswordComponent,
  ],
  imports: [
    CommonModule,
    AuthRoutingModule,
    ReactiveFormsModule,
    TranslocoModule,
    MatInputModule,
    TranslocoModule
  ]
})
export class AuthModule { }
