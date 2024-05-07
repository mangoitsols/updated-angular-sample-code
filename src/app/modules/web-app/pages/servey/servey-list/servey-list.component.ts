import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { LoginDetails } from '@core/models';
import { AuthService, LanguageService, NotificationService } from '@core/services';
import { ConfirmDialogService } from '@shared/components';
import { SurveyDetailModalComponent } from '../survey-detail-modal/survey-detail-modal.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-servey-list',
  templateUrl: './servey-list.component.html',
  styleUrls: ['./servey-list.component.css'],
})
export class ServeyListComponent implements OnInit {
  userData: LoginDetails;
  language: any;
  isData: boolean = true;
  displayedColumns: string[] = ['title', 'description', 'surveyType', 'surveyStartDate', 'surveyEndtDate', 'created_at', 'View'];
  columnsToDisplay: string[] = this.displayedColumns.slice();
  dataSource!: MatTableDataSource<any>;
  result: any;
  @ViewChild(MatPaginator) matpaginator!: MatPaginator;
  @ViewChild(MatSort) matsort!: MatSort;
  totalRows: number = 0;
  pageSize: number = 10;
  currentPage: any = 0;
  pageSizeOptions: number[] = [10, 20, 50];

  constructor(private authService: AuthService, private lang: LanguageService, private confirmDialogService: ConfirmDialogService, private notificationService: NotificationService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.language = this.lang.getLanguageFile();
    this.userData = JSON.parse(localStorage.getItem('user-data'));
    this.getUserAllSurvey('');
  }

  /**
   * Function for get All the login user Survey
   * @author  MangoIt Solutions(T)
   * @param   {}
   * @return  {all the records of Survey} array of object
   */
  getUserAllSurvey(search: any) {
    var pageNo = this.currentPage + 1;
    this.authService.setLoader(true);
    var endPoint: string;
    if (search && search.target.value != '') {
      endPoint = 'getOwnerSurvey/' + pageNo + '/' + this.pageSize + '?search=' + search.target.value;
    } else {
      endPoint = 'getOwnerSurvey/' + pageNo + '/' + this.pageSize;
    }
    this.authService.memberSendRequest('get', endPoint, null).subscribe((respData: any) => {
      this.authService.setLoader(false);
      this.dataSource = new MatTableDataSource(respData.survey);
      this.totalRows = respData.pagination.rowCount;
      this.dataSource.sort = this.matsort;
      this.isData = true;
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
        this.getUserAllSurvey('');
      }
    });
    confirmDialog.backdropClick().subscribe(() => {
      confirmDialog.close(); // Close the dialog when backdrop (outside the dialog) is clicked
    });
  }

  /**
   * Function for sort column date
   * @author  MangoIt Solutions(T)
   */
  sortData(sort: Sort) {
    this.dataSource.data = this.dataSource.data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      return this._compare(a[sort.active], b[sort.active], isAsc);
    });
  }

  private _compare(a: number | string, b: number | string, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  /**
   * Function is used to delete survey BY admin
   * @author  MangoIt Solutions
   * @param   {survey_id,userId}
   * @return  {staring}
   */
  surveyDelete(id: number) {
    this.confirmDialogService.confirmThis(
      this.language.confirmation_message.delete_survey,
      () => {
        this.authService.setLoader(true);
        this.authService.memberSendRequest('delete', 'deleteSurvey/' + id, null).subscribe((respData: any) => {
          this.authService.setLoader(false);
          if (respData['isError'] == false) {
            this.notificationService.showSuccess(respData['result']['message'], 'Success');
            this.getUserAllSurvey('');
          } else if (respData['code'] == 400) {
            this.notificationService.showError(respData['message'], 'Error');
          }
        });
      },
      () => {}
    );
  }

  /**
   * Function for pagination page changed
   * @author  MangoIt Solutions(T)
   */
  pageChanged(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
    this.getUserAllSurvey('');
  }
}
