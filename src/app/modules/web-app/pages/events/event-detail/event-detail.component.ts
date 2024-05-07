import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Location } from '@angular/common';
import { Subscription } from 'rxjs';
import { SafeUrl } from '@angular/platform-browser';
import { saveAs } from 'file-saver';
import { LoginDetails, ParticipateAccess, ProfileDetails, TaskCollaboratorDetails, ThemeType, UserAccess } from '@core/models';
import { AuthService, CommonFunctionService, LanguageService, NotificationService, ThemeService, AcceptdenyService } from '@core/services';
import { ConfirmDialogService, DenyReasonConfirmDialogService, UpdateConfirmDialogService } from '@shared/components';
import { filter } from 'rxjs/operators';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import { io, Socket } from 'socket.io-client';
import { environment } from '@env/environment';
import { appSetting } from '@core/constants';

declare var $: any;
@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'app-event-detail',
  templateUrl: './event-detail.component.html',
  styleUrls: ['./event-detail.component.css'],
})
export class EventDetailComponent implements OnInit, OnDestroy {
  language: any;
  eventDetails: any = null;
  showImage: boolean = false;
  showUpdateImage: boolean = false;
  displayError: boolean = false;
  setTheme: ThemeType;
  organizerDetails: { email: string; firstname: string; id: number; image: SafeUrl; lastname: string; member_id: number }[] = [];
  unapprovedParticipants: { email: string; firstname: string; id: number; image: SafeUrl; lastname: string; member_id: number }[] = [];
  approvedParticipants: { email: string; firstname: string; id: number; image: SafeUrl; lastname: string; member_id: number }[] = [];
  memImg: { email: string; firstname: string; id: number; image: SafeUrl; lastname: string; member_id: number }[] = [];
  member_id: number;
  un_id: number;
  profile_data: ProfileDetails;
  memberStartDateStatus: Date;
  birthdateStatus: boolean;
  getclubInfo: ProfileDetails;
  thumbnail: string;
  alluserInformation: { member_id: number }[] = [];
  thumb: SafeUrl;
  docFile: string;
  fileArray: string[] = [];
  updateFileArray: string[] = [];
  imageurl: string;
  updateImageurl: string;
  userDetails: LoginDetails;
  role: any;
  userId: any;
  private activatedSub: Subscription;
  updateEventData: any;
  private refreshPage: Subscription;
  private denyRefreshPage: Subscription;
  private removeUpdate: Subscription;
  collaborators: any[] = [];
  collaboratorDetails: TaskCollaboratorDetails[] = [];
  taskOrganizerDetails: any[] = [];
  taskOrganizerDetailsUpdated: any[] = [];
  count: number = 0;
  isTaskDetails: boolean = false;
  isTaskDetailsUpdate: boolean = false;
  responseMessage: any;
  countParti: number = 0;
  allUsers: any;
  eventId: any;
  eventDate: any;
  result: any;
  documentData: any;
  dowloading: boolean = false;
  approvedParticipantsNew: any[] = [];
  deniedParticipants: any[] = [];

