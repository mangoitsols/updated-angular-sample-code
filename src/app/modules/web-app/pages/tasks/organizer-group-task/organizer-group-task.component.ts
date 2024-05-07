import { Component, Input, OnInit } from '@angular/core';
import { AuthService, CommonFunctionService, LanguageService } from '@core/services';
import { TaskDetailModalComponent } from '../task-detail-modal/task-detail-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
declare var $: any;

@Component({
  selector: 'app-organizer-group-task',
  templateUrl: './organizer-group-task.component.html',
  styleUrls: ['./organizer-group-task.component.css'],
})
export class OrganizerGroupTaskComponent implements OnInit {
  @Input() organizerTask: any;
  language: any;
  user_id: string;
  personalTasks: TaskType[];
  toDoTask: TaskType[] = [];
  inProgress: TaskType[] = [];
  completed: TaskType[] = [];
  userDetails: any;

  constructor(private authService: AuthService, private lang: LanguageService, private router: Router, private commonFunctionService: CommonFunctionService, private dialog: MatDialog) {}

  ngOnInit(): void {
    let currentUrl = this.router.url;
    currentUrl = currentUrl.split('?')[1];
    this.language = this.lang.getLanguageFile();
    this.userDetails = JSON.parse(localStorage.getItem('user-data'));
    this.user_id = localStorage.getItem('user-id');
    if (sessionStorage.getItem('token')) {
      this.toDoTask = [];
      this.inProgress = [];
      this.completed = [];
      if (this.organizerTask?.length > 0) {
        this.organizerTask?.forEach(element => {
          if (element.group_id > 0) {
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
            if (element.team_id != null) {
              if (element.group_id > 0 && element.status == 'ToDo') {
                this.toDoTask.push(element);
                this.toDoTask;
              } else if (element.group_id > 0 && element.status == 'InProgress') {
                this.inProgress.push(element);
                this.inProgress;
              } else if (element.group_id > 0 && element.status == 'Completed') {
                this.completed.push(element);
                this.completed;
              }
            }
          }
        });

        if (currentUrl && currentUrl?.includes('Group_Task')) {
          this.organizerTask = this.organizerTask.filter((task: any) => {
            if (!task.group_id) {
              return false;
            }
            return true;
          });
        }
      }
      this.authService.setLoader(false);
      this.personalTasks = this.organizerTask;
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
