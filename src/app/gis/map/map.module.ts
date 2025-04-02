import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MaterialModule } from '../../shared/material.module';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import { MapRoutingModule } from './map-routing.module';
import { ListComponent } from './list/list.component';
import { AddEditComponent } from './add-edit/add-edit.component';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslocoRootModule } from '../../transloco-root.module';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [
    ListComponent,
    AddEditComponent
  ],
  imports: [
    CommonModule,
    MapRoutingModule,
    MaterialModule,
    NgxDatatableModule,
    ReactiveFormsModule,
    TranslocoRootModule,
    MatTooltipModule,
    NgxDaterangepickerMd.forRoot(),
    SharedModule,
    MatDialogModule
  ]
})
export class MapModule { }
