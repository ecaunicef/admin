import { Component, OnInit, ViewChild } from '@angular/core';
import { ColumnMode, SelectionType } from '@swimlane/ngx-datatable';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { ApiService } from 'src/app/services/api.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TranslocoService } from '@ngneat/transloco';
import { AuthService } from 'src/app/services/auth/auth.service';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { HeaderService } from 'src/app/services/header.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
// import { Fileupload } from "blueimp-file-upload/js/jquery.fileupload";
import { MatDialog } from '@angular/material/dialog';
import { DeleteDialogComponent } from 'src/app/shared/components/delete-dialog/delete-dialog.component';
import { CommonService } from 'src/app/services/common.service';

declare var $: any;
declare var bootstrap: any;

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css'],
})
export class ListComponent {
  @ViewChild(DatatableComponent, { static: true }) table!: DatatableComponent;

  rows: any = [];
  addedit: any = [];
  columnMode = ColumnMode;
  seacrinput: boolean = false;
  filterData: any = [];
  filteredData: any;
  filterForm!: FormGroup;
  selectedHeaderArea: any = {
    'country': 'all',
    'district': 'all'
  };

  categoryList: any = [];
  constructor(
    private apiService: ApiService,
    private toastr: ToastrService,
    private transloco: TranslocoService,
    private dialog: MatDialog,
    private translocoservice: TranslocoService,
    private headerService: HeaderService,
    private authService: AuthService,
  ) {}

  userType: any = '';
  assignedCountryList: any = [];
  ngOnInit(): void {
    // this.getListData();
    let userDetails = this.authService.getUserDetails()['data']['data']
    let data = JSON.parse(userDetails['area_level1']);
    this.userType = userDetails.user_role;
    this.assignedCountryList = data;
    this.headerService.setTitle({ breadcrumb: 'Mobile Data > Feedback' });
    this.headerService.getAllAreas().subscribe((res: any) => {
        if (res?.district_selected && res?.country_selected) {
          this.selectedHeaderArea['country'] = JSON.stringify(res?.country_selected);
          this.selectedHeaderArea['district'] = JSON.stringify(res.district_selected);
          this.getListData();
        }
    });
      
  }

  changePageSize() {
    let newpPageSize: any = $('#mySelectId').val();
    this.table.limit = parseInt(newpPageSize);
    this.table.recalculate();
  }
  selectAll = false;
  genderSelection = {
    all: false,
    male: false,
    female: false,
    other: false,
  };

  toggleSelectAll() {
    this.selectAll = !this.selectAll;
    this.genderSelection = {
      all: this.selectAll,
      male: this.selectAll,
      female: this.selectAll,
      other: this.selectAll,
    };
  }

  updateSelectAll() {
    const { all, male, female, other } = this.genderSelection;
    this.selectAll = all && male && female && other;
  }

  getSelectedOptions(): string[] {
    return Object.entries(this.genderSelection)
      .filter(([key, value]) => value)
      .map(([key]) => key.charAt(0).toUpperCase() + key.slice(1));
  }
  ngAfterViewInit() {

    $('.filter-close').click(function(){
      $('.filter_drop').removeClass('show')
    });
  }
  setPage(pageInfo: any) {
    this.getListData();
  }

  searchBar() {
    this.seacrinput = !this.seacrinput;
    if (!this.seacrinput) {
      $('.seacrinput').val('');
      this.clearSearch();
    }
  }

  clearSearch() {
    this.rows = [...this.filterData];
    this.table.offset = 0;
  }

  getListData() {
    this.apiService
      .post('api/data-retrieval/feedback/get-all-list', this.selectedHeaderArea)
      .subscribe((res: any) => {
        this.rows = res.data;
        this.filterData = res.data;
      });
  }

  updateFilter(event: any): void {
    const val = event?.target?.value?.toLowerCase() || '';
    this.rows = this.filterData.filter((item: any) => {
        return Object.keys(item).some((key) => 
            item[key]?.toString().toLowerCase().includes(val)
        );
    });

    this.table.offset = 0;
  }

  deleteBlog(id:any){
    console.log("deleteBlog",id);
    const dialog = this.dialog.open(DeleteDialogComponent, {
      width: "350px",
      data: {
        messageDialog: "Are you sure to delete?",
        delete: true,
      },
    });

    dialog.afterClosed().subscribe((selection: any) => {
      if (selection) {
        const payload={
          id:id
        }
        this.apiService.post(`api/data-import/feedback/delete-feedback`, payload).subscribe((response: any) => {
          if (response.success) {
            this.setPage({ offset: 0 })
            this.toastr.success(response.message)
          } else{
            this.toastr.error(response.message)
          }
        });
      }
    });
  };

  rowMessageData:any='';

  onClickMessageIcon(value:any){
    this.rowMessageData=value;
  };
  //================= view model =================================//
  viewRowMessage: any = '';
  viewMassageMode(row: any) {
    this.viewRowMessage = row;
  }
}
