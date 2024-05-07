import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { SafeUrl } from '@angular/platform-browser';
import { TaskCollaboratorDetails } from '@core/models';
import { AuthService, CommonFunctionService, LanguageService } from '@core/services';
import { TaskDetailModalComponent } from '../task-detail-modal/task-detail-modal.component';

declare var $: any;

@Component({
  selector: 'app-organizer-all-task',
  templateUrl: './organizer-all-task.component.html',
  styleUrls: ['./organizer-all-task.component.css'],
})
export class OrganizerAllTaskComponent implements OnInit {
  @Input() organizerTask: any;
  language: any;
  user_id: string;
  allTasks: TaskType[];
  toDoTask: TaskType[] = [];
  inProgress: TaskType[] = [];
  completed: TaskType[] = [];
  userDetails: any;
  task_id: number;
  count: number = 0;
  taskDetails: any = [];
  organizerDetails: any[] = [];
  collaborators: any[] = [];
  collaboratorDetails: TaskCollaboratorDetails[] = [];
  thumb: SafeUrl;
  allUsers: any;

  constructor(private authService: AuthService, private lang: LanguageService, private commonFunctionService: CommonFunctionService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.language = this.lang.getLanguageFile();
    this.user_id = localStorage.getItem('user-id');
    this.userDetails = JSON.parse(localStorage.getItem('user-data'));
    if (sessionStorage.getItem('token')) {
      this.toDoTask = [];
      this.inProgress = [];
      this.completed = [];

      if (this.organizerTask && this.organizerTask?.length > 0) {
        this.organizerTask?.forEach(element => {
          if ((element.group_id == 0 || element.group_id == null || element.group_id == '') && element.team_id != null) {
            element.approvedCount = 0;
            element.progressVal = 0;
            if (element.subtasks && element.subtasks.length > 0) {
              element.approvedCount = element.subtasks.filter((obj: any) => obj.status === 1).length;
              element.progressVal = Math.round(100 * (element.approvedCount / element.subtasks.length));
            } else if (element.status == 'Completed') {
              element.progressVal = 100; //to show progress value = 100, if task consists of no subtasks
            }
            let cudate: Date = new Date();
            element.dayCount = this.commonFunctionService.getDays(cudate, element.date);
            if (element.date.split('T')[0] > cudate.toISOString().split('T')[0]) {
              element.remain = this.language.Survey.day_left;
            } else {
              element.remain = this.language.organizer_task.daysOverride;
            }

            if ((element.group_id == null || element.group_id == 0) && element.status == 'ToDo') {
              this.toDoTask.push(element);
              this.toDoTask;
            } else if ((element.group_id == null || element.group_id == 0) && element.status == 'InProgress') {
              this.inProgress.push(element);
              this.inProgress;
            } else if ((element.group_id == null || element.group_id == 0) && element.status == 'Completed') {
              this.completed.push(element);
              this.completed;
            }
          }
        });
      }
      this.authService.setLoader(false);
      this.allTasks = this.organizerTask;
    }
  }

  /**
   * Function is used to open survey-detail modal
   * @author  MangoIt Solutions (T)
   * @param   {}
   * @return  {Array Of Object}
   */
  openModal(task: any, tasks: any[], selectedIndex: number) {
    const confirmDialog = this.dialog.open(TaskDetailModalComponent, {
      data: { task, tasks, selectedIndex },
      disableClose: true,
      panelClass: 'task-dialog-model',
    });
    confirmDialog.afterClosed().subscribe(result => {
      if (result == true) {
        this.ngOnInit();
      }
    });
    confirmDialog.backdropClick().subscribe(() => {
      confirmDialog.close(); // Close the dialog when backdrop (outside the dialog) is clicked
    });
  }
}