  selectedTask: any;
  invited: boolean = false;
  showParticipate: boolean = false;
  showAccept: boolean;
  showDeny: boolean;
  showDeny2: boolean;
  showParticipatebtn: boolean;
  socket: Socket;
  participateAccess: ParticipateAccess;
  userAccess: UserAccess;
  updateType: any = 0;
  updateDocFile: any;
  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private themes: ThemeService,
    private _location: Location,
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
      }, 2000);
    });

    this.denyRefreshPage = this.updateConfirmDialogService.denyDialogResponse.subscribe(resp => {
      setTimeout(() => {
        this.ngOnInit();
      }, 2000);
    });

    this.removeUpdate = this.denyReasonService.remove_deny_update.subscribe(resp => {
      setTimeout(() => {
        this.ngOnInit();
      }, 1000);
    });
  }

  ngOnInit(): void {
    this.socket = io(environment.serverUrl);
    this.userDetails = JSON.parse(localStorage.getItem('user-data'));

    if (localStorage.getItem('club_theme') != null) {
      let theme: ThemeType = JSON.parse(localStorage.getItem('club_theme'));
      this.setTheme = theme;
    }
    this.activatedSub = this.themes.club_theme.subscribe((resp: ThemeType) => {
      this.setTheme = resp;
    });

    this.eventId = this.route.snapshot.params.eventid;
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        untilDestroyed(this)
      )
      .subscribe((event: NavigationEnd) => {
        this.eventId = this.route.snapshot.params.eventid;
        this.getAllUserInfo();
      });

    this.role = this.userDetails.roles[0];
    this.userId = this.userDetails.userId;
    this.language = this.lang.getLanguageFile();
    this.userAccess = appSetting.role;
    this.participateAccess = this.userAccess[this.role].participate;
    this.getAllUserInfo();
    this.route.queryParams.subscribe(params => {
      this.eventDate = params.date;
    });
  }

  /**
   * Function to get all the Club Users
   * @author  MangoIt Solutions
   * @param   {}
   * @return  {Array Of Object} all the Users
   */
  getAllUserInfo() {
    this.authService.memberSendRequest('get', 'teamUsers/team/' + this.userDetails.team_id, null).subscribe((respData: any) => {
      if (respData?.length > 0) {
        this.alluserInformation = [];
        this.allUsers = respData;
        Object(respData).forEach((val, key) => {
          this.alluserInformation[val.id] = { member_id: val.member_id };
        });
        this.getEventDetails(this.eventId);
      }
    });
  }

  /**
   * Function to get particular Event Detail
   * Date: 14 Mar 2023
   * @author  MangoIt Solutions (R)
   * @param   {}
   * @return  {Array Of Object} Event all detail
   */
  getEventDetails(eventid: number) {
    if (sessionStorage.getItem('token')) {
      this.authService.setLoader(true);
      this.authService.memberSendRequest('get', 'get-event-by-id/' + eventid, null).subscribe((respData: any) => {
        if (respData['isError'] == false) {
          this.eventDetails = [];
          this.organizerDetails = [];
          this.approvedParticipants = [];
          this.unapprovedParticipants = [];
          this.authService.setLoader(false);
          this.updateEventData = null;
          this.eventDetails = respData['result'][0];

          this.eventDetails.date_from = this.eventDate ? this.eventDate + 'T' + this.eventDetails.date_from.split('T')[1] : this.eventDetails.date_from;
          this.eventDetails.recurring_dates = JSON.parse(this.eventDetails.recurring_dates);
          this.eventDetails.recurring_dates.forEach((element: any) => {
            element.start_time = this.commonFunctionService.convertTime(element.start_time);
            element.end_time = this.commonFunctionService.convertTime(element.end_time);
          });
          if (this.eventDate) {
            this.eventDetails.recurring_dates.unshift(
              this.eventDetails.recurring_dates.splice(
                this.eventDetails.recurring_dates.findIndex(elt => elt.date_from === this.eventDate),
                1
              )[0]
            );
          }
          if (this.eventDetails) {
            //to show or hide accept & deny button
            if (this.eventDetails?.eventUsers) {
              const currentUser = this.eventDetails.eventUsers.find(user => user.user_id === this.userDetails?.userId);
              if (currentUser && currentUser.approved_status === 0) {
                this.showAccept = true;
                this.showDeny = true;
              } else if (currentUser && currentUser.approved_status === 3) {
                this.showAccept = true;
                this.showDeny = false;
              } else if (currentUser && currentUser.approved_status === 4) {
                this.showParticipatebtn = true;
                this.showDeny2 = false;
              } else {
                this.showAccept = false;
                this.showDeny = false;
                this.showParticipatebtn = false;
                this.showDeny2 = false;
              }
            }

            //to show or hide participate & deny button
            const isUserNotPresent = !this.eventDetails?.eventUsers.some(user => user.user_id === this.userDetails?.userId);
            this.showParticipate = isUserNotPresent;
            if (this.showParticipate) {
              this.showParticipatebtn = true;
              this.showDeny2 = true;
            }

            if (this.eventDetails.image && this.eventDetails.image != '') {
              let tokenUrl = this.commonFunctionService.genrateImageToken(this.eventDetails?.id, 'event');
              this.eventDetails.token = { url: tokenUrl, isLoading: true, imageLoaded: false };
              this.commonFunctionService.loadImage(this.eventDetails.token);
              this.showImage = true;
              this.imageurl = tokenUrl;
            } else {
              this.showImage = false;
              this.imageurl = '';
            }

            if (this.eventDetails?.document && this.eventDetails?.document != '') {
              this.docFile = this.eventDetails?.document;
            }
            this.getOrganizerDetails(eventid);
            this.getParticipantDetails(eventid);

            if (this.eventDetails['author'] == JSON.parse(this.userDetails.userId) || this.userDetails.roles[0] == 'admin') {
              if (this.eventDetails['updated_record'] != null && this.eventDetails['updated_record'] != '') {
                this.updateEventData = JSON.parse(this.eventDetails['updated_record']);
                console.log(this.updateEventData);

                this.updateEventData['users'] = JSON.parse(this.updateEventData['users']);
                this.updateEventData['task'] = JSON.parse(this.updateEventData['task']);
                this.updateEventData['recurring_dates'] = JSON.parse(this.updateEventData['eventDate']);

                if (this.updateEventData?.image && this.updateEventData?.image != null) {
                  let updateTokenUrl = this.commonFunctionService.genrateImageToken(this.eventDetails.id, 'updateEvent');
                  this.updateEventData.token = { url: updateTokenUrl, isLoading: true, imageLoaded: false };
                  this.commonFunctionService.loadImage(this.updateEventData.token);
                }

                if (this.updateEventData?.document && this.updateEventData?.document != '') {
                  this.updateType = 1;
                  this.updateDocFile = this.updateEventData?.document;
                } else {
                  this.updateType = 0;
                  this.docFile = this.docFile;
                }

                if (this.updateEventData && this.updateEventData.users.length > 0) {
                  this.updateEventData.users.forEach(element => {
                    if (parseInt(element.user_id) != parseInt(this.eventDetails['author'])) {
                      if (this.allUsers?.length > 0) {
                        this.allUsers.forEach((el: any) => {
                          if (parseInt(el.id) == parseInt(element.user_id)) {
                            element.user = el;
                          }
                        });
                      }
                    }
                  });
                  this.updateEventData.users = Object.assign(this.authService.uniqueObjData(this.updateEventData.users, 'user_id'));
                  this.updateEventData.users = this.updateEventData.users.filter(item => item.user !== undefined);
                }
                if (this.updateEventData?.task?.length > 0) {
                  this.isTaskDetailsUpdate = true;
                  this.updateEventData?.task[0]?.taskCollaborators.forEach(element => {
                    // if (element.user_id != this.updateEventData[0]?.['organizer_id']) {
                    if (this.allUsers?.length > 0) {
                      this.allUsers.forEach((el: any) => {
                        if (el.id == element.user_id) {
                          element.user = el;
                        }
                      });
                    }
                    // }
                    if (element.user_id == this.updateEventData?.task[0]?.['organizer_id']) {
                      this.taskOrganizerDetailsUpdated.push(element);
                    }
                  });
                }

                if (this.updateEventData.room != 'null') {
                  this.commonFunctionService
                    .roomsById(this.updateEventData.room)
                    .then((resp: any) => {
                      this.updateEventData.roomData = resp;
                    })
                    .catch((erro: any) => {
                      this.notificationService.showError(erro, 'Error');
                    });
                }
              }
            }

            if (this.eventDetails && this.eventDetails.eventTask && Object.keys(this.eventDetails.eventTask).length != 0) {
              this.authService.memberSendRequest('get', 'getCollaboratorTask/task/' + this.eventDetails?.eventTask.id, null).subscribe((respData: any) => {
                if (respData && respData.length > 0) {
                  respData.forEach(ele => {
                    if (ele.user_id == this.userDetails.userId) {
                      this.countParti = 1;
                    }
                  });
                }
              });

              setTimeout(() => {
                if (this.eventDetails?.eventTask['organizer_id'] == this.userDetails.userId || this.userDetails.isAdmin == true || this.countParti == 1) this.isTaskDetails = true;
                this.setUsers(this.eventDetails?.eventTask?.id);
              }, 2000);
            }
          }
        } else if (respData['code'] == 400) {
          this.notificationService.showError(respData['message'], 'Error');
        }
        this.authService.setLoader(false);
      });
    }
  }

  /**
   * Function to get Organizer of particular Event
   * @author  MangoIt Solutions
   * @param   {CourseId}
   * @return  {Array Of Object} orgnizer detail
   */
  getOrganizerDetails(eventid: number) {
    if (sessionStorage.getItem('token')) {
      this.organizerDetails = [];
      this.approvedParticipants = [];
      this.unapprovedParticipants = [];
      this.authService.setLoader(true);
      this.authService.memberSendRequest('get', 'approvedParticipants/event/' + eventid, null).subscribe((respData: any) => {
        this.authService.setLoader(false);
        if (respData?.length > 0) {
          respData.forEach((value, key) => {
            if (this.eventDetails.author == value.users.id) {
              this.organizerDetails.push(value.users);
            } else {
              this.approvedParticipants.push(value);
            }
          });
          this.organizerDetails = Object.assign(this.authService.uniqueObjData(this.organizerDetails, 'id'));
          this.approvedParticipants = Object.assign(this.authService.uniqueObjData(this.approvedParticipants, 'id'));
          this.approvedParticipantsNew = this.approvedParticipants.filter((item: any) => item.approved_status === 1);
          this.deniedParticipants = this.approvedParticipants.filter((item: any) => item.approved_status === 3);
        }
      });
    }
  }

  /**
   * Function to get the participants of particular Event
   * @author  MangoIt Solutions
   * @param   {EventId}
   * @return  {Array Of Object} all the participants details
   */
  getParticipantDetails(eventid: number) {
    if (sessionStorage.getItem('token')) {
      this.unapprovedParticipants = [];
      this.memImg = [];
      let count = 0;
      this.authService.setLoader(true);
      this.authService.memberSendRequest('get', 'unapprovedParticipants/event/' + eventid, null).subscribe((respData: any) => {
        this.authService.setLoader(false);
        this.unapprovedParticipants = respData;
        if (this.unapprovedParticipants && this.unapprovedParticipants.length > 0) {
          this.unapprovedParticipants = Object.assign(this.authService.uniqueObjData(this.unapprovedParticipants, 'id'));
          if (this.eventDetails['approved_status'] == 1) {
            this.unapprovedParticipants.forEach((val, index) => {
              if (val.id == this.userId) {
                count = 1;
                if (val.id == this.userId && !(val.id == this.eventDetails['author'])) {
                  this.invited = true;
                }
              }
            });
          }
        }
        this.authService.setLoader(false);
      });
    }
  }

  /**
   * Function to get a particular tasks' details
   * @author MangoIt Solutions (M)
   * @param {user id}
   * @returns {Object} Details of the task
   */
  getTaskDetails(taskInfo: any) {
    this.selectedTask = taskInfo;
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

  deleteEvents(eventId: number) {
    this.acceptdenyService.unapprovedEvent(eventId, 'web');
  }

  deleteUpdateEvents(eventId: number) {
    this.acceptdenyService.deleteUpdateEvents(eventId, 'web');
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
  onShowTask() {
    let el: HTMLCollectionOf<Element> = document.getElementsByClassName('Task-toggle');
    if (!this.showToggle) {
      this.showToggle = true;
      el[0].className = 'Task-toggle show';
    } else {
      this.showToggle = false;
      el[0].className = 'Task-toggle';
    }
  }
  goBack() {
    this.router.navigate(['/web/organizer']);
  }

  /**
   * Function is used to set users participants
   * Date: 03 Feb 2023
   * @author  MangoIt Solutions (R)
   * @param   {TaskId}
   * @return  {Array Of Object} users all detail
   */
  setUsers(taskid: number) {
    if (sessionStorage.getItem('token')) {
      this.taskOrganizerDetails = [];
      this.collaborators = [];
      this.collaboratorDetails = [];
      this.authService.setLoader(true);
      this.authService.memberSendRequest('get', 'getCollaboratorTask/task/' + taskid, null).subscribe((respData: any) => {
        this.authService.setLoader(false);
        this.collaboratorDetails = respData;
        let org_id = 0;
        if (this.collaboratorDetails && this.collaboratorDetails.length > 0) {
          this.collaboratorDetails.forEach((value: any) => {
            if (value.user_id == this.eventDetails?.eventTask?.['organizer_id']) {
              this.taskOrganizerDetails.push(value);
              org_id = 1;
            } else {
              this.collaborators.push(value);
            }
          });
          this.collaborators = Object.assign(this.authService.uniqueObjData(this.collaborators, 'id'));
        }
      });
    }
  }

  /**
   * Function is used to make the task completed
   * Date: 03 Feb 2023
   * @author  MangoIt Solutions (R)
   * @param   {Taskid}
   * @return  {success and error message}
   */
  mainTaskMarkComplete(taskId: number) {
    var subtaskStatus: number = 0;
    if (this.eventDetails.eventTask['id'] == taskId) {
      this.confirmDialogService.confirmThis(
        this.language.confirmation_message.complete_task,
        () => {
          this.authService.setLoader(true);
          this.authService.memberSendRequest('get', 'approveTaskById/task/' + taskId, null).subscribe((respData: any) => {
            this.authService.setLoader(false);
            if (respData['isError'] == false) {
              this.notificationService.showSuccess(respData['result'], 'Success');
              setTimeout(() => {
                this.ngOnInit();
              }, 3000);
            } else if (respData['code'] == 400) {
              this.notificationService.showError(respData['result'], 'Error');
            }
          });
        },
        () => {
          $('#styled-checkbox-' + taskId).prop('checked', false);
        }
      );
    }
  }

  /**
   * Function is used to download document
   * @author  MangoIt Solutions
   * @param   {path}
   */
  download(path: any, type: any) {
    let data = {
      name: path,
      event_id: this.eventId,
      type: type,
    };
    this.dowloading = true;
    var endPoint = 'download-document';
    if (data && data.name) {
      let filename = data.name.split('/').reverse()[0];
      this.authService
        .downloadDocument('post', endPoint, data)
        .toPromise()
        .then((blob: any) => {
          saveAs(blob, filename);
          this.authService.setLoader(false);
          this.dowloading = false;
          setTimeout(() => {
            this.authService.sendRequest('post', 'delete-document/uploads', data).subscribe((result: any) => {
              this.result = result;
              this.authService.setLoader(false);
              if (this.result.success == false) {
                this.notificationService.showError(this.result['result']['message'], 'Error');
              } else if (this.result.success == true) {
                this.documentData = this.result['result']['message'];
              }
            });
          }, 7000);
        })
        .catch(err => {
          this.responseMessage = err;
        });
    }
  }

  /**
   * Function is used to accept the event by a participant
   * @author  MangoIt Solutions
   * @param   {eventId}
   * @return  {}
   */
  acceptEvent(eventId: number) {
    this.acceptdenyService.acceptInvitedEvent(eventId, 'web');
  }

  /**
   * Function is used to reject the event by a participant
   * @author  MangoIt Solutions
   * @param   {eventId}
   * @return  {}
   */
  rejectEvent(eventId: number) {
    this.acceptdenyService.denyInvitedEvent(eventId, 'web');
  }

  hasComma(str: string) {
    if (str) {
      return str.replace(/,/g, '.');
    } else {
      return str;
    }
  }

  ngOnDestroy(): void {
    this.refreshPage.unsubscribe();
    this.activatedSub.unsubscribe();
    this.denyRefreshPage.unsubscribe();
    this.removeUpdate.unsubscribe();
  }
}
