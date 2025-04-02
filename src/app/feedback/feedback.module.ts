import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FeedbackRoutingModule } from './feedback-routing.module';
import { ListComponent } from './list/list.component';
import { EditComponent } from './edit/edit.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { MaterialModule } from 'src/app/shared/material.module';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    ListComponent,
    EditComponent
  ],
  imports: [
    CommonModule,
    FeedbackRoutingModule,
    NgxDatatableModule,
    MatTooltipModule,
    ReactiveFormsModule,
    SharedModule,
    MaterialModule,
    FormsModule
  ]
})
export class FeedbackModule { }
