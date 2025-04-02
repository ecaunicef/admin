import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './layout/header/header.component';
import { FooterComponent } from './layout/footer/footer.component';
import { SidebarComponent } from './layout/sidebar/sidebar.component';
import { AuthLayoutComponent } from './layout/auth-layout/auth-layout.component';
import { AdminLayoutComponent } from './layout/admin-layout/admin-layout.component';
import { AuthModule } from './auth/auth.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { CustomInterceptorService } from './services/custom-interceptor.service';
import { ToastrModule } from 'ngx-toastr';
import { AdminHeaderComponent } from './layout/admin-header/admin-header.component';
import { AdminFooterComponent } from './layout/admin-footer/admin-footer.component';
import { TranslocoRootModule } from './transloco-root.module';
import { RolePermissionComponent } from './role-permission/role-permission.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from './shared/shared.module';
import { MatDialogModule } from '@angular/material/dialog';
import { NgIdleKeepaliveModule } from '@ng-idle/keepalive';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { TranslocoModule } from '@ngneat/transloco';
import { PageNotFoundServerErrorComponent } from './page-not-found-server-error/page-not-found-server-error.component';
import { RecursiveSearchPipe } from './shared/pipes/recursive-search.pipe';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import {MatSelectModule} from '@angular/material/select';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatRadioModule} from '@angular/material/radio';
import {MatCardModule} from '@angular/material/card';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatButtonModule} from '@angular/material/button';

// this includes the core NgIdleModule but includes keepalive providers for easy wireup



@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    SidebarComponent,
    AuthLayoutComponent,
    AdminLayoutComponent,
    AdminHeaderComponent,
    AdminFooterComponent,
    RolePermissionComponent,
    PageNotFoundComponent,
    ResetPasswordComponent,
    PageNotFoundServerErrorComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    TranslocoModule,
    AuthModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ToastrModule.forRoot({
      positionClass: 'toast-top-right'
    }),
    TranslocoRootModule,
    MatFormFieldModule,
    MatInputModule,
    NgxDatatableModule,
    FormsModule,
    MatDatepickerModule,
    ReactiveFormsModule,
    SharedModule,
    NgIdleKeepaliveModule.forRoot(),
    MatDialogModule,
    MatTooltipModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatCheckboxModule,
    MatRadioModule,
    MatCardModule,
    MatButtonModule
  
  ],
  providers: [
    {

      provide: HTTP_INTERCEPTORS,
      useClass: CustomInterceptorService,
      multi: true
    },
    RecursiveSearchPipe
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
