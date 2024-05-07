import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { LoginDetails, ParticipateAccess, ThemeType, UserAccess } from '@core/models';
import { CommonFunctionService, LanguageService, NavigationService, NotificationService, ThemeService } from '@core/services';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Router } from '@angular/router';
import { UseCommunityGroups } from '@core/usecases/useCommunityGroups';
import { CommunityGroupEntity } from '@core/entities';
import { PaginatedEntity, Pagination } from '@core/entities/_extra/paginated.entity';
import { FilterQuery } from '@core/types';
import { ConfirmDialogService } from '@shared/components';
import { io, Socket } from 'socket.io-client';
import { environment } from '@env/environment';
import { appSetting } from '@core/constants';

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'vc-community-groups',
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.scss'],
})
export class GroupsComponent implements OnInit {
  selectedItems = [];
  dropDownItems: any = [];
  form: FormGroup = new FormGroup({
    groupFilter: new FormControl(),
  });
  userTheme: ThemeType;
  communityGroups: CommunityGroupEntity[] = [];
  useCommunityGroups = new UseCommunityGroups();
  isLoading = true;
  selectedFilter = 1;
  language: any;
  pagination: Pagination = new PaginatedEntity().pagination;
  filterQuery: FilterQuery = {};
  socket: Socket;
  participateAccess: ParticipateAccess;
  userAccess: UserAccess;
  userDetails: LoginDetails;

  constructor(
    private _theme: ThemeService,
    private _router: Router,
    private navigationService: NavigationService,
    private _changeRef: ChangeDetectorRef,
    private _confirmDialogService: ConfirmDialogService,
    private _languageService: LanguageService,
    private _notificationService: NotificationService,
    private commonFunctionService: CommonFunctionService
  ) {
    this.socket = io(environment.serverUrl);
    this.language = this._languageService.getLanguageFile();
  }

  ngOnInit(): void {
    this.userDetails = JSON.parse(localStorage.getItem('user-data'));
    let userRole: string = this.userDetails.roles[0];
    this.userAccess = appSetting.role;
    this.participateAccess = this.userAccess[userRole].participate;

    if (this.participateAccess.group == 'Yes') {
      this._fetchApprovedGroups();
      const userTheme = JSON.parse(localStorage.getItem('club_theme'));
      if (userTheme) {
        this.userTheme = userTheme;
      }

      this._theme.club_theme.pipe(untilDestroyed(this)).subscribe((theme: ThemeType) => {
        this.userTheme = theme;
      });

      this.dropDownItems = [
        {
          id: 1,
          name: this.language.community_groups.all_groups,
          description: 'Show all available groups',
          value: null,
        },
        {
          id: 2,
          name: this.language.community_groups.groups_u_manage,
          description: 'Show groups that I manage',
          value: 'createdBy',
        },
        {
          id: 3,
          name: this.language.community_groups.groups_u_member_of,
          description: 'Show groups that I am a member of',
          value: 'joinByCurrentUser',
        },
      ];
    }
  }

  onFilterChange(filter: any) {
    if (filter.id === this.selectedFilter) {
      return;
    }
    this.selectedFilter = filter.id;
    this.isLoading = true;
    switch (filter.value) {
      case 'createdBy':
        this.filterQuery = { createdBy: true };
        break;
      case 'joinByCurrentUser':
        this.filterQuery = { joinByCurrentUser: true };
        break;
      default:
        this.filterQuery = null;
        break;
    }
    this._fetchApprovedGroups();
  }

  openGroupDetail(selectedGroup: CommunityGroupEntity) {
    const groupAdmin = selectedGroup.createdByUser;
    this._router.navigate([`web/community/group/${selectedGroup.id}/details/`], {
      state: { groupAdmin },
    });
  }

  deleteGroup(selectedGroup: CommunityGroupEntity) {
    this._confirmDialogService.confirmThis(
      `${this.language?.confirmation_message.deleteGroup_popup} <u>${selectedGroup.name} </u> ${this.language?.create_task.group}?`,
      () => {
        this.useCommunityGroups
          .deleteGroup(selectedGroup.id)
          .pipe(untilDestroyed(this))
          .subscribe(() => {
            this._fetchApprovedGroups();
            this.socket.emit('sendNotification', 'Group', (error: any) => {});
            this._notificationService.showSuccess(`${this.language?.success_message.delete_group} ${selectedGroup.name} ${this.language?.create_task.group}`, 'Success');
          });
      },
      () => {}
    );
  }

  joinGroup(selectedGroup: CommunityGroupEntity) {
    this._confirmDialogService.confirmThis(
      `${this.language?.confirmation_message.joinGroupConfirm_popup} <u>${selectedGroup.name}</u> ${this.language?.create_task.group}?`,
      () => {
        this.useCommunityGroups
          .joinGroup(selectedGroup.id)
          .pipe(untilDestroyed(this))
          .subscribe(() => {
            this._fetchApprovedGroups();
            this.socket.emit('sendNotification', 'Group', (error: any) => {});
            if (selectedGroup['isPrivate'] == 0) {
              this._notificationService.showSuccess(`${this.language?.success_message.join_group} ${selectedGroup.name} ${this.language?.create_task.group}`, 'Success');
            } else if (selectedGroup['isPrivate'] == 1) {
              this._notificationService.showSuccess(`${this.language?.community_groups.wait_admin_approve}`, 'Success');
            }
          });
      },
      () => {}
    );
  }

  leaveGroup(selectedGroup: CommunityGroupEntity) {
    this._confirmDialogService.confirmThis(
      `${this.language?.confirmation_message.leaveGroupConfirm_popup} <u>${selectedGroup.name}</u> ${this.language?.create_task.group}?`,
      () => {
        this.useCommunityGroups
          .leaveGroup(selectedGroup.id)
          .pipe(untilDestroyed(this))
          .subscribe(() => {
            this._fetchApprovedGroups();
            this.socket.emit('sendNotification', 'Group', (error: any) => {});
            this._notificationService.showSuccess(`${this.language?.success_message.leave_group} ${selectedGroup.name} ${this.language?.create_task.group}`, 'Success');
          });
      },
      () => {}
    );
  }

  editGroup(selectedGroup: any) {
    this._router.navigate([`web/update-group/${selectedGroup.id}`]);
  }

  changePage(pageNumber: number) {
    this.pagination.page = pageNumber;
    this.filterQuery = { ...this.filterQuery, ...this.pagination };
    this.isLoading = true;
    this._fetchApprovedGroups();
  }

  changePageSize(pageSize: number) {
    this.pagination.pageSize = pageSize;
    this.filterQuery = { ...this.filterQuery, ...this.pagination };
    this.isLoading = true;
    this._fetchApprovedGroups();
  }

  private _fetchApprovedGroups(): void {
    this.isLoading = true;
    this.useCommunityGroups
      .getApprovedCommunityGroups(this.filterQuery)
      .pipe(untilDestroyed(this))
      .subscribe(groupsList => {
        this.communityGroups = groupsList.groups;
        this.communityGroups.forEach((element: any) => {
          if (element?.image && element?.image != null) {
            let tokenUrl = this.commonFunctionService.genrateImageToken(element.id, 'group');
            element.token = tokenUrl;
          }
        });

        this.pagination = groupsList.pagination;
        this._changeRef.markForCheck();
        this.isLoading = false;
      });
  }
}
