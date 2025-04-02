import { Component, EventEmitter, Input, OnInit, Output, SimpleChange } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../../services/api.service';
import { FormControl } from '@angular/forms';
import { TranslocoService } from '@ngneat/transloco';
import { compose } from 'underscore';
import { CommonService } from 'src/app/services/common.service';
declare var $: any;

@Component({
	selector: 'app-role-form',
	templateUrl: './role-form.component.html',
	styleUrls: ['./role-form.component.css']
})

export class RoleFormComponent implements OnInit {
	// show form on click
	// selectedFolderNames = new FormControl('');
	passwordBoxTypeText = true;
	add_form: any = false;
	titlePage: any = '';
	showEdit: boolean = false;
	managePermission!: FormGroup;
	add: any = '';
	edit: any = '';
	tabChanges: boolean = false;
	showTooltip: any;
	selected_area: any;
	parentLevel: any;
	areaDropdown: any = [];
	nodes: any;
	nodeJsonData: any;
	node: any = [];
	checkedUserArea: any = [];
	isAreaChecked: boolean = false;
	totalAreaCount: any = 0;
	addUserForm: any;
	area: any = [];
	enableAddForm: boolean = false
	countPermission: number = 0

	permission: any = JSON.stringify({ viewIsChecked: false, editIsChecked: false, deleteIsChecked: false, showIsChecked: false });
	module: any = []

	disableEmail: boolean = false;
	saveMsg: any;
	updateMsg: any;
	somethingError: any;
	filteredModule: any = [];
	subModuleList: any = [];
	selectedModule: any;
	selectedSubModule: any;
	permissionCheckBox: any = {
		"add_edit": false,
		"delete": false,
		"show_hide": false,
		"view": false,
	}
	allPermissionList: any;
	filteredRole: any = [];
	allPermissionOrg: any = [];
	allCheckAction: any = [];
	selectModuleShow: any = '';
	selectSubModuleShow: any = '';
	arrayUniqueByKey: any = [];
	filterModuleList: any;
	clearSearch = '';
	role: string = ''
	allViewChecks: boolean = true
	allAddEditChecks: boolean = true
	allAllDeleteChecks: boolean = true
	allShowHideChecks: boolean = true
	listindex: any
	allViewChecked: boolean = false
	listindex2: any;
	showPrimaryData: boolean = false;
	buttonEnable: boolean = false;
	buttonOn: boolean = true;
	selectedFolderNames: any = []
	folderNames: any = []
	showModelData:any= {};
	viewForm: boolean = false

	constructor(private formBuilder: FormBuilder, private translocoservice: TranslocoService, private apiService: ApiService, private toastr: ToastrService, private commonService: CommonService) { }
	@Output() eventList = new EventEmitter<object>();

	@Input() data: any;

	ngOnInit(): void {

		this.createUserForm();
		this.getAllFolderNames()

		this.translocoservice.selectTranslateObject('role_permission').subscribe((res: any) => {
			this.add = res.add
			this.edit = res.edit
			this.saveMsg = res.save_msg
			this.updateMsg = res.update_msg
		});

		this.translocoservice.selectTranslateObject('common').subscribe((res: any) => {
			this.somethingError = res.something_error
		});

		let data = this.commonService.getPermissionList().subscribe((res: any) => {
			this.module = res
			// console.log("🚀 ~  file: role-form.component.ts:135 ~  RoleFormComponent ~  data ~   this.module :",  this.module )
			this.filterModuleList = this.module
		})
		this.commonService.createPermissionList();
	}



	ngOnChanges(changes: { [property: string]: SimpleChange }) {
		let change: SimpleChange = changes['data'];
		if (change.currentValue) {
			this.showForm(change.currentValue)
		}
	}


	createUserForm() {
		this.managePermission = this.formBuilder.group({
			id: ['']
		});
	}

	toggleSelection(item: string, event: any) {
		if (this.selectedFolderNames.includes(item)) {
			this.selectedFolderNames = this.selectedFolderNames.filter((selectedItem: any) => selectedItem !== item);
		} else {
			this.selectedFolderNames.push(item);
		}
		if (this.selectedFolderNames.length > 0) {
			this.showPrimaryData = true
		} else {
			this.showPrimaryData = false
		}

		if (this.selectedFolderNames.length == this.folderNames.length) {
			$('#selectAllFolder').prop('checked', true);
		} else {
			$('#selectAllFolder').prop('checked', false);
		}
		// console.log('event',this.selectedFolderNames);
	}


