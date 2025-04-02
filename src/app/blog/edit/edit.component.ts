import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  SimpleChange,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { TranslocoService } from '@ngneat/transloco';
import { RecursiveSearchPipe } from 'src/app/shared/pipes/recursive-search.pipe';
import { ApiService } from 'src/app/services/api.service';
import { HeaderService } from '../../services/header.service';



declare var $: any;
@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css'],
})
export class EditComponent {
  @Output('setPage') setPage: EventEmitter<any> = new EventEmitter();
  add_form: any = false;
  blogForm!: FormGroup;
  showEdit: boolean = false;
  add: any = 'Add';
  titlePage: any = '';
  showTooltip: any;
  edit: any = '';
  filename: any = '';
  imageError: boolean = false;
  imageTypeFile: any = '.png,.jpeg,.jpg';
  minDate: any = Date;
  allCountryList:any=[];
  selectedHeaderArea:any={
    'country':'all',
    'district':'all'
  };

  constructor(
    private search: RecursiveSearchPipe,
    private formBuilder: FormBuilder,
    private translocoservice: TranslocoService,
    private toastr: ToastrService,
    private apiService: ApiService,
    private headerService: HeaderService,
  ) {
    this.minDate = new Date();
  }

  userInfo: any;
  ngOnInit(): void {
    this.createBlogForm();
    this.getBroadcastCategory();
    this.apiService.getAll("api/data-retrieval/users/details").subscribe((res:any) => {
      let userData = res?.data?.data;
      this.userInfo = userData;
    })
    this.headerService.getAllAreas().subscribe((res: any) => {
      setTimeout(() => {
        if (res?.area?.status && res?.area?.data) {
          this.allCountryList = res?.area?.data;
        }
        if (res?.district_selected && res?.country_selected){
          this.selectedHeaderArea['country'] = JSON.stringify(res?.country_selected);
          this.selectedHeaderArea['district']=JSON.stringify(res.district_selected);
        }
      },100)
    });
    this.setMinDateTime();

    // this.sent

  }

  minDateTime: any;
  setMinDateTime() {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 1); // Add 1 minute
    this.minDateTime = now.toISOString().slice(0, 16); // Format as 'YYYY-MM-DDTHH:mm'    // Format to "yyyy-MM-ddTHH:mm"
  }

  ngAfterViewInit(){
    $('.dateTimePicker').click(function (this:any) {
      this.showPicker();
    })
  }


  getImage(event: any) {
    const files = event.target.files;
    if (files.length) {
      const file = files[0];
      const validExtensions = ['png', 'jpeg', 'jpg'];
      const fileExtension = file.name.split('.').pop()?.toLowerCase();

      this.imageError = false;
      this.filename = file.name;

      if (!validExtensions.includes(fileExtension)) {
        this.filename = '';
        this.imageError = true;
        this.blogForm.patchValue({ image: null });
        return;
      }

      this.blogForm.patchValue({ image: file });
    } else {
      this.filename = '';
      this.blogForm.patchValue({ image: null });
    }
  }

  createBlogForm() {
    this.blogForm = this.formBuilder.group({
      id: [''],
      title: ['', Validators.required],
      subtitle: [''],
      message: ['', Validators.required],
      message_category: ['', Validators.required],
      broadcastDate: [''],
      area: ['', Validators.required],
      is_scheduled: ['', Validators.required],
      createdBy: [""],
    });

    this.setupBroadcastDateValidation();

  };


