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
// import { Fileupload } from "blueimp-file-upload/js/jquery.fileupload";
import { MatDialog } from '@angular/material/dialog';
import { DeleteDialogComponent } from 'src/app/shared/components/delete-dialog/delete-dialog.component';
import { CommonService } from 'src/app/services/common.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AddEditComponent } from '../add-edit/add-edit.component';


declare var $: any;
declare var bootstrap: any;
var logInterval: any;


@Component({
    selector: 'app-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.css']
})
export class ListComponent {

    @ViewChild(DatatableComponent, { static: true }) table!: DatatableComponent;
    @ViewChild(AddEditComponent) addEditComponent: AddEditComponent | undefined;
    rowList: any = []
    rows: any = [];
    addedit: any = [];
    row: any = {};
    selectedValue: any = '';
    columnMode = ColumnMode;
    filteredDataCategoryList: any = [];
    seacrinput: boolean = false;
    selected: any = [];
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

	logFiles: string = '';

    languageList: any = ['Geographical Area', 'Classification']
    selectedLanguageList: any = "Geographical Area"

    categoryList: any = [];
    allCountryList: any;
    selectedArea: any = {
        country: 'all'
    };
    today = new Date();
    currentYear = this.today.getFullYear();
    currentMonth = (this.today.getMonth() + 1) < 10 ? '0' + (this.today.getMonth() + 1) : (this.today.getMonth() + 1);
    currentDate = this.today.getDate() < 10 ? '0' + this.today.getDate() : this.today.getDate();
    todaysDate = String(this.currentYear) + String(this.currentMonth) + String(this.currentDate);
    url:string='';

    
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
		this.logFiles = environment.logPath;
        
