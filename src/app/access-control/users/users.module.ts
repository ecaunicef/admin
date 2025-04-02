import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UsersRoutingModule } from './users-routing.module';
import { ListComponent } from './list/list.component';
import { AddEditComponent } from './add-edit/add-edit.component';
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
    AddEditComponent,
  ],
  imports: [
    CommonModule,
    UsersRoutingModule,
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
export class UsersModule { }
