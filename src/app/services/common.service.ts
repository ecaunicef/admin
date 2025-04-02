import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from './api.service';
import { ToastrService } from 'ngx-toastr';
import { TranslocoService } from '@ngneat/transloco';
import { Subject } from 'rxjs';

@Injectable({
	providedIn: 'root',
})
export class CommonService {
	// permissionList: any = [];
	public permissionList = new Subject()
	public classificationList = new Subject()
	constructor(
		private route: Router,
		private translocoservice: TranslocoService,
		private apiservice: ApiService,
		private router: Router,
		private toastr: ToastrService
	) { }
	permission: any = JSON.stringify({ viewIsChecked: false, editIsChecked: false, deleteIsChecked: false, showIsChecked: false });

	redirect(subModule: any) {
		// console.log("subModule", subModule)

		this.route.navigate(['/summary']);
		return
		switch (subModule) {
			case 'Time Period':
				this.route.navigate(['/time-period']);
				break;
			case 'Data Source':
				this.route.navigate(['/data-source']);
				break;
			case 'Goal':
				this.route.navigate(['/data-source']);
				break;
			case 'Indicator':
				this.route.navigate(['/indicator']);
				break;
			case 'Indicator Metadata':
				this.route.navigate(['/indicator-metadata']);
				break;
			case 'Area':
				this.route.navigate(['/area']);
				break;
			case 'GIS Maps':
				this.route.navigate(['/gis-map']);
				break;
			case 'Sm Unit':
				this.route.navigate(['/sm-unit']);
				break;
			case 'Role':
				this.route.navigate(['/role']);
				break;
			case 'User':
				this.route.navigate(['/users']);
				break;
			case 'Topics':
				this.route.navigate(['/topics']);
				break;
			case 'Data Entry':
				this.route.navigate(['/data-view']);
				break;
			//  add date 28/08/23
			case 'Dashboard':
				this.route.navigate(['/summary']);
				break;
			case 'Manage GIDs':
				this.route.navigate(['/sdmx/mapping']);
				break;
			case 'SDMX Import':
				this.route.navigate(['/sdmx/import']);
				break;
			case 'SDMX Export':
				this.route.navigate(['/sdmx/export']);
				break;
			case 'Language':
				this.route.navigate(['/language']);
				break;

			//
			case 'Basic Database Report':
				this.route.navigate(['/basic-summary-report']);
				break;
			case 'Advance Database Report':
				this.route.navigate(['/advance-summary-report']);
				break;
			case 'Range Check Report':
				this.route.navigate(['/range-check-report']);
				break;
			case 'Report Generator':
				this.route.navigate(['/report-generate']);
				break;
			case 'audit-trail':
				this.route.navigate(['/Audit Trail']);
				break;
			case 'Publications':
				this.route.navigate(['/publications']);
				break;
			case 'Data by Topics':
				this.route.navigate(['/topic']);
				break;
			case 'Data by Regions':
				this.route.navigate(['/region']);
				break;
			case 'Form Manager':
				this.route.navigate(['/form-list']);
				break;

			case 'Survey Manager':
				this.route.navigate(['/survey-list']);
				break;
			case 'Manage Frame':
				this.route.navigate(['/manage-frame']);
				break;
			//--
			case 'Role and Prmission':
				this.route.navigate(['/role-permission']);
				break;
			case 'User':
				this.route.navigate(['/users']);
				break;
			case 'Area':
				this.route.navigate(['/area-list']);
				break;
			case 'GIS Maps':
				this.route.navigate(['/gis-map']);
				break;
			case 'Map Data':
				this.route.navigate(['/data-exchange/processed']);
				break;
			case 'Import Data':
				this.route.navigate(['/data-exchange/import']);
				break;
			case 'Approve Data':
				this.route.navigate(['/data-approve']);
				break;
			case 'Process Primary Data':
				this.route.navigate(['/data-exchange/primary']);
				break;
			case 'Enterprise':
				this.route.navigate(['/enterprises']);
				break;
			case 'Establishment':
				this.route.navigate(['/establishments']);
				break;

			default:
				// this.route.navigate(['/']);
				break;
		}
	}

	logOut() {
		// var Cookies = document.cookie.split(';');
		// for (var i = 0; i < Cookies.length; i++){
		//   document.cookie = Cookies[i] + "=;expires=" + new Date(0).toUTCString();
		// }

		// this.router.navigate(['/'], { queryParams: { logout: 'true' } });

		this.apiservice.post('api/data-retrieval/users/logout', {}).subscribe({
			next: (res: any) => {
				this.translocoservice
					.selectTranslateObject('logout_success')
					.subscribe((result: any) => {
						this.router.navigate(['/'], { queryParams: { logout: 'true' } });
						return;
					});
			},
			error: (error: any) => {
				this.router.navigate(['/'], { queryParams: { logout: 'true' } });
				return;
			},
		});
	}


