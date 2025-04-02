import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import { ColumnMode, DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../services/api.service';
import { HeaderService } from '../../services/header.service';
import { number } from 'echarts';
declare var $: any;
@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent implements OnInit {
  addActive: boolean = false;
  add: any = '';
  edit: any = '';
  isStatus:any  =1;
  singleDiff: any;
  allData:any
  otherFormat: any = '';
  constructor(private apiService: ApiService, private headerService:HeaderService, private toastr: ToastrService, private translocoservice: TranslocoService) { }
  row: any = undefined
  @Input()
  rows: any = []
  columnMode = ColumnMode;
  // ======================================= NGX Datatbale Checkbox
  selected: any = [];
  seacrinput: boolean = false;
  filterData:any = []
  SelectionType = SelectionType;
  page = {
    totalElements:0,
    totalPages:0,
    startOffset:0,
    size:0,
    endOffset:0,
    pageNumber:0,
    searchFor:''
  }

  @ViewChild(DatatableComponent, { static: true }) table!: DatatableComponent;
  onSelect(rows: any) {
    this.selected.splice(0, this.selected.length);
    this.selected.push(...rows.selected);

    if(this.selected.length > 0){
    this.addActive = true
    }else{
    this.addActive = false
    }
  }
  // ======================================= NGX Datatbale Checkbox

  ngOnInit(): void {
    this.setPage({offset:0});
    this.translocoservice.selectTranslateObject('audit_trail').subscribe((res:any) => {
      this.headerService.setTitle({title:res.title, breadcrumb: res.breadcrumb});
     });
  }
  editSource(row: any) {
    this.row = Object.assign({}, row);
  }
  searchBar() {
    this.seacrinput = !this.seacrinput;
  }

  reloadItem() {
  }


  updateFilter(event: any) {
    const val = event.target.value.toLowerCase();

    let debouncedFunction = this.debounce(val,this.getData,1000)
    debouncedFunction()
  }

  
  getData(...args: any) {
    let searchText =  args[0]

    this.page['searchFor'] = searchText
    this.setPage({offset:0})
  }

  timeoutId!: number;

   debounce(val:any,func:any, delay:any) {
    let that = this
    return ()=>{
      console.log(this.timeoutId)
      let context = that;
      let args = arguments;
      if(this.timeoutId) clearTimeout(this.timeoutId);
      this.timeoutId = window.setTimeout(function(){
        func.apply(context,args);
      },delay);
      console.log(this.timeoutId)
    };
  }

  changePageSize() {
    let newpPageSize: any = $("#mySelectId").val();
    this.table.recalculate();

    this.page.size = Number(newpPageSize);
    if (this.page.size > this.page.totalElements) {
      this.page.size = this.page.totalElements;
    }

    this.setPage({offset:0})
  }

  setPage(pageInfo:any) {
    if(this.page.size == 0){
      this.page.size = 10
    }

    this.rows = [];
    this.page.pageNumber = pageInfo.offset;
    const start = this.page.pageNumber * this.page.size;
    const end = Math.min(start + Number(this.page.size), this.page.totalElements);
    this.page.startOffset = start;
    this.page.endOffset = end;

     this.apiService
      .post("api/data-retrieval/audit/list", this.page)
      .subscribe((res: any) => {
        this.page.totalElements = res.totalElements;
        this.page.totalPages = res.totalPages;
        this.rows = res.data  //.sort((e: any) => (e.createdAt > e.createdAt) ? 1 : -1);
        this.filterData = [...res.data];
      });
  }

  showDiffList(singleDiff:any){
    let diffData:any = [];
     if(singleDiff.collectionName=="Enterprise"){
      this.otherFormat = 'Enterprise'
     }else if(singleDiff.collectionName == 'Establishment'){
      this.otherFormat = 'Establishment'
    }else{
      this.otherFormat = ''
    }
    for (let i in singleDiff.diff) {
      diffData.push({ key: i, diffHistory: singleDiff.diff[i] });
    }
    this.singleDiff = diffData
    console.log("🚀 ~  file: list.component.ts:148 ~  ListComponent ~  showDiffList ~  diffData:", diffData)

    $('#export-popup').modal('toggle');
  }

  checkType(value:any){
    if(typeof value == 'string'){
      return 'string'
    }else if(typeof value == 'number'){
      return 'number'
    }else{
      return 'object'
    }
  }

  checkFirst(value:any){
    console.log("🚀 ~  file: list.component.ts:166 ~  ListComponent ~  checkFirst ~  value:", typeof value)
    if(typeof value == 'object'){
      return 'object'
    }else if(typeof value == 'number'){
      return 'number'
    }else{
      return 'array'
    }
  }
  ngAfterViewInit() {
	  // ========================================================== Search Bar outer click close
      let th = this
      $(document).click(function (event:any) {
        var searchBar = $('.searchBar');
        if (!searchBar.is(event.target) && searchBar.has(event.target).length === 0) {
            searchBar.removeClass('fullWidth');
            th.seacrinput = false;
        }
      });
    // ========================================================== Search Bar outer click close
  }
}
