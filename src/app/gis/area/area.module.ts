import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';


import { MaterialModule } from '../../shared/material.module';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import { AreaRoutingModule } from './area-routing.module';
import { ListComponent } from './list/list.component';
import { AddEditComponent } from './add-edit/add-edit.component';

import { MatTooltipModule } from '@angular/material/tooltip';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslocoModule } from '@ngneat/transloco';
import { SharedModule } from 'src/app/shared/shared.module';
// import { TreeModule } from '@circlon/angular-tree-component';


@NgModule({
  declarations: [
    ListComponent,
    AddEditComponent
  ],
  imports: [
    CommonModule,
    AreaRoutingModule,
    MaterialModule,
    NgxDatatableModule,
    MatTooltipModule,
    ReactiveFormsModule,
    TranslocoModule,
    SharedModule,
    // TreeModule
  ]
})
export class AreaModule { }
