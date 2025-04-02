import { Component, ViewChild} from '@angular/core';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { ApiService } from 'src/app/services/api.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TranslocoService } from '@ngneat/transloco';
import { AuthService } from 'src/app/services/auth/auth.service';
import { HttpClient } from '@angular/common/http';
import { HeaderService } from 'src/app/services/header.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
// import { Fileupload } from "blueimp-file-upload/js/jquery.fileupload";
import { MatDialog } from '@angular/material/dialog';
import { CommonService } from 'src/app/services/common.service';
import { DeleteDialogComponent } from 'src/app/shared/components/delete-dialog/delete-dialog.component';
import { AddEditComponent } from '../add-edit/add-edit.component';

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

  row: any = {};
  rows: any = [];
  addedit: any = [];
  selectedValue: any = '';
  columnMode = ColumnMode;
  filteredDataCounsellingList: any = [];
  seacrinput: boolean = false;
  selected: any = [];
  viewForm: boolean = false
  seacrinputInner: boolean = false;
  filterData: any = [];
  filterForm!: FormGroup;
  page: any = {
      size: 0,
      totalElements: 0,
      totalPages: 0,
      pageNumber: 0,
      startOffset: 0,
      filterKeyWord: '',
      userId: '',
  };
  filteredData: any;


  allStatesRoles: any = [
      {
          id: 'Antigua and Barbuda',
          name: 'Antigua and Barbuda'
      },
      {
          id: 'Barbados',
          name: 'Barbados'
      },
      {
          id: 'Grenada',
          name: 'Grenada'
      },
      {
          id: 'Anguilla',
          name: 'Anguilla'
      },
      {
          id: 'Montserrat',
          name: 'Montserrat'
      },

  ];

  selectedCountry: any;
  counsellingList: any = [];
  countryList: any = [];
  constructor(
      private apiService: ApiService,
      private toastr: ToastrService,
      private transloco: TranslocoService,
      private route: Router,
      private authService: AuthService,
      private http: HttpClient,
      private headerService: HeaderService,
      private dialog: MatDialog,
      private commonService: CommonService,
      private translocoservice: TranslocoService
  ) {

  }

  getChatline() {

    this.apiService.getAll('api/data-retrieval/chatline/get-chatline').subscribe((res:any)=>{
        this.rows = res?.data;
        this.filterData = res?.data;
    })
     
  }
  
  ngOnInit(): void {
      this.getChatline();
      this.headerService.setTitle({ breadcrumb: 'Admin > Mobile App Customize > U-Matter Chatline'});


  }


  handleEdit(row: any) {
    this.addEditComponent?.showForm(row);
}


  selectAll = false;
  genderSelection = {
    male: false,
    female: false,
    other: false,
  };

  toggleSelectAll() {
    this.selectAll = !this.selectAll;
    this.genderSelection = {
      male: this.selectAll,
      female: this.selectAll,
      other: this.selectAll,
    };
  }

  updateSelectAll() {
    const { male, female, other } = this.genderSelection;
    this.selectAll = male && female && other;
  }

  getSelectedOptions(): string[] {
    return Object.entries(this.genderSelection)
      .filter(([key, value]) => value)
      .map(([key]) => key.charAt(0).toUpperCase() + key.slice(1));
  }


  selectedComment:any;
  selectedCommentId:any;
  typedComment:any;
  editComment(row:any){
      this.selectedComment = row.comment;
      this.selectedCommentId = row.id;
  }

  onChangeComment(value: any){
      this.typedComment = value;
  }
  saveComment(){
      this.apiService.post('api/data-import/counselling/update-status-comment', { id: this.selectedCommentId, comment: this.typedComment }).subscribe((res: any) => {
          if (res.status) {
              this.toastr.success(res.message);
              this.getChatline();
          }
          else {
              this.toastr.error(res.message);
          }
      })
  }
  formatAppointmentReason(appointment_reason: string | null): string {
      if (!appointment_reason) {
          return '';
      }
      try {
          const reasonsArray = JSON.parse(appointment_reason);
          return reasonsArray.join(', ');
      } catch (error) {
          console.error('Error parsing appointment_reason:', error);
          return '';
      }
  }

 
  changeStatus(row:any){
    let newStatus = row['status'] === 0 ? 1 : 0;

    this.apiService.post('api/data-import/chatline/change-status', {id: row.id, status: newStatus}).subscribe((res:any)=>{
        if(res.status){
            this.toastr.success(res.message);
            this.setPage({offset: 0});
        } else{
            this.toastr.error(res.message);
        }
    })
  }

  deleteChatline(id: any) {
    const dialog = this.dialog.open(DeleteDialogComponent, {
        width: "350px",
        data: {
            messageDialog: "Are you sure to delete?",
            delete: true,
        },
    });

    dialog.afterClosed().subscribe((selection: any) => {
        if (selection) {
            const payload = {
                id: id
            }
            this.apiService.post(`api/data-import/chatline/delete`, payload).subscribe((response: any) => {
                if (response.status) {
                    this.setPage({ offset: 0 })
                    this.toastr.success(response.message)
                } else {
                    this.toastr.error(response.message)
                }
            });
        }
    });
};


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
      this.getChatline();
      // try {
      //     $('#loaders').fadeIn();
      //     $('.loaders ol li').css('display', 'block');

      //     this.rows = [];
      //     this.page.pageNumber = pageInfo.offset;
      //     const start = this.page.pageNumber * this.page.size;
      //     const end = Math.min(
      //         start + Number(this.page.size),
      //         this.page.totalElements
      //     );
      //     this.page.startOffset = start;
      //     this.page.endOffset = end;
      //     if (this.page.size == 0) {
      //         this.page.size = 10;
      //     }

      //     this.apiService
      //         .post('api/data-retrieval/category-master/get-list', {
      //             key: this.selectedValue,
      //         })
      //         .subscribe((response: any) => {
      //             this.page.totalElements = response?.count;
      //             this.page.totalPages = response?.totalPages;
      //             this.rows = response?.data;
      //             this.filteredData = response.data;
      //         });

      //     $('#loaders').fadeOut();
      //     $('.loaders ol li').fadeOut();

      //     setTimeout(() => {
      //         $('.page-count').html(
      //             'Showing ' + this.page.size + ' of ' + this.page.totalElements
      //         );
      //     }, 1000);
      // } catch (error) {
      //     console.log('response', error);
      // }
  }
  ncSearchToggle: any = false
  ncSearch() {
      this.seacrinputInner = !this.seacrinputInner;
      if (!this.seacrinputInner) {
          $('.seacrinputInner').val('');
          this.clearSearch();
      }
  }
  clearAllSearch() {
      this.rows = this.filterData;
      this.table.offset = 0;
  }
  searchBar() {
      this.seacrinput = !this.seacrinput;
      if (!this.seacrinput) {
          $('.seacrinput').val('');
          this.clearSearch();
      }
  }


  searchValue: string = '';

  updateFilter(event: any) {
      const val = event.target.value.toLowerCase();
      const temp = this.filterData.filter(function (d: any) {
          return Object.keys(d).some(function (key) {
              return d[key]?.toString()?.toLowerCase()?.indexOf(val) !== -1 || !val;
          });
      });
      this.rows = temp;
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

  clearSearch() {
      this.searchValue = '';
      this.counsellingList = [...this.filteredDataCounsellingList];
  }

  clearSearchList() {
      this.counsellingList = this.filteredDataCounsellingList;
  }


  onToggleSwitch(event: any, row: any) {
      const isChecked = event.target.checked;
      console.log(row, 'sadsadg211111')
      const statusValue = isChecked ? 1 : 0;

      this.updateStatus(statusValue, row.id);
  }

  updateStatus(status: number, id: any) {

      this.apiService.post('api/data-import/counselling/update-status-comment', { id: id, current_status: status }).subscribe((res: any) => {
          if (res.status) {
              this.toastr.success(res.message);
              this.getChatline();
          }
          else {
              this.toastr.error(res.message);
          }
      })
  }
  ngAfterViewInit() {

      $('.filter-close').click(function(){
        $('.filter_drop').removeClass('show')
      });
    }
  

  deleteCounselling(id: any) {
      const dialog = this.dialog.open(DeleteDialogComponent, {
          width: "350px",
          data: {
              messageDialog: "Are you sure to delete?",
              delete: true,
          },
      });

      dialog.afterClosed().subscribe((selection: any) => {
          if (selection) {
              const payload = {
                  id: id
              }
              this.apiService.post(`api/data-import/counselling/delete-counselling`, payload).subscribe((response: any) => {
                  if (response.status) {
                      this.setPage({ offset: 0 })
                      this.toastr.success(response.message)
                  } else {
                      this.toastr.error(response.message)
                  }
              });
          }
      });
  };

}