	getAllFolderNames() {
		// this.apiService
		// 	.getAll('api/data-retrieval/role-permission/getFiles')
		// 	.subscribe((res: any) => {
		// 		this.folderNames = res.folderNames
		// 	});
		// this.apiService
		// 	.getAll('api/primary-dataset/datasetImport/folder_list')
		// 	.subscribe((res: any) => {
		// 		// console.log("🚀 ~  file: role-form.component.ts:158 ~  RoleFormComponent ~  .subscribe ~  res:", res)
		// 		this.folderNames = res.folderNames
		// 	});

			
	}


	handleValidationForFolderNames: any = []
	showForm(rowData: any) {
		if(rowData?.view == true){
			this.viewForm = true
		}else{
			this.viewForm = false
		}
		
		$('#selectAllFolder').prop('checked', false);

		this.toggleOverlay()
		this.showTooltip = !this.showTooltip;
		if (rowData == undefined) {
			this.buttonOn = true

			this.showPrimaryData = false

			this.selectedFolderNames = []
			this.role = ''
			this.countPermission = 0
			this.enableAddForm = false
			this.module.forEach((element: any) => {

				element.subModule.forEach((ele: any) => {

					ele.permission.deleteIsChecked = false;
					ele.permission.editIsChecked = false;
					ele.permission.showIsChecked = false;
					ele.permission.viewIsChecked = false;

				})

				let subModuleCount = element.subModule.length;

				element.permission.deleteIsChecked = false
				element.permission.editIsChecked = false
				element.permission.showIsChecked = false
				element.permission.viewIsChecked = false

			});

		}

		// this.allCheckAction  =[]

		this.clearSearch = ''
		this.module = this.filterModuleList
	
		this.add_form = !this.add_form;
		if (rowData != undefined) {
			this.buttonOn = false
			this.showPrimaryData = true
			this.titlePage = this.edit;
			this.showEdit = true;
			// this.enableAddForm = true
			this.selectedFolderNames = rowData.primary_data_folder_name
			// console.log(rowData, 'rowDatarowDatarowDatarowData');



			rowData.permissions.forEach((e: any) => {
				this.allCheckAction = e.actions
			})

			this.permissionCheckBox = {
				"add_edit": this.allCheckAction[0]?.add_edit,
				"delete": this.allCheckAction[1]?.delete,
				"show_hide": this.allCheckAction[2]?.show_hide,
				"view": this.allCheckAction[3]?.view,
			}

			this.role = rowData.name

			this.module.forEach((element: any) => {



				let allDeleteChecked = 0, allEditIsChecked = 0,
					allShowIsChecked = 0, allViewIsChecked = 0;

				element.subModule.forEach((ele: any) => {

					let permission = rowData?.permissions.find((e: any) => e.subModule == ele.name);

					let temp: any = {};

					permission?.actions.forEach((e: any) => {
						temp = { ...temp, ...e }
					});

					allDeleteChecked += (temp.delete) ? 1 : 0,
						allEditIsChecked += (temp.add_edit) ? 1 : 0,
						allShowIsChecked += (temp.show_hide) ? 1 : 0,
						allViewIsChecked += (temp.view) ? 1 : 0;

					// console.log(temp.delete, temp.add_edit, temp.show_hide, temp.view)
					// this is used for form validation on patch data
					temp.delete == true ? this.countPermission += 1 : 0
					temp.add_edit == true ? this.countPermission += 1 : 0
					temp.show_hide == true ? this.countPermission += 1 : 0
					temp.view == true ? this.countPermission += 1 : 0

					ele.permission.deleteIsChecked = temp.delete;
					ele.permission.editIsChecked = temp.add_edit;
					ele.permission.showIsChecked = temp.show_hide;
					ele.permission.viewIsChecked = temp.view;
				})


				let subModuleCount = element.subModule.length;

				element.permission.deleteIsChecked = (allDeleteChecked == subModuleCount);
				element.permission.editIsChecked = (allEditIsChecked == subModuleCount);
				element.permission.showIsChecked = (allShowIsChecked == subModuleCount);
				element.permission.viewIsChecked = (allViewIsChecked == subModuleCount);

			});

			this.managePermission.patchValue({
				id: rowData._id
			});

			console.log("»»ᅳAJᅳ► ~  file: role-form.component.ts:293 ~  RoleFormComponent ~  showForm ~  rowData.permissions.module:", rowData.permissions.module)
			this.selectModule({ value: rowData.permissions.module })

			// if (this.selectedFolderNames.length == this.folderNames.length) {
			// 	$('#selectAllFolder').prop('checked', true);
			// } else {
			// 	$('#selectAllFolder').prop('checked', false);
			// }

		} else {
			this.permissionCheckBox = {
				"add_edit": false,
				"delete": false,
				"show_hide": false,
				"view": false,
			}
			this.selectedModule = []
			this.selectedSubModule = []
			this.managePermission.patchValue({
				module: '',
				subModule: ''
			});

			this.selectModuleShow = ''
			this.selectSubModuleShow = ''

			this.titlePage = this.add;
			this.showEdit = false;
			this.managePermission.reset();
		}
		this.buttonEnable = this.isAnyPermissionTrue(this.module)
	}

