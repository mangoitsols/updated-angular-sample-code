import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TaskCollaboratorDetails } from '@core/models';
import { AuthService, CommonFunctionService, LanguageService, NotificationService } from '@core/services';
import { ConfirmDialogService } from '@shared/components/confirm-dialog/confirm-dialog.service';
declare var $: any;

@Component({
  selector: 'app-task-detail-modal',
  templateUrl: './task-detail-modal.component.html',
  styleUrls: ['./task-detail-modal.component.css'],
})
export class TaskDetailModalComponent implements OnInit {
  user_id: string;
  language: any;
  userDetails: any;
  taskDetails: any = [];
  allUsers: any;
  organizerDetails: any[] = [];
  collaborators: any[] = [];
  collaboratorDetails: TaskCollaboratorDetails[] = [];
  count: number = 0;
  task_id: number;
  isChecked: boolean = false;
  @ViewChild('radioButton') radioButton: ElementRef;
  @ViewChild('radioButtonMain') radioButtonMain: ElementRef;
  checkedStates: { [key: number]: boolean } = {};
  checkedStatesMain: { [key: number]: boolean } = {};
  tasks: any[];
  selectedIndex: number;

  constructor(
    private authService: AuthService,
    private lang: LanguageService,
    private commonFunctionService: CommonFunctionService,
    private notificationService: NotificationService,
    private confirmDialogService: ConfirmDialogService,
    public dialogRef: MatDialogRef<TaskDetailModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.tasks = data.tasks;
    this.selectedIndex = data.selectedIndex;
  }

  ngOnInit(): void {
    this.language = this.lang.getLanguageFile();
    this.user_id = localStorage.getItem('user-id');
    this.userDetails = JSON.parse(localStorage.getItem('user-data'));
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
      this.getTaskDetails(this.data['task'].id);
    });
  }

  /**
   * Function to get a task detail
   * @author  MangoIt Solutions
   * @param   {taskid}
   * @return  {Array Of Object} all the Users
   */
  getTaskDetails(taskid: number) {
    this.authService.setLoader(true);
    if (sessionStorage.getItem('token')) {
      this.authService.memberSendRequest('get', 'get-task-by-id/' + taskid, null).subscribe((respData: any) => {
        this.authService.setLoader(false);
        this.taskDetails = null;
        if (respData['isError'] == false) {
          if (respData && respData['result'] && respData['result'][0]) {
            this.taskDetails = respData['result'][0];

            this.taskDetails.approvedCount = 0;
            this.taskDetails.progressVal = 0;
            if (this.taskDetails?.subtasks?.length > 0) {
              this.taskDetails.approvedCount = this.taskDetails.subtasks.filter((obj: any) => obj.status === 1).length;
              this.taskDetails.progressVal = Math.round(100 * (this.taskDetails?.approvedCount / this.taskDetails?.subtasks.length));
            } else if (this.taskDetails?.status == 1) {
              this.taskDetails.progressVal = 100; //to show progress value = 100, if task consists of no subtasks
            }

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
                element.assigned_too = JSON.parse(element.assigned_to);
                if (element.assigned_too.length > 0) {
                  element.assigned_too.forEach(elem => {
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
        } else if (respData['code'] == 400) {
          this.notificationService.showError(respData['message'], 'Error');
        }
      });
    }
  }

  /**
   * Function to get the details of the organizer of the task
   * @author  MangoIt Solutions
   * @param   {groupId, Group Name}
   * @return  {}
   */
  getOrganizerDetails(taskid: number): void {
    if (sessionStorage.getItem('token')) {
      this.organizerDetails = [];
      this.collaborators = [];
      this.collaboratorDetails = [];
      this.authService.setLoader(true);
      this.authService.memberSendRequest('get', `getTaskCollaborator/task/${taskid}`, null).subscribe((respData: any) => {
        this.authService.setLoader(false);
        if (respData && respData.length > 0) {
          this.count = respData.some(ele => ele.user_id === this.userDetails.userId) ? 1 : 0;
          this.collaboratorDetails = respData;
          const org_id = this.taskDetails['organizer_id'];
          this.organizerDetails = this.collaboratorDetails.filter(val => val.user_id === org_id);
          this.collaborators = this.collaboratorDetails.filter(val => val.user_id !== org_id);
          this.organizerDetails = this.authService.uniqueObjData(this.organizerDetails, 'id');
          this.collaborators = this.authService.uniqueObjData(this.collaborators, 'id');
        }
      });
    }
  }

  /**
   * Function for the completion of Subtask
   * @author  MangoIt Solutions
   * @param   {subTaskid}
   * @return  {}
   */
  subTaskMarkComplete(subtaskId: number) {
    if (this.taskDetails['subtasks'] && this.taskDetails['subtasks'].length > 0) {
      this.taskDetails['subtasks'].forEach(element => {
        if (element.id == subtaskId) {
          this.count = this.collaborators && this.collaborators.some(el => el.user_id == this.userDetails.userId) ? 1 : 0;
          if (element.assigned_too && element.assigned_too.some(elem => elem.user_id === this.userDetails.userId || this.taskDetails['organizer_id'] === this.userDetails.userId || this.userDetails.roles[0] === 'admin')) {
            this.count = 1;
          }

          if (this.count == 1) {
            this.confirmDialogService.confirmThis(
              this.language.confirmation_message.complete_task,
              () => {
                this.authService.memberSendRequest('get', 'complete-subtask-by-id/' + subtaskId, null).subscribe((respData: any) => {
                  this.collaboratorDetails = [];
                  this.ngOnInit();
                  this.checkedStates = {};
                });
              },
              () => {
                this.checkedStates = {};
                this.checkedStates[subtaskId] = false;
              }
            );
            this.count = 0;
          } else {
            this.checkedStates[subtaskId] = false;
            this.notificationService.showError(this.language.organizer_task.completePermission, 'Error');
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
                    this.checkedStatesMain = {};
                    this.notificationService.showSuccess(respData['result'], 'Success');
                    this.ngOnInit();
                  } else if (respData['code'] == 400) {
                    this.checkedStatesMain[taskId] = false;
                    this.notificationService.showError(respData['message'], 'Error');
                  }
                });
              },
              () => {
                this.checkedStatesMain = {};
                this.checkedStatesMain[taskId] = false;
              }
            );
          } else {
            this.checkedStatesMain[taskId] = false;
            // $('#subtask').modal('toggle');
            this.notificationService.showError(this.language.organizer_task.uncomplete_heading, 'Error');
          }
        } else {
          this.checkedStatesMain[taskId] = false;
          // $('#subtask1').modal('toggle');
          this.notificationService.showError(this.language.organizer_task.completeByAdmin, 'Error');
        }
      }, 100);
    }
  }

  /**
   * Function to navigate to previous task
   * @author  MangoIt Solutions
   * @param   {subTaskid}
   * @return  {}
   */
  navigateToPreviousTask() {
    if (this.selectedIndex > 0) {
      this.selectedIndex--;
      this.updateTaskDetails();
    }
  }

  /**
   *Function to navigate to next task
   * @author  MangoIt Solutions
   * @param   {subTaskid}
   * @return  {}
   */
  navigateToNextTask() {
    if (this.selectedIndex < this.tasks.length - 1) {
      this.selectedIndex++;
      this.updateTaskDetails();
    }
  }

  private updateTaskDetails() {
    let selectedTask = this.tasks[this.selectedIndex];
    this.getTaskDetails(selectedTask?.id);
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

  close(val: any) {
    this.dialogRef.close(val);
  }
}
