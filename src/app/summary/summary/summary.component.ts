import { Component, ElementRef, ViewChild } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import { HeaderService } from 'src/app/services/header.service';
import { ApiService } from 'src/app/services/api.service';
import * as echarts from 'echarts';
import { AuthService } from 'src/app/services/auth/auth.service';
import { HttpClient } from '@angular/common/http';
// import { Fileupload } from "blueimp-file-upload/js/jquery.fileupload";
import { CommonService } from 'src/app/services/common.service';
import { DateRange, MatDatepickerInputEvent } from '@angular/material/datepicker';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DatatableComponent } from '@swimlane/ngx-datatable';
// import {MatButtonModule} from '@angular/material/button';
// import {MatDatepickerModule} from '@angular/material/datepicker';
// import {MatInputModule} from '@angular/material/input';
// import {MatFormFieldModule} from '@angular/material/form-field';
import domtoimage from 'dom-to-image';
import  {environment}  from 'src/environments/environment';
import { ChangePasswordComponent } from 'src/app/auth/change-password/change-password.component';

@Component({
  selector: 'app-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.css'],
})
export class SummaryComponent {
  @ViewChild(DatatableComponent, { static: true }) table!: DatatableComponent;
  selectedRange!: DateRange<Date>;
  data: any = {};
  userChartData: any = [];
  counsellingChartData: any = [];
  chartOption: any;
  isUserChecked: boolean = false;
  isCounsellingChecked: boolean = false;
  startDate:any = null;
  endDate: any= null;
  startUserDate:any = null;
  endUserDate: any = null;
  selectedArea: any = {
    country: 'all',
    district:'all'
  }
  dateRangeForm!: FormGroup;
  categoryList: any = [];
  todayDate:any=new Date();
  periodicallyData: any ='monthly'
  currentYear = new Date().getFullYear();
  firstDate = new Date(this.currentYear, 0, 1)
  

  constructor(
    private authService: AuthService,
    private translocoservice: TranslocoService,
    private headerService: HeaderService,
    private dataService: ApiService,
    private commonService: CommonService,
    private fb: FormBuilder, // private MatButtonModule: MatButtonModule, // private MatDatepickerModule: MatDatepickerModule, // private MatInputModule: MatInputModule, // private MatFormFieldModule: MatFormFieldModule,
  ) {
    this.headerService.getAllAreas().subscribe((res: any) => {
    })
    
  }

  selectedGender: string | undefined;
  selectedAgeGroup: string | undefined='all';
  selectedGender2: string | undefined;
  selectedAgeGroup2: string | undefined='all';
  selectedGender3: string | undefined;
  selectedAgeGroup3: string | undefined='all';

  genderOptions: string[] = ['Male', 'Female', 'Other'];
  ageGroupOptions:any =[
    {value:'all',lebel:"All"},
    { value: '0-4', lebel: "Under 5 years"},
    { value: '5-9', lebel: "5-9 years" },
    { value: '10-14', lebel: "10-14 years"},
    { value: '15-17', lebel: "15-17 years" },
    { value: '18-', lebel: "Above 18 years" }
  ];

  ngOnInit() {
    this.initializeDates();

    const today = new Date();
    const lastWeek = new Date(today);
    lastWeek.setDate(today.getDate() - 7);
    this.dateRangeForm = this.fb.group({
      start: [this.firstDate],
      end: [today]
    });
    this.headerService.getAllAreas().subscribe((data: any) => {
      this.selectedArea = data;
      if (data?.district_selected && data?.country_selected) {
        this.selectedArea['country'] = JSON.stringify(data?.country_selected);
        this.selectedArea['district'] = JSON.stringify(data?.district_selected);
        // this.selectedHeaderArea['country'] = JSON.stringify(res?.country_selected);
        // this.selectedHeaderArea['district'] = JSON.stringify(res.district_selected);
        // this.getUserList();
        this.loadData();

      }
      // this.getListData()
    })
    this.headerService.setTitle({ breadcrumb: 'Summary' });

  }

