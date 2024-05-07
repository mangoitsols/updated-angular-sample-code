import { ChangeDetectorRef, Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { GroupTaskDialogBoxComponent } from '@shared/components';
import { DialogService } from '@ngneat/dialog';
import { UseCommunityGroups } from '@core/usecases/useCommunityGroups';
import { ActivatedRoute, Router } from '@angular/router';
import { CommunityGroupTaskEntity, Subtask } from '@core/entities';
import { CommonFunctionService, LanguageService } from '@core/services';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { CategorizedGroupTasksType } from '@core/types';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Status } from '@core/enums';

@UntilDestroy()
@Component({
  selector: 'vc-group-tasks',
  templateUrl: './group-tasks.component.html',
  styleUrls: ['./group-tasks.component.scss'],
})
export class GroupTasksComponent implements OnInit {
  language: any;
  isLoading = true;
  groupTasks: CommunityGroupTaskEntity[] = [];
  categorizedTasks: CategorizedGroupTasksType;
  @Output() refresh: EventEmitter<boolean> = new EventEmitter<boolean>();
  protected readonly Status = Status;
  private readonly groupId: string;
  private _useCommunityGroupTasks = new UseCommunityGroups();
  private dialog = inject(DialogService);

  constructor(private _router: Router, private _activateRoute: ActivatedRoute, private _changeDetector: ChangeDetectorRef, private lang: LanguageService, private commonFunctionService: CommonFunctionService) {
    this.groupId = this._activateRoute.snapshot.parent.paramMap.get('id');
  }

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
      this._updateTaskStatus(+event.item.element.nativeElement.id, event.container.id as Status.TaskStatus);
    }
  }

  ngOnInit(): void {
    this.language = this.lang.getLanguageFile();
    this._fetchGroupTasks();
  }

  getSubTasks(taskId: number): Subtask[] {
    if (!this.groupTasks) {
      return [];
    }
    return this.groupTasks.find(task => task.id === taskId).subtasks as Subtask[];
  }

  // updateTaskStatus(taskId: number, status: number): void {
  //   this._useCommunityGroupTasks.updateTaskStatus(taskId, status).subscribe(() => {
  //     this.refresh.emit(true);
  //   });
  // }

  getSubTaskStatusCount(taskId: number): { count: string; percentage: number } {
    const subTasks = this.getSubTasks(taskId);
    if (!subTasks || subTasks.length === 0) {
      return { count: '0/0', percentage: 0 };
    }

    const total = subTasks.length;
    const countWithStatusOne = subTasks.filter(task => task.status === 1).length;
    const percentage = (countWithStatusOne / total) * 100;

    return {
      count: `${countWithStatusOne}/${total}`,
      percentage: Math.round(percentage),
    };
  }

  openGroupTaskDialogModal(task: CommunityGroupTaskEntity) {
    const dialog = this.dialog.open(GroupTaskDialogBoxComponent, {
      windowClass: 'web-group-task-details-dialog',
      data: {
        task,
        allTasks: this.groupTasks,
      },
    });
  }

  private _fetchGroupTasks(): void {
    this.isLoading = true;
    this._useCommunityGroupTasks
      .getGroupTasks(+this.groupId)
      .pipe(untilDestroyed(this))
      .subscribe(tasksList => {
        this.groupTasks = tasksList.groupTask;

        if (this.groupTasks) {
          this.groupTasks?.forEach(element => {
            if (element['image'] && element['image'] != null) {
              let tokenUrl = this.commonFunctionService.genrateImageToken(element.id, 'task');
              element['token'] = { url: tokenUrl, isLoading: true, imageLoaded: false };
              this.commonFunctionService.loadImage(element['token']);
            }
          });
        }

        this.categorizedTasks = this._useCommunityGroupTasks.categorizeTasks(this.groupTasks);

        this.isLoading = false;
      });
  }

  private _updateTaskStatus(taskId: number, taskStatus: Status.TaskStatus) {
    const body = {
      status: taskStatus,
      taskId,
    };
    // TODO: implement api to update task status
  }
}