	toggleOverlay() {
		$('.overlay').toggleClass('d-block');
		$('body').toggleClass('overflow-hidden');
	}




	// for overlay on click
	ngAfterViewInit() {

		this.getAllPermission();


		setTimeout(() => {
			// $(".open_childs").click(function (this:HTMLElement) {
			//   $(this).parent().parent().find(".sub-level").addClass('d-table-row');
			// });
		}, 100);
	}


	addPermission() {
		//---------------------------------------
		let data: any = {}
		let dataSurvey: any = {};
		// for (var i = 0; i < this.module[0].subModule.length; i++) {
		// 	let single = this.module[0].subModule[i]
		// 	if (single.name == 'Primary Data-Ingest' || single.name == 'Primary Data-Filter' || single.name == 'Primary Data-Clean' || single.name == 'Primary Data-Calculate' || single.name == 'Primary Data-Complete') {
		// 		if (single?.permission['viewIsChecked'] == true) {
		// 			data = {
		// 				name: 'Primary Data',
		// 				displayName: 'Primary Data',
		// 				permission: {
		// 					viewIsChecked: true,
		// 					editIsChecked: true,
		// 					deleteIsChecked: true,
		// 					showIsChecked: true
		// 				}
		// 			}
		// 		} else {
		// 			data = {
		// 				name: 'Primary Data',
		// 				displayName: 'Primary Data',
		// 				permission: {
		// 					viewIsChecked: false,
		// 					editIsChecked: false,
		// 					deleteIsChecked: false,
		// 					showIsChecked: false
		// 				}
		// 			}
		// 		}
		// 		break;
		// 	}
		// }

		// for (let i = 0; i < this.module[3].subModule.length; i++) {
		// 	let subModule = this.module[3].subModule[i];
		// 	if (subModule.name == 'Survey Manager-Pending' || subModule.name == 'Survey Manager-InProgress' || subModule.name == 'Survey Manager-Completed' || subModule.name == 'Survey Manager-Validated' || subModule.name == 'Survey Manager-Cancelled') {
		// 		if (subModule?.permission['viewIsChecked'] == true) {
		// 			dataSurvey = {
		// 				name: 'Survey Manager',
		// 				displayName: 'Survey Manager',
		// 				permission: {
		// 					viewIsChecked: true,
		// 					editIsChecked: true,
		// 					deleteIsChecked: true,
		// 					showIsChecked: true
		// 				}
		// 			}
		// 		} else {
		// 			dataSurvey = {
		// 				name: 'Survey Manager',
		// 				displayName: 'Survey Manager',
		// 				permission: {
		// 					viewIsChecked: false,
		// 					editIsChecked: false,
		// 					deleteIsChecked: false,
		// 					showIsChecked: false
		// 				}
		// 			}
		// 		}
		// 		break;
		// 	}
		// }

		let allModule = this.module

		// allModule[0].subModule.push(data);
		// allModule[3].subModule.push(dataSurvey);
		let dataSet = {
			name: this.role,
			module: allModule,
			folderNames: this.selectedFolderNames
		};

		this.apiService
			.post("api/data-import/role-permission/add", dataSet)
			.subscribe((resp: any) => {
				if (resp.status == false) {
					// this.toastr.error(this.somethingError);
					this.toastr.error(resp.message);
					this.toggleOverlay();
				} else {
					this.toastr.success(this.saveMsg);
					this.managePermission.reset();
					setTimeout(() => {
						// $(".overlay").removeClass("d-block");
						const body = document.getElementsByTagName("body")[0];
						body.classList.remove("overflow-hidden");
						this.add_form = !this.add_form;
						// this.toggleOverlay();

					}, 0);
					// this.eventList.emit();
					this.eventList.emit({ status: resp.status, type: 'add' });

				}
					
			});
		this.toggleOverlay()

	}