  initializeDates() {
    // Handle counselling dates
    this.endDate = new Date();
    this.startDate = new Date();
    this.startDate.setDate(this.endDate.getDate() - 120);
  
    // Handle user dates
    this.endUserDate = new Date();
    this.startUserDate = new Date();
    this.startUserDate.setDate(this.endUserDate.getDate() - 320);
  }
  
  loadData() {
    // this.headerService.getArea().subscribe((data: any) => {

    //   data.country = this.removeSpecialChars(data.country);
    //   data.district = this.removeSpecialChars(data.district);

    //   if (data.country !== this.selectedArea?.country) {
    //     data.district = 'all';
    //   }
    
    //   // this.selectedArea = {
    //   //   country: data.country === 'all' ? '' : data.country,
    //   //   district: data.district === 'all' ? '' : data.district,
    //   // };

    

    //   // if(!this.isCounsellingChecked){
    //   //   this.getCounsellingChartData('gender');
    //   // }else{
    //   //   this.getCounsellingChartData('age');
    //   // }
    // })

    this.getData();
    this.getListData();
    if (!this.isUserChecked) {
      this.getUserChartData('gender');
    } else {
      this.getUserChartData('age');
    }
    if(!this.isCounsellingChecked){
      this.getCounsellingChartData('gender');
    }else{
      this.getCounsellingChartData('age');
    }

  }

  getData() {
    const payload = {
      country: this.selectedArea.country,
      district: this.selectedArea.district,
    };
    this.dataService
      .post('api/data-retrieval/summary',payload)
      .subscribe((res: any) => {
        if (res.success) {
          this.data = res.data;
        }
      });
  }

  getUserChartData(data:any){
    const payload = {
      groupBy: this.selectedAgeGroup,
      start:this.startUserDate,
      end:this.endUserDate,
      country: this.selectedArea.country,
      district: this.selectedArea.district,
    };

    this.dataService
      .post('api/data-retrieval/summary/user-chart',payload)
      .subscribe((res: any) => {
        if (res.success) {
          this.userChartData = res.data;

          if (Object.keys(this.userChartData)?.length) {
            this.initChart('stackchart','user-chart',this.userChartData);
          } else {
            this.showNoDataMessage('user-chart');
          }
        } else {
          console.error('Failed to retrieve data.');
          this.showNoDataMessage('user-chart');
        }
      });
  }

  showNoDataMessage(chartId: string) {
    const chartDom = document.getElementById(chartId) as HTMLElement;
    if (chartDom) {
      chartDom.innerHTML = `
        <div style="padding: 20px;color: #666;height: 100%;display: flex;align-items: center;justify-content: center;">
          No data
        </div>`;
    }
  }

  onUserSwitchChange(event: Event) {
    this.isUserChecked = (event.target as HTMLInputElement).checked;
    const selected = this.isUserChecked ? 'age' : 'gender';
    this.getUserChartData(selected);
  }
  removeSpecialChars(text: string): string {
    return text.replace(/\r\n/g, '').trim();
  }
  
  ApplyUserDate() {
    const selected = this.isUserChecked ? 'age' : 'gender';
    this.getUserChartData(selected);
  }

  getCounsellingChartData(data:any){
    const payload = {
      groupBy: this.selectedAgeGroup2,
      start:this.startDate,
      end:this.endDate,
      country: this.selectedArea.country,
      district: this.selectedArea.district,
    };
    this.dataService
      .post('api/data-retrieval/summary/counselling-chart',payload)
      .subscribe((res: any) => {

          if (res.success) {
            this.counsellingChartData = res.data;
    
            if (Object.keys(this.counsellingChartData)?.length) {
              // this.initChart('column', 'counselling-chart', this.counsellingChartData);
              this.initChart('counsellingstack', 'counselling-chart', this.counsellingChartData);
              
            } else {
              this.showNoDataMessage('counselling-chart');
            }
          } else {
            console.error('Failed to retrieve data.');
            this.showNoDataMessage('counselling-chart');
          }
    });
  }

