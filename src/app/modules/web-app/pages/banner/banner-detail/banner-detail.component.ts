import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ThemeType } from '@core/models';
import { AuthService, CommonFunctionService, LanguageService, NotificationService, ThemeService } from '@core/services';
import { ConfirmDialogService } from '@shared/components';
import { BreadcrumbItem } from '@shared/components/page-header/breadcrumb.type';

@Component({
  selector: 'app-banner-detail',
  templateUrl: './banner-detail.component.html',
  styleUrls: ['./banner-detail.component.css'],
})
export class BannerDetailComponent implements OnInit {
  language: any;
  setTheme: ThemeType;
  banner: any;
  private activatedSub: Subscription;
  bannerDetail: any;
  selectedCategory: any[] = [];
  bannerCategoryOption: { name: string; value: string }[];
  bannerPlacementOption: { name: any; value: string }[];
  selectedPlacement: any[] = [];
  bannerDisplayOption: { name: any; id: string }[];
  selectedDisplayed: any[] = [];
  breadCrumbItems: Array<BreadcrumbItem>;

  constructor(
    private themes: ThemeService,
    private lang: LanguageService,
    private confirmDialogService: ConfirmDialogService,
    private notificationService: NotificationService,
    private router: Router,
    private authService: AuthService,
    private route: ActivatedRoute,
    private commonFunctionService: CommonFunctionService
  ) {}

  ngOnInit(): void {
    if (localStorage.getItem('club_theme') != null) {
      let theme: ThemeType = JSON.parse(localStorage.getItem('club_theme'));
      this.setTheme = theme;
    }
    this.activatedSub = this.themes.club_theme.subscribe((resp: ThemeType) => {
      this.setTheme = resp;
    });

    this.language = this.lang.getLanguageFile();
    this.initBreadcrumb();

    this.route.params.subscribe(params => {
      const bannerId: number = params['bannerId'];
      this.getBannerById(bannerId);
    });

    this.bannerCategoryOption = [
      { name: this.language.banner.app_sponsor, value: '1' },
      { name: this.language.banner.sponsor, value: '2' },
      { name: this.language.banner.free_space, value: '3' },
    ];

    this.bannerPlacementOption = [
      { name: this.language.banner.dashboard, value: '1' },
      { name: this.language.banner.all_news, value: '2' },
      { name: this.language.banner.news_details, value: '3' },
      { name: this.language.banner.all_groups, value: '4' },
      { name: this.language.banner.groups_details, value: '5' },
    ];

    this.bannerDisplayOption = [
      { name: this.language.banner.mobile_app, id: '1' },
      { name: this.language.banner.desktop, id: '2' },
      { name: this.language.banner.notification_section, id: '3' },
      { name: this.language.banner.everywhere, id: '4' },
    ];
  }

  /**
   * Function for get Banner detail by Id
   * @author  MangoIt Solutions(M)
   * @param   {Banner Id}
   * @return  {Banner Detail} array of object
   */
  getBannerById(id: number) {
    this.authService.setLoader(true);
    this.authService.memberSendRequest('get', 'getBannerbyId/' + id, null).subscribe((respData: any) => {
      this.authService.setLoader(false);
      if (respData['isError'] == false) {
        this.bannerDetail = respData['result'];
        this.bannerDetail['category'] = JSON.parse(this.bannerDetail.category);
        this.bannerDetail['placement'] = JSON.parse(this.bannerDetail.placement);
        this.bannerDetail['display'] = JSON.parse(this.bannerDetail.display);

        let tokenUrl = this.commonFunctionService.genrateImageToken(this.bannerDetail.id, 'banner');
        this.bannerDetail.token = { url: tokenUrl, isLoading: true, imageLoaded: false };
        this.commonFunctionService.loadImage(this.bannerDetail.token);

        if (this.bannerDetail['redirectLink'].includes('https://') || this.bannerDetail['redirectLink'].includes('http://')) {
          this.bannerDetail['redirectLink'] = this.bannerDetail.redirectLink;
        } else {
          this.bannerDetail['redirectLink'] = '//' + this.bannerDetail.redirectLink;
        }

        this.bannerDetail['category'].forEach((element: any) => {
          this.bannerCategoryOption.forEach((elem: any) => {
            if (element == elem.value) {
              this.selectedCategory.push(elem);
            }
          });
        });

        this.bannerDetail['placement'].forEach((element: any) => {
          this.bannerPlacementOption.forEach((elem: any) => {
            if (element == elem.value) {
              this.selectedPlacement.push(elem);
            }
          });
        });

        this.bannerDetail['display'].forEach((element: any) => {
          this.bannerDisplayOption.forEach((elem: any) => {
            if (element == elem.id) {
              this.selectedDisplayed.push(elem);
            }
          });
        });
      } else if (respData['code'] == 400) {
        this.notificationService.showError(respData['message'], 'Error');
      }
    });
  }

  /**
   * Function for delete the particular Banner by Id
   * @author  MangoIt Solutions(M)
   * @param   {Banner Id}
   * @return  {}
   */
  deleteBanner(bannerId: any) {
    this.confirmDialogService.confirmThis(
      this.language.confirmation_message.delete_banner,
      () => {
        this.authService.setLoader(true);
        this.authService.memberSendRequest('delete', 'deleteBanner/' + bannerId, null).subscribe((respData: any) => {
          this.authService.setLoader(false);
          this.notificationService.showSuccess(respData['result']['message'], 'Success');
          const url: string[] = ['/web/banner-list'];
          this.router.navigate(url);
        });
      },
      () => {}
    );
  }

  /**
   * Function  for display Hamburger Menu
   */
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

  private initBreadcrumb(): void {
    this.breadCrumbItems = [{ label: 'Banner', link: '/web/banner-list' }, { label: this.language.banner.banner_detail }];
  }

  goBack() {
    this.router.navigate(['/web/banner-list']);
  }

  ngOnDestroy(): void {
    this.activatedSub.unsubscribe();
  }
}
