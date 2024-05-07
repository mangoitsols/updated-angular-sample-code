import { Component, OnDestroy, OnInit } from '@angular/core';
import { Email, LoginDetails, ThemeType } from '@core/models';
import { Subscription } from 'rxjs';
import { AuthService, CommonFunctionService, LanguageService, NotificationService, ThemeService } from '@core/services';
import { DomSanitizer } from '@angular/platform-browser';
import { ConfirmDialogService } from '@shared/components';
import { BreadcrumbItem } from '@shared/components/page-header/breadcrumb.type';

declare var $: any;

@Component({
  selector: 'app-show-email',
  templateUrl: './show-email.component.html',
  styleUrls: ['./show-email.component.css'],
})
export class ShowEmailComponent implements OnInit, OnDestroy {
  language: any;
  userDetails: LoginDetails;
  userRole: string;
  responseMessage: string;
  setTheme: ThemeType;
  emailData: Email[];
  totalEmail: number;
  private activatedSub: Subscription;
  currentPageNmuber: number = 1;
  itemPerPage: number = 10;
  totalRecord: number = 0;
  totalEmails: number = 0;
  limitPerPage: { value: string }[] = [{ value: '10' }, { value: '20' }, { value: '30' }, { value: '40' }, { value: '50' }];
  breadCrumbItems: Array<BreadcrumbItem>;

  constructor(
    private notificationService: NotificationService,
    private authService: AuthService,
    private themes: ThemeService,
    private sanitizer: DomSanitizer,
    private commonFunctionService: CommonFunctionService,
    private lang: LanguageService,
    private confirmDialogService: ConfirmDialogService
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
    this.userDetails = JSON.parse(localStorage.getItem('user-data'));
    this.userRole = this.userDetails.roles[0];
    this.initBreadcrumb();
    this.getEmail();
  }

  getEmail() {
    this.authService.memberSendRequest('get', 'getAllEmailTemplate', null).subscribe((respData: any) => {
      this.authService.setLoader(false);
      this.emailData = respData;

      this.emailData.forEach((element: any) => {
        let tokenUrl = this.commonFunctionService.genrateImageToken(element.id, 'emailTemplate');
        element.token = { url: tokenUrl, isLoading: true, imageLoaded: false };
        this.commonFunctionService.loadImage(element.token);
        // if (element?.template_logo[0]?.template_image) {
        // 	element.template_logo[0].template_image = this.sanitizer.bypassSecurityTrustUrl(this.commonFunctionService.convertBase64ToBlobUrl(element?.template_logo[0]?.template_image.substring(20)));
        // }
      });
      this.totalEmails = this.emailData.length;
    });
  }

  deleteEmail(id: number) {
    this.confirmDialogService.confirmThis(
      this.language.confirmation_message.delete_Email,
      () => {
        this.authService.setLoader(true);
        this.authService.memberSendRequest('delete', 'deleteEmailTemplate/' + id, null).subscribe((respData: any) => {
          this.authService.setLoader(false);
          if (respData['isError'] == false) {
            // $('#responseMessage').show();
            this.responseMessage = respData['result']['message'];
            this.notificationService.showSuccess(this.responseMessage, 'Success');
            setTimeout(() => {
              // $('#responseMessage').delay(1000).fadeOut();
              // this.responseMessage = '';
              this.getEmail();
            }, 1000);
          } else if (respData['code'] == 400) {
            this.responseMessage = respData['message'];
            this.notificationService.showError(this.responseMessage, 'Error');
            // setTimeout( () =>{
            // 	$('#responseMessage').delay(1000).fadeOut();
            // 	this.responseMessage = '';
            // },1000);
          }
        });
      },
      () => {}
    );
  }

  /**
   * Function is used for pagination
   * @author  MangoIt Solutions
   */
  pageChanged(event: number) {
    this.currentPageNmuber = event;
  }

  /**
   * Function is used for pagination
   * @author  MangoIt Solutions
   */
  goToPg(eve: number) {
    if (isNaN(eve)) {
      eve = this.currentPageNmuber;
    } else {
      if (eve > Math.ceil(this.totalEmails / this.itemPerPage)) {
        this.notificationService.showError(this.language.error_message.invalid_pagenumber, 'Error');
      } else {
        this.currentPageNmuber = eve;
        // this.getEmail();
      }
    }
  }

  /**
   * Function is used for pagination
   * @author  MangoIt Solutions
   */
  setItemPerPage(limit: number) {
    if (isNaN(limit)) {
      limit = this.itemPerPage;
    }
    this.itemPerPage = limit;
    // this.getEmail();
  }

  private initBreadcrumb(): void {
    this.breadCrumbItems = [{ label: 'E-mail Templates', link: '/web/tags-list' }];
  }

  ngOnDestroy(): void {
    this.activatedSub?.unsubscribe();
  }
}