setupBroadcastDateValidation() {
  this.blogForm.get('is_scheduled')?.valueChanges.subscribe((isSentValue) => {
    const broadcastDateControl = this.blogForm.get('broadcastDate');

    if (isSentValue === '1') {
      broadcastDateControl?.setValidators([Validators.required]);
    } else {
      broadcastDateControl?.clearValidators();
    }

    broadcastDateControl?.updateValueAndValidity();
  });
}

  messageCategory:any=[];
  getBroadcastCategory(){
    this.apiService.getAll('api/data-retrieval/blog/get-broadcast-category').subscribe((res:any)=>{
      if(res.success){
        this.messageCategory = res?.data;
      }
    })
  }

  showForm(rowData: any) {
    this.blogForm.reset();
    this.add_form = !this.add_form;
    this.showTooltip = !this.showTooltip;
    this.filename = "";

    if (rowData != undefined) {
      this.titlePage = 'Edit';
      this.showEdit = true;
      this.patchFormData(rowData);
    } else {
      this.titlePage = 'Add';
      this.showEdit = false;
    }
    this.toggleOverlay();
  }

  patchFormData(rowData: any) {
    const { id, title, subtitle, message_category, message, area_code ,scheduled, is_scheduled } = rowData;

    let areacodeList=area_code?.split(',');
    if (areacodeList?.length == this.allCountryList?.length){
      this.isAllSelected=true;
    }else{
      this.isAllSelected = false;
    }

    const formattedScheduled = scheduled
        ? new Date(scheduled).toISOString().slice(0, 16)
        : null;

    this.blogForm.patchValue({
      id: id,
      title: title,
      subtitle: subtitle,
      message:message,
      message_category: message_category,
      broadcastDate:formattedScheduled,
      is_scheduled: String(is_scheduled),
      area:areacodeList
    });
    // this.filename = image;
  }

  getLocalizedDate(date: string): string {
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return new Date(this.blogForm.value.broadcastDate).toLocaleString('en-US', { timeZone: userTimeZone });
  }

  createBlog() {
    console.log(this.blogForm.value, "bbbbbbbbbbbbbbbbbbbb")


    this.apiService
      .postWithImage('api/data-import/blog/create-blogs',{ ...this.blogForm.value, is_scheduled: Number(this.blogForm.value.is_scheduled), createdBy: this.userInfo['id'], sent_date: new Date()})
      .subscribe((response: any) => {
        if (response.success) {
          this.toastr.success(response.message);
          this.setPage.emit({ offset: 0 });
          this.showForm('');
        } else {
          this.toastr.error(response.message);
        }
      });
  }

  updateBlog() {
    // const formData = new FormData();
    // const { id, title, subtitle, description, tag } = this.blogForm.value;

    // formData.append('id', id);
    // formData.append('title', title);
    // formData.append('subtitle', subtitle);
    // formData.append('description', description);
    // formData.append('broadcastDate', description);
    // formData.append('tag', tag);

    // if (this.blogForm.get('image')?.value) {
    //   formData.append('image', this.blogForm.get('image')?.value);
    // }

    const scheduledDate = Number(this.blogForm.value.is_scheduled) === 0 ? null : this.blogForm.value.broadcastDate;
    const payload = {
      ...this.blogForm.value,
      is_scheduled: Number(this.blogForm.value.is_scheduled),
      broadcastDate: scheduledDate,
      createdBy: this.userInfo['id'],
      sent_date: new Date()
    }
    this.apiService
      .postWithImage('api/data-import/blog/update-blog', payload)
      .subscribe((response: any) => {
        if (response.success) {
          this.toastr.success(response.message);
          this.setPage.emit({ offset: 0 });
          this.showForm('');
        } else {
          this.toastr.error(response.message);
        }
      });
  }

  toggleOverlay() {
    $('.overlay').toggleClass('d-block');
    $('body').toggleClass('overflow-hidden');
  }
  

  isAllSelected:boolean = false;

  toggleSelectAll() {
    this.isAllSelected = !this.isAllSelected;
    if (this.isAllSelected) {
      this.blogForm.patchValue({
        area: this.allCountryList.map((item: any) => item.country_area_code)
      })
      // this.isAllSelected = ;
    }else {

      this.blogForm.patchValue({
        area:[]
      });

    }
  }

  onSelectionChange(event: any) {
    const selectedValues = this.blogForm?.value?.area || [];
    console.log(selectedValues?.length === this.allCountryList?.length,"9999")
    if (selectedValues?.length === this.allCountryList?.length) {
      this.isAllSelected = true;
    }else{

      this.isAllSelected = false;
    }
  }


  //=================== Country name accn to country area_code  =============================//
  getCountryName(areaCode: string): string | undefined {
    const country = this.allCountryList.find((c:any) => c.country_area_code === areaCode);
    return country ? country.country_name : undefined;
  }

}