	createPermissionList() {

		this.translocoservice.selectTranslateObject('role_permission_list').subscribe((res: any) => {

			let dataNew = [

				{
					name: "Admin",
					subModule: []
				},
				// {
				// 	name: "Classification",
				// 	displayName: 'Classification',
				// 	permission: JSON.parse(this.permission),
				// 	subModule: []
				// },
				// {
				// 	name: "Program Cycle",
				// 	displayName: 'Program Cycle',
				// 	permission: JSON.parse(this.permission),
				// 	subModule: []
				// },
				// {
				// 	name: "Access Control",
				// 	displayName: 'Access Control',
				// 	permission: JSON.parse(this.permission),
				// 	subModule: [{
				// 		name: "Role", 
				// 		displayName: 'Role',
				// 		permission: JSON.parse(this.permission)
				// 	},
				// 	{
				// 		name: "User", 
				// 		displayName: 'User',
				// 		permission: JSON.parse(this.permission)
				// 	}
				// 	]
				// },
				// {
				// 	name: "Report",
				// 	displayName: 'Report',
				// 	permission: JSON.parse(this.permission),
				// 	subModule: []
				// },
				// {
				// 	name: "Resources",
				// 	displayName: 'Resources',
				// 	permission: JSON.parse(this.permission),
				// 	subModule: []
				// },
			// 	///////////////////////////////////
			]
			this.permissionList.next(dataNew)
		});

	}

	getPermissionList() {
		return this.permissionList.asObservable();
	}

	// Module - Manage classification
	categoryMasterList() {		
		let category = [
			{ key: "type_of_business", value: "Type of business" },
			{ key: "state", value: "State" },
			{ key: "type_of_ownership", value: "Type of ownership" },
			{ key: "type_of_company", value: "Type of company" },
			{ key: "global_business_category", value: "Global business category" },
			{ key: "workforce_source", value: "Workforce source" },
			{ key: "sm_unit", value: "Sm Unit" },
			{ key: "designation", value: "Designation" },
			{ key: "main_activity", value: "Main activity" },
			{ key: "secondary_activity", value: "Secondary activity" },
			{ key: "ancillary_activity", value: "Ancillary activity" },
			{ key: "institutional_sector", value: "Institutional sector" },
			{ key: "information_source", value: "Information source" },
			{ key: "global_business_category", value: "Global business category" },
			{ key: "ministry_division", value: "Ministry division" },
			{ key: "mvca", value: "MVCA" },
			{ key: "optional_locality_select_for_automatic_derivation_of_mvca", value:"Optional locality - select for automatic derivation of MVCA"},
			{ key: "optional_street_name_select_for_automatic_derivation_of_mvca", value:"Optional street name - select for automatic derivation of MVCA"},
			{ key: "government_paysite_code", value:"Government paysite code"},
			{ key: "labour_sector", value: "Labour Sector" },
			{ key: "factory_area", value: "Factory Area" },
			

		]
		this.classificationList.next(category)
	}

	getCategoryMasterList() {
		return this.classificationList.asObservable()
	}

	getRolePermission(){
			return {
				'Admin':'Admin',

		}
	}


	makeClassificationString(classification: any, mytext: any) {
		// 	let maxMatch = '';
		// 	let maxCount = 0;

		// 	for (let text of mytext) {
		// 		let textWords = text.split(' '); // Split the text into words

		// 		for (let str of classification) {
		// 			let count = 0;
		// 			for (let word of textWords) {
		// 				if (str.toLowerCase().includes(word.toLowerCase())) { // Convert both strings to lowercase
		// 					count++;
		// 				}
		// 			}

		// 			if (count > maxCount) {
		// 				maxCount = count;
		// 				maxMatch = str;
		// 			}
		// 		}
		// 	}


		// 	return maxMatch;

		let maxMatch = '';
		let maxMatchCount = 0;

		// Split the mytext string into an array of words
		let mytextWords = mytext.join('').split(' ');

		// Iterate over each classification string
		for (let str of classification) {
			let matchCount = 0;

			// Convert str to lowercase
			let strLower = str.toLowerCase();

			// Check if all words from mytext appear in the classification string (case-insensitive)
			for (let word of mytextWords) {
				// Convert word to lowercase
				let wordLower = word.toLowerCase();

				if (strLower.includes(wordLower)) {
					matchCount++;
				}
			}

			// Update maxMatch if the current classification string has more matches
			if (matchCount > maxMatchCount) {
				maxMatchCount = matchCount;
				maxMatch = str;
			}
		}

		return maxMatch;


	}
	
	fixedOpratorforAll(){
		const fixedOperators = [
				{'key': '=', 'value': '='},
				{'key': '%', 'value': 'Like'},
				{'key': 'IN', 'value': 'IN'},
				{'key': 'NOT IN', 'value': 'NOT IN'},
				{'key': '<', 'value': '<'},
				{'key': '>', 'value': '>'},
				{'key': '!=', 'value': '!='},
				{'key': 'Between', 'value': 'Between'},
				{'key': 'NULL', 'value': 'NULL'},
				{'key': 'NOT NULL', 'value': 'NOT NULL'},
				{'key': '>=', 'value': '>='},
				{'key': '<=', 'value': '<='}
			]
			return fixedOperators;
	
		}

	

}
