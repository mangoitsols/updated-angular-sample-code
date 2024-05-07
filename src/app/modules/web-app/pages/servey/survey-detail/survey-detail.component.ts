import { Component, OnDestroy, OnInit } from '@angular/core';
import { saveAs } from 'file-saver';
import { ClubDetail, LoginDetails, ProfileDetails, ThemeType } from '@core/models';
import { Survey } from '@core/models/survey.model';
import { Subscription } from 'rxjs';
import { AuthService, CommonFunctionService, LanguageService, NotificationService, ThemeService, AcceptdenyService } from '@core/services';
import { ConfirmDialogService, DenyReasonConfirmDialogService, UpdateConfirmDialogService } from '@shared/components';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { UntypedFormBuilder } from '@angular/forms';
import { io, Socket } from 'socket.io-client';
import { environment } from '@env/environment';
import { filter } from 'rxjs/operators';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import { BreadcrumbItem } from '@shared/components/page-header/breadcrumb.type';
import { trim } from 'jquery';
declare var $: any;
@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'app-survey-detail',
  templateUrl: './survey-detail.component.html',
  styleUrls: ['./survey-detail.component.css'],
})
export class SurveyDetailComponent implements OnInit, OnDestroy {
  language: any;
  userDetails: LoginDetails;
  surveyId: any;
  surveyData: Survey;
  setTheme: ThemeType;
  private activatedSub: Subscription;
  updateSurveyData: any;
  showToggle: any;
  thumbnail: string;
  memberid: number;
  displayError: boolean = false;
  getclubInfo: ClubDetail;
  profile_data: ProfileDetails;
  birthdateStatus: boolean;
  memberStartDateStatus: Date;
  private refreshPage: Subscription;
  private denyRefreshPage: Subscription;
  private removeUpdate: Subscription;
  showImage: any;
  showUpdatedImage: any;
  showFile: any;
  showUpdatedFile: any;
  thumb: string;
  breadCrumbItems: Array<BreadcrumbItem>;
  responseMessage: string = null;
  result: any;
  documentData: any;
  dowloading: boolean = false;
  socket: Socket;
  role: any;

