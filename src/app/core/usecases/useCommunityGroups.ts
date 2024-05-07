import { Observable } from 'rxjs';
import { inject } from '@angular/core';
import { map } from 'rxjs/operators';
import { CommonFunctionService, CommunityGroupEventsService, CommunityGroupMembersService, CommunityGroupNewsService, CommunityGroupsService, CommunityGroupTasksService, UserService } from '@core/services';
import { DomSanitizer } from '@angular/platform-browser';
import { CategorizedGroupTasksType, FilterQuery } from '@core/types';
import {
  CommunityGroupEntity,
  CommunityGroupEventEntity,
  CommunityGroupEventParticipant,
  CommunityGroupEventsList,
  CommunityGroupMembersList,
  CommunityGroupNewsEntity,
  CommunityGroupNewsList,
  CommunityGroupsList,
  CommunityGroupTaskEntity,
  CommunityGroupTasksList,
  GroupParticipant,
  Pagination,
  UserEntity,
} from '@core/entities';

import { plainToClass } from 'class-transformer';
import { Status } from '@core/enums';

export class UseCommunityGroups {
  private _communityGroupsService = inject(CommunityGroupsService);
  private _communityGroupMembersService = inject(CommunityGroupMembersService);
  private _communityGroupNewsService = inject(CommunityGroupNewsService);
  private _sanitizer = inject(DomSanitizer);
  private _commonFunctionsService = inject(CommonFunctionService);
  private _communityGroupTasksService = inject(CommunityGroupTasksService);
  private _communityGroupEventsService = inject(CommunityGroupEventsService);
  private _userService = inject(UserService);
  private _userId = +localStorage.getItem('user-id');

  constructor() {}

  // ----------- GROUPS -------------

  getApprovedCommunityGroups(queryParams?: FilterQuery): Observable<CommunityGroupsList> {
    return this._communityGroupsService.find(queryParams).pipe(
      map(response => {
        if (response) {
          return {
            pagination: response.pagination,
            groups: response.groups.map((item: CommunityGroupEntity) => plainToClass(CommunityGroupEntity, item)),
          } as CommunityGroupsList;
        }
      })
    );
  }

  getGroupDetails(groupId: number): Observable<CommunityGroupEntity> {
    if (!groupId) {
      throw new Error('groupId is required');
    }
    return this._communityGroupsService.get(groupId).pipe(
      map(response => {
        if (response) {
          const group = plainToClass(CommunityGroupEntity, response.groups[0]);

          // if (group.groupImages.length) {
          // 	group.groupImages[0].groupImage = this.convertBase64ToImage(group.groupImages[0].groupImage);
          // }
          if (group['image'] && group['image'] != null) {
            let tokenUrl = this._commonFunctionsService.genrateImageToken(group.id, 'group');
            group['token'] = { url: tokenUrl, isLoading: true, imageLoaded: false };
            this._commonFunctionsService.loadImage(group['token']);
          }
          return group;
        }
      })
    );
  }

  deleteGroup(groupId: number): Observable<any> {
    if (!groupId) {
      throw new Error('groupId is required');
    }
    return this._communityGroupsService.delete(groupId);
  }

  leaveGroup(groupId: number): Observable<any> {
    if (!groupId) {
      throw new Error('groupId is required');
    }
    if (!this._userId) {
      throw new Error('userId is required');
    }
    return this._communityGroupsService.leave(groupId, this._userId);
  }

  joinGroup(groupId: number): Observable<any> {
    if (!groupId) {
      throw new Error('groupId is required');
    }
    if (!this._userId) {
      throw new Error('userId is required');
    }
    return this._communityGroupsService.join(groupId, this._userId);
  }

  getAllGroups(): Observable<CommunityGroupEntity[]> {
    return this._communityGroupsService.getAll().pipe(
      map(response => {
        if (response) {
          return response.groups;
        }
      })
    );
  }

  // ----------- TASKS -------------

  getGroupTasks(groupId: any, filterQuery?: FilterQuery): Observable<CommunityGroupTasksList> {
    if (!groupId) {
      throw new Error('groupId is required');
    }
    return this._communityGroupTasksService.find(groupId, filterQuery).pipe(
      map(response => {
        if (response) {
          return {
            groupTask: response.groupTask.map((item: CommunityGroupTaskEntity) => {
              const transformedTask = plainToClass(CommunityGroupTaskEntity, item);
              if (transformedTask.taskImage && transformedTask.taskImage[0]?.taskImage) {
                transformedTask.taskImage[0].taskImage = this.convertBase64ToImage(transformedTask.taskImage[0].taskImage);
              }
              return transformedTask;
            }),
          };
        }
      })
    );
  }

