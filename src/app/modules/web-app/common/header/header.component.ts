import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { NgxImageCompressService } from 'ngx-image-compress';
import { AuthorizationAccess, ClubDetail, CreateAccess, LoginDetails, ParticipateAccess, ThemeType, UserAccess } from '@core/models';
import { AuthService, CommonFunctionService, LanguageService, NotificationService, NotificationsService, ThemeService, AcceptdenyService, UserImageService } from '@core/services';
import { ConfirmDialogService, DenyReasonConfirmDialogService, UpdateConfirmDialogService } from '@shared/components';
import { appSetting } from '@core/constants';
import { environment } from '@env/environment';
import { io, Socket } from 'socket.io-client';

declare var $: any;

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  language: any;
  userDetails: LoginDetails;
  userAccess: UserAccess;
  clubData: ClubDetail;
  createAccess: CreateAccess;
  participateAccess: ParticipateAccess;
  authorizationAccess: AuthorizationAccess;
  displayFlag: string = 'de';
  alluserDetails: String[] = [];
  getNotificationInterval: number;
  userRespData: string;
  thumbnail: string;
  alreadyAcceptMsg: string;
  showNotifications: any[] = [];
  showNotificationsss: any = [];
  responseMessage: string = '';
  memberPhotosuccess: string;
  documentForm: UntypedFormGroup;
  globalSearchForm: UntypedFormGroup;
  setTheme: ThemeType;
  pageUrl: any;
  socket: Socket;
  chatUserArr: any;
  msgUserArr: any;
  totalUnreadChats: any = 0;
  userId: any;
  file: File;
  fileToReturn: File;
  imageChangedEvent: Event = null;
  image: File;
  imgName: string;
  imgErrorMsg: boolean = false;
  docErrorMsg: boolean = false;
  croppedImage: string = '';
  isImage: boolean = false;
  private activatedSub: Subscription;
  private activatedPro: Subscription;
  private refreshPage: Subscription;
  private denyRefreshPage: Subscription;
  private removeUpdate: Subscription;
  private activatedHeadline: Subscription;
  headline_word_option: number = 0;
  notifi: any;

  constructor(
    private _router: Router,
    private route: ActivatedRoute,
    private themes: ThemeService,
    private authService: AuthService,
    private confirmDialogService: ConfirmDialogService,
    private lang: LanguageService,
    private sanitizer: DomSanitizer,
    private tostrNotificationService: NotificationService,
    private notificationService: NotificationsService,
    private updateConfirmDialogService: UpdateConfirmDialogService,
    private denyReasonService: DenyReasonConfirmDialogService,
    private formbuilder: UntypedFormBuilder,
    private imageCompress: NgxImageCompressService,
    private commonFunctionService: CommonFunctionService,
    private acceptdenyService: AcceptdenyService,
    private userImageService: UserImageService
  ) {
    this.socket = io(environment.serverUrl);
    this.showNotifications = [];
    this.notificationService
      .getNotifications()
      .then(notifications => {
        this.showNotificationsss = notifications;
        setTimeout(() => {
          this.modifiedData(this.showNotificationsss);
        }, 2000);
      })
      .catch(error => {
        console.error('Error fetching notifications:', error);
      });
    this.socket.on('getNotification', (data: any) => {
      let section = data;
      if (this.userDetails.roles[0] != 'guest') {
        this.notificationService
          .getNotifications(section)
          .then(notifications => {
            this.showNotificationsss = notifications;
            setTimeout(() => {
              this.modifiedData(this.showNotificationsss);
            }, 2000);
          })
          .catch(error => {
            // Handle any errors that occurred during the promise execution
            console.error('Error fetching notifications:', error);
          });
      }
    });
  }

  ngOnInit() {
    const bodyTag = document.body;
    this.language = localStorage.getItem('language');
    bodyTag.classList.remove('lang-de', 'lang-en', 'lang-fr', 'lang-it', 'lang-sp', 'lang-tr');
    bodyTag.classList.add('lang-' + this.language);

    if (localStorage.getItem('club_theme') != null) {
      let theme: ThemeType = JSON.parse(localStorage.getItem('club_theme'));
      this.setTheme = theme;
    }
    this.activatedSub = this.themes.club_theme.subscribe((resp: ThemeType) => {
      this.setTheme = resp;
    });
    this.activatedPro = this.themes.profile_imge.subscribe((resp: string) => {
      this.userImageService.emptyAuthorImage();
      this.getUserImage();
    });

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

    this.authService.count$.subscribe(count => {
      this.chats();
    });

    this.activatedHeadline = this.commonFunctionService.changeHeadline.subscribe((resp: any) => {
      this.headline_word_option = resp;
    });

    this.displayFlag = localStorage.getItem('language');
    this.language = this.lang.getLanguageFile();
    this.headline_word_option = parseInt(localStorage.getItem('headlineOption'));
    this.userDetails = JSON.parse(localStorage.getItem('user-data'));
    this.userId = this.userDetails.userId;
    let userRole: string = this.userDetails.roles[0];
    this.userAccess = appSetting.role;
    this.createAccess = this.userAccess[userRole].create;
    this.participateAccess = this.userAccess[userRole].participate;
    this.authorizationAccess = this.userAccess[userRole].authorization;

    this.globalSearchForm = this.formbuilder.group({
      searchOption: ['', [Validators.required]],
    });

    this.socket = io(environment.serverUrl, { transports: ['websocket'] });
    this.chats();
    this.socket.on('firstusermsg', (msg: any) => {
      this.chats();
    });
  }

  filterNotificationsBySection = (section: string) => {
    delete this.showNotificationsss[section];
    return this.showNotificationsss;
  };

  modifiedData(notifications: any) {
    this.showNotifications = [];
    Object.values(notifications).forEach((element: any) => {
      Object.values(element).forEach((elem: any) => {
        this.showNotifications.push(elem);
      });
    });
    this.showNotifications.sort((a, b) => {
      const dateA = new Date(a.updated_at);
      const dateB = new Date(b.updated_at);

      if (dateA.getTime() === dateB.getTime()) {
        // If dates are equal, sort based on time
        return dateB.getTime() - dateA.getTime();
      } else {
        // Sort based on date
        return dateB.getTime() - dateA.getTime();
      }
    });
  }

  pageRedirect(page: string, id: number) {
    const random = Math.floor(Math.random() * 1000);
    this._router.navigate(['/web/' + page + '/', id], { queryParams: { random } });
  }

  getUserImage() {
    if (sessionStorage.getItem('token')) {
      let userData: LoginDetails = JSON.parse(localStorage.getItem('user-data'));
      this.authService.memberInfoRequest('get', 'member-photo?database_id=' + userData.database_id + '&club_id=' + userData.team_id + '&member_id=' + userData.member_id, null).subscribe((respData: any) => {
        this.authService.setLoader(false);
        if (respData['code'] == 400) {
          this.responseMessage = respData['message'].message;
          this.tostrNotificationService.showError(this.responseMessage, null);
        } else {
          this.userRespData = respData;
          this.thumbnail = this.sanitizer.bypassSecurityTrustUrl(respData.changingThisBreaksApplicationSecurity) as string;
        }
      });
    }
  }

  get formControls() {
    return this.globalSearchForm.controls;
  }

  globalSearch() {
    if (this.globalSearchForm.invalid) {
      return;
    } else {
      this._router.navigate(['/web/search/' + this.globalSearchForm.value.searchOption]);
      this.globalSearchForm.reset();
    }
  }

  onLanguageSelect(lan: string) {
    localStorage.setItem('language', lan);
    window.location.reload();
  }

  acceptInvitedCourse(CourseId: number) {
    this.acceptdenyService.acceptInvitedCourse(CourseId, 'web');
  }

  denyInvitedCourse(courseId: number) {
    this.acceptdenyService.denyInvitedCourse(courseId, 'web');
  }

  acceptJoinUser(courseId: number, userIId: number) {
    this.acceptdenyService.acceptJoinUser(courseId, userIId, 'web');
  }

  denyJoinUser(courseId: number, userIId: number) {
    this.acceptdenyService.denyJoinUser(courseId, userIId);
  }

  approvedCourses(courseId: number) {
    this.acceptdenyService.approvedCourses(courseId, 'web');
  }

  approvedUpdateCourses(courseId: number) {
    this.acceptdenyService.approvedUpdateCourses(courseId, 'web');
  }

  unapprovedCourse(courseId: number) {
    this.acceptdenyService.unapprovedCourse(courseId, 'web');
  }

  deleteUpdateCourse(courseId: number) {
    this.acceptdenyService.deleteUpdateCourse(courseId, 'web');
  }

  deleteCourse(courseId: number) {
    this.acceptdenyService.deleteCourse(courseId, 'web');
  }

  approvedGroup(groupId: number, authorId: any) {
    this.acceptdenyService.approvedGroup(groupId, 'web');
  }

  unapproveGroup(groupId: number, authorId: any) {
    this.acceptdenyService.unapproveGroup(groupId, 'web');
  }

  joinGroup(groupId: number, userId: number) {
    this.acceptdenyService.joinGroup(groupId, userId, 'web');
  }

  acceptGroup(groupId: number) {
    this.acceptdenyService.acceptGroup(groupId, 'web');
  }

  denyGroup(groupId: number, userId: number) {
    this.acceptdenyService.denyGroup(groupId, userId);
  }

  rejectGroup(groupId: number) {
    this.acceptdenyService.rejectGroup(groupId);
  }

  viewGroup(groupId: number) {
    this.acceptdenyService.viewGroup(groupId);
  }

  viewUpdatedGroup(groupId: number) {
    this.acceptdenyService.viewUpdatedGroup(groupId, 'web');
  }

  viewAcceptedGroup(groupId: number) {
    this.acceptdenyService.viewAcceptedGroup(groupId, 'web');
  }

  readPublishedGroup(groupId: number) {
    this.acceptdenyService.readPublishedGroup(groupId, 'web');
  }

  acceptUpdatedGroup(groupId: number) {
    this.acceptdenyService.acceptUpdatedGroup(groupId, 'web');
  }

  acceptNews(newsId: number, authorId: any) {
    this.acceptdenyService.acceptNews(newsId, 'web');
  }

  acceptUpdatedNews(newsId: number) {
    this.acceptdenyService.acceptUpdatedNews(newsId, 'web');
  }

  denyNews(newsId: number, authorId: any) {
    this.acceptdenyService.denyNews(newsId, 'web');
  }

  deleteUpdateNews(newsId: number, authorId: any) {
    this.acceptdenyService.deleteUpdateNews(newsId, 'web');
  }

  approvedEvents(eventId: number) {
    this.acceptdenyService.approvedEvents(eventId, 'web');
  }

  approvedUpdateEvents(eventId: number) {
    this.acceptdenyService.approvedUpdateEvents(eventId, 'web');
  }

  unapprovedEvent(eventId: number) {
    this.acceptdenyService.unapprovedEvent(eventId, 'web');
  }

  deleteUpdateEvents(eventId: number) {
    this.acceptdenyService.deleteUpdateEvents(eventId, 'web');
  }

  deleteEvents(eventId: number) {
    this.acceptdenyService.deleteEvents(eventId, 'web');
  }

  acceptInvitedEvent(eventId: number) {
    this.acceptdenyService.acceptInvitedEvent(eventId, 'web');
  }

  denyInvitedEvent(eventId: number) {
    this.acceptdenyService.denyInvitedEvent(eventId, 'web');
  }

  adminApprovedTasks(taskId: number) {
    this.acceptdenyService.adminApprovedTasks(taskId, 'web');
  }

  adminUnapprovedTasks(taskId: number) {
    this.acceptdenyService.adminUnapprovedTasks(taskId, 'web');
  }

  adminApprovedUpdateTasks(taskId: number) {
    this.acceptdenyService.adminApprovedUpdateTasks(taskId, 'web');
  }

  deleteUpdateTask(taskId: number) {
    this.acceptdenyService.deleteUpdateTask(taskId, 'web');
  }

  deleteTask(taskId: number) {
    this.acceptdenyService.deleteTask(taskId, 'web');
  }

  acceptInvitedTask(taskId: number) {
    this.acceptdenyService.acceptInvitedTask(taskId, 'web');
  }

  acceptInvitedSubTask(subtaskId: number, taskId: number) {
    this.acceptdenyService.acceptInvitedSubTask(subtaskId, taskId, 'web');
  }

  viewUpdatedTask(taskId: number) {
    this.acceptdenyService.viewUpdatedTask(taskId, 'web');
  }

  viewCompletedTask(taskId: number) {
    this.acceptdenyService.viewCompletedTask(taskId, 'web');
  }

  acceptMessage(msgId: number, esdb_id: number) {
    this.acceptdenyService.acceptMessage(esdb_id);
  }

  denyMessage(msgId: number, esdb_id: number) {
    this.acceptdenyService.denyMessage(esdb_id);
  }

  approvedRooms(roomId: number) {
    this.acceptdenyService.approvedRooms(roomId, 'web');
  }

  approvedUpdateRooms(roomId: number) {
    this.acceptdenyService.approvedUpdateRooms(roomId, 'web');
  }

  unapprovedRooms(roomId: number) {
    this.acceptdenyService.unapprovedRooms(roomId, 'web');
  }

  deleteRoom(roomId: number) {
    this.acceptdenyService.deleteRoom(roomId, 'web');
  }

  deleteUpdateRoom(roomId: number) {
    this.acceptdenyService.deleteUpdateRoom(roomId, 'web');
  }

  approvedInstructors(instructor_id: number) {
    this.acceptdenyService.approvedInstructors(instructor_id, 'web');
  }

  approvedUpdateInstructors(instructor_id: number) {
    this.acceptdenyService.approvedUpdateInstructors(instructor_id, 'web');
  }

  unapprovedInstuctors(instructor_id: number) {
    this.acceptdenyService.unapprovedInstuctors(instructor_id, 'web');
  }

  deleteUpdateInstructor(instructor_id: number) {
    this.acceptdenyService.deleteUpdateInstructor(instructor_id, 'web');
  }

  deleteInstructor(instructor_id: number) {
    this.acceptdenyService.deleteInstructor(instructor_id, 'web');
  }

  approvedFaqs(faqId: number) {
    this.acceptdenyService.approvedFaqs(faqId, 'web');
  }

  approvedUpdateFaqs(faqId: number) {
    this.acceptdenyService.approvedUpdateFaqs(faqId, 'web');
  }

  denyFaqs(faqsId: number) {
    this.acceptdenyService.denyFaqs(faqsId, 'web');
  }

  deleteFaqs(faqsId: number) {
    this.acceptdenyService.deleteFaqs(faqsId, 'web');
  }

  deleteUpdateFaqs(faqsId: number) {
    this.acceptdenyService.deleteUpdateFaqs(faqsId, 'web');
  }

  readApprovedFaqs(faqId: number) {
    this.acceptdenyService.readApprovedFaqs(faqId, 'web');
  }

  readUpdatedFaqs(faqId: number) {
    this.acceptdenyService.readUpdatedFaqs(faqId, 'web');
  }

  approvedFaqsCategory(faqCategoryId: number) {
    this.acceptdenyService.approvedFaqsCategory(faqCategoryId);
  }

  unapprovedFaqsCategory(faqCategoryId: number) {
    this.acceptdenyService.unapprovedFaqsCategory(faqCategoryId);
  }

  approvedSurvey(surveyId: number) {
    this.acceptdenyService.approvedSurvey(surveyId, 'web');
  }

  unapprovedSurvey(surveyId: number) {
    this.acceptdenyService.unapprovedSurvey(surveyId, 'web');
  }

  approvedUpdatedSurvey(survey_id: number) {
    this.acceptdenyService.approvedUpdatedSurvey(survey_id, 'web');
  }

  surveyDelete(survey_id: number) {
    this.acceptdenyService.surveyDelete(survey_id, 'web');
  }

  deleteUpdatedSurvey(survey_id: number) {
    this.acceptdenyService.deleteUpdatedSurvey(survey_id, 'web');
  }

  acceptInvitedSurvey(surveyId: number) {
    this.acceptdenyService.acceptInvitedSurvey(surveyId, 'web');
  }

  viewNews(newsId: number) {
    this.acceptdenyService.viewNews(newsId);
  }

  viewApprovePublishNewsByAdmin(newsId: number) {
    this.acceptdenyService.viewApprovePublishNewsByAdmin(newsId, 'web');
  }

  viewApproveUpdateNewsByAdmin(newsId: number) {
    this.acceptdenyService.viewApproveUpdateNewsByAdmin(newsId, 'web');
  }

  viewFaqs(faqId: number) {
    this.acceptdenyService.viewFaqs(faqId);
  }

  viewDenyPublishTaskByAdmin(taskId: number) {
    this.acceptdenyService.viewDenyPublishTaskByAdmin(taskId);
  }

  viewAcceptPublishTaskByAdmin(task_id: number) {
    this.acceptdenyService.viewAcceptPublishTaskByAdmin(task_id, 'web');
  }

  viewAcceptUpdatedTaskByAdmin(task_id: number) {
    this.acceptdenyService.viewAcceptUpdatedTaskByAdmin(task_id, 'web');
  }

  viewDenyPublishInstructorByAdmin(instructor_id: number) {
    this.acceptdenyService.viewDenyPublishInstructorByAdmin(instructor_id);
  }

  viewApprovePublishInstructorByAdmin(instructor_id: number) {
    this.acceptdenyService.viewApprovePublishInstructorByAdmin(instructor_id, 'web');
  }

  viewApproveUpdateInstructorByAdmin(instructor_id: number) {
    this.acceptdenyService.viewApproveUpdateInstructorByAdmin(instructor_id, 'web');
  }

  viewAcceptPublishSurveyByAdmin(survey_id: number) {
    this.acceptdenyService.viewAcceptPublishSurveyByAdmin(survey_id, 'web');
  }

  viewPublishUpdateSurveyByAdmin(survey_id: number) {
    this.acceptdenyService.viewPublishUpdateSurveyByAdmin(survey_id, 'web');
  }

  viewDenyPublishSurveyByAdmin(survey_id: number) {
    this.acceptdenyService.viewDenyPublishSurveyByAdmin(survey_id);
  }

  viewApprovePublishRoomByAdmin(room_id: number) {
    this.acceptdenyService.viewApprovePublishRoomByAdmin(room_id, 'web');
  }

  viewApproveUpdateRoomByAdmin(room_id: number) {
    this.acceptdenyService.viewApproveUpdateRoomByAdmin(room_id, 'web');
  }

  viewDenyPublishRoomByAdmin(room_id: number) {
    this.acceptdenyService.viewDenyPublishRoomByAdmin(room_id);
  }

  viewDenyPublishEventByAdmin(event_id: number) {
    this.acceptdenyService.viewDenyPublishRoomByAdmin(event_id);
  }

  viewApprovePublishEventByAdmin(event_id: number) {
    this.acceptdenyService.viewApprovePublishEventByAdmin(event_id, 'web');
  }

  viewApproveUpdateEventByAdmin(event_id: number) {
    this.acceptdenyService.viewApproveUpdateEventByAdmin(event_id, 'web');
  }

  viewUpdateEvent(event_id: number) {
    this.acceptdenyService.viewUpdateEvent(event_id, 'web');
  }

  viewDenyPublishCourseByAdmin(course_id: number) {
    this.acceptdenyService.viewDenyPublishCourseByAdmin(course_id);
  }

  viewApprovePublishCourseByAdmin(course_id: number) {
    this.acceptdenyService.viewApprovePublishCourseByAdmin(course_id, 'web');
  }

  viewApproveUpdateCourseByAdmin(course_id: number) {
    this.acceptdenyService.viewApproveUpdateCourseByAdmin(course_id, 'web');
  }

  viewUpdateCourse(course_id: number) {
    this.acceptdenyService.viewUpdateCourse(course_id, 'web');
  }

  viewInternalCourse(course_id: number) {
    this.acceptdenyService.viewInternalCourse(course_id, 'web');
  }

  viewInternalUpdateCourse(course_id: number) {
    this.acceptdenyService.viewInternalUpdateCourse(course_id, 'web');
  }

  viewJoinedCourse(course_id: number) {
    this.acceptdenyService.viewJoinedCourse(course_id, 'web');
  }

  uploadFile(event: Event) {
    let userId: string = localStorage.getItem('user-id');
    this.documentForm = new UntypedFormGroup({
      add_calendar: new UntypedFormControl(''),
      author: new UntypedFormControl(userId),
      event_type: new UntypedFormControl('', Validators.required),
    });
    const file: File = (event.target as HTMLInputElement).files[0];
    const mimeType: string = file.type;
    this.documentForm.patchValue({
      add_calendar: file,
    });
    this.documentForm.get('add_calendar').updateValueAndValidity();
    this.insertDoc(file);
    setTimeout(() => {
      this._router.navigate(['/web/dashboard']);
      this.authService.setLoader(false);
    }, 3000);
  }

  insertDoc(doc: File) {
    var formData: FormData = new FormData();
    for (const key in this.documentForm.value) {
      if (Object.prototype.hasOwnProperty.call(this.documentForm.value, key)) {
        const element = this.documentForm.value[key];
        if (key == 'add_calendar') {
          formData.append('file', element);
        } else {
          if (key != 'add_calendar') {
            formData.append(key, element);
          }
        }
      }
    }
    this.authService.setLoader(true);
    this.authService.memberSendRequest('post', 'update-calendar', formData).subscribe((respData: any) => {
      this.authService.setLoader(false);
      this.responseMessage = respData;
      this.tostrNotificationService.showSuccess(this.responseMessage, null);

      if (respData['code'] == 400) {
        this.responseMessage = respData['message'];
        this.tostrNotificationService.showError(this.responseMessage, null);
      }
    });
  }

  chats() {
    this.totalUnreadChats = 0;
    if (!this.userDetails.isMember_light && !this.userDetails.isMember_light_admin) {
      this.authService.memberSendRequest('get', 'get-usersgroup-chat/' + this.userDetails.userId, '').subscribe((resp: any) => {
        this.chatUserArr = resp;
        let grp: any;
        if (this.chatUserArr && this.chatUserArr.length > 0) {
          this.chatUserArr.forEach(element => {
            this.totalUnreadChats += element.count;
          });
        }
      });
    }
  }

  uploadImage() {
    $('#profileImagepPopup').modal('show');
    $('#profileSpinnerHeader').hide();
  }

  closeImagePopup() {
    this.croppedImage = '';
    this.imageChangedEvent = null;
    $('.preview_txt').hide();
    $('.preview_txt').text('');
    $('#profileImagepPopup').modal('hide');
    $('#profileSpinnerHeader').hide();
  }

  /**
   * Function is used to validate file type is image and upload images
   * @author  MangoIt Solutions
   * @param   {}
   * @return  error message if file type is not image or application or text
   */
  errorImage: any = { isError: false, errorMessage: '' };
  uploadFileEvt1(event: Event) {
    var file: File = (event.target as HTMLInputElement).files[0];
    if (file) {
      const mimeType: string = file.type;
      if (mimeType.match(/image\/*/) == null) {
        this.errorImage = { isError: true, errorMessage: this.language.error_message.common_valid };
        this.croppedImage = '';
        this.imageChangedEvent = null;
        $('.preview_txt').hide();
        $('.preview_txt').text('');
        setTimeout(() => {
          this.errorImage = { isError: false, errorMessage: '' };
        }, 3000);
      } else {
        this.errorImage = { isError: false, errorMessage: '' };
        this.fileChangeEvent(event);
      }
    }
  }

  fileChangeEvent(event: any): void {
    if (event && event.type == 'change') {
      this.croppedImage = '';
      this.imageChangedEvent = null;
      $('.preview_txt').hide();
      $('.preview_txt').text('');
      this.isImage = true;
    }
    this.imageChangedEvent = event;
    const file = (event.target as HTMLInputElement).files[0];
    var mimeType: string = file.type;
    if (mimeType.match(/image\/*/) == null) {
      this.errorImage = { isError: true, errorMessage: this.language.error_message.common_valid };
    }
  }

  /**
   * Function is used to cropped and compress the uploaded image
   * @author  MangoIt Solutions
   * @param   {}
   * @return  {object} file object
   */
  imageCropped(event: ImageCroppedEvent) {
    this.imageCompress
      .compressFile(event.base64, -1, 50, 50, 100, 100) // 50% ratio, 50% quality
      .then(compressedImage => {
        this.croppedImage = compressedImage;
      });
  }

  imageLoaded() {}

  cropperReady() {
    /* cropper ready */
    this.isImage = false;
  }

  loadImageFailed() {
    /* show message */
  }

  reloadCurrentRoute() {
    let currentUrl: string = this._router.url;
    this._router.navigate([currentUrl]);
  }

  /**
   * Function is used to changed user profile Image
   * M-Date: 03 Feb 2023
   * @author  MangoIt Solutions (T)
   * @param   {}
   * @return  {object} user details
   */
  changeImage() {
    if (this.croppedImage) {
      $('#profileSpinnerHeader').show();
      let data = {
        image_file: this.croppedImage.split('base64,')[1],
      };

      this.authService.memberSendRequest('post', 'change-profile-picture/', data).subscribe((respData: any) => {
        this.memberPhotosuccess = respData;
        if (this.memberPhotosuccess === 'OK') {
          this.themes.getProfilePicture(this.memberPhotosuccess);
          this.tostrNotificationService.showSuccess(this.language.profile.upload_profile, 'Success');

          setTimeout(() => {
            this.croppedImage = '';
            $('#profileImagepPopup').modal('hide');
            $('#profileSpinnerHeader').hide();
            this.croppedImage = '';
            this.imageChangedEvent = null;
            $('.preview_txt').hide();
            $('.preview_txt').text('');
          }, 2000);
        } else if (respData['code'] == 400) {
          $('#profileSpinnerHeader').hide();
          this.tostrNotificationService.showError(this.language.community_messages.code_error, 'Error');
        }
      });
    } else {
      this.tostrNotificationService.showError(this.language.profile.upload_pic, 'Error');
    }
  }

  isVisible: boolean = false;
  showDropdown() {
    if (!this.isVisible) this.isVisible = true;
    else this.isVisible = false;
  }

  showMenu: boolean = false;
  onOpen() {
    let el: HTMLCollectionOf<Element> = document.getElementsByClassName('sidebar');
    if (!this.showMenu) {
      this.showMenu = true;
      el[0].className = 'sidebar open';
    } else {
      this.showMenu = false;
      el[0].className = 'sidebar';
    }
  }

  showToggle: boolean = false;
  onShow() {
    let el: HTMLCollectionOf<Element> = document.getElementsByClassName('navbar-collapse');
    if (!this.showToggle) {
      this.showToggle = true;
      el[0].className = 'navbar-collapse show';
    } else {
      this.showToggle = false;
      el[0].className = 'navbar-collapse';
    }
  }

  logout() {
    this.authService.sendRequest('put', 'setLoginStatus/' + this.userDetails.userId, null).subscribe(resp => {
      if (resp['isError'] == false) {
        sessionStorage.clear();
        localStorage.clear();
        this._router.navigate(['/login']);

        setTimeout(() => {
          window.location.reload();
        }, 300);
      } else if (resp['code'] == 400) {
        // this.notificationService.showError(resp['message'], 'Error');
      }
    });
  }

  goToProfile() {
    this.showDropdown();
    this._router.navigate(['/web/profile']);
  }

  ngOnDestroy(): void {
    clearInterval(this.getNotificationInterval);
    this.activatedSub.unsubscribe();
    this.activatedPro.unsubscribe();
    this.refreshPage.unsubscribe();
    this.denyRefreshPage.unsubscribe();
    this.removeUpdate.unsubscribe();
    this.activatedHeadline.unsubscribe();
  }
}
