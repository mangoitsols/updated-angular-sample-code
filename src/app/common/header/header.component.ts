import { Component, HostBinding, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { appSetting } from '../../app-settings';
import { AuthServiceService } from '../../service/auth-service.service';
import { ConfirmDialogService } from '../../confirm-dialog/confirm-dialog.service';
import { LanguageService } from '../../service/language.service';

import { DomSanitizer } from '@angular/platform-browser';
declare var $ : any;

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  language;
  userDetails;
  userAccess;
  createAccess;
  participateAccess;
  authorizationAccess;
  groupNotifications;
  newsNotifications;
  eventsNotifications;
  invitedEventsNotifications;
  unapprovedGroups;
  taskNotifications;
  unapprovedTasks;
  messageNotifications;
  displayFlag = 'de';
  alluserDetails: any = [];
  getNotificationInterval;
  allNotification;
  userRespData;
  thumbnail = null;

  responseMessage = null;
  memberPhotosuccess;


  constructor(private _router: Router, private authService: AuthServiceService, private confirmDialogService: ConfirmDialogService,
    private lang: LanguageService, private sanitizer: DomSanitizer) { }

  ngOnInit(): void {
    this.displayFlag = localStorage.getItem('language');
    this.language = this.lang.getLanguaageFile();

    this.userDetails = JSON.parse(localStorage.getItem('user-data'));

    this.getUserImage();

    let userRole = this.userDetails.roles[0];
    
    this.userAccess = appSetting.role;
    
    this.createAccess = this.userAccess[userRole].create;
    this.participateAccess = this.userAccess[userRole].participate;
    this.authorizationAccess = this.userAccess[userRole].authorization;

    let self = this;
    this.authService.memberSendRequest('get', 'teamUsers/team/1', null)
      .subscribe(
        (respData: any) => {
          Object(respData).forEach((val, key) => {
            this.alluserDetails[val.id] = { firstname: val.firstname, lastname: val.lastname };
          })
          if (userRole == 'admin') {  
            self.getGroupNotifications();
            self.unapprovedUserGroups()
            self.getNewsNotifications();
            self.getTasksNotifications();
            self.getEventsNotifications();
            self.getInvitedEventsNotifications();
            self.getAllUnapprovedTasks();
            self.getMessageWaitingToApprove();
          } else {
            self.unapprovedUserGroups()
            self.getInvitedEventsNotifications();
            self.getAllUnapprovedTasks();
          }
        }
      );

    clearInterval(this.getNotificationInterval);
    this.getNotificationInterval = setInterval(() => {
      this.authService.memberSendRequest('get', 'teamUsers/team/1', null)
        .subscribe(
          (respData: any) => {
            Object(respData).forEach((val, key) => {
              this.alluserDetails[val.id] = { firstname: val.firstname, lastname: val.lastname };
            })
            if (userRole == 'admin') {
              self.getGroupNotifications();
              self.unapprovedUserGroups()
              self.getNewsNotifications();
              self.getTasksNotifications();
              self.getEventsNotifications();
              self.getInvitedEventsNotifications();
              self.getAllUnapprovedTasks();
              self.getMessageWaitingToApprove();
            } else {
              self.unapprovedUserGroups()
              self.getInvitedEventsNotifications();
              self.getAllUnapprovedTasks();
            }
          }
        );
    }, 30000);
  }

  ngOnDestroy() {
    clearInterval(this.getNotificationInterval);
  }

  getUserImage() {
    if (sessionStorage.getItem('token')) {
      let userData = JSON.parse(localStorage.getItem('user-data'));
      this.authService.setLoader(true);
      this.authService.memberInfoRequest('get', 'member-photo?database_id=' + userData.database_id + '&club_id=' + userData.team_id + '&member_id=' + userData.member_id, null)
        .subscribe(
          (respData: any) => {
            
            this.authService.setLoader(false);
            if (respData['code'] == 400) {
              this.responseMessage = respData['message'].message;
            }else{
              this.userRespData = respData;
              this.thumbnail = this.sanitizer.bypassSecurityTrustUrl(respData.changingThisBreaksApplicationSecurity);
            }
          }
        );
    }
  }
  uploadFileEvt1(event){

    const file = (event.target as HTMLInputElement).files[0];


    const mimeType = file.type;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    var url;
    reader.onload = (_event) => {
      url = reader.result;
 
      if (mimeType.match(/image\/*/)) {
        $('.preview_img').attr('src', url);
      } else {
        $('.preview_img').attr('src', 'assets/img/doc-icons/chat_doc_ic.png');
      }

      let data = {
        "image_file": url.split('base64,')[1]
      }
      this.authService.setLoader(true);
      let self = this;
      this.authService.memberSendRequest('post','change-profile-picture/',data)
        .subscribe(
          (respData: JSON) => {
            this.authService.setLoader(false);
            this.memberPhotosuccess = respData; 
            if (respData['code'] == 400) {
              this.responseMessage = "Something went Wrong, Please do after sometime.";
            }
            else{
              self.reloadCurrentRoute();
              setTimeout(function () {
                self.getUserImage()
              }, 2000);              
          }       
        });
    }

    $('.message-upload-list').show();
    $('.preview_txt').show();
    $('.preview_txt').text(file.name);   
    
  }

  reloadCurrentRoute() {
    let currentUrl = this._router.url;

    this._router.navigateByUrl('/', {skipLocationChange: true}).then(() => {
        this._router.navigate([currentUrl]);
    });
  }


  isVisible: boolean = false;
  showDropdown() {
    if (!this.isVisible)
      this.isVisible = true;
    else
      this.isVisible = false;
  }

  showMenu: boolean = false;
  onOpen() {
    let el = document.getElementsByClassName("sidebar");
    if (!this.showMenu) {
      this.showMenu = true;
      el[0].className = "sidebar open";
    }
    else {
      this.showMenu = false;
      el[0].className = "sidebar";
    }
  }

  showToggle: boolean = false;
  onShow() {
    let el = document.getElementsByClassName("navbar-collapse");
    if (!this.showToggle) {
      this.showToggle = true;
      el[0].className = "navbar-collapse show";
    }
    else {
      this.showToggle = false;
      el[0].className = "navbar-collapse";
    }
  }

  logout() {
    sessionStorage.clear();
    localStorage.clear();
    this._router.navigate(["/login"]);
  }

  goToProfile() {
    this.showDropdown();
    this._router.navigate(["/profile"]);
  }

  getGroupNotifications() {
    this.authService.memberSendRequest('get', 'get-group-requests', null)
      .subscribe(
        (respData: any) => {
          this.groupNotifications = respData;
          this.allNotification
        }
      );
  }

  getNewsNotifications() {
    this.authService.memberSendRequest('get', 'get-unapproved-news', null)
      .subscribe(
        (respData: any) => {
          this.newsNotifications = respData;
        }
      )
  }

  getEventsNotifications() {
    this.authService.memberSendRequest('get', 'get-unapproved-events', null)
      .subscribe(
        (respData: any) => {
          this.eventsNotifications = respData;
        }
      )
  }

  getInvitedEventsNotifications() {
    let userId = localStorage.getItem('user-id');
    this.authService.memberSendRequest('get', 'unapprovedEvents/user/' + userId, null)
      .subscribe(
        (respData: any) => {
          this.invitedEventsNotifications = respData;
        }
      )
  }

  unapprovedUserGroups() {
    let userId = localStorage.getItem('user-id');
    this.authService.memberSendRequest('get', 'unapprovedUserGroups/user/' + userId, null)
      .subscribe(
        (respData: any) => {
          this.unapprovedGroups = respData;
        }
      );
  }

  getTasksNotifications() {
    this.authService.memberSendRequest('get', 'get-approval-tasks-for-admin', null)
      .subscribe(
        (respData: any) => {
          this.taskNotifications = respData;
        }
      )
  }

  getAllUnapprovedTasks() {
    let userId = localStorage.getItem('user-id');
    this.authService.memberSendRequest('get', 'getAllUnapprovedTasks/user/' + userId, null)
      .subscribe(
        (respData: any) => {
          this.unapprovedTasks = respData;
        }
      );
  }

  getMessageWaitingToApprove() {
    this.authService.memberSendRequest('get', 'message/waiting-to-approve', null)
      .subscribe(
        (respData: any) => {
          this.messageNotifications = respData;
        }
      );
  }


  joinGroup(groupId, userId) {
    let self = this;
    this.confirmDialogService.confirmThis(this.language.confirmation_message.accept_group, function () {
      let postData = {
        "participants": {
          "group_id": groupId,
          "user_id": userId,
          "approved_status": 1
        }
      };
      self.authService.memberSendRequest('put', 'acceptGroup/user/' + userId + '/group_id/' + groupId, postData)
        .subscribe(
          (respData: any) => {
            self.ngOnInit();
            window.location.reload();
          }
        )
    }, function () {
    })
  }

  denyGroup(groupId, userId) {
    let self = this;
    this.confirmDialogService.confirmThis(this.language.confirmation_message.deny_group, function () {
      self.authService.memberSendRequest('delete', 'denyGroup/user/' + userId + '/group_id/' + groupId, null)
        .subscribe(
          (respData: any) => {
            self.ngOnInit();
            window.location.reload();
          }
        )
    }, function () {
    })
  }

  acceptNews(newsId) {
    let self = this;
    this.confirmDialogService.confirmThis(this.language.confirmation_message.publish_article, function () {
      let postData = {
        "approved_statud": 1
      };
      self.authService.memberSendRequest('get', 'approve-news-by-id/' + newsId, null)
        .subscribe(
          (respData: any) => {
            self.ngOnInit();
            window.location.reload();
          }
        )
    }, function () {
    })
  }

  denyNews(newsId) {
    let self = this;
    this.confirmDialogService.confirmThis(this.language.confirmation_message.deny_article, function () {
      let postData = {
        "approved_statud": 0
      };
      self.authService.memberSendRequest('post', 'news/' + newsId, postData)
        .subscribe(
          (respData: any) => {
            self.ngOnInit();
            window.location.reload();
          }
        )
    }, function () {
    })
  }

  acceptInvitedEvent(eventId) {
    let self = this;
    let userId = localStorage.getItem('user-id');
    this.confirmDialogService.confirmThis(this.language.confirmation_message.accept_event_invitation, function () {
      self.authService.memberSendRequest('put', 'acceptEvent/user/' + userId + '/event_id/' + eventId, null)
        .subscribe(
          (respData: any) => {
            self.ngOnInit();
            window.location.reload();
          }
        )
    }, function () {
    })
  }

  denyInvitedEvent(eventId) {
    let self = this;
    let userId = localStorage.getItem('user-id');
    this.confirmDialogService.confirmThis(this.language.confirmation_message.deny_event_invitation, function () {
      self.authService.memberSendRequest('delete', 'denyEvent/user/' + userId + '/event_id/' + eventId, null)
        .subscribe(
          (respData: any) => {
            self.ngOnInit();
            window.location.reload();
          }
        )
    }, function () {
    })
  }

  approvedEvents(eventId) {
    let self = this;
    let userId = localStorage.getItem('user-id');
    this.confirmDialogService.confirmThis(this.language.confirmation_message.approved_event, function () {
      self.authService.memberSendRequest('get', 'set-approve-status/' + eventId, null)
        .subscribe(
          (respData: any) => {
            self.ngOnInit();
            window.location.reload();
          }
        )
    }, function () {
    })
  }

  unapprovedEvent(eventId) {
    let self = this;
    let userId = localStorage.getItem('user-id');
    this.confirmDialogService.confirmThis(this.language.confirmation_message.unapproved_event, function () {
      self.authService.memberSendRequest('delete', 'unapprovedParticipants/event/' + eventId, null)
        .subscribe(
          (respData: any) => {
            self.ngOnInit();
            window.location.reload();
          }
        )
    }, function () {
    })
  }

  adminApprovedTasks(taskId) {
    let self = this;
    let userId = localStorage.getItem('user-id');
    this.confirmDialogService.confirmThis(this.language.confirmation_message.approved_task, function () {
      self.authService.memberSendRequest('get', 'approve-task-as-admin/' + taskId, null)
        .subscribe(
          (respData: any) => {
            self.ngOnInit();
            window.location.reload();
          }
        )
    }, function () {
    })
  }

  adminUnapprovedTasks(taskId) {
    let self = this;
    let userId = localStorage.getItem('user-id');
    this.confirmDialogService.confirmThis(this.language.confirmation_message.unapproved_task, function () {
      self.authService.memberSendRequest('delete', 'DeleteTask/' + taskId, null)
        .subscribe(
          (respData: any) => {
            self.ngOnInit();
            window.location.reload();
          }
        )
    }, function () {
    })
  }

  acceptInvitedTask(taskId) {
    let self = this;
    let userId = localStorage.getItem('user-id');
    this.confirmDialogService.confirmThis(this.language.confirmation_message.unapproved_event, function () {
      self.authService.memberSendRequest('put', 'acceptTask/user/' + userId + '/task_id/' + taskId, null)
        .subscribe(
          (respData: any) => {
            self.ngOnInit();
            window.location.reload();
          }
        )
    }, function () {
    })
  }

  denyInvitedTask(taskId) {
    let self = this;
    let userId = localStorage.getItem('user-id');
    this.confirmDialogService.confirmThis(this.language.confirmation_message.unapproved_event, function () {
      self.authService.memberSendRequest('delete', 'denyTask/user/' + userId + '/task_id/' + taskId, null)
        .subscribe(
          (respData: any) => {
            self.ngOnInit();
            window.location.reload();
          }
        )
    }, function () {
    })
  }

  acceptGroup(groupId) {
    let self = this;
    let userId = localStorage.getItem('user-id');
    this.confirmDialogService.confirmThis(this.language.confirmation_message.accept_group, function () {
      let postData = {
        "participants": {
          "group_id": groupId,
          "user_id": userId,
          "approved_status": 1
        }
      };
      self.authService.memberSendRequest('put', 'acceptGroup/user/' + userId + '/group_id/' + groupId, postData)
        .subscribe(
          (respData: any) => {
            self.ngOnInit();
            window.location.reload();
          }
        )
    }, function () {
    })
  }

  rejectGroup(groupId) {
    let self = this;
    let userId = localStorage.getItem('user-id');
    this.confirmDialogService.confirmThis(this.language.confirmation_message.deny_group, function () {
      self.authService.memberSendRequest('delete', 'denyGroup/user/' + userId + '/group_id/' + groupId, null)
        .subscribe(
          (respData: any) => {
            self.ngOnInit();
            window.location.reload();
          }
        )
    }, function () {
    })
  }

  onLanguageSelect(lan: any) {
    localStorage.setItem('language', lan);
    window.location.reload();
  }

  acceptMessage(msgId, esdb_id) {
    let self = this;
    let userId = localStorage.getItem('user-id');
    this.confirmDialogService.confirmThis(this.language.confirmation_message.accept_msg, function () {
      self.authService.memberSendRequest('get', 'message/approve-message/' + esdb_id, null)
        .subscribe(
          (respData: any) => {
            self.ngOnInit();
            window.location.reload();
          }
        )
    }, function () {
    })
  }

  denyMessage(msgId, esdb_id) {
    let self = this;
    let userId = localStorage.getItem('user-id');
    this.confirmDialogService.confirmThis(this.language.confirmation_message.deny_msg, function () {
      self.authService.memberSendRequest('delete', 'message/deny-message/' + esdb_id, null)
        .subscribe(
          (respData: any) => {
            self.ngOnInit();
            window.location.reload();
          }
        )
    }, function () {
    })
  }


}


