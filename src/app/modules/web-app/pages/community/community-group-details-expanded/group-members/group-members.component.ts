import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { BreadcrumbItem } from '@shared/components/page-header/breadcrumb.type';
import { CommunityGroupEntity, CommunityGroupEventEntity, CommunityGroupNewsEntity, GroupParticipant, UserEntity } from '@core/entities';
import { UseCommunityGroups } from '@core/usecases/useCommunityGroups';
import { LanguageService, NotificationService } from '@core/services';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmDialogService } from '@shared/components';

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'vc-group-members',
  templateUrl: './group-members.component.html',
  styleUrls: ['./group-members.component.scss', '../../community-group-details/community-group-details.component.scss'],
})
export class GroupMembersComponent implements OnInit {
  breadcrumbs: BreadcrumbItem[] = [];
  language: any;
  groupDetails: CommunityGroupEntity;
  groupNews: CommunityGroupNewsEntity[];
  groupMembers: GroupParticipant[];
  groupEvents: CommunityGroupEventEntity[];
  loadings = {
    groupDetails: true,
    newsList: true,
    eventsList: true,
    membersList: true,
  };
  noGroupDetails = false;
  pageSize = 1000;
  private readonly groupId: string;
  private readonly userId: number;
  private _groupAdmin: UserEntity;
  private _useCommunityGroups = new UseCommunityGroups();

  constructor(
    private lang: LanguageService,
    private _router: Router,
    private _activateRoute: ActivatedRoute,
    private _changeDetector: ChangeDetectorRef,
    private _confirmDialogService: ConfirmDialogService,
    private _notificationService: NotificationService
  ) {
    this.language = this.lang.getLanguageFile();
    this.groupId = this._activateRoute.snapshot.parent.paramMap.get('id');
    this.userId = +localStorage.getItem('user-id');
  }

  get isGroupAdmin(): boolean {
    return this._groupAdmin?.id === +this.userId;
  }

  get isGroupMember(): boolean {
    return this.groupDetails?.participants?.some(member => member.userId === +this.userId) || false;
  }

  ngOnInit(): void {
    this.initBreadcrumb();
    this._fetchData();
  }

  deleteGroup() {
    this._confirmDialogService.confirmThis(
      `${this.language?.confirmation_message.deleteGroup_popup} <u>${this.groupDetails.name} </u> ${this.language?.create_task.group}?`,
      () => {
        this._useCommunityGroups
          .deleteGroup(+this.groupId)
          .pipe(untilDestroyed(this))
          .subscribe(resp => {
            this._router.navigate(['/web/community/groups']);
          });
      },
      () => {}
    );
  }

  leaveGroup() {
    this._confirmDialogService.confirmThis(
      `${this.language?.confirmation_message.leaveGroupConfirm_popup} <u>${this.groupDetails.name}</u> ${this.language?.create_task.group}?`,
      () => {
        this._useCommunityGroups
          .leaveGroup(+this.groupId)
          .pipe(untilDestroyed(this))
          .subscribe(resp => {
            this._router.navigate(['/web/community/groups']);
            this._notificationService.showSuccess(`You have left ${this.groupDetails.name} group`, 'Success');
          });
      },
      () => {}
    );
  }

  joinGroup() {
    this._useCommunityGroups
      .joinGroup(+this.groupId)
      .pipe(untilDestroyed(this))
      .subscribe(resp => {
        this._fetchGroupDetails();
        this._notificationService.showSuccess(`You have joined ${this.groupDetails.name} group`, 'Success');
      });
  }

  private initBreadcrumb(): void {
    this.breadcrumbs = [
      { label: 'Community', link: '/web/community/groups' },
      {
        label: this.language.community.groups,
        link: '/web/community/groups',
      },
      { label: this.language.community_groups.vc_group_details, link: '/web/community' },
    ];
  }

  private _fetchGroupDetails(): void {
    this._useCommunityGroups
      .getGroupDetails(+this.groupId)
      .pipe(untilDestroyed(this))
      .subscribe(
        GroupDetails => {
          this.groupDetails = GroupDetails;

          this._groupAdmin = GroupDetails.createdByUser;
          this.loadings.groupDetails = false;
          // this._fetchAdminImage();
        },
        error => {
          this._notificationService.showError('Error fetching group details', 'Error');
          this.noGroupDetails = true;
        }
      );
  }

  private _fetchGroupMembers(): void {
    this._useCommunityGroups
      .getGroupMembers(+this.groupId, { pageSize: 1000 })
      .pipe(untilDestroyed(this))
      .subscribe(resp => {
        this.groupMembers = resp.members as GroupParticipant[];
        this.groupMembers = this.groupMembers.filter(member => member.approvedStatus === 1);
        this.loadings.membersList = false;
      });
  }

  // private _fetchAdminImage(): void {
  // 	this._useCommunityGroups
  // 		.getUserPhoto(+this._groupAdmin.memberId)
  // 		.pipe(untilDestroyed(this))
  // 		.subscribe(
  // 			(image: Blob) => {
  // 				this._groupAdmin.imageUrl = image;
  // 				this.groupDetails.createdByUser.imageUrl = image;
  // 				this._changeDetector.markForCheck();
  // 			},
  // 			error => {
  // 				console.error('Error fetching image for admin:', this._groupAdmin.id, error);
  // 				this._groupAdmin.imageUrl = 'assets/img/default-user.png'; // Set default image on error
  // 				this._changeDetector.markForCheck();
  // 			}
  // 		);
  // }

  private _fetchData(): void {
    this._fetchGroupDetails();
    this._fetchGroupMembers();
  }
}
