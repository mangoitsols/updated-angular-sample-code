import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { LoginDetails, NewsGroup, NewsType, ThemeType } from '@core/models';
import { AuthService, CommonFunctionService, LanguageService, NotificationService, ThemeService } from '@core/services';
import { PaginatedEntity, Pagination } from '@core/entities/_extra/paginated.entity';

declare var $: any;

@Component({
  selector: 'app-group-news',
  templateUrl: './group-news.component.html',
  styleUrls: ['./group-news.component.css'],
})
export class GroupNewsComponent implements OnInit {
  @Output() dataLoaded: EventEmitter<any> = new EventEmitter<any>();

  language: any;
  userData: LoginDetails;
  role: string = '';
  thumbnail: string;
  memberid: number;
  setTheme: ThemeType;
  groupNewsData: NewsGroup[];
  guestGroupNews: NewsGroup[] = [];
  newsData: NewsType;
  newsTitle: string;
  groupNewsImg: string;
  private activatedSub: Subscription;
  itemPerPage: number = 10;
  currentPageNumber: number = 1;
  totalPages: any;
  pagesArray: number[] = [];
  newsImg: any;
  groupResponse: any;
  pagination: Pagination = new PaginatedEntity().pagination;

  constructor(private authService: AuthService, private router: Router, private lang: LanguageService, private themes: ThemeService, private notificationService: NotificationService, private commonFunctionService: CommonFunctionService) {}

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
    this.role = this.userData.roles[0];
    this.getAllNews(1);
    this.pagination.pageSize = 10;
  }

  isClubNewsRoute(): boolean {
    return this.router.url === '/web/clubwall/club-news';
  }

  isClubDatesRoute(): boolean {
    return this.router.url === '/web/clubwall/club-dates';
  }

  isClubwall(): boolean {
    return this.router.url === '/web/clubwall';
  }

  /**
   * Function is used to get all group news
   * @author  MangoIt Solutions
   * @param   {userId}
   * @return  {Object}
   */
  getAllNews(item: any) {
    if (sessionStorage.getItem('token')) {
      let userId: string = localStorage.getItem('user-id');
      this.currentPageNumber = item;
      this.authService.setLoader(true);
      this.authService.memberSendRequest('get', 'get-group-news-by-user-id/' + userId + '/' + +this.currentPageNumber + '/' + this.pagination.pageSize, null).subscribe((respData: any) => {
        this.groupNewsData = respData?.groupNews;
        this.pagination = respData.pagination;
        this.groupNewsData.forEach((groupNewsItem: any) => {
          let tokenUrl = this.commonFunctionService.genrateImageToken(groupNewsItem.news_id, 'news');
          groupNewsItem.token = { url: tokenUrl, isLoading: true, imageLoaded: false };
          this.commonFunctionService.loadImage(groupNewsItem.token);
        });
        this.dataLoaded.emit();
        this.authService.setLoader(false);
      });
    }
  }

  /**
   * Function is used to get new details by news Id
   * @author  MangoIt Solutions
   * @param   {newsId}
   * @return  {Object}
   */
  getNewsDetails(newsid: number) {
    this.groupNewsImg = '';
    if (sessionStorage.getItem('token')) {
      this.authService.setLoader(true);
      this.authService.memberSendRequest('get', 'get-news-by-id/' + newsid, null).subscribe((respData: any) => {
        this.authService.setLoader(false);
        this.getFirstNews(respData);
      });
    }
  }

  /**
   * Function is used to get new details by news Id
   * @author  MangoIt Solutions
   * @param   {newsId}
   * @return  {Object}
   */
  getFirstNews(allNews: NewsType) {
    let news: NewsType = allNews['result'];
    this.newsData = news;
    if (this.newsData) {
      let tokenUrl = this.commonFunctionService.genrateImageToken(this.newsData.id, 'news');
      this.newsData.token = { url: tokenUrl, isLoading: true, imageLoaded: false };
      this.commonFunctionService.loadImage(this.newsData.token);
    }
  }

  /**
   * Function is used to redirect on update news page
   * @author  MangoIt Solutions
   */
  updateNews(newsId: number) {
    $('#exModal1').modal('hide');
    const url: string[] = ['/web/update-news/' + newsId];
    this.router.navigate(url);
  }

  /**
   * Function is used to delete news by news Id
   * @author  MangoIt Solutions
   * @param   {newsId}
   * @return  success/ error message
   */
  deleteNews(newsId: number) {
    $('#exModal1').modal('hide');
    let self = this;
    this.commonFunctionService
      .deleteNews(newsId)
      .then((resp: any) => {
        self.notificationService.showSuccess(resp, null);
        self.getAllNews(1);
        const url: string[] = ['/web/clubwall'];
        self.router.navigate(url);
      })
      .catch((err: any) => {
        self.notificationService.showError(err, null);
      });
  }

  removeHtml(str: any) {
    var tmp: HTMLElement = document.createElement('DIV');
    tmp.innerHTML = str;
    return tmp.textContent || tmp.innerText || '';
  }

  showToggle: boolean = false;
  showToggles: boolean = false;
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

  closeModal() {
    $('#exModal1').modal('hide');
  }

  changePage(pageNumber: number) {
    this.pagination.page = pageNumber;
    this.getAllNews(pageNumber);
  }

  changePageSize(pageSize: number) {
    this.pagination.pageSize = pageSize;
    this.getAllNews(this.pagination.page);
  }

  ngOnDestroy(): void {
    this.activatedSub.unsubscribe();
  }
}
