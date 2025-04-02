import { Component, EventEmitter, Input, Output, SimpleChange, ViewChild } from '@angular/core';
import { ColumnMode, DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';
declare var $: any;
@Component({
  selector: 'app-description-modal',
  templateUrl: './description-modal.component.html',
  styleUrls: ['./description-modal.component.css']
})
export class DescriptionModalComponent {
    @Output() eventList = new EventEmitter<object>();
    SelectionType = SelectionType;
    @Input() data: any;
    rows: any =[];
    rowsOrg: any =[];
    selected: any = [];
    columnMode = ColumnMode;
    selectedData: any = {};
    allRowsSelected: boolean =false;
    multipleCheck: any = false;
    modalTitle: any = '';
    addActive: boolean = false;
    editValue: any = [];
    pageLimit: number = 10;
    constructor(){
    }
  
    closeDropdownModal(){
      $('#modalDropDownDesc').modal('toggle');
    }
    @ViewChild(DatatableComponent, { static: true }) table!: DatatableComponent;
    ngOnChanges(changes: { [property: string]: SimpleChange }) {
      let change: SimpleChange = changes['data'];
      if (change.currentValue) {
        //console.log("🚀 ~  file: description-modal.component.ts:35 ~  DescriptionModalComponent ~  ngOnChanges ~  change.currentValue:", change.currentValue)
        this.closeDropdownModal()
        // return
       this.modalTitle = change.currentValue?.data?.filterName
        
        // $('.removeCheckedRadio').prop('checked', false)
        this.rows = []
        this.rows = change.currentValue?.data?.data
       }
    }
  
  
    submitSelection(){
      this.eventList.emit({ data: '' , dropdownName :'' });
      this.closeDropdownModal();
    }

    closeDescriptionModal(){
      this.eventList.emit({ data: '', dropdownName: '' });
      $('#modalDropDownDesc').modal('toggle');
    }
  
  }
