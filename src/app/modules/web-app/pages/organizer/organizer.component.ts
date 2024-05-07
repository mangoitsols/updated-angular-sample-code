import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthorizationAccess, CreateAccess, LoginDetails, ParticipateAccess, ThemeType, UserAccess } from '@core/models';
import { AuthService, LanguageService, NotificationService, ThemeService } from '@core/services';
import { appSetting } from '@core/constants';
import { BreadcrumbItem } from '@shared/components/page-header/breadcrumb.type';

declare var $: any;

@Component({
  selector: 'app-organizer',
  templateUrl: './organizer.component.html',
  styleUrls: ['./organizer.component.css'],
})
export class OrganizerComponent implements OnInit, OnDestroy {
  language: any;
  userDetails: LoginDetails;
  userAccess: UserAccess;
  createAccess: CreateAccess;
  participateAccess: ParticipateAccess;
  authorizationAccess: AuthorizationAccess;
  documentForm: UntypedFormGroup;
  displayEvents: boolean = false;
  displayTasks: boolean = false;
  displayDocs: boolean = false;
  displayDates: boolean = false;
  setTheme: ThemeType;
  responseMessage: string = '';
  extensions: any;
  doc_type: string;
  private activatedSub: Subscription;
  uploadResp: any;
  breadCrumbItems: Array<BreadcrumbItem>;

