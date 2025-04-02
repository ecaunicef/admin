import { Component, EventEmitter, Input, OnInit, Output, SimpleChange } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { TranslocoService } from '@ngneat/transloco';
import { RecursiveSearchPipe } from 'src/app/shared/pipes/recursive-search.pipe';
import { ApiService } from 'src/app/services/api.service';

declare var $: any;
@Component({
    selector: 'app-edit',
    templateUrl: './edit.component.html',
    styleUrls: ['./edit.component.css']
})
export class EditComponent {
    @Output('setPage') setPage: EventEmitter<any> = new EventEmitter();

    add_form: any = false;
    manageCategory!: FormGroup;

    viewForm: boolean = false;
    saveMsg: any;
    disableEmail: boolean = false;
    showEdit: boolean = false;
    add: any = '';
    titlePage: any = '';
    somethingError: any;
    checkedArea: any[] = []
    updateMsg: any;
    showTooltip: any;
    edit: any = '';
    categoryType:any='';
    constructor(private search: RecursiveSearchPipe, private formBuilder: FormBuilder, private translocoservice: TranslocoService, private toastr: ToastrService, private apiService: ApiService) { }
    @Output() eventList = new EventEmitter<object>();
    @Input() data: any;
    @Input('selectedValue') set selectedValue(selectedValue: any) {
       this.categoryType = selectedValue
    }

    ngOnChanges(changes: { [property: string]: SimpleChange }) {
        // Extract changes to the input property by its name
        let change: SimpleChange = changes['data'];
        // console.log("🚀 ~ file: add-edit.component.ts:31 ~ AddEditComponent ~ ngOnChanges ~ change.currentValue:", change.currentValue)
        if (change?.currentValue) {
            this.showForm(change.currentValue)
        }

        // Whenever the data in the parent changes, this method gets triggered
        // You can act on the changes here. You will have both the previous
        // value and the  current value here.
    }

    toggleOverlay() {
        $('.overlay').toggleClass('d-block');
        $('body').toggleClass('overflow-hidden');
    }

    ngOnInit(): void {
        this.createUserForm();

        this.translocoservice.selectTranslateObject('user').subscribe((res: any) => {
            this.add = res.add
            this.edit = res.edit
            this.saveMsg = res.save_msg
            this.updateMsg = res.update_msg
        });

        this.translocoservice.selectTranslateObject('common').subscribe((res: any) => {
            this.somethingError = res.something_error
        });





        var toggler = document.getElementsByClassName("caret");
        var i;

        for (i = 0; i < toggler.length; i++) {
            toggler[i].addEventListener("click", function (this: any) {
                this.parentElement.querySelector(".nested").classList.toggle("active");
                this.classList.toggle("caret-down");
            });
        }
    }

    createUserForm() {
        this.manageCategory = this.formBuilder.group({
            id: [''],
            name: ['', [Validators.required, Validators.pattern('^(?!null).*$'), Validators.pattern('^(?!Null).*$'), Validators.pattern('^(?!NULL).*$')]],
            type: ['']
            //   email: ['', [Validators.required,
            //   Validators.pattern('[A-Za-z0-9._%+-]{2,}@[a-zA-Z]{3,}([.]{1}[a-zA-Z]{2,}|[.]{1}[a-zA-Z]{2,}[.]{1}[a-zA-Z]{2,})')]],
            //   phone: ['', [Validators.required, Validators.minLength(7), Validators.maxLength(10), Validators.pattern(/^[0-9]+$/)]],
            //   department: [[], Validators.required],
            //   designation: ['', Validators.required],
            //   password: ['', [Validators.required, Validators.required, Validators.minLength(7), Validators.maxLength(20), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)]],
            //   user_role: ['', Validators.required],
        }, {});
    }

    addCategory() {
        this.manageCategory.patchValue({
            type: this.categoryType
        })

        this.apiService.post('api/data-import/category/add-category', this.manageCategory.value).subscribe((res: any) => {
            if (res.status == true) {
                this.toastr.success(res.message);
                this.manageCategory.reset();
                this.showForm('');
                this.setPage.emit({ offset: 0 });


            } else {
                this.toastr.error(res.message);
                this.manageCategory.reset();
                this.showForm('');
            }
        })
    }

    updateCategory(data: any) {
        this.apiService.post('api/data-import/category/update-category', data).subscribe((res: any) => {
            if (res.status == true) {
                this.toastr.success(res.message);
                this.manageCategory.reset();
                this.showForm('');
                this.setPage.emit({ offset: 0 });

            } else {
                this.toastr.error(res.message);
                this.manageCategory.reset();
                this.showForm('');
            }
        })
    }

    showForm(rowData: any) {

        if (rowData?.view == true) {
            this.viewForm = true
        } else {
            this.viewForm = false
        }

        this.manageCategory.reset();
        this.add_form = !this.add_form;
        this.showTooltip = !this.showTooltip;
        if (rowData != undefined) {
            this.titlePage = this.edit;
            this.showEdit = true;


            this.disableEmail = true;

            const passwordControl = this.manageCategory.get('password');

            if (passwordControl) {
                passwordControl.setValidators([]);
                passwordControl.updateValueAndValidity()
            }

            console.log(rowData, ":rowData")

            this.manageCategory.patchValue({
                id: rowData.id,
                name: rowData.name,
                type:rowData.type
                //   email: rowData.email,
                //   user_role: rowData.role,
                // unit: rowData.unit,
                //   phone: rowData.phone,
                // department: rowData.department,
                //   area: null,
                //   password: '',
                //   designation: rowData.designation
            });
        } else {
            $('.area_input').prop("checked", false);


            this.titlePage = this.add;
            this.showEdit = false;
            this.manageCategory.reset();
        }
        this.toggleOverlay();
        // console.log('selectArea', this.checkedArea)
    }

}
