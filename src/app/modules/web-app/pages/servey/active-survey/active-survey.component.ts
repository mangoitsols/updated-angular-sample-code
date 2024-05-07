import { Component, OnDestroy, OnInit } from '@angular/core';
import { LoginDetails, ThemeType } from '@core/models';
import { Subscription } from 'rxjs';
import { AuthService, CommonFunctionService, LanguageService, NotificationService, ThemeService } from '@core/services';
import { Survey } from '@core/models/survey.model';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';

import { SurveyDetailModalComponent } from '../survey-detail-modal/survey-detail-modal.component';

declare var $: any;

@Component({
  selector: 'app-active-survey',
  templateUrl: './active-survey.component.html',
  styleUrls: ['./active-survey.component.css'],
})
export class ActiveSurveyComponent implements OnInit, OnDestroy {
  language: any;
  setTheme: ThemeType;
  currentPageNmuber: number = 1;
  itemPerPage: number = 10;
  totalRecord: number = 0;
  totalActiveSurvey: number = 0;
  limitPerPage: { value: string }[] = [{ value: '10' }, { value: '20' }, { value: '30' }, { value: '40' }, { value: '50' }];
  userDetails: LoginDetails;
  userRole: string;
  activeSurvey: any[];
  private activatedSub: Subscription;
  thumb: any;
  surveyVoteResult: { TotalCount: number; answerCount: { AnswerId: number; count: number }; result: Survey; userCount: number }[];
  surveyData: Survey;
  imageShow: any;
  surveyVoteForm: UntypedFormGroup;

  constructor(
    private authService: AuthService,
    private themes: ThemeService,
    private notificationService: NotificationService,
    private lang: LanguageService,
    private commonFunctionService: CommonFunctionService,
    public formBuilder: UntypedFormBuilder,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.language = this.lang.getLanguageFile();
    this.userDetails = JSON.parse(localStorage.getItem('user-data'));
    this.userRole = this.userDetails.roles[0];
    this.getSurveyData();

    if (localStorage.getItem('club_theme') != null) {
      let theme: ThemeType = JSON.parse(localStorage.getItem('club_theme'));
      this.setTheme = theme;
    }

    this.activatedSub = this.themes.club_theme.subscribe((resp: ThemeType) => {
      this.setTheme = resp;
    });

    this.surveyVoteForm = this.formBuilder.group({
      user_id: [''],
      team_id: [''],
      surveyType: [''],
      surveyTypeId: [''],
    });
  }

  /**
   * Function is used to get active survey list
   * @author  MangoIt Solutions
   * @param   {}
   * @return  {object} survey object
   */
  getSurveyData() {
    var endPoints: any;
    if (this.userRole == 'admin') {
      endPoints = 'getActivePollSurvey/' + this.currentPageNmuber + '/' + this.itemPerPage;
    } else if (this.userRole != 'admin') {
      endPoints = 'getActivePollSurveyUser/user/' + this.userDetails.userId + '/' + this.currentPageNmuber + '/' + this.itemPerPage;
    }
    this.authService.setLoader(true);
    this.authService.memberSendRequest('get', endPoints, null).subscribe((respData: any) => {
      this.authService.setLoader(false);
      if (respData['isError'] == false) {
        if (respData?.['result']?.['survey']?.length > 0) {
          this.activeSurvey = [];
          respData['result']['survey'].forEach((element: any) => {
            let cudate = new Date();
            if (cudate.toISOString().split('T')[0] >= element.surveyStartDate.split('T')[0]) {
              element.dayCount = this.commonFunctionService.getDays(cudate, element.surveyEndDate.split('T')[0]);
              element.remain = this.language.courses.days;
              /* Progress Bar calculation */
              element.progress = this.commonFunctionService.progressBarCalculation(element.surveyStartDate, element.surveyEndDate);
            } else {
              element.dayCount = this.commonFunctionService.getDayDifference(element.surveyStartDate, element.surveyEndDate);
              element.remain = this.language.courses.days;
              /* Progress Bar calculation */
              element.progress = 0;
            }
          });

          this.activeSurvey = respData['result']['survey'];
          this.totalActiveSurvey = respData['result'].pagination.rowCount;
        }
      }
    });
  }

  /**
   * Function is used to open survey-detail modal
   * @author  MangoIt Solutions (T)
   * @param   {}
   * @return  {Array Of Object}
   */
  openModal(survey: any, surveys: any[], selectedIndex: number, type?: any) {
    const confirmDialog = this.dialog.open(SurveyDetailModalComponent, {
      data: { survey, surveys, selectedIndex, type },
      disableClose: true,
      panelClass: 'survey-dialog-model',
      maxHeight: '90vh',
    });
    confirmDialog.afterClosed().subscribe(result => {
      if (result == true) {
        this.getSurveyData();
      }
    });
    confirmDialog.backdropClick().subscribe(() => {
      confirmDialog.close(); // Close the dialog when backdrop (outside the dialog) is clicked
    });
  }

  /**
   * Function is used to change page
   * @author  MangoIt Solutions
   */
  pageChanged(event: number) {
    this.currentPageNmuber = event;
    this.getSurveyData();
  }

  /**
   * Function is used to go to page
   * @author  MangoIt Solutions
   */
  goToPg(eve: number) {
    if (isNaN(eve)) {
      eve = this.currentPageNmuber;
    } else {
      if (eve > Math.ceil(this.totalActiveSurvey / this.itemPerPage)) {
        this.notificationService.showError(this.language.error_message.invalid_pagenumber, 'Error');
      } else {
        this.currentPageNmuber = eve;
        this.getSurveyData();
      }
    }
  }

  /**
   * Function is used to set per page
   * @author  MangoIt Solutions
   */
  setItemPerPage(limit: number) {
    if (isNaN(limit)) {
      limit = this.itemPerPage;
    }
    this.itemPerPage = limit;
    this.getSurveyData();
  }

  /**
   * Function is used to close survey
   * @author  MangoIt Solutions
   * @param   {id}
   * @return  {string} success message
   */
  surveyClose(id: number) {
    this.authService.setLoader(true);
    this.authService.memberSendRequest('put', 'closeSurvey/survey/' + id, '').subscribe((respData: any) => {
      this.authService.setLoader(false);
      if (respData['isError'] == false) {
        this.notificationService.showSuccess(respData['result'], 'Success');
        this.ngOnInit();
      } else if (respData['code'] == 400) {
        this.notificationService.showError(respData['message'], 'Error');
      }
    });
  }

  ngOnDestroy(): void {
    this.activatedSub.unsubscribe();
  }
}
