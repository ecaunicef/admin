import {
  Component,
  Output,
  EventEmitter,
  ViewChild,
  Input,
  SimpleChange,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormGroupDirective,
  FormArray,
  AbstractControl,
} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { TranslocoService } from '@ngneat/transloco';
import { ApiService } from '../../../services/api.service';

declare var $: any;
@Component({
  selector: 'app-add-edit',
  templateUrl: './add-edit.component.html',
  styleUrls: ['./add-edit.component.css'],
})
export class AddEditComponent {
  // show form on click
  form_open: any = false;
  areaDropdown: any = [];
  nodes: any = [];
  addEditForm: any = FormGroup;
  documentEncodedName: any = '';
  docfilename: any;
  document: any;
  documentBase64: any;
  validationError: any;
  levels: any = ['1', '2', '3', '4', '5'];
  showEdit: any = false;
  showTooltip: any = true;
  selected:any
  @Output() emitAddUpdate = new EventEmitter<string>();
  saveMsg: any;
  updateMsg: any;
  checkJsonFile: boolean = true;
  patchedStartDate:any
  patchedEndDate:any
  maxDate:any= new Date('01/01/3000')
  viewForm: boolean = false
  // startDate: Date;
  // startDateD: Date;

  @Input('data') set data(data: any) {
    if (data != undefined && !(Object.keys(data).length === 0)) {
      this.showForm(data);
    }
  }

  constructor(
    private dataService: ApiService,
    public formBuilder: FormBuilder,
    private toastr: ToastrService,
    private translocoservice: TranslocoService
  ) {
   }

  showForm(rowData: any) {
  console.log("₱ ~ AddEditComponent ~ showForm ~ rowData:", rowData?.view)

    if(rowData?.view == true){
      this.viewForm = true
    }else{
      this.viewForm = false
    }

    this.addEditForm.reset();
    this.form_open = !this.form_open;
    this.showTooltip = !this.showTooltip;
    console.log(rowData);

    this.showEdit = false;
    this.docfilename = '';

    if (rowData !== undefined) {
      this.showEdit = true;


      let startDate =  rowData.startDate.split('/').join('-'),
        endDate = rowData.endDate.split('/').join('-');

       const [day, month, year] = startDate.split("-");
       const [dd, mm, yyyy] =  endDate.split("-");
       startDate = new Date(`${year}-${month}-${day}`);
       endDate = new Date(`${yyyy}-${mm}-${dd}`);

      let dates = { 'startDate': startDate, 'endDate': endDate };
      // console.log('addEditForm dates',dates)
      // return
      this.selected = dates
      this.addEditForm.patchValue({
        id: rowData._id,
        title: rowData.title,
        levels: rowData.level,
        // dates: dates,
      //   fromDate:new Date(rowData.startDate),
      // toDate:new Date(rowData.endDate),
      fromDate:new Date(dates.startDate),
      toDate:new Date(dates.endDate),
      });
      // console.log('addEditForm',this.addEditForm.value);
      // this.patchedStartDate = rowData.startDate
      // this.patchedEndDate = rowData.endDate 
      // this.docfilename = rowData.original_name;   
      this.docfilename = rowData.document;   
    }

    this.toggleOverlay();
  }

  ngOnInit() {
    this.createAddForm();
    this.translocoservice.selectTranslateObject('data_source').subscribe((res: any) => {
      this.saveMsg = res.save_msg
      this.updateMsg = res.update_msg
    });
  }


  // for overlay on click
  ngAfterViewInit() {

  }

  createAddForm() {
    this.addEditForm = this.formBuilder.group({
      id: [''],
      title: ['', Validators.required],
      levels: ['', Validators.required],
      // dates: ['', Validators.required],
      fromDate:['', Validators.required],
      toDate:['', Validators.required],
      jsonFile: ['', Validators.required],
    });
  }

  isDocSelected: any = false;
  getDocument(event: any) {
    this.documentEncodedName = '';

    let files = event.target.files;
      
    if (files.length) {
      this.isDocSelected = true;
    } else {
      this.isDocSelected = false;
    }

    if (files.length<=0 ) {
      
      this.document = '';
      this.docfilename = '';
      return;
    }
    let file = files[0];

    this.docfilename = files[0].name;
    // console.log("🚀 ~ file: add-edit.component.ts:131 ~ AddEditComponent ~ getDocument ~ this.docfilename:", this.docfilename.split('.').pop())
      if(this.docfilename.split('.').pop() != 'json'){
        this.document = '';
        this.docfilename = '';
        this.checkJsonFile = false
        // this.addEditForm.controls['jsonFile'].setValue('')
      }else{
        this.checkJsonFile = true

        // this.addEditForm.controls['jsonFile'].setValue(this.docfilename)
        if (files && file) {
          var reader = new FileReader();
          reader.onload = this._handleReaderLoadedDocument.bind(this);
    
          reader.readAsBinaryString(file);
          this.document = '';
        }
      }
     

   
  }

