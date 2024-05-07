import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Location } from '@angular/common';
import { ClubDetail, LoginDetails, ProfileDetails, TaskCollaboratorDetails, ThemeType } from '@core/models';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { AuthService, CommonFunctionService, LanguageService, NotificationService, ThemeService, AcceptdenyService } from '@core/services';
import { ConfirmDialogService, DenyReasonConfirmDialogService, UpdateConfirmDialogService } from '@shared/components';
import { io, Socket } from 'socket.io-client';
import { environment } from '@env/environment';
import { filter } from 'rxjs/operators';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
declare var $: any;

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'app-task-detail',
  templateUrl: './task-detail.component.html',
  styleUrls: ['./task-detail.component.css'],
})
export class TaskDetailComponent implements OnInit, OnDestroy {
  language: any;
  displayError: boolean;
  userDetails: LoginDetails;
  setTheme: ThemeType;
  taskDetails: any = [];
  getclubInfo: ClubDetail;
  birthdateStatus: boolean;
  collaboratorDetails: TaskCollaboratorDetails[] = [];
  profile_data: ProfileDetails;
  memberStartDateStatus: Date;
  thumbnail: SafeUrl;
  thumb: SafeUrl;
  organizerDetails: any[] = [];
  collaborators: any[] = [];
  count: number = 0;
  updatedTaskData: any;
  UpdatedcollaboratorDetails: any[] = [];
  updatedOrganizerDetails: any[] = [];
  updatedCollaborators: any[] = [];
  task_id: number;
  subtaskCompleteStatus: number = 0;
  private activatedSub: Subscription;
  private refreshPage: Subscription;
  private denyRefreshPage: Subscription;
  private removeUpdate: Subscription;

