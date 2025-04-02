import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CredentialRoutingModule } from './credential-routing.module';
import { ListComponent } from './list/list.component';
import { EditComponent } from './edit/edit.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslocoModule } from '@ngneat/transloco';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { MaterialModule } from '../../shared/material.module';
import { MatDialogModule } from '@angular/material/dialog';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [
    ListComponent,
    EditComponent
  ],
  imports: [
    CommonModule,
    CredentialRoutingModule,
    MaterialModule,
    NgxDatatableModule,
    FormsModule,
    ReactiveFormsModule,
    MatTooltipModule,
    TranslocoModule,
    SharedModule,
    MatDialogModule
  ]
})
export class CredentialModule { }