	updatePermission(formVal: any) {

		let data: any = {}
		let dataSurvey: any = {};

		// this.module[0].subModule = this.module[0].subModule.filter((entry: any) => entry.name !== "Primary Data");
		// for (var i = 0; i < this.module[0].subModule.length; i++) {
		// 	let single = this.module[0].subModule[i]

		// 	if (single.name == 'Primary Data-Ingest' || single.name == 'Primary Data-Filter' || single.name == 'Primary Data-Clean' || single.name == 'Primary Data-Calculate' || single.name == 'Primary Data-Complete') {
		// 		if (single?.permission['viewIsChecked'] == true || single?.permission['editIsChecked'] == true || single?.permission['deleteIsChecked'] == true || single?.permission['showIsChecked'] == true) {
		// 			data = {
		// 				name: 'Primary Data',
		// 				displayName: 'Primary Data',
		// 				permission: {
		// 					viewIsChecked: true,
		// 					editIsChecked: true,
		// 					deleteIsChecked: true,
		// 					showIsChecked: true
		// 				}
		// 			}
		// 		} else {
		// 			data = {
		// 				name: 'Primary Data',
		// 				displayName: 'Primary Data',
		// 				permission: {
		// 					viewIsChecked: false,
		// 					editIsChecked: false,
		// 					deleteIsChecked: false,
		// 					showIsChecked: false
		// 				}
		// 			}
		// 		}
		// 		break;
		// 	}
		// }

		// for (let i = 0; i < this.module[3].subModule.length; i++) {
		// 	let subModule = this.module[3].subModule[i];
		// 	if (subModule.name == 'Survey Manager-Pending' || subModule.name == 'Survey Manager-InProgress' || subModule.name == 'Survey Manager-Completed' || subModule.name == 'Survey Manager-Validated' || subModule.name == 'Survey Manager-Cancelled') {
		// 		if (subModule?.permission['viewIsChecked'] == true) {
		// 			dataSurvey = {
		// 				name: 'Survey Manager',
		// 				displayName: 'Survey Manager',
		// 				permission: {
		// 					viewIsChecked: true,
		// 					editIsChecked: true,
		// 					deleteIsChecked: true,
		// 					showIsChecked: true
		// 				}
		// 			}
		// 		} else {
		// 			dataSurvey = {
		// 				name: 'Survey Manager',
		// 				displayName: 'Survey Manager',
		// 				permission: {
		// 					viewIsChecked: false,
		// 					editIsChecked: false,
		// 					deleteIsChecked: false,
		// 					showIsChecked: false
		// 				}
		// 			}
		// 		}
		// 		break;
		// 	}
		// }
		let allModule = this.module
		// allModule[0].subModule.push(data)
		// allModule[3].subModule.push(dataSurvey)

		let id = this.managePermission.value.id;
		formVal['name'] = this.role,
			formVal['module'] = allModule,
			formVal['folderNames'] = this.selectedFolderNames

		this.apiService
			.update("api/data-import/role-permission/update", id, formVal)
			.subscribe((response: any) => {
				if (response.status == false) {
					// this.toastr.error(this.somethingError);
					this.toastr.error(response.message);
					this.toggleOverlay();

				} else {
					this.toastr.success(this.updateMsg);
					this.managePermission.reset();
					setTimeout(() => {
						// $(".overlay").removeClass("d-block");
						const body = document.getElementsByTagName("body")[0];
						body.classList.remove("overflow-hidden");
						this.add_form = !this.add_form;
						// this.toggleOverlay();
					}, 0);
					this.showEdit = false;
					this.titlePage = this.add;
					this.eventList.emit({ status: response.status, type: 'update' });
				}
			});
		this.toggleOverlay()
	}

