import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ImportLogsRoutingModule } from './import-logs-routing.module';
import { ListComponent } from './list/list.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslocoModule } from '@ngneat/transloco';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { MaterialModule } from '../shared/material.module';
import { SharedModule } from '../shared/shared.module';


@NgModule({
  declarations: [
    ListComponent
  ],
  imports: [
    CommonModule,
    ImportLogsRoutingModule,
    TranslocoModule,
    SharedModule,
    NgxDatatableModule,
    MatTooltipModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class ImportLogsModule { }