        if(environment.production) {
            this.url = environment.apiUrl;
        } else {
            this.url = `${window.location.protocol}//${window.location.host}/`
        }

    }


    ngOnInit(): void {
        this.getListData();
        this.headerService.setTitle({ breadcrumb: 'Admin > Language' });

        console.log(this.selectedLanguageList,"88888");
    }


    changePageSize() {
        let newpPageSize: any = $('#mySelectId').val();
        this.table.limit = parseInt(newpPageSize);
        this.table.recalculate();
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

    clearSearch() {
        this.rows = [...this.filterData];
        this.table.offset = 0;
    }

    getDynamicFieldValue(row: any, areaField: string, classificationField: string): any {
        // Return the correct field value based on selectedLanguageList
        return this.selectedLanguageList === 'Geographical Area'
            ? row[areaField]
            : row[classificationField];
    }
    
    
    updateDynamicFieldValue(row: any, areaField: string, classificationField: string, value: any): void {
        // Update the correct field in the row object based on selectedLanguageList
        if (this.selectedLanguageList === 'Geographical Area') {
            row[areaField] = value;
        } else {
            row[classificationField] = value;
        }
    
        // Log the updated row for debugging
        console.log("Updated row:", row);
    }
    
    
    dynamicProp: string = 'name';
    dynamicDutchProp: string = 'name_nl';
    dynamicFrenchProp: string = 'name_fr';
    dynamicSpanishProp: string = 'name_es';
    getListData() {
        if (this.selectedLanguageList === "Classification") {
            this.dynamicProp = 'classification_name';
            this.dynamicDutchProp = 'classification_name_nl';
            this.dynamicFrenchProp = 'classification_name_fr';
            this.dynamicSpanishProp = 'classification_name_es';
            this.apiService
                .getAll('api/data-retrieval/classification/get-classifications')
                .subscribe((res: any) => {
                    if (res.data && res.data.length > 0) {
                        // Replace null values with empty strings
                        this.rows = res.data.map((row: any) => ({
                            ...row,
                            classification_name_nl: row.classification_name_nl || "",
                            classification_name_fr: row.classification_name_fr || "",
                            classification_name_es: row.classification_name_es || ""
                        }));
                    } else {
                        this.rows = [];
                    }
                    this.filterData = [...this.rows];
                });
        } else {
            this.dynamicProp = 'name';
            this.dynamicDutchProp = 'name_nl';
            this.dynamicFrenchProp = 'name_fr';
            this.dynamicSpanishProp = 'name_es';
            this.apiService
                .getAll('api/data-retrieval/area/get-area-list')
                .subscribe((res: any) => {
                    if (res.data && res.data.length > 0) {
                        // Replace null values with empty strings for area data
                        this.rows = res.data.map((row: any) => ({
                            ...row,
                            name_nl: row.name_nl || "",
                            name_fr: row.name_fr || "",
                            name_es: row.name_es || ""
                        }));
                    } else {
                        this.rows = [];
                    }
                    this.filterData = [...this.rows];
                });
        }
    }
    

    saveLanguage(row: any, field: string) {    
        let keyName = row?.name ?? row?.classification_name
        const payload = {
            id: row.id,
            name: keyName,
            table: this.selectedLanguageList === 'Classification' ? 'classification' : 'area',
            languageFields: {
                [field]: row[field]?.trim() || ""
            }
        };
    
    
        this.apiService.post('api/data-import/language/update-language', payload).subscribe(
            (res: any) => {
                if (res.status) {
                    this.toastr.success(res.message);
                } else if (res.status === 0 || res.status === false) {
                    this.toastr.error(res.message);
                }
            },
            (error: any) => {
                this.toastr.error('Error updating language field.');
                console.error('API error:', error);
            }
        );
    }
    

    updateFilterList(event: any) {
        const val = event.target.value.toLowerCase();
    
        this.rows = this.filterData.filter((d: any) =>
            Object.keys(d).some((key) => d[key]?.toString().toLowerCase().includes(val))
        );
    
        if (!val) {
            this.rows = [...this.filterData];
        }
    }


//================================ Import and export file system ===================================//
    isFileExist:boolean = false;
    fileName:string='';
    
    uploadStatus:string='';
    totalCount:any='';
    totalUpdated:any='';
    totalImported:any='';
    errorRecord:any='';
    totalUploadCount:any='';
    importProgress:boolean=false;
    isImportCompleted:any=false;

    detectFiles(event: any) {
        this.fileName = event.target.files[0].name;
    }
    // chooseFile(){
    //     $('#fileupload_language').click();
    //     this.startImport();
    // }

    chooseFile() {
        (<HTMLInputElement>document.getElementById("fileupload_language")).click();
        this.startImport();
    }


    startImport(){
        let that = this;
        this.fileName = '';
        var url = this.url + 'api/data-import/file-upload';
        $(document).on("change", "#fileupload_language", (e: any) => {
            that.detectFiles(e);
            this.isFileExist = true;
        });
        console.log(that.authService.getUserDetails(),"000")


        $('#fileupload_language').fileupload({
            maxChunkSize: 2000000,
            acceptFileTypes: /(\.|\/)(csv)$/i,
            url: this.url + "api/data-import/file-upload",
            replaceFileInput: false,
            dataType: "json",
            formData: {
                import_for:1,
                language_type:that.selectedLanguageList,
                user_id: that.authService.getUserDetails()['data']['data']['id']

            },
            add: function (e: any, data: any) {
                $('#upload')
                    .off('click')
                    .on('click', function () {
                        that.uploadStatus = 'In process',
                            that.totalCount = '',
                            that.totalUpdated = '';
                        that.totalImported = '';
                        that.errorRecord = '';
                        that.isFileExist = false;
                        that.totalUploadCount = '',
                            that.importProgress = true;
                        data.submit();
                    });
            },
            beforeSend: function (xhr: any, data: any) {
                xhr.setRequestHeader('Accept', 'application/json');
                xhr.setRequestHeader(
                    'Authorization',
                    `Bearer ${localStorage.getItem('auth_token')}`
                );
            },

            done: function (e: any, data: any) {
                if (data._response.textStatus == 'success') {
                }
                that.fileName = data.result.name;
                clearInterval(logInterval);

                logInterval = setInterval(function () {
                    that.getImportLog('progress_' + data.result.import_id + '.txt');
                }, 3000);
            },
            error: function (jqXHR: any, textStatus: any, errorThrown: any) {
                if (errorThrown == "Bad Request") {
                    let errorMsg = jqXHR.responseJSON.message;
                    let importId = jqXHR.responseJSON.import_id;

                    // that.deleteInvalidLogFile(importId);
                    that.inValidFileUploadMsg(errorMsg);

                }
            },
            progressall: function (e: any, data: any) { },
        });
        
    }

    deleteInvalidLogFile(importId: any) {
        this.importProgress = false;

        this.apiService.getAll('api/data-import/area/deleteInvalidLogFile/' + importId).subscribe((response: any) => {
            console.log(`Invalid log file Deleted`);
        })
    }

    inValidFileUploadMsg(msg: any) {
        this.toastr.error(msg);
    }




    getImportLog(fileName: any) {

        var elem: any = document.getElementById("myBar");
        var widthelem: any = document.getElementById("progress_bar");
        var width = 0;

        var elem1: any = document.getElementById("myBar1");
        var widthelem1: any = document.getElementById("progress_bar1");
        var width1 = 0;

        var elem2 = document.getElementById("myBar2");
        var widthelem2 = document.getElementById("progress_bar2");
        var width2 = 0;

        let obj = this;
        this.apiService.getAll('api/data-import/uploadedFile/get_import_progress/' + fileName)
            .subscribe((response: any) => {
                // console.log("🚀 ~ file: list.component.ts:201 ~ ListComponent ~ .subscribe ~ response:", response)
                var result = response
                //Total Record

                var total = result['Total record']
                var imported = result['Import Record']
                var updated = result['Update Record']
                var error = result['Error Record']

                var totalData = +total;
                var totalUpdated = +updated
                var errorRecord = +error;
                var totalImported = +imported
                this.totalCount = totalData;
                this.totalUpdated = totalUpdated;
                this.totalImported = totalImported;
                this.errorRecord = errorRecord;
                var importData = result['Import Record'];
                var width = (importData * 100) / totalData;
                width = Math.round(width);

                var errorData = result['Error Record'];
                var width1 = (errorData * 100) / totalData;
                width1 = Math.round(width1);
                widthelem1.style.width = width1 + '%';
                elem1.innerHTML = errorData;
                var updateData = result['Update Record'];
                var width2 = (updateData * 100) / totalData;
                width2 = Math.round(width2);
                var status = result['Complete Record'];
                width = width + width2;
                widthelem.style.width = width + '%';
                elem.innerHTML = String(Number(importData) + Number(updateData));

                $(".count_imported").html(String(parseInt(importData) + parseInt(updateData)));
                if (status == '0') {
                    $(".statusFailed").hide();
                    $(".statusComplete").hide();
                } else if (status == '1') {
                    clearInterval(logInterval);
                    $(".statusFailed").hide();
                    this.uploadStatus="Completed";
                    $(".statusComplete").show();
                    this.isImportCompleted = true;
                    // this.getFileInfo()
                    $(document).on('hidden.bs.modal', '#import-popup', function () {
                        location.reload();
                    });
                } else if (status == '2') {
                    $(".statusFailed").show();
                    $(".statusComplete").hide();
                }

            })

    }

    downloadEmptyFile(){
   
        let a = document.createElement('a');
        let filepath = '';
        let moduleName ='Language';
        filepath = `assets/lib/data-template/${moduleName}_template.csv`;
        a.href = filepath;
        
        a.download = environment.prefixDownloadFile + `${this.selectedLanguageList}_template` + this.todaysDate + '.csv';
        document.body.appendChild(a);
        setTimeout(() => {
            a.click();
        }, 1000);
        document.body.removeChild(a);

        $('#export-popup').modal('toggle');
    };


    downloadWithData() {
        let exportId = this.selectedLanguageList !== "Classification" ? 1 : 2;
		this.apiService.getAll('api/data-retrieval/language/exportData/' + exportId)
		.subscribe((res: any) => {
		console.log("🚀 ~ file: list.component.ts:321 ~ ListComponent ~ .subscribe ~ res:", res)
			setTimeout(() => {
				let filepath = this.logFiles + "/" + res.filepath;
				let filename = res.filepath.replace(/\.[^/.]+$/, "");
				let a = document.createElement("a");
				a.href = filepath;
				a.download = environment.prefixDownloadFile + filename + this.todaysDate + '.csv';
				document.body.appendChild(a);
				a.click();
				document.body.removeChild(a);				
			}, 1000);
		});

		$('#export-popup').modal('toggle');
	}


    ngViewAfterViewInit() {
        this.startImport();
    }



}