  onCounsellingSwitchChange(event: Event) {
    this.isCounsellingChecked = (event.target as HTMLInputElement).checked;
    const selected = this.isCounsellingChecked ? 'age' : 'gender';
    this.getCounsellingChartData(selected);
  }
  onChangleAgeGroup(){
    this.getCounsellingChartData('');
  }
  
  ApplyCounsellingDate() {
    const selected = this.isCounsellingChecked ? 'age' : 'gender';
    this.getCounsellingChartData(selected);
  }

  // initChart(type: string,chartId: string,chartData:any) {
  //   const chartDom = document.getElementById(chartId) as HTMLElement;
  //   let myChart: echarts.ECharts | undefined;

  //   if (chartDom) {
  //     myChart = echarts.getInstanceByDom(chartDom) || echarts.init(chartDom);
  //     myChart.dispose();
  //     myChart = echarts.init(chartDom);
  //   }

  //   switch (type) {
  //     case 'pie':
  //       this.chartOption = this.getPieChartOption(chartData);
  //       break;
  //     case 'bar':
  //       this.chartOption = this.getBarChartOption(chartData);
  //       break;
  //     case 'column':
  //       this.chartOption = this.getColumnChartOption(chartData);
  //       break;
  //     case 'line':
  //       this.chartOption = this.getLineChartOption(chartData);
  //       break;
  //     case 'doughnut':
  //       this.chartOption = this.getDoughnutChartOption(chartData);
  //       break;
  //     default:
  //       console.warn('Invalid chart type');
  //   }

  //   if (myChart && this.chartOption) {
  //     myChart.setOption(this.chartOption);
  //   }
  // }

  initChart(type: string, chartId: string, chartData: any) {
  // Validate input parameters
  if (!type || !chartId || !chartData) {
    console.error('Missing required parameters. Ensure type, chartId, and chartData are provided.');
    return;
  }

  const chartDom = document.getElementById(chartId) as HTMLElement;
  
  if (!chartDom) {
    console.error(`Chart container with ID "${chartId}" not found.`);
    return;
  }

  let myChart: echarts.ECharts | undefined;

  // Initialize or reinitialize the chart instance
  try {
    myChart = echarts.getInstanceByDom(chartDom) || echarts.init(chartDom);
    myChart.dispose(); // Dispose to avoid memory leaks or re-initialization conflicts
    myChart = echarts.init(chartDom);
  } catch (error) {
    console.error('Error initializing chart:', error);
    return;
  }

  // Set chart options based on the type provided
  switch (type) {
    case 'pie':
      this.chartOption = this.getPieChartOption(chartData);
      break;
    case 'bar':
      this.chartOption = this.getBarChartOption(chartData);
      break;
    case 'column':
      this.chartOption = this.getColumnChartOption(chartData);
      break;
    case 'line':
      this.chartOption = this.getLineChartOption(chartData);
      break;
    case 'doughnut':
      this.chartOption = this.getDoughnutChartOption(chartData);
      break;
    case 'stackchart':
      this.chartOption = this.getStackChartOption(chartData);
      break;
    case 'counsellingstack':
      this.chartOption = this.getCounsellingStackChartOption(chartData);
      break;
      
    default:
      console.warn(`Invalid chart type: "${type}".`);
      return;
  }


  // Apply the chart options if everything is valid
  if (myChart && this.chartOption) {
    try {
      myChart.setOption(this.chartOption);
    } catch (error) {
      console.error('Error setting chart options:', error);
    }
  } else {
    console.error('Chart instance or options are not valid.');
  }
}


  getDoughnutChartOption(chartData:any) {
    return {
      tooltip: {
        trigger: 'item',
      },
      legend: {
        bottom: '5%',
        left: 'center',
      },
      series: [
        {
          name: 'Access From',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          label: {
            show: true,
            position: 'inside',
            formatter: (params: any) => {
              return `{bold|${params.value}}`;
            },
            rich: {
              bold: {
                fontWeight: 'bold',
                fontSize: 22,
                color: '#ffffff',
              },
            },
          },
          labelLine: {
            show: true,
          },
          data: chartData,
        },
      ],
    };
  }

