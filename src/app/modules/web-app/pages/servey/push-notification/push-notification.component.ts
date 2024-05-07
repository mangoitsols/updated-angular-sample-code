import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import io, { Socket } from 'socket.io-client';
import { CrmNews, CrmSurvey, LoginDetails, ThemeType } from '@core/models';
import { UntypedFormArray, UntypedFormGroup } from '@angular/forms';
import { AuthService, CommonFunctionService, LanguageService, NotificationService, ThemeService } from '@core/services';
import { Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
//import {serverUrl} from '@env/environment';
import { environment } from '@env/environment';

declare let $: any;
@Component({
  selector: 'app-push-notification',
  templateUrl: './push-notification.component.html',
  styleUrls: ['./push-notification.component.css'],
})
export class PushNotificationComponent implements OnInit, OnDestroy {
  userData: LoginDetails;
  setTheme: ThemeType;
  displayNotification: any;
  notification_id: number[] = [];
  socket: Socket;
  private activatedSub: Subscription;
  language: any;
  surveyData: CrmSurvey[] = [];
  newsData: CrmNews[] = [];
  newsForm: UntypedFormGroup;
  surveyForm: UntypedFormGroup;

  constructor(
    public authService: AuthService,
    private router: Router,
    private themes: ThemeService,
    private lang: LanguageService,
    private notificationService: NotificationService,
    private sanitizer: DomSanitizer,
    private commonFunctionService: CommonFunctionService
  ) {}

  ngOnInit(): void {
    if (localStorage.getItem('club_theme') != null) {
      let theme: ThemeType = JSON.parse(localStorage.getItem('club_theme'));
      this.setTheme = theme;
    }
    this.activatedSub = this.themes.club_theme.subscribe((resp: ThemeType) => {
      this.setTheme = resp;
    });
    this.language = this.lang.getLanguageFile();
    this.userData = JSON.parse(localStorage.getItem('user-data'));
    this.socket = io(environment.serverUrl);
    this.getNotify();
    if (this.userData.roles[0] != 'guest') {
      this.getCRMNews();
      this.getcrmSurvey();
    }
    this.socket.on('newnoti', (notificationData: any) => {
      this.getNotify();
    });

    this.newsForm = new UntypedFormGroup({
      newsIds: new UntypedFormArray([]),
    });

    this.surveyForm = new UntypedFormGroup({
      surveyIds: new UntypedFormArray([]),
    });
  }

  getNotify() {
    var endPoint: string = 'surveyNotify/' + this.userData.userId;
    this.notification_id = [];
    this.authService.setLoader(true);
    this.authService.memberSendRequest('get', endPoint, '').subscribe((respData: any) => {
      this.authService.setLoader(false);
      if (respData['isError'] == false && respData.result != '') {
        this.displayNotification = respData.result;
        if (this.displayNotification?.length > 0) {
          this.displayNotification.forEach((element: any) => {
            this.notification_id.push(element.id);
          });
          let dis_noti = this.displayNotification.filter((o: any) => o.author != this.userData.userId);
          this.displayNotification = [];
          this.displayNotification = dis_noti;
          this.displayNotification['text'] = this.language.Survey.new_survey;
          $('#push-notification').modal({
            backdrop: 'static',
          });
          $('#push-notification').modal('show');
        }
      } else if (respData['code'] == 400) {
        this.notificationService.showError(respData['message'], 'Error');
      }
    });
  }

  getCRMNews() {
    var loginStatus: string = localStorage.getItem('loginStatus');
    if (loginStatus == '1') {
      this.authService.setLoader(true);
      this.authService.memberSendRequest('get', 'get-crmnews-notification', null).subscribe((respData: CrmNews) => {
        this.authService.setLoader(false);
        if (respData?.result?.news?.length > 0 && respData.isError == false) {
          setTimeout(() => {
            $('#push-notification').modal({ backdrop: 'static' });
            $('#push-notification').modal('show');
            this.newsData = respData.result.news;
            this.newsData.forEach((element: any) => {
              if (element?.picture) {
                element.picture = this.sanitizer.bypassSecurityTrustUrl(this.commonFunctionService.convertBase64ToBlobUrl(element?.picture.substring(20)));
              }
              if (element?.image) {
                element.image = this.sanitizer.bypassSecurityTrustUrl(this.commonFunctionService.convertBase64ToBlobUrl(element?.image.substring(20)));
              }
            });
            var status = '0';
            localStorage.setItem('loginStatus', status);
          }, 600);
        } else if (respData.isError == false && respData?.result?.news?.length < 1) {
          $('#push-notification').modal('hide');
          var status = '0';
          localStorage.setItem('loginStatus', status);
        }
      });
    }
  }

  getcrmSurvey() {
    var loginStatus = localStorage.getItem('loginStatus');
    if (loginStatus == '1') {
      this.authService.setLoader(true);
      this.authService.memberSendRequest('get', 'get-crmsurvey-notification', null).subscribe((respData: CrmSurvey) => {
        this.authService.setLoader(false);
        if (respData?.result?.survey?.length > 0 && respData.isError == false) {
          setTimeout(() => {
            $('#push-notification').modal({ backdrop: 'static' });
            $('#push-notification').modal('show');
            this.surveyData = respData.result.survey;
            this.surveyData.forEach((element: any) => {
              if (element?.picture) {
                element.picture = this.sanitizer.bypassSecurityTrustUrl(this.commonFunctionService.convertBase64ToBlobUrl(element?.picture.substring(20)));
              }
            });
            var status = '0';
            localStorage.setItem('loginStatus', status);
          }, 600);
        } else if (respData.isError == false && respData.result.survey.length < 1) {
          $('#push-notification').modal('hide');
          var status = '0';
          localStorage.setItem('loginStatus', status);
        }
      });
    }
  }

  readSurvey() {
    var endPoint: string = 'surveyread';
    let read: any = { id: this.notification_id, loginId: this.userData.userId };
    this.authService.setLoader(true);
    this.authService.memberSendRequest('post', endPoint, read).subscribe((respData: any) => {
      this.authService.setLoader(false);
      if (respData['isError'] == false) {
        $('#push-notification').modal('hide');
        this.getNotify();
        this.notificationService.showSuccess(respData['result']['message'], 'Success');
        setTimeout(() => {
          this.notification_id = [];
        }, 1000);
      } else if (respData['code'] == 400) {
        this.notificationService.showError(respData['message'], 'Error');
      }
    });
  }

  getpopclosed() {
    if (this.newsData && this.newsData.length > 0) {
      this.newsData.forEach(element => {
        this.newsForm.value.newsIds.push(element.news_id);
      });
    }
    if (sessionStorage.getItem('token')) {
      this.authService.setLoader(true);
      let userId = localStorage.getItem('user-id');
      this.authService.memberSendRequest('post', 'get-crmnews-read', this.newsForm.value).subscribe((respData: CrmNews) => {
        this.authService.setLoader(false);
      });
    }
  }

  getsurveypopclosed() {
    if (this.surveyData && this.surveyData.length > 0) {
      this.surveyData.forEach(element => {
        this.surveyForm.value.surveyIds.push(element.id);
      });
    }
    if (sessionStorage.getItem('token')) {
      this.authService.setLoader(true);
      this.authService.memberSendRequest('post', 'get-crmsurvey-read', this.surveyForm.value).subscribe((respData: CrmSurvey) => {
        this.authService.setLoader(false);
        if (respData['isError'] == false) {
          $('#push-notification').modal('hide');
        } else if (respData['code'] == 400) {
          $('#push-notification').modal('hide');
        }
      });
    }
  }

  viewDetails() {
    $('#push-notification').modal('hide');
    this.getsurveypopclosed();
    this.router.navigate(['/web/crm-survey']);
  }

  viewNewsDetails() {
    $('#push-notification').modal('hide');
    this.getpopclosed();
    this.router.navigate(['/web/crm-news']);
  }

  viewReadSurveyDetail() {
    $('#push-notification').modal('hide');
    this.readSurvey();
    this.router.navigate(['/web/survey']);
  }

  redirectToDashboard() {
    $('#push-notification').modal('hide');
    this.getpopclosed();
    this.getsurveypopclosed();
    this.readSurvey();
    this.router.navigate(['/web/dashboard']);
  }

  closeModal() {
    $('#push-notification').modal('hide');
  }

  ngOnDestroy(): void {
    this.activatedSub.unsubscribe();
  }
}
