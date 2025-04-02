import { Component, EventEmitter, Input, OnInit, Output, SimpleChange } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { TranslocoService } from '@ngneat/transloco';
import { RecursiveSearchPipe } from 'src/app/shared/pipes/recursive-search.pipe';
import { ApiService } from 'src/app/services/api.service';

declare var $: any;
@Component({
	selector: 'app-edit',
	templateUrl: './add-edit.component.html',
	styleUrls: ['./add-edit.component.css']
})
export class AddEditComponent {
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
	categoryType: any = '';
	constructor(private search: RecursiveSearchPipe, private formBuilder: FormBuilder, private translocoservice: TranslocoService, private toastr: ToastrService, private apiService: ApiService) { }
	@Output() eventList = new EventEmitter<object>();
	@Input() data: any;
	@Input('selectedValue') set selectedValue(selectedValue: any) {
		this.categoryType = selectedValue
	}

	ngOnChanges(changes: { [property: string]: SimpleChange }) {
		let change: SimpleChange = changes['data'];
		if (change?.currentValue) {
			this.showForm(change.currentValue)
		}
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
			classificationName: ['', [Validators.required, Validators.pattern('^(?!null).*$'), Validators.pattern('^(?!Null).*$'), Validators.pattern('^(?!NULL).*$')]],
			classificationType: ['']
		}, {});
	}

	addCategory() {
		this.manageCategory.patchValue({
			classificationType: this.categoryType
		})

		this.apiService.post('api/data-import/classification/create', this.manageCategory.value).subscribe((res: any) => {
			if (res.success == true) {
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
		this.apiService.post('api/data-import/classification/update', data).subscribe((res: any) => {
			if (res.success == true) {
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
		
		this.add_form = !this.add_form;
		this.showTooltip = !this.showTooltip;
		this.manageCategory.reset();
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
				classificationName: rowData.classification_name,
				classificationType: rowData.classification_type
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
