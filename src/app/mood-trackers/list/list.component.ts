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
// import { Fileupload } from "blueimp-file-upload/js/jquery.fileupload";
import { MatDialog } from '@angular/material/dialog';
import { CommonService } from 'src/app/services/common.service';
import { DateRange } from '@angular/material/datepicker';
import { FormBuilder, FormGroup } from '@angular/forms';
import * as echarts from 'echarts';
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
    selectedRange!: DateRange<Date>;
    row: any = {};
    rows: any = [];
    addedit: any = [];
    selectedValue: any = '';
    columnMode = ColumnMode;
    filteredDataCategoryList: any = [];
    seacrinput: boolean = false;
    selected: any = [];
    viewForm: boolean = false
    seacrinputInner: boolean = false;
    filterData: any = [];
    allMood:any=[]
    page: any = {
        size: 0,
        totalElements: 0,
        totalPages: 0,
        pageNumber: 0,
        startOffset: 0,
        filterKeyWord: '',
        userId: '',
    };
    selectedArea: any = {
        country: 'all',
        district: 'all'
    }


    dateRangeForm!: FormGroup;
    categoryList: any = [];
    constructor(
        private apiService: ApiService,
        private fb: FormBuilder,
        private headerService: HeaderService,
        private dialog: MatDialog,
        private toastr: ToastrService,

    ) {
        this.headerService.setTitle({ breadcrumb: 'Mobile Data > Mood Tracker' });
    }

    // feelings = [
    //     { value: 'happy', viewValue: 'Happy 😊' },
    //     { value: 'sad', viewValue: 'Sad 😔' },
    //     { value: 'excited', viewValue: 'Excited 😃' },
    //     { value: 'nervous', viewValue: 'Nervous 😬' },
    //     { value: 'relaxed', viewValue: 'Relaxed 😌' }
    // ];

    selectedFeeling:any = 'happy';
    selectedAreaCode: any = []
    todayDate:any=new Date();

    ngOnInit(): void {
        const currentYear = this.todayDate.getFullYear();
        let minDate = new Date(currentYear, 0, 1);
        let maxDate = new Date();
        this.dateRangeForm = this.fb.group({
            start: [minDate],
            end: [maxDate]
        });
        let isHeaderCall: any = false;

        this.getAllData();        
        this.headerService.getAllAreas().subscribe((data: any) => {
            isHeaderCall=true;
            if (data?.country_selected){
                this.selectedAreaCode =[];
                  data?.country_selected?.forEach((country: any) => {
                      country?.districts?.forEach((district: any) => {
                          if (district?.active) {
                              this.selectedAreaCode.push(district.district_area_code);
                          }
                      });
                  });
                this.getListData(this.selectedFeeling);

          }
        });
        if (!isHeaderCall){
            this.getListData(this.selectedFeeling);
        }

    }

    changePageSize() {
        let newpPageSize: any = $('#mySelectId').val();
        this.table.limit = parseInt(newpPageSize);
        this.table.recalculate();
    }

    setPage(pageInfo: any) {
        this.getListData(this.selectedFeeling);
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

    formatDate(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    startDate1: any
    endDate1: any
    totalMoodtracker: number = 0
    mean: number = 0
    median: number = 0
    mode: number = 0



    // get all mood
    feelings: any = [];

    getAllData() {
        this.apiService.getAll('api/data-retrieval/mood-mapper/get-list').subscribe((res: any) => {
            this.allMood = res?.data;
            this.selectedFeeling = res?.data[0]?.mood.toLowerCase();
            this.allMood.map((item: any) => {
                this.feelings.push({
                    value: item.mood.toLowerCase(), viewValue: item.mood
                })

            })
        })
    }

    getListData(val:any) {
        console.log(this.selectedAreaCode,"22222", val)

        this.startDate1 = this.formatDate(this.dateRangeForm.value.start);
        this.endDate1 = this.formatDate(this.dateRangeForm.value.end);

        const payload = {
            startDate: this.startDate1,
            endDate: this.endDate1,
            name: val,
            areaLevel2: this.selectedAreaCode?.length > 0 ? this.selectedAreaCode : 'all'
        }
        this.apiService
            .post('api/data-retrieval/moodtracker/get-all', payload)
            .subscribe((res: any) => {
                if (res.status) {
                    this.rows = res.data ? res.data : [];
                    this.filterData = res.data;
                    this.totalMoodtracker = res.count;
                    let values = this.transformData(this.rows);
                    this.mean = Math.round(this.totalMoodtracker / values.length);
                    // finding median value 
                    let medianValue = this.transformDataForMedian(this.rows);
                    const totals = medianValue.map(entry => entry.total);

                    totals.sort((a, b) => a - b);
                    const len = totals.length;
                    if (len % 2 === 0) {
                        const mid1 = totals[len / 2 - 1];
                        const mid2 = totals[len / 2];
                        this.median = Math.round((mid1 + mid2) / 2);
                    } else {
                        this.median = Math.round(totals[Math.floor(len / 2)]);
                    }

                    //  finding mode 
                    this.mode = this.findMode(values)

                    console.log(values, medianValue, "kkkkk")


                }
            });

    }

    findMode = (data:any[])=>{
        const totals = data.map(entry => entry.total);

        const countMap: Record<number, number> = {};
        totals.forEach(total => {
            countMap[total] = (countMap[total] || 0) + 1;
        });

        let mode = 0;
        let maxCount = 0;

        for (const [key, value] of Object.entries(countMap)) {
            if (value > maxCount) {
                maxCount = value;
                mode = Number(key); 
            }
        }

        return mode;
    }
    transformDataForMedian=(input:any[])=>{
        const grouped: Record<string, number> = {};
        for (const item of input) {
            const date = item.created.split("T")[0];
            if (!grouped[date]) {
                grouped[date] = 1;
            } else {
                grouped[date]++;
            }
        }
        const result = [];
        for (const date in grouped) {
            result.push({ date, total: grouped[date] });
        }
        result.sort((a, b) => new Date(a.total).getTime() - new Date(b.total).getTime());
    
        return result;
    }

    transformData = (input: any[]) => {
        const grouped: Record<string, number> = {};
        for (const item of input) {
            const date = item.created.split("T")[0];
            if (!grouped[date]) {
                grouped[date] = 1; 
            } else {
                grouped[date]++;
            }
        }
        const result = [];
        for (const date in grouped) {
            result.push({ date, total: grouped[date] });
        }
        result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        return result;
    };

    updateFilter(event: any) {
        const val = event.target.value.toLowerCase();
        const temp = this.filterData.filter((d: any) => {
            return Object.keys(d).some((key) => {
                const fieldValue = d[key] !== null && d[key] !== undefined ? d[key].toString().toLowerCase() : '';
                return fieldValue.indexOf(val) !== -1;
            });
        });
        this.rows = temp;
        this.table.offset = 0;
    }

    getLocation(latlongt: any) {
        if (latlongt != "0") {
            const geo = JSON.parse(latlongt);
            return `https://maps.google.com/?q=${geo.latitude},${geo.longitude}`;
        } else return `https://maps.google.com/?q=0,0`
    }

    isValidLocation(location: any): boolean {
        try {
            if (!location || location === ' ') return false;

            // Parse location if it's a JSON string
            const loc = typeof location === 'string' ? JSON.parse(location) : location;
            return !!loc.latitude && !!loc.longitude;
        } catch (error) {
            console.error('Invalid location format', error);
            return false;
        }
    }

    handleDelete(id: any) {
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
                this.apiService.post(`api/data-import/moodtracker/delete`, payload).subscribe((response: any) => {
                    if (response.status) {
                        this.setPage({ offset: 0 })
                        this.toastr.success(response.message)
                        this.getListData(this.selectedFeeling)
                    } else {
                        this.toastr.error(response.message)
                    }
                });
            }
        });
    };



    getDateRange() {
        const selectedRange = this.dateRangeForm.value;
        if (selectedRange.start && selectedRange.end) {

            this.dateRangeForm = this.fb.group({
                start: [selectedRange.start],
                end: [selectedRange.end]
            });
            this.getListData(this.selectedFeeling)
        } else {
            console.error('Date range not fully selected.');
        }
    }


}