	getAllPermission() {
		this.areaDropdown = []
		this.apiService.getAll('api/data-retrieval/role-permission/list').subscribe((res: any) => {

			this.allPermissionList = res.data
			this.allPermissionOrg = [...this.allPermissionList]
			this.arrayUniqueByKey = [...new Map(this.allPermissionOrg.map((item: any) => [item['name'], item])).values()];
		})
	}

	filterInput(param: any, type: any) {

		this.role = param.value
		if (this.role.trim().length > 0) {
			this.buttonOn = false
		} else {
			this.buttonOn = true
		}
		// alert(this.countPermission)

		if (this.role.trim().length < 1 || (this.countPermission > 0 || this.countPermission < 0)) {
			this.enableAddForm = false

			if (this.role.trim().length > 0 && this.countPermission > 0) {
				this.enableAddForm = true
			} else {
				this.enableAddForm = false
			}

			switch (type) {

				case 'module':
					if (param.value.length < 1) {
						this.filteredRole = [];
					} else {
						this.filteredRole = this.arrayUniqueByKey.filter((element: any) => (element.name.toLowerCase().startsWith(param.value.toLowerCase())));
					}
					break;

				default:
					break;
			}
		} else {
			if (this.countPermission == 0) {
				this.enableAddForm = false
			} else {
				this.enableAddForm = true
			}
		}
	}
	selectModule(target: any) {
		this.selectedModule = target.value
		if (this.selectedModule == 'No data') {
			this.managePermission.controls['module']?.setValue('')
		} else {
			this.managePermission?.controls['module']?.setValue(this.selectedModule)
		}
		this.subModuleList = this.module.find((e: any) => (e.name == target.value))?.subModule
	}
	selectSubModule(target: any) {
		this.selectedSubModule = target.value
	}

	selectCheckbox(val: any, key: any) {
		this.permissionCheckBox[key] = val.target.checked
	}

	filterModuleDropdown(target: any) {
		let list = this.filterModuleList.filter((e: any) => (e.name.toLowerCase().startsWith(target.value.toLowerCase())))
		if (list.length > 0) {
			this.module = list
		} else {
			this.module = [{ name: "No data", subModule: [] }]
		}
	}

	clickedIndex: any

	openNestedList(index: number) {
		// $(".sub-level").slideToggle(); // new code working
		this.clickedIndex = this.clickedIndex === index ? null : index;
		// this.clickedIndex= index
		this.tabChanges = !this.tabChanges
		this.listindex = index
		this.allViewChecks = !this.allViewChecks
		this.allAddEditChecks = !this.allAddEditChecks
		this.allAllDeleteChecks = !this.allAllDeleteChecks
		this.allShowHideChecks = !this.allShowHideChecks
	}

	openNestedList2(index: number) {
		// $(".sub-level").slideToggle(); // new code working
		this.clickedIndex = index
		this.tabChanges = !this.tabChanges
		this.listindex2 = index
		this.allViewChecks = !this.allViewChecks
		this.allAddEditChecks = !this.allAddEditChecks
		this.allAllDeleteChecks = !this.allAllDeleteChecks
		this.allShowHideChecks = !this.allShowHideChecks
	}

	selectAllchild(key: string, i: number, event: any) {
		if (event.target.checked) {
			// element.permission['viewIsChecked'] = true
			this.countPermission += 3
		} else {
			// element.permission['viewIsChecked'] = false
			this.countPermission -= 3
		}



		// if (this.role.trim().length > 0 && this.countPermission > 0) {
		//   this.enableAddForm = true
		// } else {
		//   this.enableAddForm = false
		// }
		const element = this.module[i];

		element.subModule.forEach((submodule: any) => {
			if (this.showPrimaryData) {
				submodule.permission[key] = element.permission[key];
			} else {
				if (submodule.name != "Primary Dataset") {
					submodule.permission[key] = element.permission[key];
				}
			}

			// submodule.permission['viewIsChecked'] = element.permission[key];
		});

		this.buttonEnable = this.isAnyPermissionTrue(this.module)
	}

