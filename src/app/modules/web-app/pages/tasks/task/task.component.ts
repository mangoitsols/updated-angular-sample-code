import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthorizationAccess, CreateAccess, LoginDetails, ParticipateAccess, ThemeType, UserAccess } from '@core/models';
import { LanguageService, ThemeService } from '@core/services';
import { appSetting } from '@core/constants';
import { BreadcrumbItem } from '@shared/components/page-header/breadcrumb.type';

@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.css'],
})
export class TaskComponent implements OnInit {
  language: any;
  userDetails: LoginDetails;
  userAccess: UserAccess;
  createAccess: CreateAccess;
  participateAccess: ParticipateAccess;
  authorizationAccess: AuthorizationAccess;
  documentForm: UntypedFormGroup;
  displayEvents: boolean = false;
  displayTasks: boolean = true;
  displayDocs: boolean = false;
  displayDates: boolean = false;
  setTheme: ThemeType;
  responseMessage: string = '';
  extensions: any;
  doc_type: string;
  private activatedSub: Subscription;
  uploadResp: any;
  breadCrumbItems: Array<BreadcrumbItem>;

  constructor(private lang: LanguageService, public formBuilder: UntypedFormBuilder, private router: Router, private themes: ThemeService) {
    var parts = this.router.url.split('/')['3'];
    if (parts == 'organizer-task') {
      this.displayTasks = true;
    } else if (parts == 'organizer-documents') {
      this.displayDocs = true;
    } else if (parts == 'club-dates') {
      this.displayDates = true;
    } else {
      this.displayEvents = true;
    }
  }

  ngOnInit(): void {
    if (localStorage.getItem('club_theme') != null) {
      let theme: ThemeType = JSON.parse(localStorage.getItem('club_theme'));
      this.setTheme = theme;
    }
    this.activatedSub = this.themes.club_theme.subscribe(resp => {
      this.setTheme = resp;
    });
    this.language = this.lang.getLanguageFile();
    this.userDetails = JSON.parse(localStorage.getItem('user-data'));
    let userRole: string = this.userDetails.roles[0];
    this.userAccess = appSetting.role;
    this.extensions = appSetting.extensions;
    this.createAccess = this.userAccess[userRole].create;
    this.participateAccess = this.userAccess[userRole].participate;
    this.authorizationAccess = this.userAccess[userRole].authorization;
    this.initBreadcrumb();
  }

  onEvents() {
    this.displayEvents = true;
    this.displayTasks = false;
    this.displayDocs = false;
    this.displayDates = false;
    this.initBreadcrumb();
  }

  onTasks() {
    this.displayTasks = true;
    this.displayEvents = false;
    this.displayDocs = false;
    this.initBreadcrumb();
  }

  onDocuments() {
    this.displayTasks = false;
    this.displayEvents = false;
    this.displayDocs = true;
    this.initBreadcrumb();
  }

  /**
   * Function is used to display dates tab
   * @author  MangoIt Solutions
   */
  onDates() {
    this.displayDates = true;
    this.displayEvents = false;
    this.initBreadcrumb();
  }

  showMenu: boolean = false;
  onOpen() {
    let el: HTMLCollectionOf<Element> = document.getElementsByClassName('all_btn_group btn_collapse');
    if (!this.showMenu) {
      this.showMenu = true;
      el[0].className = 'all_btn_group btn_collapse open';
    } else {
      this.showMenu = false;
      el[0].className = 'all_btn_group btn_collapse';
    }
  }

  isOrganizerRoute(): boolean {
    return this.router.url === '/web/organizer';
  }

  isOrganizerEventRoute(): boolean {
    return this.router.url === '/web/organizer/organizer-event';
  }

  isOrganizerTaskRoute(): boolean {
    return this.router.url === '/web/organizer/organizer-task';
  }

  isOrganizerDocumentsRoute(): boolean {
    return this.router.url === '/web/organizer/organizer-documents';
  }

  isClubDatesRoute(): boolean {
    // Check if the current route is '/clubwall/club-events'
    return this.router.url === '/web/organizer/club-dates';
  }

  private initBreadcrumb(): void {
    if (this.displayEvents) {
      this.displayEvents = true;
      this.displayTasks = false;
      this.displayDocs = false;
      this.breadCrumbItems = [{ label: this.language.organizer_task.oganizer_head, link: '' }, { label: this.displayEvents ? this.language.club_events.events : '' }];
    } else if (this.displayTasks) {
      this.displayTasks = true;
      this.displayEvents = false;
      this.displayDocs = false;
      this.isOrganizerTaskRoute();
      this.breadCrumbItems = [{ label: this.language.organizer_task.oganizer_head, link: '' }, { label: this.displayTasks ? this.language.organizer_task.title : '' }];
    } else if (this.displayDocs) {
      this.displayTasks = false;
      this.displayEvents = false;
      this.displayDocs = true;
      this.isOrganizerDocumentsRoute();
      this.breadCrumbItems = [{ label: this.language.organizer_task.oganizer_head, link: '' }, { label: this.displayDocs ? this.language.organizer.documents : '' }];
    } else if (this.displayDates) {
      this.displayTasks = false;
      this.displayEvents = false;
      this.displayDocs = false;
      this.displayDates = true;
      this.isClubDatesRoute();
      this.breadCrumbItems = [{ label: this.language.organizer_task.oganizer_head, link: '' }, { label: this.displayDates ? this.language.club_wall.club_dates : '' }];
    } else {
      this.displayEvents = true;
      this.displayTasks = false;
      this.displayDocs = false;
      this.breadCrumbItems = [{ label: 'Organizer', link: '' }, { label: this.displayEvents ? this.language.club_events.events : '' }];
    }
  }

  ngOnDestroy(): void {
    this.activatedSub.unsubscribe();
  }
}
