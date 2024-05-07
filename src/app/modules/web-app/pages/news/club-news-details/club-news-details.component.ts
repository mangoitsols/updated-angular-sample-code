import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { ClubDetail, LoginDetails, NewsType, ProfileDetails, ThemeType } from '@core/models';
import { Subscription } from 'rxjs';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { AuthService, CommonFunctionService, LanguageService, NotificationService, ThemeService, AcceptdenyService } from '@core/services';
import { ConfirmDialogService, DenyReasonConfirmDialogService, UpdateConfirmDialogService } from '@shared/components';
import { io, Socket } from 'socket.io-client';
import { environment } from '@env/environment';
import { filter } from 'rxjs/operators';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
declare var $: any;
@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'app-club-news-details',
  templateUrl: './club-news-details.component.html',
  styleUrls: ['./club-news-details.component.css'],
})
export class ClubNewsDetailsComponent implements OnInit, OnDestroy {
  language: any;
  userDetails: LoginDetails;
  newsData: NewsType;
  updateNewsData: any;
  viewImage: boolean = false;
  memberid: number;
  setTheme: ThemeType;
  private activatedSub: Subscription;
  private refreshPage: Subscription;
  private denyRefreshPage: Subscription;
  private removeUpdate: Subscription;
  responseMessage: any;
  sliderOptions: OwlOptions = {
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
  bannerData: any;
  mobBannerData: any;
  adsTineon: any;
  allowAdvertisment: any;
  isShow: boolean = false;
  socket: Socket;
  newsId: number;
  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private themes: ThemeService,
    private confirmDialogService: ConfirmDialogService,
    private lang: LanguageService,
    private updateConfirmDialogService: UpdateConfirmDialogService,
    private denyReasonService: DenyReasonConfirmDialogService,
    private notificationService: NotificationService,
    private commonFunctionService: CommonFunctionService,
    private acceptdenyService: AcceptdenyService
  ) {
    this.refreshPage = this.confirmDialogService.dialogResponse.subscribe(message => {
      setTimeout(() => {
        this.ngOnInit();
      }, 1000);
    });

    this.denyRefreshPage = this.updateConfirmDialogService.denyDialogResponse.subscribe(resp => {
      setTimeout(() => {
        this.ngOnInit();
      }, 1000);
    });

    this.removeUpdate = this.denyReasonService.remove_deny_update.subscribe(resp => {
      setTimeout(() => {
        this.ngOnInit();
      }, 1000);
    });

    this.newsId = this.route.snapshot.params.newsid;
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        untilDestroyed(this)
      )
      .subscribe((event: NavigationEnd) => {
        this.newsId = this.route.snapshot.params.newsid;
        this.getNewsDetails(this.newsId);
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
    this.userDetails = JSON.parse(localStorage.getItem('user-data'));

    this.allowAdvertisment = localStorage.getItem('allowAdvertis');
    this.getNewsDetails(this.newsId);
    if (this.allowAdvertisment == 0) {
      if (sessionStorage.getItem('token') && window.innerWidth < 768) {
        this.getMobileNewsDetailBanners();
      } else {
        this.getDesktopNewsDetailBanners();
      }
    }
  }

  /**
   * Function for get All the Banners
   * @author  MangoIt Solutions(M)
   * @param   {}
   * @return  {all the records of Banners} array of object
   */
  getDesktopNewsDetailBanners() {
    this.authService.setLoader(true);
    this.authService.memberSendRequest('get', 'getBannerForNewsDetails_Desktop/', null).subscribe((respData: any) => {
      this.authService.setLoader(false);
      if (respData['isError'] == false) {
        this.bannerData = respData['result']['banner'];
        this.bannerData.forEach((element: any) => {
          element['category'] = JSON.parse(element.category);
          element['placement'] = JSON.parse(element.placement);
          element['display'] = JSON.parse(element.display);
          let tokenUrl = this.commonFunctionService.genrateImageToken(element.id, 'banner');
          element.token = { url: tokenUrl, isLoading: true, imageLoaded: false };
          this.commonFunctionService.loadImage(element.token);

          if (element['redirectLink'].includes('https://') || element['redirectLink'].includes('http://')) {
            element['redirectLink'] = element.redirectLink;
          } else {
            element['redirectLink'] = '//' + element.redirectLink;
          }
        });
      } else if (respData['code'] == 400) {
        this.notificationService.showError(respData['message'], 'Error');
      }
    });
  }

  /**
   * Function for get All the Banners
   * @author  MangoIt Solutions(M)
   * @param   {}
   * @return  {all the records of Banners} array of object
   */
  getMobileNewsDetailBanners() {
    this.authService.setLoader(true);
    this.authService.memberSendRequest('get', 'getBannerForNewsDetailsMobileApp/', null).subscribe((respData: any) => {
      this.authService.setLoader(false);
      if (respData['isError'] == false) {
        this.mobBannerData = respData['result']['banner'];
        this.mobBannerData.forEach((element: any) => {
          element['category'] = JSON.parse(element.category);
          element['placement'] = JSON.parse(element.placement);
          element['display'] = JSON.parse(element.display);
          let tokenUrl = this.commonFunctionService.genrateImageToken(element.id, 'banner');
          element.token = { url: tokenUrl, isLoading: true, imageLoaded: false };
          this.commonFunctionService.loadImage(element.token);

          if (element['redirectLink'].includes('https://') || element['redirectLink'].includes('http://')) {
            element['redirectLink'] = element.redirectLink;
          } else {
            element['redirectLink'] = '//' + element.redirectLink;
          }
        });
        this.timeOut1();
      } else if (respData['code'] == 400) {
        this.notificationService.showError(respData['message'], 'Error');
      }
    });
  }

  timeOut1() {
    let count = 0;
    setInterval(() => {
      if (count === this.mobBannerData.length) {
        count = 0;
      }
      this.adsTineon = this.mobBannerData[count];
      count++;
    }, 3000);
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
      //mobile
      displayMode = 1;
    } else {
      //desktop
      displayMode = 0;
    }
    let data = {
      banner_id: bannerId,
      user_id: this.userDetails.userId,
      display_mode: displayMode,
    };
    this.authService.memberSendRequest('post', 'bannerClick/', data).subscribe((respData: any) => {});
  }

