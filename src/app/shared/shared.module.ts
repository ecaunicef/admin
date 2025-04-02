import { NgModule } from '@angular/core';
import { AccessControlDirective } from './access-control.directive';
import { DeleteDialogComponent } from './components/delete-dialog/delete-dialog.component';
import { RoleFormComponent } from './components/role-form/role-form.component';
import { TranslocoModule } from '@ngneat/transloco';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MaterialModule } from './material.module';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FilterPipe } from './pipes/filter.pipe';
import { SearchPipe } from './pipes/search.pipe';
import { SearchareaPipe } from './pipes/searcharea.pipe';
import { CustomSearchPipe } from './pipes/custom-search.pipe';
import { CustomDatePipe } from './pipes/custom-date.pipe';
import { MatStepperModule } from '@angular/material/stepper';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { FilterCategoryMasterPipe } from './pipes/filter-category-master.pipe';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ChangeDateFormatPipe } from './pipes/change-date-format.pipe';
import { DescriptionModalComponent } from './components/description-modal/description-modal.component';

@NgModule({
  declarations: [SearchPipe, FilterCategoryMasterPipe, SearchareaPipe, CustomSearchPipe, FilterPipe, AccessControlDirective, DeleteDialogComponent, RoleFormComponent, CustomDatePipe, ChangeDateFormatPipe,  DescriptionModalComponent],
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    TranslocoModule,
    MaterialModule,
    CommonModule,
    ReactiveFormsModule,
    MatTooltipModule,
    MatStepperModule,
    NgxDatatableModule,
    MatSlideToggleModule
  ],
    
  exports: [SearchPipe, SearchareaPipe,  FilterCategoryMasterPipe, CustomSearchPipe, FilterPipe, AccessControlDirective, DeleteDialogComponent, RoleFormComponent, ChangeDateFormatPipe,  DescriptionModalComponent,]
})
export class SharedModule { }
