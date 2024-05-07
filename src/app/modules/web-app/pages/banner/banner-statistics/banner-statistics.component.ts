import { Component, OnInit } from '@angular/core';
import * as echarts from 'echarts';
import { AuthService, LanguageService } from '@core/services';
import { BreadcrumbItem } from '@shared/components/page-header/breadcrumb.type';
import { LoginDetails, ParticipateAccess, UserAccess } from '@core/models';
import { appSetting } from '@core/constants';

@Component({
  selector: 'app-banner-statistics',
  templateUrl: './banner-statistics.component.html',
  styleUrls: ['./banner-statistics.component.css'],
})
export class BannerStatisticsComponent implements OnInit {
  language: any;

  allBanners: any;
  bannerName: any[] = [];
  bannerGender: any[] = [];
  bannerFemale: any[] = [];
  bannerMale: any[] = [];
  bannerDiverse: any[] = [];
  bannerBusiness: any[] = [];
  bannerUndefine: any[] = [];
  isSuccessFalse: boolean = false;

  allMobBanners: any;
  bannerNameMob: any[] = [];
  bannerGenderMob: any[] = [];
  bannerFemaleMob: any[] = [];
  bannerMaleMob: any[] = [];
  bannerDiverseMob: any[] = [];
  bannerBusinessMob: any[] = [];
  bannerUndefineMob: any[] = [];
  isSuccessFalseMob: boolean = false;

  public barChartOptions = {
    scaleShowVerticalLines: false,
    responsive: true,
  };
  public barChartLabels = []; // add all banner labels
  public barChartType = 'bar';
  public barChartLegend = true;
  // add all banner click data
  public barChartData = [{ data: [], label: 'Clicks' }];
  barChartName: any[] = [];
  barChartCount: any[] = [];

  public barChartOptions1 = {
    scaleShowVerticalLines: false,
    responsive: true,
  };
  public barChartLabels1 = []; // add all banner labels
  public barChartType1 = 'bar';
  public barChartLegend1 = true;
  // add all banner click data
  public barChartData1 = [{ data: [], label: 'Clicks' }];
  barChartName1: any[] = [];
  barChartCount1: any[] = [];
  breadCrumbItems: Array<BreadcrumbItem>;
  participateAccess: ParticipateAccess;
  userAccess: UserAccess;
  userDetails: LoginDetails;

  constructor(private authService: AuthService, private lang: LanguageService) {}
  ngOnInit(): void {
    this.language = this.lang.getLanguageFile();
    this.userDetails = JSON.parse(localStorage.getItem('user-data'));
    let role = this.userDetails.roles[0];
    this.userAccess = appSetting.role;
    this.participateAccess = this.userAccess[role].participate;
    if (this.participateAccess?.banner == 'Yes') {
      this.initBreadcrumb();
      var endPoint = 'getBannerStatisticForDesktop';
      this.authService.memberSendRequest('get', endPoint, '').subscribe((respData: any) => {
        this.authService.setLoader(false);
        if (respData.isError == true) {
          this.isSuccessFalse = true;
        } else if (respData.isError == false) {
          this.isSuccessFalse = false;
          this.allBanners = respData.result.banner;
          this.genderStatisticsDesktop(this.allBanners);
          this.bannerClickDesktop(this.allBanners);
        }
      });
      var endPoint = 'getBannerStatisticForMobileApp';
      this.authService.memberSendRequest('get', endPoint, '').subscribe((respData: any) => {
        this.authService.setLoader(false);
        if (respData.isError == true) {
          this.isSuccessFalseMob = true;
        } else if (respData.isError == false) {
          this.isSuccessFalseMob = false;
          this.allMobBanners = respData.result.banner;
          this.genderStatisticsMobile(this.allMobBanners);
          this.bannerClickMobile(this.allMobBanners);
        }
      });
    }
  }

  bannerClickDesktop(allBanners: any) {
    if (allBanners?.length > 0) {
      allBanners.forEach((element: any) => {
        this.barChartName.push(element.bannerName);
        this.barChartCount.push(element.Totalcount);
      });
      this.barChartLabels = this.barChartName;
      this.barChartData[0].data = this.barChartCount;
    }
  }

  bannerClickMobile(allMobBanners: any) {
    if (allMobBanners?.length > 0) {
      allMobBanners.forEach((element: any) => {
        this.barChartName1.push(element.bannerName);
        this.barChartCount1.push(element.Totalcount);
      });
      this.barChartLabels1 = this.barChartName1;
      this.barChartData1[0].data = this.barChartCount1;
    }
  }