  /**
   * Function is used to get new details by news Id
   * @author  MangoIt Solutions
   * @param   {newsId}
   * @return  {Object}
   */
  getNewsDetails(newsid: number) {
    if (sessionStorage.getItem('token')) {
      this.authService.setLoader(true);
      this.authService.memberSendRequest('get', 'get-news-by-id/' + newsid, null).subscribe((respData: any) => {
        if (respData['isError'] == false && Object.keys(respData.result).length > 0) {
          this.getFirstNews(respData);
        } else {
          this.notificationService.showError(this.language.community_groups.no_news, 'Error');
        }
        this.authService.setLoader(false);
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
    let tokenUrl = this.commonFunctionService.genrateImageToken(this.newsData.id, 'news');
    this.newsData.token = { url: tokenUrl, isLoading: true, imageLoaded: false };
    this.memberid = this.newsData.user.member_id;
    if (this.newsData['author'] == JSON.parse(this.userDetails.userId) || this.userDetails.roles[0] == 'admin') {
      this.updateNewsData = JSON.parse(news.updated_record);
      if (this.updateNewsData && this.updateNewsData != null) {
        if (this.updateNewsData?.newImage && this.updateNewsData?.newImage != 'null') {
          let updateTokenUrl = this.commonFunctionService.genrateImageToken(this.newsData.id, 'updateNews');
          this.updateNewsData.newImage = { url: updateTokenUrl, isLoading: true, imageLoaded: false };
          this.commonFunctionService.loadImage(this.updateNewsData.newImage);
        } else {
          this.updateNewsData.newImage = null;
        }
      }
    }
    this.commonFunctionService.loadImage(this.newsData.token);
  }

  /**
   * Function is used to delete news by news Id
   * @author  MangoIt Solutions
   * @param   {newsId}
   * @return  success/ error message
   */
  deleteNews(newsId: number) {
    this.commonFunctionService
      .deleteNews(newsId)
      .then((resp: any) => {
        this.notificationService.showSuccess(resp, 'Success');
        const url: string[] = ['/web/clubwall'];
        this.router.navigate(url);
        this.socket.emit('sendNotification', 'News', (error: any) => {});
      })
      .catch((err: any) => {
        this.notificationService.showError(err, 'Error');
      });
  }

  /**
   * Function is used to delete update news by news Id
   * @author  MangoIt Solutions
   * @param   {newsId}
   * @return  success/ error message
   */
  deleteUpdateNews(newsId: number) {
    this.acceptdenyService.deleteUpdateNews(newsId, 'web');
  }

  /**
   * Function is used to redirect on update news page
   * @author  MangoIt Solutions
   */
  updateNews(newsId: number) {
    const url: string[] = ['/web/update-news/' + newsId];
    this.router.navigate(url);
  }

  /**
   * Function is used to aprove news by news Id
   * @author  MangoIt Solutions
   * @param   {newsId}
   * @return  success/ error message
   */
  approveNews(newsId: number) {
    this.acceptdenyService.acceptNews(newsId, 'web');
  }

  /**
   * Function is used to aprove update news by news Id
   * @author  MangoIt Solutions
   * @param   {newsId}
   * @return  success/ error message
   */
  approveUpdteNews(newsId: number) {
    this.acceptdenyService.acceptUpdatedNews(newsId, 'web');
  }

  /**
   * Function is used to deny news by news Id by admin
   * @author  MangoIt Solutions
   * @param   {newsId}
   * @return  success/ error message
   */
  denyNews(newsId: number) {
    this.acceptdenyService.denyNews(newsId, 'web');
  }

  showToggle: boolean = false;
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

  removeHtml(str) {
    var tmp: HTMLElement = document.createElement('DIV');
    tmp.innerHTML = str;
    return tmp.textContent || tmp.innerText || '';
  }

  goBack() {
    this.router.navigate(['/web/clubwall']);
  }

  toggleDisplay() {
    this.isShow = !this.isShow;
  }

  ngOnDestroy(): void {
    this.activatedSub.unsubscribe();
    this.refreshPage.unsubscribe();
    this.denyRefreshPage.unsubscribe();
    this.removeUpdate.unsubscribe();
  }
}