  getGroupTaskById(taskId: number): Observable<CommunityGroupTaskEntity> {
    if (!taskId) {
      throw new Error('taskId is required');
    }
    return this._communityGroupTasksService.get(taskId).pipe(
      map(response => {
        if (response) {
          const task = plainToClass(CommunityGroupTaskEntity, response);
          if (task.taskImage && task.taskImage[0]?.taskImage) {
            task.taskImage[0].taskImage = this.convertBase64ToImage(task.taskImage[0].taskImage);
          }
          return task;
        }
      })
    );
  }

  setSubTaskStatus(subTaskId: number, status?: Status.SubtaskStatus): Observable<any> {
    if (!subTaskId) {
      throw new Error('subTaskId is required');
    }
    let uncomplete;
    switch (status) {
      case Status.SubtaskStatus.Complete:
        uncomplete = null;
        break;
      case Status.SubtaskStatus.Incomplete:
        uncomplete = 'true';
        break;
    }
    const param: FilterQuery = {
      uncomplete,
    };
    return this._communityGroupTasksService.updateStatus(subTaskId);
  }

  // ----------- MEMBERS -------------

  getGroupMembers(groupId: number, queryParams?: FilterQuery): Observable<CommunityGroupMembersList> {
    if (!groupId) {
      throw new Error('groupId is required');
    }
    return this._communityGroupMembersService.get(groupId, queryParams).pipe(
      map(response => {
        if (response) {
          return {
            pagination: response.pagination,
            members: response.members.map((item: GroupParticipant) => {
              return plainToClass(GroupParticipant, item);
            }),
          } as CommunityGroupMembersList;
        }
      })
    );
  }

  // ----------- NEWS -------------

  getGroupNews(groupId: number, queryParams?: FilterQuery): Observable<CommunityGroupNewsList> {
    if (!groupId) {
      throw new Error('groupId is required');
    }
    return this._communityGroupNewsService.find(groupId, queryParams).pipe(
      map(response => {
        if (response) {
          return {
            pagination: response.pagination,
            groupNews: response.groupNews.map((item: CommunityGroupNewsEntity) => {
              const transformedItem = plainToClass(CommunityGroupNewsEntity, item);
              let tokenUrl = this._commonFunctionsService.genrateImageToken(item.id, 'news');
              transformedItem.token = { url: tokenUrl, isLoading: true, imageLoaded: false };
              this._commonFunctionsService.loadImage(transformedItem.token);
              // if (transformedItem.newsImage && transformedItem.newsImage[0]?.newsImage) {
              //   transformedItem.newsImage[0].newsImage = this.convertBase64ToImage(transformedItem.newsImage[0].newsImage);
              // }
              return transformedItem;
            }),
          } as CommunityGroupNewsList;
        }
      })
    );
  }

  deleteGroupNews(newsId: number): Observable<any> {
    if (!newsId) {
      throw new Error('newsId is required');
    }
    return this._communityGroupNewsService.delete(newsId);
  }

  getGroupNewsById(newsId: number): Observable<CommunityGroupNewsEntity> {
    if (!newsId) {
      throw new Error('newsId is required');
    }
    return this._communityGroupNewsService.get(newsId).pipe(
      map(response => {
        if (response) {
          const news = plainToClass(CommunityGroupNewsEntity, response);
          if (news.newsImage && news.newsImage[0]?.newsImage) {
            news.newsImage[0].newsImage = this.convertBase64ToImage(news.newsImage[0].newsImage);
          }
          return news;
        }
      })
    );
  }

  // ----------- EVENTS -------------

  getGroupEvents(groupId: number, pagination: Partial<Pagination>): Observable<CommunityGroupEventsList> {
    if (!groupId) {
      throw new Error('groupId is required');
    }
    return this._communityGroupEventsService.find(groupId, pagination).pipe(
      map(response => {
        if (response) {
          return {
            pagination: response.pagination,
            groupEvents: response.groupEvents.map((item: CommunityGroupEventEntity) => {
              const transformedItem = plainToClass(CommunityGroupEventEntity, item);
              if (transformedItem.eventImages && transformedItem.eventImages[0]?.eventImage) {
                transformedItem.eventImages[0].eventImage = this.convertBase64ToImage(transformedItem.eventImages[0]?.eventImage);
              }
              return transformedItem;
            }),
          } as CommunityGroupEventsList;
        }
      })
    );
  }

