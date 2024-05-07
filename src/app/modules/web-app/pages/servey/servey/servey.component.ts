import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthorizationAccess, CreateAccess, LoginDetails, ParticipateAccess, ThemeType, UserAccess } from '@core/models';
import { Subscription } from 'rxjs';
import { AuthService, LanguageService, ThemeService } from '@core/services';
import { appSetting } from '@core/constants';
import { BreadcrumbItem } from '@shared/components/page-header/breadcrumb.type';

declare var $: any;
@Component({
  selector: 'app-servey',
  templateUrl: './servey.component.html',
  styleUrls: ['./servey.component.css'],
})
export class ServeyComponent implements OnInit, OnDestroy {
  language: any;
  userDetails: LoginDetails;
  userRole: string;
  responseMessage: string;
  displayActiveSurvey: boolean = true;
  displayMySurvey: boolean = false;
  displayCompletedSurvey: boolean = false;
  setTheme: ThemeType;
  userAccess: UserAccess;
  createAccess: CreateAccess;
  participateAccess: ParticipateAccess;
  authorizationAccess: AuthorizationAccess;
  breadCrumbItems: Array<BreadcrumbItem>;

  private activatedSub: Subscription;

  constructor(private authService: AuthService, private themes: ThemeService, private lang: LanguageService) {}

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
    this.userAccess = appSetting.role;
    this.createAccess = this.userAccess[this.userRole].create;
    this.participateAccess = this.userAccess[this.userRole].participate;
    this.authorizationAccess = this.userAccess[this.userRole].authorization;
    this.authService.setLoader(false);
    this.initBreadcrumb();
  }

  onSurvey(id: number) {
    $('.tab-pane').removeClass('active');
    $('.nav-link').removeClass('active');
    if (id == 1) {
      this.displayActiveSurvey = true;
      this.displayMySurvey = false;
      this.displayCompletedSurvey = false;
      $('#tabs-1').addClass('active');
      $('#head-allTask').addClass('active');
    }
    if (id == 2) {
      this.displayActiveSurvey = false;
      this.displayMySurvey = true;
      this.displayCompletedSurvey = false;
      $('#tabs-2').addClass('active');
      $('#head-personalTask').addClass('active');
    }
    if (id == 3) {
      this.displayActiveSurvey = false;
      this.displayMySurvey = false;
      this.displayCompletedSurvey = true;
      $('#tabs-3').addClass('active');
      $('#head-groupTask').addClass('active');
    }
    this.initBreadcrumb();
  }

  private initBreadcrumb(): void {
    if (this.displayActiveSurvey) {
      this.breadCrumbItems = [{ label: this.language.Survey.vereins_tools, link: '/web/survey' }, { label: this.displayActiveSurvey ? this.language.Survey.active_survey + ' ' + this.language.Survey.survey : '' }];
    } else if (this.displayMySurvey) {
      this.breadCrumbItems = [{ label: this.language.Survey.vereins_tools, link: '/web/survey' }, { label: this.displayMySurvey ? this.language.Survey.my_votes + ' ' + this.language.Survey.survey : '' }];
    } else if (this.displayCompletedSurvey) {
      this.breadCrumbItems = [{ label: this.language.Survey.vereins_tools, link: '/web/survey' }, { label: this.displayCompletedSurvey ? this.language.Survey.completed_votes + ' ' + this.language.Survey.survey : '' }];
    } else {
      this.breadCrumbItems = [{ label: this.language.Survey.vereins_tools, link: '/web/survey' }, { label: this.displayActiveSurvey ? this.language.Survey.active_survey + ' ' + this.language.Survey.survey : '' }];
    }
  }

  ngOnDestroy(): void {
    this.activatedSub.unsubscribe();
  }
}
