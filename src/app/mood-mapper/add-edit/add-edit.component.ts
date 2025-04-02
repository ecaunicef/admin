import { Component, EventEmitter, Output, Input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { ToastrService } from 'ngx-toastr';


declare var bootstrap: any;
declare var $: any;

@Component({
  selector: 'app-add-edit',
  templateUrl: './add-edit.component.html',
  styleUrls: ['./add-edit.component.css']
})
export class AddEditComponent {
  @Output('setPage') setPage: EventEmitter<any> = new EventEmitter();

  manageChatline !: FormGroup;
  add_form: any = false;
  showTooltip: any = false;
  titlePage: any = '';
  showEdit: boolean = false;
  allMood: any = ['Happy', 'Excited', 'Loved', 'Sad', 'Angry', 'Depressed', 'Stressed', 'Guilty', 'Lonely', 'Resilient', 'Hurt'];
  allAssigneList: any = ['Call Us', 'Counselling', 'My Diary', 'My Chill Spot', 'Arcade', 'U-Matter', 'My Rights', 'Parenting Hub', 'Government Services', 'Resources', 'MyChild Helpline', 'UNICEF ECA'];

  manageCredential!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    private toastr: ToastrService,

  ) { }
  showForm(rowData: any) {
    this.add_form = !this.add_form;
    this.showTooltip = !this.showTooltip;
    if (rowData != undefined && rowData != '') {
      this.titlePage = 'Edit';
      this.showEdit = true;

      const assignedModulesArray = rowData?.assigned_modules 
      ? rowData.assigned_modules.split(',').map((item:any) => item.trim()) 
      : [];

      this.manageCredential.patchValue({
        id: rowData?.id,
        mood: rowData?.mood,
        description: rowData?.description,
        assigned_modules: assignedModulesArray
      })

    } else {
      this.titlePage = 'Add';
      this.showEdit = false;
    }
  }
  toggleOverlay() {
    $('.overlay').toggleClass('d-block');
    $('body').toggleClass('overflow-hidden');
  }

  createCredientialForm() {
    this.manageCredential = this.formBuilder.group({
      id: [''],
      mood: ['', Validators.required],
      description: ['', Validators.required],
      assigned_modules: [[], Validators.required]
    }, {});
  }

  updateMoodMapper(){
    this.apiService.post('api/data-import/mood-mapper/edit-mapper', this.manageCredential.value).subscribe((res:any)=>{
      if(res.status){
        this.toastr.success(res.message)
        this.showForm('');
        this.manageCredential.reset();
        this.setPage.emit({ offset: 0 });

      } else{
        this.toastr.error(res.message);
      }
    })
  }



  ngOnInit(): void {
    this.createCredientialForm();
  }

}
