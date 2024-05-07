import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { LoginDetails, ThemeType } from '@core/models';
import { Survey } from '@core/models/survey.model';
import { AuthService, CommonFunctionService, LanguageService, NotificationService, ThemeService } from '@core/services';
import { MatDialog } from '@angular/material/dialog';
import { SurveyDetailModalComponent } from '../survey-detail-modal/survey-detail-modal.component';

declare var $: any;

@Component({
  selector: 'app-my-survey',
  templateUrl: './my-survey.component.html',
  styleUrls: ['./my-survey.component.css'],
})
export class MySurveyComponent implements OnInit, OnDestroy {
  language: any;
  setTheme: ThemeType;
  currentPageNmuber: number = 1;
  itemPerPage: number = 10;
  totalRecord: number = 0;
  totalActiveSurvey: number = 0;
  limitPerPage: { value: string }[] = [{ value: '10' }, { value: '20' }, { value: '30' }, { value: '40' }, { value: '50' }];
  userDetails: LoginDetails;
  userRole: string;
  responseMessage: string;
  totalMyVotes: number = 0;
  totalCompletedSurvey: number = 0;
  Completed: Survey[];
  activeSurvey: Survey[];
  myVoteParam: Survey[] = [];
  myVotes: Survey[] = [];
  private activatedSub: Subscription;
  thumb: any;
  myVoteParamDetails: Survey[] = [];
  surveyFinish: boolean = false;

  constructor(private authService: AuthService, private themes: ThemeService, private notificationService: NotificationService, private lang: LanguageService, private commonFunctionService: CommonFunctionService, private dialog: MatDialog) {}

  ngOnInit(): void {
    if (localStorage.getItem('club_theme') != null) {
      let theme: ThemeType = JSON.parse(localStorage.getItem('club_theme'));
      this.setTheme = theme;
    }

    this.activatedSub = this.themes.club_theme.subscribe((resp: ThemeType) => {
      this.setTheme = resp;
    });

    this.language = this.lang.getLanguageFile();
    this.userDetails = JSON.parse(localStorage.getItem('user-data'));
    this.userRole = this.userDetails.roles[0];
    this.getMyAllVotes();
  }

  /**
   * Function is used to get all user survey which User have added vote
   * @author  MangoIt Solutions
   * @param   {userId}
   * @return  {object} survey object
   */
  getMyAllVotes() {
    this.authService.memberSendRequest('get', 'getMySurveyVotes/user/' + this.userDetails.userId + '/' + this.currentPageNmuber + '/' + this.itemPerPage, null).subscribe((respData: any) => {
      if (respData['isError'] == false) {
        if (respData?.['result']?.['survey']?.length > 0) {
          this.myVoteParam = [];
          respData?.['result']?.['survey']?.forEach((element: any, index: any) => {
            let cudate: Date = new Date();
            if (cudate?.toISOString().split('T')[0] >= element?.survey?.surveyStartDate?.split('T')[0]) {
              var days = this.commonFunctionService.getDays(cudate, element.survey.surveyEndDate.split('T')[0]);
              element.survey.dayCount = days;
              element.survey.remain = this.language.courses.days;
              if (element.survey.dayCount > 1) {
                element.survey.dayCount = days + '  ' + this.language.courses.days;
              } else if (element.survey.dayCount == 1 || element.survey.dayCount == 0) {
                element.survey.dayCount = days + '  ' + this.language.courses.day;
              }
              /* Progress Bar calculation */
              element.survey.progress = this.commonFunctionService.progressBarCalculation(element.survey.surveyStartDate, element.survey.surveyEndDate);
            } else {
              var days = this.commonFunctionService.getDayDifference(element.survey.surveyStartDate, element.survey.surveyEndDate);
              element.survey.dayCount = days;
              element.survey.remain = this.language.courses.days;
              if (element.survey.dayCount > 1) {
                element.survey.dayCount = days + '  ' + this.language.courses.days;
              } else if (element.survey.dayCount == 1 || element.survey.dayCount == 0) {
                element.survey.dayCount = days + '  ' + this.language.courses.day;
              }
              element.survey.progress = 0;
            }
            this.myVoteParam.push(element.survey);
          });
          this.totalMyVotes = respData['result'].pagination.rowCount;
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
    });
    confirmDialog.afterClosed().subscribe(result => {
      if (result == true) {
        this.getMyAllVotes();
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
    this.getMyAllVotes();
  }

  /**
   * Function is used to go to page
   * @author  MangoIt Solutions
   */
  goToPg(eve: number) {
    if (isNaN(eve)) {
      eve = this.currentPageNmuber;
    } else {
      if (eve > Math.ceil(this.totalMyVotes / this.itemPerPage)) {
        this.notificationService.showError(this.language.error_message.invalid_pagenumber, 'Error');
      } else {
        this.currentPageNmuber = eve;
        this.getMyAllVotes();
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
    this.getMyAllVotes();
  }

  ngOnDestroy(): void {
    this.activatedSub.unsubscribe();
  }
}