  _handleReaderLoadedDocument(event: any) {
    let binaryString = event.target.result;
    this.documentBase64 = btoa(binaryString);
    // console.log("document", this.documentBase64, this.docfilename)

    this.documentEncodedName = this.docfilename + ';' + this.documentBase64;
  }

  addNewRecord(formValue: any) {
    // console.log("₱ ~ AddEditComponent ~ addNewRecord ~ formValue:", formValue)
    let fromDate = new Date(this.addEditForm.value.fromDate);
    let toDate = new Date(this.addEditForm.value.toDate);
    
    // Increment the dates by one day
    fromDate.setUTCDate(fromDate.getUTCDate() + 1);
    toDate.setUTCDate(toDate.getUTCDate() + 1);
    
    let dates = {
      startDate: fromDate.toISOString().substring(0, 10),
      endDate: toDate.toISOString().substring(0, 10)
    };

    formValue.jsonFile = this.documentEncodedName;
    formValue.dates = dates;

    this.validationError = [];
    this.dataService
      .post('api/data-import/manage-gis/add-gis', formValue)
      .subscribe((resp: any) => {
        console.log('response', resp);
        if (resp.success == false) {
          this.validationError = resp.error;
        } else {
          this.toastr.success(this.saveMsg);
          this.form_open = false;
          this.addEditForm.reset();

          this.emitAddUpdate.emit(resp.success);
          this.toggleOverlay();
        }
      });
  }

  updateGis(formVal: any) {
    if (
      formVal.title == '' ||
      formVal.levels == '' ||
      formVal.jsonFile == '' ||
      formVal.dates == ''
    ) {
      return;
    }
    formVal['jsonFile'] = this.documentEncodedName;
    // console.log(typeof formVal.dates);
    // const startDate = new Date(formVal.dates.startDate)
    // let endDate =  new Date(formVal.dates.endDate) 

    // const [day, month, year] = this.patchedEndDate.split("/");
    // const dateObj = new Date(year, month - 1, day);
    // const months = [
    //   "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    //   "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    // ];
    // const dayName = dateObj.toLocaleDateString("en-US", { weekday: "short" });
    // const monthName = months[dateObj.getMonth()];
    // const formattedEndDate = `${dayName} ${monthName} ${day} ${year} 00:00:00 GMT+0530 (India Standard Time)`;

    // // console.log(this.patchedStartDate, this.patchedEndDate, (formattedEndDate == endDate.toString()))
    // // return
    // if(formattedEndDate != endDate.toString()){
    //   // reduce end date to -1 day
    //   endDate.setDate(endDate.getDate() - 1);
    // }

    let fromDate = new Date(this.addEditForm.value.fromDate);
    let toDate = new Date(this.addEditForm.value.toDate);
    
    // Increment the dates by one day
    fromDate.setUTCDate(fromDate.getUTCDate() + 1);
    toDate.setUTCDate(toDate.getUTCDate() + 1);
    
    let dates = {
      startDate: fromDate.toISOString().substring(0, 10),
      endDate: toDate.toISOString().substring(0, 10)
    };

    formVal['dates'] =  dates //JSON.stringify({startDate, endDate});


    // console.log(startDate, endDate)
    // return

    let id = this.addEditForm.get('id').value;
    // api/data-import/resources/update
    this.dataService
      .update('api/data-import/manage-gis/update-gis', id, formVal)
      .subscribe((response: any) => {
       
        if (response.success == false) {
          this.validationError = response.error;
        } else {
          this.toastr.success(this.updateMsg);
          // reset the form after submitting data
          this.addEditForm.reset();

          this.form_open = false;

          this.showEdit = false;
          this.emitAddUpdate.emit(response.success);
          this.toggleOverlay();
        }
      });
  }

  toggleOverlay() {

    $('.overlay').toggleClass('d-block');
    $('body').toggleClass('overflow-hidden');


  }
}
