import { Component, OnInit } from '@angular/core';
import { LoginDetails, ThemeType } from '@core/models';
import { Survey } from '@core/models/survey.model';
import { Subscription } from 'rxjs';
import { AuthService, LanguageService, NotificationService, ThemeService } from '@core/services';
import { ConfirmDialogService } from '@shared/components';
import { MatDialog } from '@angular/material/dialog';
import { SurveyDetailModalComponent } from '../survey-detail-modal/survey-detail-modal.component';
declare var $: any;
@Component({
  selector: 'app-completed-survey',
  templateUrl: './completed-survey.component.html',
  styleUrls: ['./completed-survey.component.css'],
})
export class CompletedSurveyComponent implements OnInit {
  language: any;
  currentPageNmuber: number = 1;
  itemPerPage: number = 10;
  totalCompletedSurvey: number = 0;
  userDetails: LoginDetails;
  responseMessage: string;
  userRole: string;
  curntPgNum: number;
  limitPerPage: { value: string }[] = [{ value: '10' }, { value: '20' }, { value: '30' }, { value: '40' }, { value: '50' }];
  setTheme: ThemeType;
  Completed: Survey[];
  private activatedSub: Subscription;
  thumb: any;

  constructor(private authService: AuthService, private themes: ThemeService, private notificationService: NotificationService, private lang: LanguageService, private confirmDialogService: ConfirmDialogService, private dialog: MatDialog) {}

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
    this.getCompletedData();
  }

  /**
   * Function is used to get complete survey list
   * @author  MangoIt Solutions
   * @param   {}
   * @return  {object} survey object
   */
  getCompletedData() {
    var endPoints: any;
    if (this.userRole == 'admin') {
      endPoints = 'getCompletedSurvey/' + this.currentPageNmuber + '/' + this.itemPerPage;
    } else if (this.userRole != 'admin') {
      endPoints = 'getCompletedSurveyUser/user/' + this.userDetails.userId + '/' + this.currentPageNmuber + '/' + this.itemPerPage;
    }
    this.authService.memberSendRequest('get', endPoints, null).subscribe((respData: any) => {
      this.authService.setLoader(false);
      if (respData['isError'] == false) {
        if (respData?.['result']?.['survey']?.length > 0) {
          respData['result']['survey'].forEach((element, index) => {
            let cudate: Date = new Date();
            let cuday: string = cudate.getDate().toString().padStart(2, '0');
            let cumonth: string = (cudate.getMonth() + 1).toString().padStart(2, '0');
            let cuyear: number = cudate.getFullYear();
            var date1: string = cuyear + '-' + cumonth + '-' + cuday + 'T00:0.000Z;';
            var d1: Date = new Date(date1.split('T')[0]);
            var date2: Date = new Date(element.created_at.split('T')[0]);
            var time: number = (d1.getTime() - date2.getTime()) / 1000;
            var year: number = Math.abs(Math.round(time / (60 * 60 * 24) / 365.25));
            var month: number = Math.abs(Math.round(time / (60 * 60 * 24 * 7 * 4)));
            var days: number = Math.abs(Math.round(time / (3600 * 24)));

            if (days > 31) {
              if (days > 1) {
                element.dayCount = this.language.Survey.expired + month + this.language.Survey.months_ago;
              } else if (days == 1 || days == 0) {
                element.dayCount = this.language.Survey.expired + month + this.language.Survey.month_ago;
              }
            } else if (days < 31) {
              if (days > 1) {
                element.dayCount = this.language.Survey.expired + ' ' + days + ' ' + this.language.Survey.days_ago;
              } else if (days == 1 || days == 0) {
                element.dayCount = this.language.Survey.expired + ' ' + days + ' ' + this.language.Survey.day_ago;
              }
            }
          });
        }
        this.Completed = respData['result']['survey'];
        this.totalCompletedSurvey = respData['result'].pagination.rowCount;
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
        this.getCompletedData();
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
    this.curntPgNum = event;
    this.currentPageNmuber = event;
    this.getCompletedData();
  }

  /**
   * Function is used to go to page
   * @author  MangoIt Solutions
   */
  goToPg(eve: number) {
    if (isNaN(eve)) {
      eve = this.currentPageNmuber;
    } else {
      if (eve > Math.ceil(this.totalCompletedSurvey / this.itemPerPage)) {
        this.notificationService.showError(this.language.error_message.invalid_pagenumber, 'Error');
      } else {
        this.currentPageNmuber = eve;
        this.getCompletedData();
      }
    }
  }

  /**
   * Function is used to delete survey by id
   * @author  MangoIt Solutions
   * @param   {id}
   * @return  {string} succes message
   */
  surveyDelete(id: number) {
    this.confirmDialogService.confirmThis(
      this.language.confirmation_message.delete_survey,
      () => {
        this.authService.setLoader(true);
        this.authService.memberSendRequest('delete', 'deleteSurvey/' + id, null).subscribe((respData: any) => {
          this.authService.setLoader(false);
          if (respData['isError'] == false) {
            this.responseMessage = respData['result']['message'];
            this.notificationService.showSuccess(this.responseMessage, 'Success');
            this.getCompletedData();
          } else if (respData['code'] == 400) {
            this.responseMessage = respData['message'];
            this.notificationService.showError(this.responseMessage, 'Error');
          }
        });
      },
      () => {}
    );
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
    this.getCompletedData();
  }

  ngOnDestroy(): void {
    this.activatedSub.unsubscribe();
  }
}
