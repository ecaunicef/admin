import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuditTrailRoutingModule } from './audit-trail-routing.module';
import { ListComponent } from './list/list.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslocoModule } from '@ngneat/transloco';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { MaterialModule } from '../shared/material.module';


@NgModule({
  declarations: [
    ListComponent
  ],
  imports: [
    CommonModule,
    AuditTrailRoutingModule,
    MaterialModule,
    NgxDatatableModule,
    FormsModule,
    ReactiveFormsModule,
    MatTooltipModule,
    TranslocoModule
  ]
})
export class AuditTrailModule { }