  constructor(private lang: LanguageService, private authService: AuthService, public formBuilder: UntypedFormBuilder, private router: Router, private themes: ThemeService, private notificationService: NotificationService) {
    // let parts = this.router.url.split('/');
    var parts = this.router.url.split('/')['3'];
    // var url = parts[parts.length - 1];

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
    if (localStorage.getItem('trigger-doc') !== null) {
      setTimeout(() => {
        let triggered = localStorage.getItem('trigger-doc');
        $('#organizer_doc').trigger('click');
        localStorage.removeItem('trigger-doc');
      }, 3000);
    }

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const getParamFromUrl: string = this.router.url;
        if (getParamFromUrl.includes('organizer-event')) {
          this.onEvents();
        } else {
          this.onDates();
        }
      }
    });

    this.initBreadcrumb();
  }

  onEvents() {
    this.displayEvents = true;
    this.displayTasks = false;
    this.displayDocs = false;
    this.displayDates = false;
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
      this.breadCrumbItems = [{ label: 'Organizer', link: '' }, { label: this.displayEvents ? this.language.club_events.events : '' }];
    } else if (this.displayTasks) {
      this.displayTasks = true;
      this.displayEvents = false;
      this.displayDocs = false;
      this.isOrganizerTaskRoute();
      this.breadCrumbItems = [{ label: 'Organizer', link: '' }, { label: this.displayTasks ? this.language.organizer_task.title : '' }];
    } else if (this.displayDocs) {
      this.displayTasks = false;
      this.displayEvents = false;
      this.displayDocs = true;
      this.isOrganizerDocumentsRoute();
      this.breadCrumbItems = [{ label: 'Organizer', link: '' }, { label: this.displayDocs ? this.language.organizer.documents : '' }];
    } else if (this.displayDates) {
      this.displayTasks = false;
      this.displayEvents = false;
      this.displayDocs = false;
      this.displayDates = true;
      this.isClubDatesRoute();
      this.breadCrumbItems = [{ label: 'Organizer', link: '' }, { label: this.displayDates ? this.language.club_wall.club_dates : '' }];
    } else {
      this.displayEvents = true;
      this.displayTasks = false;
      this.displayDocs = false;
      this.breadCrumbItems = [{ label: 'Organizer', link: '' }, { label: this.displayEvents ? this.language.club_events.events : '' }];
    }
  }

  uploadFile(event: Event) {
    this.documentForm = new UntypedFormGroup({
      add_image: new UntypedFormControl('', Validators.required),
      category: new UntypedFormControl('', Validators.required),
      club_id: new UntypedFormControl(this.userDetails.team_id),
    });
    const file: File = (event.target as HTMLInputElement).files[0];
    let category_text: string = '';
    for (let index = 0; index < $('.nav-tabs ').children().length; index++) {
      const element: any = $('.nav-tabs').children().children();
      if (element[index].classList.length > 2) {
        category_text = element[index].text;
      }
    }
    category_text = category_text == '' ? document.querySelector('.nav-tabs .active').textContent : category_text;
    if (category_text != '') {
      var category: string;
      category_text = category_text.trim();

      if (category_text == this.language.club_document.my_documents.trim()) {
        category = 'personal';
      } else if (category_text == this.language.club_document.club_documents.trim() || category_text == this.language.club_document.club_documents_untern.trim()) {
        category = 'club';
      } else if (category_text == this.language.club_document.archived_documents.trim()) {
        category = 'archive';
      } else if (category_text == this.language.club_document.current_status.trim() || category_text == this.language.club_document.current_status_untern.trim()) {
        category = 'current-statuses';

        // Check if the selected file is a PDF
        if (file.type !== 'application/pdf') {
          this.notificationService.showError('Only PDF files are allowed for the "current-statuses" category.', 'Error');
          return; // Abort the upload process
        }
      }

      this.documentForm.patchValue({
        add_image: file,
        category: category,
      });
      this.documentForm.get('category').updateValueAndValidity();
      const reader: FileReader = new FileReader();
      reader.readAsDataURL(file);
      var url: any;
      reader.onload = _event => {
        url = reader.result;
      };
      var ext: string[] = file.name.split('.');
      let fileError: number = 0;
      for (const key in this.extensions) {
        if (Object.prototype.hasOwnProperty.call(this.extensions, key)) {
          const element: any = this.extensions[key];
          if (key == ext[ext.length - 1]) {
            fileError++;
          }
        }
      }
      if (fileError != 0) {
        if (this.userDetails.isAdmin || this.userDetails.isFunctionary || this.userDetails.isSecretary) {
          this.insertDoc();
        } else if ((this.userDetails.guestUser || this.userDetails.isMember || this.userDetails.isEditor) && category == 'personal') {
          this.insertDoc();
        } else {
          this.notificationService.showError(this.language.error_message.permission_error, 'Error');
        }
      } else {
        this.notificationService.showError(this.language.error_message.common_valid, 'Error');
      }
    }
  }

  insertDoc() {
    var formData: FormData = new FormData();
    this.authService.setLoader(true);
    for (const key in this.documentForm.value) {
      if (Object.prototype.hasOwnProperty.call(this.documentForm.value, key)) {
        const element: any = this.documentForm.value[key];
        if (key == 'add_image') {
          formData.append('file', element);
        } else {
          if (key != 'add_image') {
            formData.append(key, element);
          }
        }
      }
    }
    this.authService.memberSendRequest('post', 'documents/insert', formData).subscribe((respData: any) => {
      if (respData.isError == false) {
        if (respData['result']['message'] == 'uploaded') {
          this.responseMessage = respData['result']['message'];
          this.notificationService.showSuccess(this.responseMessage, 'Success');
          setTimeout(() => {
            if (this.responseMessage == 'uploaded') {
              for (let index = 0; index < $('.tab-content').children().length; index++) {
                const element: any = $('.tab-content').children();
                if (element[index].classList.length > 2) {
                  this.doc_type = element[index].id;
                }
              }
              $('#organizer_task').trigger('click');
              setTimeout(() => {
                localStorage.setItem('trigger-doc', 'doc');
                $('#organizer_doc').trigger('click');
                $('#' + this.doc_type).trigger('click');
              }, 20);
              this.authService.setLoader(false);
            }
          }, 2000);
        }
      } else if (respData['code'] == 400) {
        this.notificationService.showError(respData['message'], 'Error');
      }
    });
  }

  ngOnDestroy(): void {
    this.activatedSub.unsubscribe();
  }
}