  allUsers: any;
  taskId: number;
  socket: Socket;
  displayTask: boolean = false;
  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private themes: ThemeService,
    private updateConfirmDialogService: UpdateConfirmDialogService,
    private confirmDialogService: ConfirmDialogService,
    private lang: LanguageService,
    private denyReasonService: DenyReasonConfirmDialogService,
    private notificationService: NotificationService,
    private commonFunctionService: CommonFunctionService,
    private acceptdenyService: AcceptdenyService
  ) {
    this.userDetails = JSON.parse(localStorage.getItem('user-data'));

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

    this.taskId = this.route.snapshot.params.taskid;
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        untilDestroyed(this)
      )
      .subscribe((event: NavigationEnd) => {
        this.taskId = this.route.snapshot.params.taskid;
        this.getAllUserInfo();
      });
  }

  ngOnInit(): void {
    this.socket = io(environment.serverUrl);

    if (localStorage.getItem('club_theme') != null) {
      let theme: ThemeType = JSON.parse(localStorage.getItem('club_theme'));
      this.setTheme = theme;
    }

    this.activatedSub = this.themes.club_theme.subscribe((resp: ThemeType) => {
      this.setTheme = resp;
    });

    this.userDetails = JSON.parse(localStorage.getItem('user-data'));
    this.language = this.lang.getLanguageFile();
    this.getAllUserInfo();
  }

  /**
   * Function to get all the Club Users
   * @author  MangoIt Solutions
   * @param   {}
   * @return  {Array Of Object} all the Users
   */
  getAllUserInfo() {
    this.authService.memberSendRequest('get', 'teamUsers/team/' + this.userDetails.team_id, null).subscribe((respData: any) => {
      if (respData && respData.length > 0) {
        this.allUsers = respData;
      }
      this.getTaskDetails(this.taskId);
    });
  }

  /**
   * Function to get a task detail
   * @author  MangoIt Solutions
   * @param   {taskid}
   * @return  {Array Of Object} all the Users
   */
  getTaskDetails(taskid: number) {
    if (sessionStorage.getItem('token')) {
      this.authService.setLoader(true);
      this.authService.memberSendRequest('get', 'get-task-by-id/' + taskid, null).subscribe(
        (respData: any) => {
          this.authService.setLoader(false);
          this.taskDetails = null;
          if (respData['isError'] == false) {
            if (respData && respData['result'] && respData['result'][0]) {
              this.taskDetails = respData['result'][0];

              if (this.taskDetails?.image && this.taskDetails?.image != null) {
                let tokenUrl = this.commonFunctionService.genrateImageToken(this.taskDetails.id, 'task');
                this.taskDetails.token = { url: tokenUrl, isLoading: true, imageLoaded: false };
                this.commonFunctionService.loadImage(this.taskDetails.token);
              }

              if (this.taskDetails) {
                this.getOrganizerDetails(taskid);
              }
              if (this.taskDetails['subtasks']?.length > 0) {
                this.taskDetails['subtasks'].forEach(element => {
                  element.assigned_to = JSON.parse(element.assigned_to);
                  if (element.assigned_to.length > 0) {
                    element.assigned_to.forEach(elem => {
                      if (this.allUsers?.length > 0) {
                        this.allUsers.forEach(el => {
                          if (el.id == elem.user_id) {
                            elem.user = el;
                          }
                        });
                      }
                    });
                  }
                });
              }

              if (this.taskDetails['organizer_id'] == this.userDetails.userId || this.userDetails.roles[0] == 'admin') {
                this.UpdatedcollaboratorDetails = [];
                this.updatedCollaborators = [];
                this.UpdatedcollaboratorDetails = [];
                this.updatedTaskData = null;
                if (this.taskDetails['updated_record'] != null && this.taskDetails['updated_record'] != '') {
                  this.updatedTaskData = JSON.parse(this.taskDetails?.['updated_record']);
                }

                if (this.updatedTaskData != null) {
                  if (this.updatedTaskData?.file && this.updatedTaskData?.file != null) {
                    let updateTokenUrl = this.commonFunctionService.genrateImageToken(this.taskDetails.id, 'updateTask');
                    this.updatedTaskData.file = { url: updateTokenUrl, isLoading: true, imageLoaded: false };
                    this.commonFunctionService.loadImage(this.updatedTaskData.file);
                  }

                  this.updatedTaskData.collaborators = JSON.parse(this.updatedTaskData.collaborators);

                  if (this.updatedTaskData['subtasks'] && this.updatedTaskData['subtasks'].length > 0) {
                    this.updatedTaskData.subtasks = JSON.parse(this.updatedTaskData.subtasks);
                    if (this.updatedTaskData && this.updatedTaskData['subtasks'].length > 0) {
                      this.updatedTaskData['subtasks'].forEach(element => {
                        if (element.assigned_to) {
                          element.assigned_to.forEach(elem => {
                            if (this.allUsers?.length > 0) {
                              this.allUsers.forEach(el => {
                                if (el.id == elem.user_id) {
                                  elem.user = el;
                                }
                              });
                            }
                          });
                        }
                      });
                    }
                  }
                  if (this.updatedTaskData && this.updatedTaskData.collaborators.length > 0) {
                    this.updatedTaskData.collaborators.forEach(element => {
                      this.UpdatedcollaboratorDetails.push(element);
                      if (this.UpdatedcollaboratorDetails) {
                        if (this.UpdatedcollaboratorDetails && this.UpdatedcollaboratorDetails.length > 0) {
                          this.UpdatedcollaboratorDetails.forEach(elem => {
                            if (this.allUsers?.length > 0) {
                              this.allUsers.forEach(el => {
                                if (el.id == elem.user_id) {
                                  elem.user = el;
                                }
                              });
                            }
                          });
                        }
                      }
                    });
                  }
                  let org_id = 0;
                  this.updatedOrganizerDetails = [];
                  if (this.UpdatedcollaboratorDetails && this.UpdatedcollaboratorDetails.length > 0) {
                    this.UpdatedcollaboratorDetails.forEach((value: any) => {
                      if (value.user_id == this.updatedTaskData['organizer_id']) {
                        this.updatedOrganizerDetails.push(value);
                        org_id = 1;
                      } else {
                        this.updatedCollaborators.push(value);
                      }
                    });
                  }
                  this.updatedOrganizerDetails = Object.assign(this.authService.uniqueObjData(this.updatedOrganizerDetails, 'id'));
                }
              }
            }
          } else if (respData['code'] == 400) {
            this.notificationService.showError(respData['message'], 'Error');
          }
        },
        error => {
          if (window.innerWidth < 768) {
            this.router.navigate(['/mobile/tasks/organizer-task']);
          } else {
            this.router.navigate(['/web/tasks/organizer-task']);
          }
        }
      );
    }
  }

  /**
   * Function to get the details of the organizer of the task
   * @author  MangoIt Solutions
   * @param   {groupId, Group Name}
   * @return  {}
   */
  getOrganizerDetails(taskid: number) {
    if (sessionStorage.getItem('token')) {
      this.organizerDetails = [];
      this.collaborators = [];
      this.collaboratorDetails = [];
      this.authService.setLoader(true);
      this.authService.memberSendRequest('get', 'getTaskCollaborator/task/' + taskid, null).subscribe((respData: any) => {
        this.authService.setLoader(false);
        if (respData && respData.length > 0) {
          this.collaboratorDetails = respData;
          var org_id = 0;
          Object(this.collaboratorDetails).forEach((val, key) => {
            if (val.user_id == this.taskDetails['organizer_id']) {
              this.organizerDetails.push(val);
              org_id = 1;
            } else {
              this.collaborators.push(val);
            }
          });
          this.organizerDetails = Object.assign(this.authService.uniqueObjData(this.organizerDetails, 'id'));
          this.collaborators = Object.assign(this.authService.uniqueObjData(this.collaborators, 'id'));
        }
      });
    }
  }

  /**
   * Function to approve task by Admin
   * @author  MangoIt Solutions
   * @param   {taskId}
   * @return  {}
   */
  adminApprovedTasks(taskId: number) {
    this.acceptdenyService.adminApprovedTasks(taskId, 'web');
  }

  /**
   * Function to approve updated task by Admin
   * @author  MangoIt Solutions
   * @param   {taskId}
   * @return  {}
   */
  adminApprovedUpdateTasks(taskId: number) {
    this.acceptdenyService.adminApprovedUpdateTasks(taskId, 'web');
  }

  /**
   * Function to Unapprove task by Admin
   * @author  MangoIt Solutions
   * @param   {taskId}
   * @return  {}
   */
  adminUnapprovedTasks(taskId: number) {
    this.acceptdenyService.adminUnapprovedTasks(taskId, 'web');
  }

  /**
   * Function for delete the Task
   * @author  MangoIt Solutions
   * @param   {taskId}
   * @return  {}
   */
  deleteTask(taskId: number) {
    this.acceptdenyService.deleteTask(taskId, 'web');
  }

  /**
   * Function for delete the updated Task
   * @author  MangoIt Solutions
   * @param   {taskId}
   * @return  {}
   */
  deleteUpdateTask(taskId: number) {
    this.acceptdenyService.deleteUpdateTask(taskId, 'web');
  }

  /**
   * Function for the completion of Subtask
   * @author  MangoIt Solutions
   * @param   {subTaskid}
   * @return  {}
   */
  eventMarkComplete(subtaskId: number) {
    if (this.taskDetails['subtasks'] && this.taskDetails['subtasks'].length > 0) {
      this.taskDetails['subtasks'].forEach(element => {
        if (element.id == subtaskId) {
          if (element.assigned_to && element.assigned_to.length > 0) {
            element.assigned_to.forEach(elem => {
              if (elem.user_id == this.userDetails.userId || this.taskDetails['organizer_id'] == this.userDetails.userId || this.userDetails.roles[0] == 'admin') {
                this.count = 1;
              } else {
                if (this.collaborators && this.collaborators.length > 0) {
                  this.collaborators.forEach((el: any) => {
                    if (el.user_id == this.userDetails.userId) {
                      this.count = 1;
                    }
                  });
                }
              }
            });
          }
          if (this.count == 1) {
            this.confirmDialogService.confirmThis(
              this.language.confirmation_message.complete_task,
              () => {
                this.authService.memberSendRequest('get', 'complete-subtask-by-id/' + subtaskId, null).subscribe((respData: any) => {
                  this.collaboratorDetails = [];
                  this.ngOnInit();
                });
              },
              () => {
                $('#styled-checkbox-' + subtaskId).prop('checked', false);
              }
            );
            this.count = 0;
          } else {
            $('#styled-checkbox-' + subtaskId).prop('checked', false);
            $('#subtask2').modal('toggle');
          }
        }
      });
    }
  }

  /**
   * Function for the completion of Main Task
   * @author  MangoIt Solutions
   * @param   {taskId}
   * @return  {}
   */
  mainTaskMarkComplete(taskId: number) {
    this.task_id = taskId;
    var subtaskStatus: number = 0;
    if (this.taskDetails['id'] == taskId) {
      this.authService.memberSendRequest('get', 'getTaskCollaborator/task/' + taskId, null).subscribe((respData: any) => {
        if (respData && respData.length > 0) {
          respData.forEach(ele => {
            if (ele.user_id == this.userDetails.userId) {
              this.count = 1;
            }
          });
        }
      });
      setTimeout(() => {
        if (this.taskDetails['organizer_id'] == this.userDetails.userId || this.userDetails.roles[0] == 'admin' || this.count == 1) {
          if (this.taskDetails['subtasks'] && this.taskDetails['subtasks'].length > 0)
            this.taskDetails['subtasks'].forEach(element => {
              if (element.status == 0) {
                subtaskStatus = 1;
              }
            });
          if (subtaskStatus == 0) {
            this.confirmDialogService.confirmThis(
              this.language.confirmation_message.complete_task,
              () => {
                this.authService.setLoader(true);
                this.authService.memberSendRequest('get', 'approveTaskById/task/' + taskId, null).subscribe((respData: any) => {
                  this.authService.setLoader(false);
                  if (respData['isError'] == false) {
                    this.notificationService.showSuccess(respData['result'], 'Success');
                    this.ngOnInit();
                  } else if (respData['code'] == 400) {
                    this.notificationService.showError(respData['message'], 'Error');
                  }
                });
              },
              () => {
                $('#styled-checkbox-' + taskId).prop('checked', false);
              }
            );
          } else {
            $('#styled-checkbox-' + taskId).prop('checked', false);
            $('#subtask').modal('toggle');
          }
        } else {
          $('#styled-checkbox-' + taskId).prop('checked', false);
          $('#subtask1').modal('toggle');
        }
      }, 100);
    }
  }

  /**
   * Function to check subtask completion
   * @author  MangoIt Solutions
   * @param   {subtask detail}
   * @return  {boolean} true or false
   */
  checkStatusToDo(arrayOfObject: any) {
    if (arrayOfObject && arrayOfObject.subtasks && arrayOfObject.subtasks.length > 0) {
      arrayOfObject.subtasks.forEach((element: { status: number }) => {
        if (element.status == 1) {
          this.subtaskCompleteStatus = 1;
        }
      });
    }
    if (this.subtaskCompleteStatus == 0) {
      return true;
    } else {
      return false;
    }
  }

  closeSubtaskModal() {
    $('#subtask2').modal('hide');
  }

  closeModal() {
    $('#subtask').modal('hide');
    $('#styled-checkbox-' + this.task_id).prop('checked', false);
  }

  closeModals() {
    $('#subtask1').modal('hide');
    $('#styled-checkbox-' + this.task_id).prop('checked', false);
  }

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

  goBack() {
    this.router.navigate(['/web/tasks/organizer-task']);
  }

  ngOnDestroy(): void {
    this.activatedSub.unsubscribe();
    this.refreshPage.unsubscribe();
    this.denyRefreshPage.unsubscribe();
    this.removeUpdate.unsubscribe();
  }
}
