import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { LoginDetails, NewsType, ThemeType } from '@core/models';
import { Subscription } from 'rxjs';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { AuthService, CommonFunctionService, LanguageService, NotificationService, ThemeService } from '@core/services';
import { Router } from '@angular/router';
declare var $: any;

@Component({
  selector: 'app-club-news',
  templateUrl: './club-news.component.html',
  styleUrls: ['./club-news.component.css'],
})
export class ClubNewsComponent implements OnInit, OnDestroy {
  @Output() dataLoaded: EventEmitter<any> = new EventEmitter<any>();
  @Input() bannerData: any;
  isBanner: boolean = false;
  language: any;
  role: string = '';
  memberid: number;
  displayError: boolean = false;
  displayPopup: boolean = false;
  responseMessage: string = null;
  userData: LoginDetails;
  dashboardNewsData: NewsType[];
  dashboardData: NewsType[];
  guestNews: NewsType[] = [];
  newsData: any;
  newsDetails: NewsType[] = [];
  newsDisplay: number;
  url: string;
  newImg: string;
  setTheme: ThemeType;
  private activatedSub: Subscription;
  allowAdvertisment: any;
  headline_word_option: number = 0;
  sliderOptions: OwlOptions = {
    loop: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    dots: false,
    navSpeed: 700,
    navText: ['', ''],
    margin: 24,
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
    nav: false,
    autoplay: true,
  };
  sliderOptionsOne: OwlOptions;
  currentPageNmuber: number = 1;
  totalPages: any;
  itemPerPage: number = 4;
  newsTotalRecords: number = 0;
  showClubDash: boolean = true;
  newData: any;
  loadingImages: boolean[] = [];
  images: { url: string; isLoading: boolean; imageLoaded: boolean }[] = [];
  constructor(public authService: AuthService, private lang: LanguageService, private router: Router, private themes: ThemeService, private notificationService: NotificationService, private commonFunctionService: CommonFunctionService) {}

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
    this.headline_word_option = parseInt(localStorage.getItem('headlineOption'));
    this.allowAdvertisment = localStorage.getItem('allowAdvertis');
    this.role = this.userData.roles[0];

    this.url = this.router.url;
    if (this.url == '/web/dashboard' || this.url == '/') {
      this.displayPopup = true;
      this.newsDisplay = 5;
      this.showClubDash = true;
      this.getAllNews();
    } else if (this.url == '/web/clubwall/club-news' || this.url == '/web/clubwall') {
      this.displayPopup = false;
      this.newsDisplay = 5;
      this.showClubDash = false;
      this.getAllNewspagination();
    }