  getGroupEventById(eventId: number): Observable<CommunityGroupEventEntity> {
    if (!eventId) {
      throw new Error('eventId is required');
    }
    return this._communityGroupEventsService.get(eventId).pipe(
      map(response => {
        if (response) {
          const event = plainToClass(CommunityGroupEventEntity, response);
          if (event.eventImages && event.eventImages[0]?.eventImage) {
            event.eventImages[0].eventImage = this.convertBase64ToImage(event.eventImages[0]?.eventImage);
          }
          return event;
        }
      })
    );
  }

  getGroupEventApprovedParticipant(eventId: number): Observable<any> {
    if (!eventId) {
      throw new Error('Event Id is required');
    }
    return this._communityGroupEventsService.getApprovedParticipants(eventId).pipe(
      map(response => {
        if (response) {
          return response.map(item => {
            return plainToClass(CommunityGroupEventParticipant, item);
          });
        }
      })
    );
  }

  getGroupEventUnApprovedParticipant(eventId: number): Observable<UserEntity[]> {
    if (!eventId) {
      throw new Error('Event Id is required');
    }
    return this._communityGroupEventsService.getUnApprovedParticipants(eventId).pipe(
      map(response => {
        if (response) {
          return response.map((item: UserEntity) => {
            return plainToClass(UserEntity, item);
          });
        }
      })
    );
  }

  getFilteredGroupEvents(groupId: number, queryParams?: FilterQuery): Observable<CommunityGroupEventEntity[]> {
    if (!groupId) {
      throw new Error('groupId is required');
    }
    return this._communityGroupEventsService.getAll(groupId, queryParams).pipe(
      map(response => {
        if (response) {
          return response.map((item: CommunityGroupEventEntity) => {
            const transformedItem = plainToClass(CommunityGroupEventEntity, item);
            let tokenUrl = this._commonFunctionsService.genrateImageToken(item.id, 'event');
            transformedItem.token = { url: tokenUrl, isLoading: true, imageLoaded: false };
            this._commonFunctionsService.loadImage(transformedItem.token);
            // if (transformedItem.eventImages && transformedItem.eventImages.length && transformedItem.eventImages[0]?.eventImage) {
            //   transformedItem.eventImages[0].eventImage = this.convertBase64ToImage(transformedItem.eventImages[0]?.eventImage);
            // }
            return transformedItem;
          });
        }
      })
    );
  }

  deleteGroupEvent(eventId: number): Observable<any> {
    if (!eventId) {
      throw new Error('eventId is required');
    }
    return this._communityGroupEventsService.delete(eventId);
  }

  participateGroupEvent(eventId: number): Observable<any> {
    if (!eventId) {
      throw new Error('eventId is required');
    }
    return this._communityGroupEventsService.accept(eventId);
  }

  cancelGroupEvent(eventId: number): Observable<any> {
    if (!eventId) {
      throw new Error('eventId is required');
    }
    return this._communityGroupEventsService.deny(eventId);
  }

  // ----------- USER PHOTO-------------

  getUserPhoto(memberId: number) {
    const { team_id, database_id } = JSON.parse(localStorage.getItem('user-data'));
    return this._userService.getUserProfilePhoto(memberId, team_id, database_id).pipe(
      map(blob => {
        if (blob) {
          const urlCreator: any = window.URL || window.webkitURL;
          return this._sanitizer.bypassSecurityTrustUrl(urlCreator.createObjectURL(blob));
        }
      })
    );
  }

  // ----------- AUX -------------

  convertBase64ToImage(image: string) {
    if (!image) {
      return;
    }
    const base64Data = image.substring(20);
    return this._sanitizer.bypassSecurityTrustUrl(this._commonFunctionsService.convertBase64ToBlobUrl(base64Data)) as string;
  }

  categorizeTasks(tasks: CommunityGroupTaskEntity[]): CategorizedGroupTasksType {
    return tasks.reduce(
      (acc, task) => {
        switch (task.status) {
          case Status.TaskStatus.Todo:
            acc.todo.push(task);
            break;
          case Status.TaskStatus.InProgress:
            acc.inProgress.push(task);
            break;
          case Status.TaskStatus.Completed:
            acc.completed.push(task);
            break;
        }
        return acc;
      },
      { todo: [], inProgress: [], completed: [] }
    );
  }
}
