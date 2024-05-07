import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
import { AuthorizationAccess, ClubDetail, CreateAccess, LoginDetails, ParticipateAccess, ThemeType, UserAccess } from '@core/models';
import { CommonFunctionService, LanguageService, ThemeService } from '@core/services';
import { appSetting } from '@core/constants';

declare var $: any;

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css'],
})
export class MenuComponent implements OnInit, OnDestroy {
  language: any;
  userDetails: LoginDetails;
  userAccess: UserAccess;
  createAccess: CreateAccess;
  participateAccess: ParticipateAccess;
  authorizationAccess: AuthorizationAccess;
  clubData: ClubDetail;
  setTheme: any;
  isActive: string = 'dashboard';
  userRoleInfo: string;
  isUpcomingCourse: boolean = true;
  private activatedSub: Subscription;
  headline_word_option: number = 0;
  private activatedHeadline: Subscription;
  open_clubTool: boolean = false;
  open_setUp: boolean = false;
  open_more: boolean = false;
  open_adminArea: boolean = false;
  open_tineonAdmin: boolean = false;
  open_owner: boolean = false;
  open_extension: boolean = false;
  logoUrl: string;
  userRole: string;
  coursePermission: any;

  constructor(private lang: LanguageService, private themes: ThemeService, private commonFunctionService: CommonFunctionService, private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.setTheme = null;
    if (localStorage.getItem('club_theme') != null) {
      let theme: ThemeType = JSON.parse(localStorage.getItem('club_theme'));
      this.setTheme = theme;
      if (this.setTheme.logo_url.includes('.png')) {
      } else {
        if (this.setTheme?.logo_url) {
          this.setTheme['logo_url'] = this.sanitizer.bypassSecurityTrustUrl(this.commonFunctionService.convertBase64ToBlobUrl(this.setTheme?.logo_url.substring(20)));
        }
      }
    }
    this.activatedSub = this.themes.club_theme.subscribe((resp: ThemeType) => {
      this.setTheme = resp;
      if (this.setTheme.logo_url.includes('.png')) {
        this.setTheme['logo_url'] = this.setTheme['logo_url'];
      } else {
        if (this.setTheme?.logo_url) {
          this.setTheme['logo_url'] = this.sanitizer.bypassSecurityTrustUrl(this.commonFunctionService.convertBase64ToBlobUrl(this.setTheme?.logo_url.substring(20)));
        }
      }
    });
    this.activatedHeadline = this.commonFunctionService.changeHeadline.subscribe((resp: any) => {
      this.headline_word_option = resp;
    });
    this.language = this.lang.getLanguageFile();
    this.userDetails = JSON.parse(localStorage.getItem('user-data'));

    this.coursePermission = this.userDetails['coursePermisssion'][0]?.vcloud_isCourse;

    this.userRole = this.userDetails.roles[0];
    this.headline_word_option = parseInt(localStorage.getItem('headlineOption'));
    let userRole = this.userDetails.roles[0];
    this.userRoleInfo = this.userDetails.roles[0];
    this.userAccess = appSetting.role;
    this.createAccess = this.userAccess[userRole].create;
    this.participateAccess = this.userAccess[userRole].participate;
    this.authorizationAccess = this.userAccess[userRole].authorization;
    this.getClubData();
  }

  // Function to check if the URL is an image URL with specified extensions
  isImageUrl(url: string): boolean {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.avif', '.apng', '.jfif', '.pjpeg', '.pjp'];
    return imageExtensions.some(extension => url.toLowerCase().endsWith(extension));
  }

  public ngInit() {
    $('div').attr('id', 'SomeID');
    $(document).ready(() => {
      $('.sidebar-wrapper').hover(
        () => {
          $(this).addClass('sidebar-hover');
        },
        () => {
          $(this).removeClass('sidebar-hover');
        }
      );
    });
  }

  getClubData() {
    if (sessionStorage.getItem('token')) {
      let userData = JSON.parse(localStorage.getItem('user-data'));
      this.clubData = userData.Club;
    }
  }

  dropDown1() {
    $('.toggleSubmenu1').next('ul').toggleClass('show');
    this.open_clubTool = !this.open_clubTool;
    this.open_setUp = false;
    this.open_more = false;
    this.open_adminArea = false;
    this.open_tineonAdmin = false;
    this.open_owner = false;
    this.open_extension = false;
  }
  dropDown2() {
    $('.toggleSubmenu2').next('ul').toggleClass('show');
    this.open_setUp = !this.open_setUp;
    this.open_clubTool = false;
    this.open_more = false;
    this.open_adminArea = false;
    this.open_tineonAdmin = false;
    this.open_owner = false;
    this.open_extension = false;
  }
  dropDown3() {
    $('.toggleSubmenu3').next('ul').toggleClass('show');
    this.open_more = !this.open_more;
    this.open_clubTool = false;
    this.open_setUp = false;
    this.open_adminArea = false;
    this.open_tineonAdmin = false;
    this.open_owner = false;
    this.open_extension = false;
  }
  dropDown4() {
    $('.toggleSubmenu4').next('ul').toggleClass('show');
    this.open_adminArea = !this.open_adminArea;
    this.open_clubTool = false;
    this.open_setUp = false;
    this.open_more = false;
    this.open_tineonAdmin = false;
    this.open_owner = false;
    this.open_extension = false;
  }
  dropDown5() {
    $('.toggleSubmenu5').next('ul').toggleClass('show');
    this.open_tineonAdmin = !this.open_tineonAdmin;
    this.open_clubTool = false;
    this.open_setUp = false;
    this.open_more = false;
    this.open_adminArea = false;
    this.open_owner = false;
    this.open_extension = false;
  }
  dropDown6() {
    $('.toggleSubmenu6').next('ul').toggleClass('show');
    this.open_owner = !this.open_owner;
    this.open_clubTool = false;
    this.open_setUp = false;
    this.open_more = false;
    this.open_adminArea = false;
    this.open_tineonAdmin = false;
    this.open_extension = false;
  }
  dropDown7() {
    $('.toggleSubmenu7').next('ul').toggleClass('show');
    this.open_owner = false;
    this.open_clubTool = false;
    this.open_setUp = false;
    this.open_more = false;
    this.open_adminArea = false;
    this.open_tineonAdmin = false;
    this.open_extension = !this.open_extension;
  }

  isValue: number = 0;
  toggle(num: number) {
    this.isValue = num;
  }

  ngOnDestroy(): void {
    this.activatedSub.unsubscribe();
    this.activatedHeadline.unsubscribe();
  }
}