    if (this.allowAdvertisment == 0) {
      setTimeout(() => {
        this.sliderOptionsOne = {
          loop: true,
          mouseDrag: true,
          touchDrag: true,
          pullDrag: true,
          dots: true,
          navSpeed: 700,
          navText: ['', ''],
          margin: 24,
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
          nav: false,
          autoplay: true,
        };
      }, 1000);
    }
  }

  /**
   * Function is used to add click count for a the particular mobile or desktop Banner
   * @author  MangoIt Solutions(M)
   * @param   {BannerId}
   * @return  {Object}
   */
  onClickBanner(bannerId: number) {
    let displayMode: number;
    if (sessionStorage.getItem('token') && window.innerWidth < 768) {
      displayMode = 1;
    } else {
      displayMode = 0;
    }
    let data = {
      banner_id: bannerId,
      user_id: this.userData.userId,
      display_mode: displayMode,
    };
    this.authService.memberSendRequest('post', 'bannerClick/', data).subscribe((respData: any) => {});
  }

  /**
   * Function is used to get top 5 news for user
   * @author  MangoIt Solutions
   * @param   {userId}
   * @return  {Object}
   */
  getAllNews() {
    if (sessionStorage.getItem('token')) {
      let userId: string = localStorage.getItem('user-id');
      this.authService.setLoader(true);
      this.authService.memberSendRequest('get', 'topNews/user/' + userId, null).subscribe((respData: any) => {
        this.authService.setLoader(false);
        this.dashboardNewsData = respData;
        if (this.dashboardNewsData && this.dashboardNewsData.length > 0) {
          this.dashboardNewsData.forEach((element: any, index) => {
            let tokenUrl = this.commonFunctionService.genrateImageToken(element.id, 'news');
            element.token = { url: tokenUrl, isLoading: true, imageLoaded: false };
            this.commonFunctionService.loadImage(element.token);
          });
          this.dataLoaded.emit();
        }
      });
    }
  }

  getAllNewspagination() {
    this.bannerData?.length == 0 || this.bannerData == undefined ? (this.itemPerPage = 5) : (this.itemPerPage = 4);
    if (sessionStorage.getItem('token')) {
      this.dashboardData = [];
      this.guestNews = [];
      this.authService.setLoader(true);
      const userId: string = localStorage.getItem('user-id');
      const requestUrl = this.role == 'admin' || this.role == 'guest' ? 'posts/' + this.currentPageNmuber + '/' + this.itemPerPage : 'uposts/' + localStorage.getItem('user-id') + '/' + this.currentPageNmuber + '/' + this.itemPerPage;
      this.authService.memberSendRequest('get', requestUrl, null).subscribe((respData: any) => {
        this.authService.setLoader(false);
        if (respData.news.length > 0) {
          this.newsTotalRecords = respData.pagination.rowCount;
          this.totalPages = Math.ceil(this.newsTotalRecords / this.itemPerPage);
          this.dashboardData = respData.news;
          this.dashboardData.forEach(element => {
            let tokenUrl = this.commonFunctionService.genrateImageToken(element.id, 'news');
            element.token = { url: tokenUrl, isLoading: true, imageLoaded: false };
            if (this.role == 'guest' && element.show_guest_list == 'true') {
              this.guestNews.push(element);
            }
            this.commonFunctionService.loadImage(element.token);
          });
        }
      });
    }
  }

  /**
   * Function is used to get news details by news id
   * @author  MangoIt Solutions
   * @param   {newsid}
   * @return  {Object}
   */
  getNewsDetails(newsid: number) {
    $('#exModal').modal('hide');
    this.newImg = '';
    if (sessionStorage.getItem('token')) {
      this.authService.setLoader(true);
      this.authService.memberSendRequest('get', 'get-news-by-id/' + newsid, null).subscribe((respData: any) => {
        this.authService.setLoader(false);
        this.getFirstNews(respData);
      });
    }
  }

  /**
   * Function is used to get first news
   * @author  MangoIt Solutions
   * @param   {}
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

  showToggle: boolean = false;
  removeHtml(str) {
    var tmp = document.createElement('DIV');
    tmp.innerHTML = str;
    return tmp.textContent || tmp.innerText || '';
  }

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

  /**
   * Function is used to delete news by news Id
   * @author  MangoIt Solutions
   * @param   {newsId}
   * @return  success/ error message
   */
  deleteNews(newsId: number) {
    $('#exModal').modal('hide');
    this.commonFunctionService
      .deleteNews(newsId)
      .then((resp: any) => {
        this.notificationService.showSuccess(resp, 'Success');
        setTimeout(() => {
          this.getAllNews();
          this.getAllNewspagination();
          const url: string[] = ['/web/clubwall'];
          this.router.navigate(url);
        }, 3000);
      })
      .catch((err: any) => {
        this.notificationService.showError(err, 'Error');
      });
  }

  /**
   * Function is used to redirect on update news page
   * @author  MangoIt Solutions
   */
  updateNews(newsId: number) {
    $('#exModal').modal('hide');
    const url: string[] = ['/web/update-news/' + newsId];
    this.router.navigate(url);
  }

  pageChanged(event: number) {
    if (event === -1) {
      // Previous button clicked
      this.currentPageNmuber--;
    } else if (event === 1) {
      // Next button clicked
      this.currentPageNmuber++;
    }
    this.getAllNewspagination();
  }

  closeModal() {
    $('#exModal').modal('hide');
  }

  ngOnDestroy(): void {
    this.activatedSub.unsubscribe();
  }

  removeHtmlTags(inputString: any) {
    return inputString.replace(/<[^>]*>/g, '');
  }
}
