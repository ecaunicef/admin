import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ClassificationRoutingModule } from './classification-routing.module';
import { ListComponent } from './list/list.component';
import { AddEditComponent } from './add-edit/add-edit.component';

import { TranslocoModule } from '@ngneat/transloco';


import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { MaterialModule } from 'src/app/shared/material.module';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    ListComponent,
    AddEditComponent
  ],
  imports: [
    CommonModule,
    ClassificationRoutingModule,
    TranslocoModule,
    NgxDatatableModule,
    MatTooltipModule,
    ReactiveFormsModule,
    SharedModule,
    MaterialModule,
    FormsModule
  ]
})
export class ClassificationModule { }
