import { Component, ViewChild} from '@angular/core';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { HeaderService } from 'src/app/services/header.service';
import { AddEditComponent } from '../add-edit/add-edit.component';
import { ApiService } from 'src/app/services/api.service';

declare var bootstrap: any;
declare var $: any;
@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent {

  @ViewChild(DatatableComponent, { static: true }) table!: DatatableComponent;
  @ViewChild(AddEditComponent) addEditComponent: AddEditComponent | undefined;
  columnMode = ColumnMode;
  selected: any = [];
  page: any = {
    size: 0,
    totalElements: 0,
    totalPages: 0,
    pageNumber: 0,
    startOffset: 0,
    filterKeyWord: '',
    userId: '',
  };

  rows: any = [];
  filterData: any = [];

  changePageSize(): any {
    let newpPageSize: any = $('#mySelectId').val();
    this.table.limit = parseInt(newpPageSize);
    this.table.recalculate();
    this.page.size = Number(newpPageSize);
    if (this.page.size > this.page.totalElements) {
        this.page.size = this.page.totalElements;
    }

    this.setPage({ offset: 0 });
  }
  setPage(pageInfo: any) {
    this.getAllData();
  }  
  clearAllSearch() {
    this.rows = this.filterData;
    this.table.offset = 0;
  }
  seacrinput: boolean = false;
  searchBar() {
      this.seacrinput = !this.seacrinput;
      if (!this.seacrinput) {
          $('.seacrinput').val('');
          this.clearSearch();
      }
  }
  searchValue: string = '';
  filteredDataCounsellingList: any = [];
  counsellingList: any = [];
  clearSearch() {
    this.searchValue = '';
    this.counsellingList = [...this.filteredDataCounsellingList];
  }

  updateFilterList(event: any) {
    const val = (event.target.value || '').toLowerCase();

    if (!val || val.trim() === '') {
        this.rows = [...this.filterData];
        return;
    }

    this.rows = this.filterData.filter((d: any) => {
        return Object.keys(d).some((key) => {
            const value = d[key];
            if (value) {
                return value.toString().toLowerCase().includes(val);
            } else {
                return false;
            }
        });
    });
}

  constructor(
    private headerService: HeaderService,
    private apiService: ApiService,

  ) {}
  ngOnInit(): void {
    this.headerService.setTitle({ breadcrumb: 'Admin > Mobile App Customize > Mood Mapper'});
    this.getAllData();
  }
  handleEdit(row: any) {
    this.addEditComponent?.showForm(row);
  }
  


  getAllData(){
    this.apiService.getAll('api/data-retrieval/mood-mapper/get-list').subscribe((res: any)=>{
      this.rows = res?.data;
      this.filterData = res?.data;
    })
  }

}
