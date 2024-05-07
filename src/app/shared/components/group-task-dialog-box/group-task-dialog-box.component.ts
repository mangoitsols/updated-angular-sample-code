import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { SafeUrl } from '@angular/platform-browser';
import { DialogRef } from '@ngneat/dialog';
import { CommunityGroupTaskEntity, Subtask } from '@core/entities';
import { LanguageService } from '@core/services';
import { Status } from '@core/enums';
import { UseCommunityGroups } from '@core/usecases/useCommunityGroups';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'app-group-task-dialog-box',
  templateUrl: './group-task-dialog-box.component.html',
  styleUrls: ['./group-task-dialog-box.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupTaskDialogBoxComponent implements OnInit {
  selectedTask: CommunityGroupTaskEntity;
  allTasks: CommunityGroupTaskEntity[] = [];
  thumb: SafeUrl;
  thumbnail: string;
  currentIndex = 0;
  language: any;
  protected readonly Status = Status;
  protected readonly TaskStatus = Status.TaskStatus;
  private _useCommunityGroupTasks = new UseCommunityGroups();

  constructor(private _ref: DialogRef, private lang: LanguageService, private _changeDetectorRef: ChangeDetectorRef) {
    this.language = this.lang.getLanguageFile();
  }

  get isFirstRecord(): boolean {
    return this.currentIndex === 0;
  }

  get isLastRecord(): boolean {
    return this.currentIndex === this.allTasks.length - 1;
  }

  get getSubTaskStatusCount(): { count: string; percentage: number } {
    if ((!this.selectedTask && this.selectedTask.subtasks) || this.selectedTask.subtasks.length === 0) {
      return { count: '0/0', percentage: 0 };
    }

    const total = this.selectedTask.subtasks.length;
    const countWithStatusOne = this.selectedTask.subtasks.filter(task => task.status === 1).length;
    const percentage = (countWithStatusOne / total) * 100;

    return {
      count: `${countWithStatusOne}/${total}`,
      percentage: Math.round(percentage),
    };
  }

  subTaskStatusIsChecked(status: Status.SubtaskStatus): boolean {
    return status === Status.SubtaskStatus.Complete;
  }

  ngOnInit(): void {
    this.allTasks = this._ref.data.allTasks;
    const currentTask = this._ref.data.task;

    this.selectedTask = this.allTasks.find(task => task.id === currentTask.id);

    this.currentIndex = this.allTasks.findIndex(task => task.id === currentTask.id);
    this._fetchUserImage();
  }

  closeModal() {
    this._ref.close();
  }

  loadPrevTask() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.selectedTask = this.allTasks[this.currentIndex];
      this._fetchUserImage();
    } else {
      console.log('No previous task available');
    }
  }

  loadNextTask() {
    if (this.currentIndex < this.allTasks.length - 1) {
      this.currentIndex++;
      this.selectedTask = this.allTasks[this.currentIndex];
      this._fetchUserImage();
    } else {
      console.log('No next task available');
    }
  }

  completeSubTask(checked: boolean, subTask: Subtask) {
    if (subTask.status === Status.SubtaskStatus.Complete) {
      return;
    }

    if (checked) {
      subTask.status = Status.SubtaskStatus.Complete;
      this._useCommunityGroupTasks
        .setSubTaskStatus(subTask.id, Status.SubtaskStatus.Complete)
        .pipe(untilDestroyed(this))
        .subscribe(
          res => {
            if (res) {
              subTask.status = Status.SubtaskStatus.Complete;
            }
          },
          error => {
            subTask.status = Status.SubtaskStatus.Incomplete;
          }
        );
    }
  }

  private _fetchUserImage() {
    this._useCommunityGroupTasks
      .getUserPhoto(+this.selectedTask.user.memberId)
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        if (res) {
          this.selectedTask.user.imageUrl = res;
          this._changeDetectorRef.markForCheck();
        }
      });
  }
}
