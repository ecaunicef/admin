import { Component, EventEmitter, Output, Input } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../services/api.service';
import { HeaderService } from '../../services/header.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
declare var bootstrap: any;
declare var $: any;

@Component({
    selector: 'app-add-edit',
    templateUrl: './add-edit.component.html',
    styleUrls: ['./add-edit.component.css']
})
export class AddEditComponent {
    @Input() rows: any[] = [];
	@Output('setPage') setPage: EventEmitter<any> = new EventEmitter();

    constructor(
        private apiService: ApiService, 
        private toastr: ToastrService,
        private formBuilder: FormBuilder, 
        private headerService: HeaderService, 
    ) {
        
    }

    manageChatline !: FormGroup;
    add_form: any = false;
    showTooltip: any = false;
    allAreas: any = [];
    titlePage: any = '';
    showEdit: boolean = false;

    createForm(){
        this.manageChatline = this.formBuilder.group({
            id: [''],
            area_level1: ['',Validators.required],
            w_link:['',Validators.required],
        });
    }

    toggleOverlay() {
        $('.overlay').toggleClass('d-block');
        $('body').toggleClass('overflow-hidden');
    }

    showForm(rowData: any) {
        this.add_form = !this.add_form;
        this.showTooltip = !this.showTooltip;
        this.manageChatline.reset();

        if (rowData != undefined && rowData != '') {
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
        const { id, area_level1, w_link } = rowData;
        this.manageChatline.patchValue({
            id: id,
            area_level1: area_level1,
            w_link: w_link,

        });

    }


    ngOnInit(){
        this.getAreaList();
        this.createForm();
    }

   
    doesAreaExists(item: any): boolean {
        // console.log(item.area_code, this.rows)
        return this.rows.some((data: any) => item.area_code === data.area_level1);
    }
    

    getAreaList(){
        this.apiService.getAll('api/data-retrieval/area/get-area-list').subscribe((data:any)=>{
            this.allAreas = data.data?.filter((item:any)=>{
                return(
                    item.level == 1
                )
            });

            // console.log("rows", this.rows)

            // console.log(this.allAreas)

            // let areaLevel1Codes = this.rows.map(item => item.area_level1);

            // this.allAreas = all_area.filter((item: any) => !areaLevel1Codes.includes(item.area_code));

            // console.log(this.allAreas);
        })
    }

    addChatline(){
        this.apiService.post('api/data-import/chatline/save', this.manageChatline.value).subscribe((res:any)=>{
            if(res.status){
                this.toastr.success(res.message);
                this.manageChatline.reset();
                this.showForm('');
				this.setPage.emit({ offset: 0 });

            } else{
                this.toastr.error(res.message);
            }
        })
    }


    updateChatline(){
        const payload = this.manageChatline.value;
        this.apiService
            .post('api/data-import/chatline/update', payload).subscribe((response: any) => {
                if (response.status) {
                    this.toastr.success(response.message);
                    this.setPage.emit({ offset: 0 });
                    this.showForm('');
                } else {
                    this.toastr.error(response.message);
                }
            });

    }



}