  genderStatisticsDesktop(allBanners: any) {
    if (allBanners?.length > 0) {
      allBanners.forEach((element: any, index: any) => {
        let bFemale: number = 0;
        let bMale: number = 0;
        let bDirvers: number = 0;
        let bBusiness: number = 0;
        let bUndefine: number = 0;
        this.bannerName.push(element.bannerName);
        element.banner_stat.forEach((elem: any) => {
          if (elem.gender == 'F') {
            bFemale++;
          } else if (elem.gender == 'M') {
            bMale++;
          } else if (elem.gender == 'D') {
            bDirvers++;
          } else if (elem.gender == 'B') {
            bBusiness++;
          } else if (elem.gender == 'U') {
            bUndefine++;
          }
        });
        this.bannerFemale[index] = bFemale;
        this.bannerMale[index] = bMale;
        this.bannerDiverse[index] = bDirvers;
        this.bannerBusiness[index] = bBusiness;
        this.bannerUndefine[index] = bUndefine;
      });
      setTimeout(() => {
        var app: any = {};
        type EChartsOption = echarts.EChartsOption;
        var chartDom = document.getElementById('main')!;
        var myChart = echarts.init(chartDom);
        var option: EChartsOption;
        const posList = ['left', 'right', 'top', 'bottom', 'inside', 'insideTop', 'insideLeft', 'insideRight', 'insideBottom', 'insideTopLeft', 'insideTopRight', 'insideBottomLeft', 'insideBottomRight'] as const;
        app.configParameters = {
          rotate: {
            min: -90,
            max: 90,
          },
          align: {
            options: {
              left: 'left',
              center: 'center',
              right: 'right',
            },
          },
          verticalAlign: {
            options: {
              top: 'top',
              middle: 'middle',
              bottom: 'bottom',
            },
          },
          position: {
            options: posList.reduce((map, pos) => {
              map[pos] = pos;
              return map;
            }, {} as Record<string, string>),
          },
          distance: {
            min: 0,
            max: 100,
          },
        };
        app.config = {
          rotate: 90,
          align: 'left',
          verticalAlign: 'middle',
          position: 'insideBottom',
          distance: 15,
          onChange: () => {
            const labelOption: BarLabelOption = {
              rotate: app.config.rotate as BarLabelOption['rotate'],
              align: app.config.align as BarLabelOption['align'],
              verticalAlign: app.config.verticalAlign as BarLabelOption['verticalAlign'],
              position: app.config.position as BarLabelOption['position'],
              distance: app.config.distance as BarLabelOption['distance'],
            };
            myChart.setOption<echarts.EChartsOption>({
              series: [
                {
                  label: labelOption,
                },
                {
                  label: labelOption,
                },
                {
                  label: labelOption,
                },
                {
                  label: labelOption,
                },
              ],
            });
          },
        };
        type BarLabelOption = NonNullable<echarts.BarSeriesOption['label']>;
        const labelOption: BarLabelOption = {
          show: true,
          position: app.config.position as BarLabelOption['position'],
          distance: app.config.distance as BarLabelOption['distance'],
          align: app.config.align as BarLabelOption['align'],
          verticalAlign: app.config.verticalAlign as BarLabelOption['verticalAlign'],
          rotate: app.config.rotate as BarLabelOption['rotate'],
          formatter: '{c}  {name|{a}}',
          fontSize: 16,
          rich: {
            name: {},
          },
        };
        option = {
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'shadow',
            },
          },
          legend: {
            data: ['Female', 'Male', 'Divers', 'Business', 'Undefine'],
          },
          xAxis: [
            {
              type: 'category',
              axisTick: { show: true },
              data: this.bannerName,
            },
          ],
          yAxis: [
            {
              type: 'value',
              max: 20,
            },
          ],
          series: [
            {
              name: 'Female',
              type: 'bar',
              barGap: 0,
              label: labelOption,
              emphasis: {
                focus: 'series',
              },
              data: this.bannerFemale,
            },
            {
              name: 'Male',
              type: 'bar',
              label: labelOption,
              emphasis: {
                focus: 'series',
              },
              data: this.bannerMale,
            },
            {
              name: 'Divers',
              type: 'bar',
              label: labelOption,
              emphasis: {
                focus: 'series',
              },
              data: this.bannerDiverse,
            },
            {
              name: 'Business',
              type: 'bar',
              label: labelOption,
              emphasis: {
                focus: 'series',
              },
              data: this.bannerBusiness,
            },
            {
              name: 'Undefine',
              type: 'bar',
              barGap: 0,
              label: labelOption,
              emphasis: {
                focus: 'series',
              },
              data: this.bannerUndefine,
            },
          ],
        };
        option && myChart.setOption(option);
      }, 1000);
    }
  }

  genderStatisticsMobile(allMobBanners: any) {
    if (allMobBanners?.length > 0) {
      allMobBanners.forEach((element: any, index: any) => {
        let bFemale: number = 0;
        let bMale: number = 0;
        let bDirvers: number = 0;
        let bBusiness: number = 0;
        let bUndefine: number = 0;
        this.bannerNameMob.push(element.bannerName);
        element.banner_stat.forEach((elem: any) => {
          if (elem.gender == 'F') {
            bFemale++;
          } else if (elem.gender == 'M') {
            bMale++;
          } else if (elem.gender == 'D') {
            bDirvers++;
          } else if (elem.gender == 'B') {
            bBusiness++;
          } else if (elem.gender == 'U') {
            bUndefine++;
          }
        });
        this.bannerFemaleMob[index] = bFemale;
        this.bannerMaleMob[index] = bMale;
        this.bannerDiverseMob[index] = bDirvers;
        this.bannerBusinessMob[index] = bBusiness;
        this.bannerUndefineMob[index] = bUndefine;
      });
      setTimeout(() => {
        var app: any = {};
        type EChartsOption = echarts.EChartsOption;
        var chartDom = document.getElementById('main1');
        var myChart1 = echarts.init(chartDom);
        var option: EChartsOption;
        const posList = ['left', 'right', 'top', 'bottom', 'inside', 'insideTop', 'insideLeft', 'insideRight', 'insideBottom', 'insideTopLeft', 'insideTopRight', 'insideBottomLeft', 'insideBottomRight'] as const;
        app.configParameters = {
          rotate: {
            min: -90,
            max: 90,
          },
          align: {
            options: {
              left: 'left',
              center: 'center',
              right: 'right',
            },
          },
          verticalAlign: {
            options: {
              top: 'top',
              middle: 'middle',
              bottom: 'bottom',
            },
          },
          position: {
            options: posList.reduce((map, pos) => {
              map[pos] = pos;
              return map;
            }, {} as Record<string, string>),
          },
          distance: {
            min: 0,
            max: 100,
          },
        };
        app.config = {
          rotate: 90,
          align: 'left',
          verticalAlign: 'middle',
          position: 'insideBottom',
          distance: 15,
          onChange: () => {
            const labelOption: BarLabelOption = {
              rotate: app.config.rotate as BarLabelOption['rotate'],
              align: app.config.align as BarLabelOption['align'],
              verticalAlign: app.config.verticalAlign as BarLabelOption['verticalAlign'],
              position: app.config.position as BarLabelOption['position'],
              distance: app.config.distance as BarLabelOption['distance'],
            };
            myChart1.setOption<echarts.EChartsOption>({
              series: [
                {
                  label: labelOption,
                },
                {
                  label: labelOption,
                },
                {
                  label: labelOption,
                },
                {
                  label: labelOption,
                },
              ],
            });
          },
        };
        type BarLabelOption = NonNullable<echarts.BarSeriesOption['label']>;
        const labelOption: BarLabelOption = {
          show: true,
          position: app.config.position as BarLabelOption['position'],
          distance: app.config.distance as BarLabelOption['distance'],
          align: app.config.align as BarLabelOption['align'],
          verticalAlign: app.config.verticalAlign as BarLabelOption['verticalAlign'],
          rotate: app.config.rotate as BarLabelOption['rotate'],
          formatter: '{c}  {name|{a}}',
          fontSize: 16,
          rich: {
            name: {},
          },
        };
        option = {
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'shadow',
            },
          },
          legend: {
            data: ['Female', 'Male', 'Divers', 'Business', 'Undefine'],
          },
          xAxis: [
            {
              type: 'category',
              axisTick: { show: true },
              data: this.bannerNameMob,
            },
          ],
          yAxis: [
            {
              type: 'value',
              max: 15,
            },
          ],
          series: [
            {
              name: 'Female',
              type: 'bar',
              barGap: 0,
              label: labelOption,
              emphasis: {
                focus: 'series',
              },
              data: this.bannerFemaleMob,
            },
            {
              name: 'Male',
              type: 'bar',
              label: labelOption,
              emphasis: {
                focus: 'series',
              },
              data: this.bannerMaleMob,
            },
            {
              name: 'Divers',
              type: 'bar',
              label: labelOption,
              emphasis: {
                focus: 'series',
              },
              data: this.bannerDiverseMob,
            },
            {
              name: 'Business',
              type: 'bar',
              label: labelOption,
              emphasis: {
                focus: 'series',
              },
              data: this.bannerBusinessMob,
            },
            {
              name: 'Undefine',
              type: 'bar',
              label: labelOption,
              emphasis: {
                focus: 'series',
              },
              data: this.bannerUndefineMob,
            },
          ],
        };
        option && myChart1.setOption(option);
      }, 1000);
    }
  }

  private initBreadcrumb(): void {
    this.breadCrumbItems = [{ label: 'Banner-Statistics', link: '/web/banner-statistics' }];
  }
}
