import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { LoginDetails } from '@core/models';
import { AuthService, CommonFunctionService, LanguageService, NotificationService } from '@core/services';
import { ConfirmDialogService } from '@shared/components';

@Component({
  selector: 'app-faqs-list',
  templateUrl: './faqs-list.component.html',
  styleUrls: ['./faqs-list.component.css'],
})
export class FaqsListComponent implements OnInit {
  userData: LoginDetails;
  language: any;
  isData: boolean = true;
  displayedColumns: string[] = [
    'name',
    'description',
    'picture_video',
    // 'author',
    'View',
  ];
  columnsToDisplay: string[] = this.displayedColumns.slice();
  dataSource!: MatTableDataSource<any>;
  result: any;
  @ViewChild(MatPaginator) matpaginator!: MatPaginator;
  @ViewChild(MatSort) matsort!: MatSort;
  totalRows: number = 0;
  pageSize: number = 10;
  currentPage: any = 0;
  pageSizeOptions: number[] = [10, 20, 50];
  responseMessage: any;

  constructor(private authService: AuthService, private lang: LanguageService, private confirmDialogService: ConfirmDialogService, private notificationService: NotificationService, private commonFunctionService: CommonFunctionService) {}

  ngOnInit(): void {
    this.language = this.lang.getLanguageFile();
    this.userData = JSON.parse(localStorage.getItem('user-data'));
    this.getUserAllFaqs('');
  }

  /**
   * Function for get All the login user Task
   * @author  MangoIt Solutions(M)
   * @param   {}
   * @return  {all the records of Task} array of object
   */
  getUserAllFaqs(search: any) {
    var pageNo = this.currentPage + 1;
    this.authService.setLoader(true);
    var endPoint: string;
    if (search && search.target.value != '') {
      endPoint = 'getOwnerFaqs/' + pageNo + '/' + this.pageSize + '?search=' + search.target.value;
    } else {
      endPoint = 'getOwnerFaqs/' + pageNo + '/' + this.pageSize;
    }
    this.authService.memberSendRequest('get', endPoint, null).subscribe((respData: any) => {
      this.authService.setLoader(false);
      respData?.faqs.forEach(element => {
        if (element?.image && element?.image != null) {
          let tokenUrl = this.commonFunctionService.genrateImageToken(element.id, 'faq');
          element.token = { url: tokenUrl, isLoading: true, imageLoaded: false };
          this.commonFunctionService.loadImage(element.token);
        } else {
          element.token = '';
        }
      });
      this.dataSource = new MatTableDataSource(respData.faqs);
      this.totalRows = respData.pagination.rowCount;
      this.dataSource.sort = this.matsort;
      this.isData = true;
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

  deleteFaqs(faqsId: number) {
    this.confirmDialogService.confirmThis(
      this.language.confirmation_message.delete_faq,
      () => {
        this.authService.setLoader(true);
        this.authService.memberSendRequest('delete', 'deleteFaq/' + faqsId, null).subscribe((respData: any) => {
          this.authService.setLoader(false);
          this.responseMessage = respData.result.message;
          this.notificationService.showSuccess(this.responseMessage, 'Success');
          this.getUserAllFaqs('');
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
    this.getUserAllFaqs('');
  }

  /**
   * Function for apply Filter
   * @author  MangoIt Solutions(T)
   */
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}
