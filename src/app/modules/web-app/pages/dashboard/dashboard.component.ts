import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthorizationAccess, CreateAccess, CrmNews, CrmSurvey, LoginDetails, ParticipateAccess, ThemeType, UserAccess } from '@core/models';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { interval, Subscription } from 'rxjs';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { AuthService, CommonFunctionService, LanguageService, NotificationService, ThemeService, UserImageService } from '@core/services';
import { DomSanitizer } from '@angular/platform-browser';
import { take } from 'rxjs/operators';
import { appSetting } from '@core/constants';

declare var $: any;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  language: any;
  userDetails: LoginDetails;
  userAccess: UserAccess;
  createAccess: CreateAccess;
  participateAccess: ParticipateAccess;
  authorizationAccess: AuthorizationAccess;
  clubNewsCount: number = 0;
  communityCount: number = 0;
  organizerCount: number = 0;
  setTheme: ThemeType;
  showEventList = false;
  showCalendar = true;
  newsForm: UntypedFormGroup;
  surveyForm: UntypedFormGroup;
  newsData: CrmNews[] = [];
  surveyData: CrmSurvey[] = [];
  responseMessage: string = '';
  userRespData: string;
  thumbnail: string;
  private activatedSub: Subscription;
  private activatedPro: Subscription;
  customOptions: OwlOptions = {
    loop: true,
    mouseDrag: false,
    touchDrag: false,
    pullDrag: false,
    dots: false,
    navSpeed: 700,
    navText: ['', ''],
    responsive: {
      0: {
        items: 1,
      },
      400: {
        items: 1,
      },
      740: {
        items: 1,
      },
      940: {
        items: 1,
      },
    },
    nav: true,
  };
  bannerData: [];
  eventData: [];
  courseData: [];
  allowAdvertisment: any;
  isData: boolean = true;
  totalChildComponents = 1;
  loadedChildComponents = 0;
  groupCount: any;
  noOfgroupCount: any;
  groupName: any;

  constructor(
    private lang: LanguageService,
    private themes: ThemeService,
    private notificationService: NotificationService,
    private authService: AuthService,
    private sanitizer: DomSanitizer,
    public formBuilder: UntypedFormBuilder,
    private commonFunctionService: CommonFunctionService,
    private userImageService: UserImageService
  ) {}

  ngOnInit(): void {
    this.authService.setLoader(true);
    if (localStorage.getItem('token') != null) {
      interval(15 * 60 * 1000)
        .pipe(take(1)) // it will run after every 25 minute
        .subscribe(() => {
          this.refreshTokens();
        });
    }
    if (localStorage.getItem('club_theme') != null) {
      let theme: ThemeType = JSON.parse(localStorage.getItem('club_theme'));
      this.setTheme = theme;
    }

    this.activatedSub = this.themes.club_theme.subscribe((resp: ThemeType) => {
      this.setTheme = resp;
    });

    this.activatedPro = this.themes.profile_imge.subscribe((resp: string) => {});

    this.language = this.lang.getLanguageFile();
    let userId: string = localStorage.getItem('user-id');
    this.userDetails = JSON.parse(localStorage.getItem('user-data'));
    let userRole: string = this.userDetails.roles[0];
    this.userAccess = appSetting.role;

    this.allowAdvertisment = localStorage.getItem('allowAdvertis');
    this.createAccess = this.userAccess[userRole].create;
    this.participateAccess = this.userAccess[userRole].participate;
    this.authorizationAccess = this.userAccess[userRole].authorization;
    this.authService.memberSendRequest('get', 'numberOfPostEventsMessage/user/' + userId, null).subscribe((respData: any) => {
      if (respData['isError'] == false) {
        this.clubNewsCount = respData.result.posts;
        this.organizerCount = respData.result.events;
        this.communityCount = respData.result.message;
        this.noOfgroupCount = respData.result?.group;
        if (this.noOfgroupCount != undefined) {
          if (!isNaN(this.noOfgroupCount)) {
            this.groupCount = respData.result?.group;
          } else {
            this.groupName = respData.result?.group;
          }
        }
      }
    });

    let eventUrl: string;
    if (userRole == 'guest') {
      eventUrl = 'openevents/';
    } else {
      eventUrl = 'approvedClubEvents/user/' + userId;
    }

    this.authService.memberSendRequest('get', eventUrl, null).subscribe((respData: any) => {
      this.eventData = respData;
      this.eventData.forEach((element: any) => {
        let tokenUrl = this.commonFunctionService.genrateImageToken(element.id, 'event');
        element.token = { url: tokenUrl, isLoading: true, imageLoaded: false };
        this.commonFunctionService.loadImage(element.token);
      });
    });

    if (this.allowAdvertisment == 0) {
      this.getDesktopDeshboardBanner();
    }
  }

  /**
   * FUnction is used to get Desktop Deshboard Banner
   * @author  MangoIt Solutions
   * @param   {}
   * @return  {Array Of Object} all the Banner
   */
  getDesktopDeshboardBanner() {
    // this.authService.setLoader(true);
    this.authService.memberSendRequest('get', 'getBannerForDashboard_Desktop/', null).subscribe((respData: any) => {
      if (respData['isError'] == false) {
        this.bannerData = respData['result']['banner'];

        if (this.bannerData?.length > 0) {
          this.bannerData.forEach((element: any) => {
            element['category'] = JSON.parse(element.category);
            element['placement'] = JSON.parse(element.placement);
            element['display'] = JSON.parse(element.display);
            let tokenUrl = this.commonFunctionService.genrateImageToken(element.id, 'banner');
            element.token = { url: tokenUrl, isLoading: true, imageLoaded: false };
            this.commonFunctionService.loadImage(element.token);

            if (element['redirectLink'].includes('https://') || element['redirectLink'].includes('http://')) {
              element['redirectLink'] = element.redirectLink;
            } else {
              element['redirectLink'] = '//' + element.redirectLink;
            }
          });
        }
        this.authService.setLoader(false);
      } else if (respData['code'] == 400) {
        this.notificationService.showError(respData['message'], 'Error');
        this.authService.setLoader(false);
      }
    });
  }

  refreshTokens() {
    const refreshToken = localStorage.getItem('refresh_token');
    let data: any = {
      refresh_token: refreshToken,
    };
    this.authService.memberSendRequest('post', 'refresh-token', data).subscribe(
      (respData: any) => {
        if (respData['isError'] == false) {
          sessionStorage.setItem('token', respData['result']['access_token']);
          localStorage.setItem('token', respData['result']['access_token']);
          sessionStorage.setItem('refresh_token', respData['result']['refresh_token']);
          localStorage.setItem('refresh_token', respData['result']['refresh_token']);
        } else if (respData['isError'] == true || respData['code'] == 400 || respData['code'] == 404) {
          // this.authService.setLoader(false);
        }
      },
      (error: any) => {
        // Handle error if token refresh fails
      }
    );
  }

  /**
   * Function is used to show and hide event list and event calender
   * @author  MangoIt Solutions
   */
  showEvents(item: any) {
    if (item.value == 'showEventList') {
      this.showEventList = true;
      this.showCalendar = false;
    } else if (item.value == 'showCalendar') {
      this.showEventList = false;
      this.showCalendar = true;
    }
  }

  ngOnDestroy(): void {
    this.activatedSub.unsubscribe();
    this.activatedPro.unsubscribe();
  }
}