	selectChild(event: any, key: any, i: any) {

		this.countPermission = 0;

		const element = this.module[i];

		element.subModule.forEach((submodule: any) => {
			// console.log("🚀 ~  file: role-form.component.ts:491 ~  RoleFormComponent ~  element.subModule.forEach ~  submodule:", submodule)
			if (submodule.permission[key]) {
				if (event.target.checked) {
					submodule.permission['viewIsChecked'] = true
					this.countPermission += 1;
				} else {
					this.countPermission -= 1;
				}
			}

			// else{
			//   submodule.permission['viewIsChecked'] = true
			//   if(submodule.permission['deleteIsChecked'] || submodule.permission['editIsChecked'] || submodule.permission['showIsChecked'] || submodule.permission['viewIsChecked']){
			//     submodule.permission['viewIsChecked'] = true
			//   }
			// }
		});

		// console.log(this.countPermission,  element.subModule.length, 'check');

		if (this.countPermission == element.subModule.length) {
			element.permission[key] = true;
			element.permission['viewIsChecked'] = true
		} else {
			element.permission[key] = false;
			// element.permission['viewIsChecked'] = false
		}
		// console.log("🚀 ~  file: role-form.component.ts:631 ~  RoleFormComponent ~  selectChild ~  element:", this.module)


		this.buttonEnable = this.isAnyPermissionTrue(this.module)
		/**
		 * this code working
		 */
		// if (this.role.trim().length > 0 && (this.countPermission > 0)) {
		//   this.enableAddForm = true
		// } else {
		//   this.enableAddForm = false
		// }

		// working

	}

	isAnyPermissionTrue(modules: any) {
		for (const module of modules) {
			if (
				module.permission.viewIsChecked ||
				module.permission.editIsChecked ||
				module.permission.deleteIsChecked ||
				module.permission.showIsChecked
			) {
				return true; // At least one permission is true
			}

			// Check submodules
			if (module.subModule && this.isAnyPermissionTrue(module.subModule)) {
				return true; // At least one permission in submodules is true
			}
		}

		return false; // No permission is true
	}

	roleSearch(event: any) {
		var searchText = event.target.value.toLowerCase();
		// console.log("🚀 ~  file: role-form.component.ts:675 ~  RoleFormComponent ~  roleSearch ~  searchText:", searchText);
		$(".check-name").each(function (this: any) {

			var displayName = $(this).text().toLowerCase();
			if (displayName.includes(searchText)) {
				$(this).show();
				$('.check-tr').addClass("visible-row"); // Add a class to visible rows
			} else {
				$(this).hide();
				$('.check-tr').removeClass("visible-row"); // Remove the class from hidden rows
			}
		});
	}

	checkPrimay(data: any) {
		// console.log("🚀 ~  file: role-form.component.ts:724 ~  RoleFormComponent ~  checkPrimay ~  data:", data)
		if (data == 'Primary Data') {
			if (this.showPrimaryData) {
				return false
			} else {
				return true
			}
		} else {
			return false
		}
	}

	selectAllPrimaryData(event: any) {
		// console.log("🚀 ~  RoleFormComponent ~  selectAllPrimaryData ~  event:",event.target.checked)
		if (event.target.checked) {
			this.selectedFolderNames = this.folderNames
		} else {
			this.selectedFolderNames = []
		}
	}

	modalshowCategory(name:any, multipleCheck:any){
		// return
			this.showModelData = {}
			$('#modalDropDownCategoryAddEdit').modal('toggle');
  
			this.showModelData.name = name
			this.showModelData.multipleCheck = multipleCheck
			this.showModelData.editValue = []
			this.showModelData.role = true

			this.showModelData.data = this.folderNames.map((e:any)=>({
				'_id': e,
				'value':e
			}))

				this.showModelData.editValue = this.selectedFolderNames
		
	}
		
	dropdownItemCategory(data: any) {
		this.selectedFolderNames =data.data.map((e:any)=>(e.value))
	}
	
}

