import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CreateAccess, LoginDetails, ParticipateAccess, ThemeType, UserAccess } from '@core/models';
import { AuthService, LanguageService, ThemeService } from '@core/services';
import { appSetting } from '@core/constants';
import { BreadcrumbItem } from '@shared/components/page-header/breadcrumb.type';

declare var $: any;

@Component({
  selector: 'app-club-wall',
  templateUrl: './club-wall.component.html',
  styleUrls: ['./club-wall.component.css'],
})
export class ClubWallComponent implements OnInit, OnDestroy {
  language: any;
  userDetails: LoginDetails;
  userAccess: UserAccess;
  createAccess: CreateAccess;
  participateAccess: ParticipateAccess;
  displayNews: boolean = false;
  displayDates: boolean = false;
  displayEvents: boolean = false;
  setTheme: ThemeType;
  private activatedSub: Subscription;
  userRole: string;
  totalChildComponents = 2;
  loadedChildComponents = 0;
  showButtonBox: boolean = false;
  breadCrumbItems: Array<BreadcrumbItem>;

  constructor(private lang: LanguageService, public authService: AuthService, private router: Router, private route: ActivatedRoute, private themes: ThemeService) {
    this.authService.setLoader(true);
    if (localStorage.getItem('club_theme') != null) {
      let theme: ThemeType = JSON.parse(localStorage.getItem('club_theme'));
      this.setTheme = theme;
    }
    this.activatedSub = this.themes.club_theme.subscribe((resp: ThemeType) => {
      this.setTheme = resp;
    });

    var getParamFromUrl = this.router.url.split('/')['3'];

    if (getParamFromUrl == 'club-events') {
      this.displayEvents = true;
    } else if (getParamFromUrl == 'club-dates') {
      this.displayDates = true;
    } else {
      this.displayNews = true;
    }
  }

  onChildDataLoaded() {
    this.loadedChildComponents++;
    // Check if all child components have loaded data
    if (this.loadedChildComponents === this.totalChildComponents) {
      this.authService.setLoader(false);
    }
  }

  ngOnInit(): void {
    this.authService.setLoader(true);
    this.language = this.lang.getLanguageFile();
    this.userDetails = JSON.parse(localStorage.getItem('user-data') || '');
    this.userRole = this.userDetails.roles[0];
    this.userAccess = appSetting.role;
    this.createAccess = this.userAccess[this.userRole].create;
    this.participateAccess = this.userAccess[this.userRole].participate;

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        // Get the current route
        const currentRoute = this.router.url;
        // Update the selected tab based on the current route
        if (currentRoute.includes('club-news')) {
          this.onNews();
        } else if (currentRoute.includes('club-dates')) {
          this.onDates();
        } else if (currentRoute.includes('club-events')) {
          this.onEvents();
        }
      }
    });
    this.initBreadcrumb();
  }

  isClubEventsRoute(): boolean {
    // Check if the current route is '/clubwall/club-events'
    return this.router.url === '/web/clubwall/club-events';
  }

  isClubDatesRoute(): boolean {
    // Check if the current route is '/clubwall/club-events'
    return this.router.url === '/web/clubwall/club-dates';
  }

  /**
   * Function is used to display news tab
   * @author  MangoIt Solutions
   */
  onNews() {
    // this.authService.setLoader(true);
    this.displayNews = true;
    this.displayDates = false;
    this.displayEvents = false;
    this.initBreadcrumb();
  }

  /**
   * Function is used to display dates tab
   * @author  MangoIt Solutions
   */
  onDates() {
    this.displayNews = false;
    this.displayDates = true;
    this.displayEvents = false;
    this.initBreadcrumb();
  }

  /**
   * Function is used to display event tab
   * @author  MangoIt Solutions
   */
  onEvents() {
    this.displayNews = false;
    this.displayDates = false;
    this.displayEvents = true;
    this.initBreadcrumb();
  }

  private initBreadcrumb(): void {
    if (this.displayNews) {
      this.displayNews = true;
      this.displayDates = false;
      this.displayEvents = false;
      this.breadCrumbItems = [{ label: 'Clubwall', link: '/web/clubwall' }, { label: this.displayNews ? this.language.club_wall.club_news : '' }];
    } else if (this.displayDates) {
      this.displayDates = true;
      this.displayNews = false;
      this.displayEvents = false;
      this.isClubDatesRoute();
      this.breadCrumbItems = [{ label: 'Clubwall', link: '/web/clubwall' }, { label: this.displayDates ? this.language.club_wall.club_dates : '' }];
    } else if (this.displayEvents) {
      this.displayNews = false;
      this.displayDates = false;
      this.displayEvents = true;
      this.isClubEventsRoute();
      this.breadCrumbItems = [{ label: 'Clubwall', link: '/web/clubwall' }, { label: this.displayEvents ? this.language.club_events.current_events : '' }];
    } else {
      this.displayNews = true;
      this.displayEvents = false;
      this.displayDates = false;
      this.breadCrumbItems = [{ label: 'Clubwall', link: '/web/clubwall' }, { label: this.displayNews ? this.language.club_wall.club_news : '' }];
    }
  }

  ngOnDestroy(): void {
    this.activatedSub.unsubscribe();
  }
}