  getPieChartOption(chartData:any) {
    return {
      tooltip: {
        trigger: 'item',
      },
      legend: {
        bottom: '5%',
        left: 'center',
      },
      series: [
        {
          name: 'Access From',
          type: 'pie',
          radius: "50%",
          avoidLabelOverlap: false,
          label: {
            show: true,
            position: 'inside',
            formatter: (params: any) => {
              return `{bold|${params.value}}`;
            },
            rich: {
              bold: {
                fontWeight: 'bold',
                fontSize: 22,
                color: '#ffffff',
              },
            },
          },
          labelLine: {
            show: true,
          },
          data: chartData,
        },
      ],
    };
  }

  getBarChartOption(chartData:any) {
    return {
      tooltip: {
        trigger: 'axis',
      },
      legend: {
        data: ['Access From'],
        bottom: '5%',
        left: 'center',
      },
      xAxis: {
        type: 'category',
        data: chartData?.map((name:any) => name?.name),
      },
      yAxis: {
        type: 'value',
      },
      series: [
        {
          name: 'Access From',
          type: 'bar',
          data: chartData?.map((value:any) => value?.value),

        },
      ],
    };
  }

  getColumnChartOption(chartData:any) {
    // return {
    //   tooltip: {
    //     trigger: 'item',
    //   },
    //   legend: {
    //     data: ['Access From'],
    //     bottom: '5%',
    //     left: 'center',
    //   },
    //   xAxis: {
    //     type: 'value',
    //   },
    //   yAxis: {
    //     type: 'category',
    //     data:['surya','pratap']
    //     // data: chartData?.map((name:any) => name?.name),
    //   },
    //   series: [
    //     {
    //       name: 'Access From',
    //       type: 'bar',
    //       data:[100,20],
    //       // data: chartData?.map((value:any) => value?.value),
    //       itemStyle: {
    //         color: '#73C9C3',
    //       },
    //     },
    //   ],
    // };

    let data = chartData;

    let a = Object.values(data).map((entry: any) => entry['Under 5 years'])
    let b = Object.values(data).map((entry: any) => entry['5-9 years'])
    let c = Object.values(data).map((entry: any) => entry['10-14 years'])
    let d = Object.values(data).map((entry: any) => entry['15-17 years'])
    let e = Object.values(data).map((entry: any) => entry['Above 18 years'])
    const seriesData = [a,b,c,d,e]
    // Flatten the array and find the max value
    const maxDataValue = Math.max(...seriesData.flat());

    // Add 5 to the max value for the xAxis
    const xAxisMax = (maxDataValue < 5) ? maxDataValue + 1 : (maxDataValue > 5 && maxDataValue < 10) ? maxDataValue+2 : maxDataValue+5;

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      grid: {
        left: '3%',
        // right: '4%',
        top: "5",
        bottom: '10',
        containLabel: true
      },
      legend: {
        // data: Object.keys(data),
        // top: '2%',
        bottom: '2%',
        itemHeight: 10,
        textStyle: {
          fontSize: 10
        }
      },
      xAxis: {
        type: 'value',
        max: xAxisMax
      },
      yAxis: {
        type: 'category',
        
        axisLabel: {
          fontSize: 10,
          width: 120,
          overflow: "break"
          // formatter: function (value: any) {
          //   let maxLength = 10; // Characters per line
          //   let ellipsis = '...';

          //   // Check if the value is longer than the maximum allowed length
          //   if (value.length > maxLength) {
          //     value = value.substring(0, maxLength) + ellipsis;
          //   }

          //   let lines = [];
          //   for (let i = 0; i < value.length; i += maxLength) {
          //     lines.push(value.substring(i, i + maxLength));
          //   }

          //   return lines; 
          // }
        },
        
        data: Object.keys(data), // Dynamically add questions to y-axis
      },
      series: [
        {
          name: 'Under 5 years',
          type: 'bar',
          data: Object.values(data).map((entry: any) => entry['Under 5 years']),
          itemStyle: { color: '#FF6384' }
        },
        {
          name: '5-9 years',
          type: 'bar',
          data: Object.values(data).map((entry: any) => entry['5-9 years']),
          itemStyle: { color: '#36A2EB' }
        },
        {
          name: '10-14 years',
          type: 'bar',
          data: Object.values(data).map((entry: any) => entry['10-14 years']),
          itemStyle: { color: '#FFCE56' }
        },
        {
          name: '15-17 years',
          type: 'bar',
          data: Object.values(data).map((entry: any) => entry['15-17 years']),
          itemStyle: { color: '#4BC0C0' }
        },
        {
          name: 'Above 18 years',
          type: 'bar',
          data: Object.values(data).map((entry: any) => entry['Above 18 years']),
          itemStyle: { color: '#9966FF' }
        },
      ],
    };

  }

  // counselling stacked chart
  getCounsellingStackChartOption(chartData:any) {
    

    let data = chartData;

    let a = Object.values(data).map((entry: any) => parseInt(entry['Under 5 years']))
    let b = Object.values(data).map((entry: any) => parseInt(entry['5-9 years']))
    let c = Object.values(data).map((entry: any) => parseInt(entry['10-14 years']))
    let d = Object.values(data).map((entry: any) => parseInt(entry['15-17 years']))
    let e = Object.values(data).map((entry: any) => parseInt(entry['Above 18 years']))
    const seriesData = [a,b,c,d,e]
    // Flatten the array and find the max value
    // const maxDataValue = Math.max(...seriesData.flat());
    // Add 5 to the max value for the xAxis
    // const xAxisMax = (maxDataValue < 5) ? maxDataValue + 1 : (maxDataValue > 5 && maxDataValue < 10) ? maxDataValue+2 : maxDataValue+5;
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      grid: {
        left: '3%',
        // right: '4%',
        top: "0%",
        bottom: '7%',
        containLabel: true
      },
      legend: {
        // data: Object.keys(data),
        // top: '2%',
        bottom: '0%',
        itemHeight: 10,
        textStyle: {
          fontSize: 10
        }
      },
      xAxis: {
        type: 'value',
        // max: xAxisMax
      },
      yAxis: {
        type: 'category',
        
        axisLabel: {
          fontSize: 11,
          width: 120,
          overflow: "break",
          // rotate: 45
          // formatter: function (value: any) {
          //   let maxLength = 10; // Characters per line
          //   let ellipsis = '...';

          //   // Check if the value is longer than the maximum allowed length
          //   if (value.length > maxLength) {
          //     value = value.substring(0, maxLength) + ellipsis;
          //   }

          //   let lines = [];
          //   for (let i = 0; i < value.length; i += maxLength) {
          //     lines.push(value.substring(i, i + maxLength));
          //   }

          //   return lines; 
          // }
        },
        
        data: Object.keys(data), // Dynamically add questions to y-axis
      },
      series: [
        {
          name: 'Under 5 years',
          type: 'bar',
          data: Object.values(data).map((entry: any) => entry['Under 5 years']),
          itemStyle: { color: '#FF6384' },
          stack: 'total',
        },
        {
          name: '5-9 years',
          type: 'bar',
          data: Object.values(data).map((entry: any) => entry['5-9 years']),
          itemStyle: { color: '#36A2EB' },
          stack: 'total',
        },
        {
          name: '10-14 years',
          type: 'bar',
          data: Object.values(data).map((entry: any) => entry['10-14 years']),
          itemStyle: { color: '#FFCE56' },
          stack: 'total',
        },
        {
          name: '15-17 years',
          type: 'bar',
          data: Object.values(data).map((entry: any) => entry['15-17 years']),
          itemStyle: { color: '#4BC0C0' },
          stack: 'total',
        },
        {
          name: 'Above 18 years',
          type: 'bar',
          data: Object.values(data).map((entry: any) => entry['Above 18 years']),
          itemStyle: { color: '#9966FF' },
          stack: 'total',
        },
      ],
    };

  }

  getLineChartOption(chartData:any) {
    return {
      tooltip: {
        trigger: 'axis',
      },
      legend: {
        data: ['Access From'],
        bottom: '5%',
        left: 'center',
      },
      xAxis: {
        type: 'category',
        data: chartData?.map((name:any) => name?.name),
      },
      yAxis: {
        type: 'value',
      },
      series: [
        {
          name: 'Access From',
          type: 'line',
          data: chartData?.map((value:any) => value?.value),
          smooth: true,
          itemStyle: {
            color: '#FF5733',
          },
          lineStyle: {
            width: 2,
          },
        },
      ],
    };
  }

  onChangeOnAgeGroup(){
    this.getUserChartData('');
  }

  getStackChartOption(chartData: any) {
    const data: any = chartData
    const ageGroups = Object.keys(data);
    const maleData = ageGroups.map((group:any) => data[group].male);
    const femaleData = ageGroups.map((group:any) => data[group].female);
    const otherData = ageGroups.map((group:any) => data[group].other);
    

    if(ageGroups?.length == 1) {
      let specificChartData = chartData[ageGroups[0]]
      // Extracting values
      let dataValue = Object.values(specificChartData);

      // Extracting keys with capitalization
      let xAxisCategory = Object.keys(specificChartData).map(key => key.charAt(0).toUpperCase() + key.slice(1));


      return {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        legend: {
          data: ageGroups,
          bottom: '0%',
          // left: 'center',
          itemHeight: 10
        },
        grid: {
          left: '3%',
          right: '4%',
          top: "5%",
          bottom: '8%',
          containLabel: true,
        },
        xAxis: {
          type: 'category',
          data: xAxisCategory,
          axisLabel: {
            fontSize: 10
          }
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            barWidth: '30%',
            name: ageGroups[0],
            type: 'bar',
            label: {
              show: false,
            },
            itemStyle: {
              color: '#43B14E',
            },
            data: dataValue,
          }
        ],
      }
    } else {

      return {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        legend: {
          data: ['Male', 'Female', 'Other'],
          bottom: '0%',
          // left: 'center',
          itemHeight: 10
        },
        grid: {
          left: '3%',
          right: '4%',
          top: "5%",
          bottom: '8%',
          containLabel: true,
        },
        xAxis: {
          type: 'category',
          data: ageGroups,
          // axisLine: {
          //   show: false,
          // },
          // axisTick: {
          //   show: false,
          // },
          axisLabel: {
            fontSize: 10
          }
        },
        yAxis: {
          type: 'value',
          // axisLine: {
          //   show: false, // Hide Y-axis line
          // },
          // axisTick: {
          //   show: false, // Hide Y-axis ticks
          // },
          // axisLabel: {
          //   show: false, // Hide Y-axis labels
          // },
          // splitLine: {
          //   show: false, // Hide split lines
          // },
        },
        series: [
          {
            barWidth: (maleData.length>1)?'50%':'10%',
            name: 'Male',
            type: 'bar',
            stack: 'total',
            label: {
              show: false,
            },
            itemStyle: {
              color: '#43B14E',
            },
            data: maleData,
          },
          {
            barWidth: (femaleData.length > 1) ? '50%' : '10%',
            name: 'Female',
            type: 'bar',
            stack: 'total',
            label: {
              show: false,
            },
            itemStyle: {
              color: '#E7414C',
            },
            data: femaleData,
          },
          {
            barWidth: (otherData.length > 1) ? '50%' : '10%',
            name: 'Other',
            type: 'bar',
            stack: 'total',
            label: {
              show: false,
            },
            itemStyle: {
              color: '#F49400',
            },
            data: otherData,
          },
        ],
      };
    }


  }

  switchChart(type: string, chartId: string) {
    // console.log("chart user chart")
    if (chartId) {
      let chartData;
  
      if (chartId === "counselling-chart") {
        // console.log("chart counselor chart", this.counsellingChartData)
        chartData = this.counsellingChartData;
      } else if (chartId === "user-chart") {
        // console.log("chart user chart")
        chartData = this.userChartData;
      }

      if (chartData && chartData.length > 0) {
        this.initChart(type, chartId, chartData);

      } else {
        console.warn('No data available for the selected chart.');
      }
    }
  }

  downloadImage(id:string): void {
    let chart;
    let userToggleButton: HTMLElement | null;
    let chartName;

    if(id === 'user_chart'){
      chart = document.getElementById(id);
      userToggleButton = document.getElementById('user_toggle_button');
      chartName = "user";
    }else{
      chart = document.getElementById(id);
      userToggleButton = document.getElementById('counselling_toggle_button');
      chartName = "counselling";
    }

    if (chart) {
      if (userToggleButton) {
        userToggleButton.style.display = 'none';
      }
      const options = {
        bgcolor: '#FFFFFF', 
        quality: 100,      
        width: chart.offsetWidth,  
        height: chart.offsetHeight
      };

      const timestamp = new Date().toISOString().replace(/[-:.]/g, '').slice(0, 15);
      const filename = `${environment.prefixDownloadFile}${chartName}_${timestamp}.png`;
  
      domtoimage.toPng(chart, options)
        .then((dataUrl: string) => {
          const link = document.createElement('a');
          link.href = dataUrl;
          link.download = filename; 
          document.body.appendChild(link);
          link.click(); 
          document.body.removeChild(link);
          if (userToggleButton) {
            userToggleButton.style.display = 'block';
          }
        })
        .catch((error:any) => {
          if (userToggleButton) {
            userToggleButton.style.display = 'block';
          }
          console.error('Error generating image:', error);
        });
    } else {
      console.error('Element not found for download.');
    }
  }
  
  
  

  
  
  toggleFullView(chartBox: HTMLElement) {
    chartBox.classList.toggle('fullWidth');
  }


  //  =============================================== mood tracker chart ======================================================

  getDateRange() {
    const selectedRange = this.dateRangeForm.value;
    if (selectedRange.start && selectedRange.end) {

      this.dateRangeForm = this.fb.group({
        start: [selectedRange.start],
        end: [selectedRange.end]
      });
      this.getListData()
    } else {
      console.error('Date range not fully selected.');
    }
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  startDate1: any
  endDate1: any
  rows:any

  getListData() {
    this.startDate1 = this.formatDate(this.dateRangeForm.value.start);
    this.endDate1 = this.formatDate(this.dateRangeForm.value.end);
    const payload = {
      ageGroup: this.selectedAgeGroup3,
      country: this.selectedArea?.country,
      district: this.selectedArea?.district,
      startDate: this.startDate1,
      endDate: this.endDate1,
      period: this.periodicallyData
    }
    this.dataService
      .post('api/data-retrieval/moodtracker/all', payload)
      .subscribe((res: any) => {
        if (res.status) {
          this.rows = res.data ? res.data : [];
          this.getStackedChart()
        }
      });

  }
  //  ====================== ===================== chart =======================


  generateUniqueDates(startDateStr: any, endDateStr: any) {
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
    const uniqueDates = [];

    const formatDate = (date: any) => {
      const options = { day: '2-digit', month: 'short', year: '2-digit' };
      return date.toLocaleDateString('en-GB', options).replace(',', '');
    };

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      uniqueDates.push(formatDate(new Date(d)));
    }

    return uniqueDates;
  }

  getStackedChart() {
    let chartDom1: any = document.getElementById('chart_area');

    if (echarts.getInstanceByDom(chartDom1)) {
      echarts.dispose(chartDom1);
    }

    let legendData = Array.from(new Set(this.rows.map((row: any) => row.name)));

    if (this.rows && this.rows.length > 0) {
      let myChart1 = echarts.init(chartDom1);

      // Define color mapping
      const colorMapping: any = {
        'Happy': '#F08935',
        'Sad': '#F4A136',
        'Angry': '#EFCB36',
        'Depressed': '#29A6A6',
        'Excited': '#BBDEF0',
        'Guilty': '#403F4C',
        'Lonely': '#E84855',
        'Loved': '#F9DC5C',
        'Resilient': '#3384FA',
        'Stressed': '#EFBCD5'
      };

      function formatDate(dateString: any) {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = date.toLocaleString('default', { month: 'short' });
        const year = date.getFullYear().toString().slice(-2);
        return `${day} ${month} ${year}`;
      }

      let xAxisValue:any=[];
      let groupedData: any = {};
      const barWidth = xAxisValue.length > 20 ? '15%' : xAxisValue.length > 10 && xAxisValue.length <= 20 ? '18%' : '30%';
      let series:any=[];
      if (this.periodicallyData=='monthly'){

        this.rows.forEach((row: any) => {
          // Format the date to get month and year (e.g., "2024-06")
          const date = new Date(row.created);
          const formattedMonth = date.toLocaleString('default', { year: 'numeric', month: 'short' });
          // Initialize the month object if not already done
          if (!groupedData[formattedMonth]) {
            groupedData[formattedMonth] = {};
          }

          // Increment the count for the corresponding mood type
          if (!groupedData[formattedMonth][row.name]) {
            groupedData[formattedMonth][row.name] = 0;
          }

          groupedData[formattedMonth][row.name]++;
        });


        let grouByName: any = {};
        let seriesData:any=[];
        xAxisValue = Object.keys(groupedData);

        Object.keys(groupedData).map((date: any) => {
          Object.keys(groupedData[date]).map(name => {
            if (!grouByName[name]) {
              grouByName[name] = {
                name: name,
                type: 'bar',
                stack: 'total',
                barWidth: barWidth,
                label: {
                  show: false,
                  formatter: (params: any) => Math.round(params.value)
                },
                itemStyle: {
                  color: colorMapping[name] || '#000000'
                },
                data: xAxisValue?.map((date: any) => groupedData[date][name] || "")
              };

              seriesData.push(grouByName[name]);
            }

          });

        });
        series = seriesData;
      }else{
        xAxisValue=this.generateUniqueDates(this.startDate1, this.endDate1);
        this.rows.forEach((row: any) => {
          const formattedDate = formatDate(row.created);
          if (!groupedData[row.name]) {
            groupedData[row.name] = {};
          }
          if (!groupedData[row.name][formattedDate]) {
            groupedData[row.name][formattedDate] = 0;
          }
          groupedData[row.name][formattedDate]++;
        });

         series = Object.keys(groupedData).map(name => {
          return {
            name: name,
            type: 'bar',
            stack: 'total',
            barWidth: barWidth,
            label: {
              show: false,
              formatter: (params: any) => Math.round(params.value)
            },
            itemStyle: {
              color: colorMapping[name] || '#000000'
            },
            data: xAxisValue.map((date: any) => groupedData[name][date] || '')
          };
        });
      }




      // Prepare the series data with colors


      const option = {
        tooltip: {
          trigger: 'axis',
        },
        legend: {
          selectedMode: true,
          data: legendData,
          itemHeight: 10,
          textStyle: {
            color: (name: string) => colorMapping[name] || '#000000',
            fontSize:10
            
          },
          // orient: 'horizontal',
          bottom: 0,
          // left: 'center',
        },
        grid: {
          left: "5%",
          right: "5%",
          top:"2%",
          bottom: xAxisValue.length > 10 ? 100 : 60
        },
        yAxis: {
          type: 'value',
          splitLine: {  
            show: true,
            lineStyle: {
              color: '#E0E0E0',
              type: 'solid'
            }
          }
        },
        xAxis: {
          type: 'category',
          data: xAxisValue,
          splitLine: {
            show: false,
            lineStyle: {
              color: '#E0E0E0',
              type: 'solid'
            }
          },
          axisLabel: {
            rotate: xAxisValue.length > 10 ? 60 : 0,
            formatter: (value: any) => value,
            margin: 10
          }
        },
        series: series
      };
      

      myChart1.setOption(option);

    } else {
      chartDom1.innerHTML = "<div class='d-flex align-items-center justify-content-center' style='height:100%; width:100%;'>No Data</div>";
    }
  }


  onSelectionChangeAgeGroup3(){
    this.getListData();
  }


  onChangeSelection(){
    this.getStackedChart();
  }



}