  constructor(
    private authService: AuthService,
    private commonFunctionService: CommonFunctionService,
    private denyReasonService: DenyReasonConfirmDialogService,
    private themes: ThemeService,
    private router: Router,
    public formBuilder: UntypedFormBuilder,
    private notificationService: NotificationService,
    private confirmDialogService: ConfirmDialogService,
    private lang: LanguageService,
    private route: ActivatedRoute,
    private updateConfirmDialogService: UpdateConfirmDialogService,
    private acceptdenyService: AcceptdenyService
  ) {
    this.userDetails = JSON.parse(localStorage.getItem('user-data'));

    this.refreshPage = this.confirmDialogService.dialogResponse.subscribe(message => {
      setTimeout(() => {
        this.ngOnInit();
      }, 2000);
    });

    this.denyRefreshPage = this.updateConfirmDialogService.denyDialogResponse.subscribe(resp => {
      setTimeout(() => {
        this.ngOnInit();
      }, 2000);
    });

    this.removeUpdate = this.denyReasonService.remove_deny_update.subscribe(resp => {
      setTimeout(() => {
        this.ngOnInit();
      }, 1000);
    });

    this.surveyId = this.route.snapshot.params.surveyId;
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        untilDestroyed(this)
      )
      .subscribe((event: NavigationEnd) => {
        this.surveyId = this.route.snapshot.params.surveyId;
        this.getSurveyData();
      });
  }

  ngOnInit(): void {
    this.socket = io(environment.serverUrl);
    if (localStorage.getItem('club_theme') != null) {
      let theme: ThemeType = JSON.parse(localStorage.getItem('club_theme'));
      this.setTheme = theme;
    }
    this.activatedSub = this.themes.club_theme.subscribe((resp: ThemeType) => {
      this.setTheme = resp;
    });
    this.language = this.lang.getLanguageFile();
    this.getSurveyData();
    this.role = this.userDetails.roles[0];
    this.initBreadcrumb();
  }

  /**
   * Function to get survey details by survey Id
   * @author  MangoIt Solutions (T)
   * @param   {}
   * @return  {Array Of Object}
   */
  getSurveyData() {
    this.authService.setLoader(true);
    this.authService.memberSendRequest('get', 'getSurveyById/' + this.surveyId, null).subscribe((respData: any) => {
      this.authService.setLoader(false);
      if (respData['isError'] == false) {
        if (respData?.['result']?.length > 0) {
          this.surveyData = respData['result'];
          this.memberid = this.surveyData[0].user_name['member_id'];
          if (this.surveyData[0].image && this.surveyData[0].image != '') {
            let tokenUrl = this.commonFunctionService.genrateImageToken(this.surveyData[0].id, 'survey');
            this.showImage = { url: tokenUrl, isLoading: true, imageLoaded: false };
            this.commonFunctionService.loadImage(this.showImage);
          } else if (this.surveyData[0].document != '') {
            this.showFile = this.surveyData[0].document;
            $('.preview_img').attr('src', '../../../../assets/img/doc-icons/folder.svg');
          } else {
            this.showImage = '';
          }

          if (this.surveyData[0]['user_id'] == JSON.parse(this.userDetails.userId) || this.userDetails.roles[0] == 'admin') {
            this.updateSurveyData = JSON.parse(this.surveyData[0]['updated_record']);
            if (this.updateSurveyData != null) {
              this.updateSurveyData.survey_Answers = JSON.parse(this.updateSurveyData.survey_Answers);
              if (this.updateSurveyData?.newImage && trim(this.updateSurveyData?.newImage) != '') {
                let updateTokenUrl = this.commonFunctionService.genrateImageToken(this.surveyData[0].id, 'updateSurvey');
                this.updateSurveyData.newImage = updateTokenUrl;
                this.showUpdatedImage = { url: updateTokenUrl, isLoading: true, imageLoaded: false };
                this.commonFunctionService.loadImage(this.showUpdatedImage);
              } else if (this.updateSurveyData?.newDocument && this.updateSurveyData?.newDocument != '') {
                this.showUpdatedFile = this.updateSurveyData?.newDocument;
              }
            }
          }
        } else {
          this.notificationService.showError(this.language.Survey.no_survey, 'Error');
        }
      } else {
        this.notificationService.showError(respData['result'], 'Error');
      }
    });
  }

  onShow() {
    let el: HTMLCollectionOf<Element> = document.getElementsByClassName('bunch_drop');
    if (!this.showToggle) {
      this.showToggle = true;
      el[0].className = 'bunch_drop show';
    } else {
      this.showToggle = false;
      el[0].className = 'bunch_drop';
    }
  }

  goBack() {
    this.router.navigate(['/web/survey']);
  }

  /**
   * Function is used to Approve survey BY admin
   * @author  MangoIt Solutions
   * @param   {survey_id,userId}
   * @return  {staring}
   */
  approveSurvey(survey_id: number) {
    this.acceptdenyService.approvedSurvey(survey_id, 'web');
  }

  /**
   * Function is used to Approve updated survey BY admin
   * @author  MangoIt Solutions
   * @param   {survey_id,userId}
   * @return  {staring}
   */
  approveUpdateSurvey(survey_id: number) {
    this.acceptdenyService.approvedUpdatedSurvey(survey_id, 'web');
  }

  /**
   * Function is used to deny survey BY admin
   * @author  MangoIt Solutions
   * @param   {survey_id,userId}
   * @return  {staring}
   */
  denySurvey(survey_id: number) {
    this.acceptdenyService.unapprovedSurvey(survey_id, 'web');
  }

  /**
   * Function is used to delete survey BY admin
   * @author  MangoIt Solutions
   * @param   {survey_id,userId}
   * @return  {staring}
   */
  surveyDelete(survey_id: number) {
    this.acceptdenyService.surveyDelete(survey_id, 'web');
  }

  /**
   * Function is used to delete updated survey BY admin
   * @author  MangoIt Solutions
   * @param   {survey_id,userId}
   * @return  {staring}
   */
  deleteUpdatedSurvey(survey_id: number) {
    this.acceptdenyService.deleteUpdatedSurvey(survey_id, 'web');
  }

  /**
   * Function is used to download document
   * @author  MangoIt Solutions
   * @param   {path}
   */
  downloadDoc(path: any, type: any) {
    let data = {
      name: path,
      survey_id: this.surveyId,
      type: type,
    };
    this.dowloading = true;
    var endPoint = 'download-survey-document';
    if (data && data.name) {
      let filename = data.name.split('/').reverse()[0];
      this.authService
        .downloadDocument('post', endPoint, data)
        .toPromise()
        .then((blob: any) => {
          saveAs(blob, filename);
          this.authService.setLoader(false);
          this.dowloading = false;
          setTimeout(() => {
            this.authService.sendRequest('post', 'delete-survey-document/uploads', data).subscribe((result: any) => {
              this.result = result;
              this.authService.setLoader(false);
              if (this.result.success == false) {
                this.notificationService.showError(this.result['result']['message'], 'Error');
              } else if (this.result.success == true) {
                this.documentData = this.result['result']['message'];
              }
            });
          }, 7000);
        })
        .catch(err => {
          this.responseMessage = err;
        });
    }
  }

  downloadImage(blobUrl: any) {
    window.open(blobUrl.changingThisBreaksApplicationSecurity, '_blank');
  }

  private initBreadcrumb(): void {
    this.breadCrumbItems = [{ label: this.language.menu.club_tools, link: '' }, { label: this.language.Survey.survey_detail }];
  }

  ngOnDestroy(): void {
    this.activatedSub.unsubscribe();
    this.refreshPage.unsubscribe();
    this.denyRefreshPage.unsubscribe();
    this.removeUpdate.unsubscribe();
  }
}
