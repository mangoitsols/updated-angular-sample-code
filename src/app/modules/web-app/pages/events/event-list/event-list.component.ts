import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { LoginDetails } from '@core/models';
import { AuthService, CommonFunctionService, LanguageService, NotificationService, ThemeService } from '@core/services';
import { ConfirmDialogService } from '@shared/components';
declare var $: any;

@Component({
  selector: 'app-event-list',
  templateUrl: './event-list.component.html',
  styleUrls: ['./event-list.component.css'],
})
export class EventListComponent implements OnInit {
  eventTypeList: { name: string }[] = [];
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
  constructor(
    private authService: AuthService,
    private lang: LanguageService,
    private themes: ThemeService,
    private sanitizer: DomSanitizer,
    private commonFunctionService: CommonFunctionService,
    private confirmDialogService: ConfirmDialogService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.language = this.lang.getLanguageFile();
    this.userData = JSON.parse(localStorage.getItem('user-data'));
    this.eventTypeList[1] = { name: this.language.create_event.club_event };
    this.eventTypeList[2] = { name: this.language.create_event.group_event };
    this.eventTypeList[3] = { name: this.language.create_event.functionaries_event };
    this.eventTypeList[4] = { name: this.language.create_event.course_event };
    this.eventTypeList[5] = { name: this.language.create_event.seminar };
    this.getUserAllEvents('');
  }

  /**
   * Function for get All the login user events
   * @author  MangoIt Solutions(T)
   * @param   {}
   * @return  {all the records of Banners} array of object
   */
  getUserAllEvents(search: any) {
    var pageNo = this.currentPage + 1;
    this.authService.setLoader(true);
    var endPoint: string;
    if (search && search.target.value != '') {
      endPoint = 'getOwnerEvents/' + pageNo + '/' + this.pageSize + '?search=' + search.target.value;
    } else {
      endPoint = 'getOwnerEvents/' + pageNo + '/' + this.pageSize;
    }
    this.authService.memberSendRequest('get', endPoint, null).subscribe((respData: any) => {
      this.authService.setLoader(false);
      var url: string[] = [];
      respData.events.forEach((element: any) => {
        let tokenUrl = this.commonFunctionService.genrateImageToken(element.id, 'event');
        element.token = { url: tokenUrl, isLoading: true, imageLoaded: false };
        this.commonFunctionService.loadImage(element.token);
        // if (element?.event_images[0]?.event_image) {
        // 	element.event_images[0].event_image = this.sanitizer.bypassSecurityTrustUrl(this.commonFunctionService.convertBase64ToBlobUrl(element.event_images[0]?.event_image.substring(20)));
        // }
      });

      if (respData.events?.length > 0) {
        this.dataSource = new MatTableDataSource(respData.events);
        this.totalRows = respData.events.length;
        this.dataSource.sort = this.matsort;
        this.isData = true;
      }
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

  deleteEvents(eventId: number) {
    this.confirmDialogService.confirmThis(
      this.language.confirmation_message.delete_event,
      () => {
        this.authService.setLoader(true);
        this.authService.memberSendRequest('delete', 'event/' + eventId, null).subscribe((respData: any) => {
          this.authService.setLoader(false);
          this.notificationService.showSuccess(respData['result']['message'], 'Success');
          this.getUserAllEvents('');
          // const url: string[] = ["/web/all-list"];
          // this.router.navigate(url);
        });
      },
      () => {
        $('.dropdown-toggle').trigger('click');
      }
    );
  }

  // deleteNews(newsId: number) {
  //
  //     this.commonFunctionService.deleteNews(newsId)
  //         .then((resp: any) => {
  //             this.notificationService.showSuccess(resp, null);
  //             this.searchValue = '';
  //             this.dataSource.filter = '';
  //             this.getUserAllNews("");
  //             // const url: string[] = ["/web/all-list"];
  //             // this._router.navigate(url);

  //         })
  //         .catch((err: any) => {
  //             this.notificationService.showError(err, null);
  //         });
  // }

  /**
   * Function for pagination page changed
   * @author  MangoIt Solutions(T)
   */
  pageChanged(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
    this.getUserAllEvents('');
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
