import { Component, ViewChild } from '@angular/core';
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


declare var $: any;
declare var bootstrap: any;

@Component({
    selector: 'app-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.css']
})
export class ListComponent {

    @ViewChild(DatatableComponent, { static: true }) table!: DatatableComponent;
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
    counsellingGiven: any = '';
    isFormFilledState: boolean = false;



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
    countryAndDistrictCode: any;
    isFormValid: boolean = false;
    selectedStatus: any = "1";
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
        private translocoservice: TranslocoService,
        private formBuilder: FormBuilder,

    ) {

    }

    userType:any='';
    assignedCountryList:any=[];
    ngOnInit(): void {
        let userDetails=this.authService.getUserDetails()['data']['data']
        let data = JSON.parse(userDetails['area_level1']);
        this.userType = userDetails.user_role;
        this.assignedCountryList = data;
        this.headerService.getAllAreas().subscribe((res: any) => {
            if (res.country_selected) {
                this.updateCountryAndDistrictCode(res); // Update the value whenever the header data changes
            }
        });
        this.headerService.setTitle({ breadcrumb: 'Mobile Data > Counselling' });
        this.createFilterForm();
        this.filterForm.valueChanges.subscribe(() => {
            this.isFormFilledState = this.checkIfFormFilled();
        });
        // this.filterForm.valueChanges.subscribe(() => {
        //     this.isFormValid = this.checkFormValidity();
        //   });

    }

    ngAfterViewInit() {
        // $('.filter-close').click(function () {
        //     $('.filter_drop').removeClass('show')
        // });
    }

    createFilterForm() {
        this.filterForm = this.formBuilder.group({
            first_name: [''],
            last_name: [''],
            age_group: [''],
            gender: [[]],
            appointment_date: this.formBuilder.group({
                start: [''],
                end: ['']
            })

        })
    }


    isChecked(value: string): boolean {
        const gender = this.filterForm.get('gender')?.value || [];
        return gender.includes(value);
    }


    onGenderChange(value: string, isChecked: boolean): void {
        const gender = this.filterForm.get('gender')?.value || [];

        if (value === 'all') {
            if (isChecked) {
                this.filterForm.get('gender')?.setValue(['all', 'male', 'female', 'other']);
            } else {
                this.filterForm.get('gender')?.setValue([]);
            }
        } else {
            let updatedGender = [...gender.filter((v: string) => v !== 'all')];

            if (isChecked) {
                updatedGender.push(value);
            } else {
                updatedGender = updatedGender.filter((v: string) => v !== value);
            }

            if (updatedGender.includes('male') && updatedGender.includes('female') && updatedGender.includes('other')) {
                updatedGender = ['all', 'male', 'female', 'other'];
            }

            this.filterForm.get('gender')?.setValue(updatedGender);
        }
    }

    // openModal() {
    //     const modalElement = document.getElementById('filterModal');
    //     if (modalElement) {
    //         modalElement.classList.add('show');
    //         modalElement.style.display = 'block';
    //     }
    //     $('#filter_drop').removeClass('show');
    //     $('.filter_sec').removeClass('show');
    // }

    getLanguage(language: any) {
        return language === 'en' ? 'English' : language === 'fr' ? 'French' : language === 'du' ? 'Dutch' : 'Spanish';
    }


    closeModal() {
        // const modalElement = document.getElementById('filterModal');
        // if (modalElement) {
        //     modalElement.classList.remove('show');
        //     modalElement.style.display = 'none';
        // }
        $('.filter_sec').removeClass('show');
        $('.filter_drop').removeClass('show');
    }
    filterSelected: any = false
    resetFilter() {
        // this.filterForm.reset();
        this.filterForm.get('gender')?.setValue([]);
        this.filterForm.get('appointment_date')?.setValue({ start: '', end: '' });
        this.filterForm.get('first_name')?.setValue('');
        this.filterForm.get('last_name')?.setValue('');
        this.filterForm.get('age_group')?.setValue('');
        this.isFormFilledState = false;
        this.filterSelected = false
        this.closeModal();
        this.getCounselling();

    }

    isFilterApplied(): boolean {
        const formValues = this.filterForm.value;

        if (
            formValues.first_name.trim() ||
            formValues.last_name.trim() ||
            formValues.age_group.trim() ||
            (formValues.gender && formValues.gender.length > 0)
        ) {
            return true;
        }

        const appointmentDate = formValues.appointment_date;
        if (appointmentDate.start.trim() || appointmentDate.end.trim()) {
            return true;
        }

        return false;
    }



    updateCountryAndDistrictCode(res: any): void {
        this.countryAndDistrictCode = [];
        if (res?.country_selected) {
            // this.countryAndDistrictCode = []; 

            res?.country_selected?.forEach((item: any) => {
                // if (item.active) {
                    // this.countryAndDistrictCode.push(item.country_area_code);
                    item.districts.forEach((district: any) => {
                        if (district.active) {
                            this.countryAndDistrictCode.push(district.district_area_code);
                        }
                    });
                // }
            });
            this.getCounselling();
        }

    }



    defaultData: any = [];
    getCounselling() {
        const payload = {
            first_name: this.filterForm?.value?.first_name,
            last_name: this.filterForm?.value?.last_name,
            age_group: this.filterForm?.value?.age_group,
            gender: this.filterForm?.value?.gender,
            appointment_date: this.filterForm?.value?.appointment_date,
            area_level2: this.countryAndDistrictCode
        }

        this.apiService.post('api/data-retrieval/counselling/get-user-based-counselling', payload).subscribe((res: any) => {
            this.defaultData = res?.data;
            let data = res?.data;
            data = this.selectedStatus !== 'all' ? data?.filter((item: any) => {
                return (
                    String(item.current_status) === this.selectedStatus
                )
            }) : this.defaultData;


            this.counsellingList = data;
            this.filterData = data;
            this.filteredDataCounsellingList = data;
        })
        this.closeModal();
    }

    getCountryColumn(row:any){
        return `${row.parent_area_name} | ${row.country}`
    }

    ApplyFilter() {
        this.filterSelected = true
        this.getCounselling();
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

    selectedComment: any;
    selectedCommentId: any;
    typedComment: any;
    current_status: any;
    disableBtn: any = true;
    changeStatus(row: any) {
        this.typedComment = row.comment;
        this.selectedComment = row.comment;
        this.selectedCommentId = row.id;
        this.current_status = row.current_status;
        this.disableBtn = row.comment?.trim().length === undefined;
        this.counsellingGiven = row.counselling_given;
    }

    onChangeComment(value: any) {
        this.typedComment = value;
        // this.selectedComment=value;
        this.disableBtn = value?.trim().length === 0;

    }

    message: any;
    showMessage(rowMessage: any) {
        this.message = rowMessage;
    }

    comment: any;
    showComment(rowComment: any) {
        this.comment = rowComment;
    }

    reason: any;
    showReason(reason: any){
        this.reason = this.formatAppointmentReason(reason);
    }



    // editComment(row: any) {
    //     this.selectedComment = row.comment;
    //     this.selectedCommentId = row.id;
    // }


    saveComment() {
        const payload = {
            id: this.selectedCommentId,
            comment: this.typedComment,
            counselling_given: this.counsellingGiven,
            current_status: (this.current_status === 1 || this.current_status === 2) ? 0 : 2
        }
        this.selectedComment = this.typedComment;
        this.apiService.post('api/data-import/counselling/update-status-comment', payload).subscribe((res: any) => {
            if (res.status) {
                this.toastr.success(res.message);
                this.getCounselling();
            }
            else {
                this.toastr.error(res.message);
            }
        })
        this.counsellingGiven = '';
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
        this.getCounselling();
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

    // checkFormValidity(): boolean {
    //     const values = this.filterForm.value;
    //     console.log(Object.values(values).some(value => value !== null && value !== '' && value !== undefined),"666666666")
    //     return Object.values(values).some(value => value !== null && value !== '' && value !== undefined);
    //   }


    updateFilterList(event: any) {
        const val = (event.target.value || '').toLowerCase();

        if (!val || val.trim() === '') {
            this.counsellingList = [...this.filteredDataCounsellingList];
            return;
        }

        this.counsellingList = this.filteredDataCounsellingList.filter((d: any) => {
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

    checkIfFormFilled(): boolean {
        const formValues = this.filterForm.value;
    
        return (
            (formValues.first_name && formValues.first_name.trim() !== '') ||
            (formValues.last_name && formValues.last_name.trim() !== '') ||
            (formValues.age_group && formValues.age_group.trim() !== '') ||
            (Array.isArray(formValues.gender) && formValues.gender.length > 0) ||
            (formValues.appointment_date &&
                (
                    (formValues.appointment_date.start && formValues.appointment_date.start !== '') || 
                    (formValues.appointment_date.end && formValues.appointment_date.end !== '')
                )
            )
        );
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
                this.getCounselling();
            }
            else {
                this.toastr.error(res.message);
            }
        })
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

    //================= view model =================================//
    viewRowMessage: any = '';
    viewMassageMode(row: any) {
        this.viewRowMessage = row;
    }
}
