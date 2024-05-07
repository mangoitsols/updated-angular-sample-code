import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { BreadcrumbItem } from '@shared/components/page-header/breadcrumb.type';
import { AuthService, LanguageService, NotificationService, ThemeService } from '@core/services';
import { ActivatedRoute, Router } from '@angular/router';
import { UseCommunityGroups } from '@core/usecases/useCommunityGroups';
import { CommunityGroupEntity, CommunityGroupEventEntity, GroupParticipant, Pagination, UserEntity } from '@core/entities';
import { CommunityGroupNewsEntity } from '@core/entities/community-groups/community-group-news.entity';
import { DateTimeUtility } from '@core/utils';
import { ConfirmDialogService, GroupNewsDetailDialogComponent, UpdateConfirmDialogService } from '@shared/components';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { DialogService } from '@ngneat/dialog';
import { CommunityGroupActionService } from '@core/services/community-groups/community-group-action.service';
import { FilterQuery } from '@core/types';
import { removeNullAndUndefinedProperties } from '@core/utils';
import { LoginDetails, ThemeType } from '@core/models';
import { Subscription } from 'rxjs';

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'vc-community-group-details',
  templateUrl: './community-group-details.component.html',
  styleUrls: ['./community-group-details.component.scss'],
})
export class CommunityGroupDetailsComponent implements OnInit {
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
  userDetails: LoginDetails;
  setTheme: ThemeType;
  chatUserArr: {
    lastMsgTime: string;
    lastMsgDate: string;
    lastMsgTimming: string;
    lastMessage: any;
    count: number;
    id: number;
    image: string;
    name: string;
    type: string;
  }[];

  private activatedSub: Subscription;
  protected groupId: any;
  private readonly userId: number;
  private _groupAdmin: UserEntity;
  private _useCommunityGroups = new UseCommunityGroups();
  private _dateTimeUtility = new DateTimeUtility();

  private _useCommunityGroupEvents = new UseCommunityGroups();

  constructor(
    private lang: LanguageService,
    private _router: Router,
    private _activateRoute: ActivatedRoute,
    private _changeDetector: ChangeDetectorRef,
    private _confirmDialogService: ConfirmDialogService,
    private _notificationService: NotificationService,
    private _dialogService: DialogService,
    private _groupActionService: CommunityGroupActionService,
    private themes: ThemeService,
    private authService: AuthService,
    private updateConfirmDialogService: UpdateConfirmDialogService
  ) {
    this.language = this.lang.getLanguageFile();
    this.userId = +localStorage.getItem('user-id');
  }

  get isGroupAdmin(): boolean {
    return this._groupAdmin?.id === +this.userId;
  }

  get isGroupMember(): boolean {
    return this.groupDetails.participants.some(member => member.userId === +this.userId);
  }

  private _filterQuery: FilterQuery;

  get filterQuery(): FilterQuery {
    return this._filterQuery;
  }

  @Input() set filterQuery(value: FilterQuery) {
    this._filterQuery = value;
    this._fetchGroupEvents();
  }

  ngOnInit(): void {
    this.userDetails = JSON.parse(localStorage.getItem('user-data'));

    if (localStorage.getItem('club_theme') != null) {
      let theme: ThemeType = JSON.parse(localStorage.getItem('club_theme'));
      this.setTheme = theme;
    }
    this.activatedSub = this.themes.club_theme.subscribe((resp: ThemeType) => {
      this.setTheme = resp;
    });

    this._activateRoute.params.subscribe(params => {
      const groupid: number = params['id'];
      this.groupId = params['id'];

      this._fetchData();
    });

    this.initBreadcrumb();
    this.chats();
  }

  navigateTo(link: string) {
    this._router.navigate([`web/community/group/${this.groupId}/${link}`]);
  }

  getDateSpecifics(dateString: string, date: 'month' | 'date' | 'day' | 'year'): string {
    switch (date) {
      case 'month':
        return this._dateTimeUtility.getMonth(dateString);
      case 'day':
        return this._dateTimeUtility.getDay(dateString);
      default:
        return '';
    }
  }

  async deleteGroup() {
    await this._groupActionService.deleteGroup({ id: +this.groupId, name: this.groupDetails.name });
  }

  async leaveGroup() {
    await this._groupActionService.leaveGroup({ id: +this.groupId, name: this.groupDetails.name });
  }

  joinGroup() {
    this._groupActionService.joinGroup({ id: +this.groupId, name: this.groupDetails.name }).then(() => {
      this._fetchGroupDetails();
    });
  }

  openNewsDetailModal(news: any) {
    setTimeout(() => {
      const dialog = this._dialogService.open(GroupNewsDetailDialogComponent, {
        windowClass: 'ngNeat-dialog-backdrop-white',
        data: {
          news,
          newsId: news.id,
        },
      });
      dialog.afterClosed$.pipe(untilDestroyed(this)).subscribe(result => {
        this.refetchData(result);
      });
    }, 300);
  }

  refetchData(event: boolean) {
    if (event) {
      this.loadings.newsList = true;
      this._fetchGroupNews();
    }
  }

  isLoggedInUser(id: any) {
    return id === this.userId;
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
        },
        error => {
          this._notificationService.showError('Error fetching group details', 'Error');
          this.noGroupDetails = true;
        }
      );
  }

  /**
   * Function is used to check if group is private so which
   * participants the details should be displayed
   * @author  MangoIt Solutions
   * @param   {GroupId}
   * @return  {}
   */

  showGroupDetails(): boolean {
    if (this.groupDetails['isPrivate'] === 1) {
      // If the group is private
      if (this.userDetails.isAdmin) {
        // If the user is an admin, show the group-detail div
        return true;
      } else {
        // Check if the user is present in participants[]
        const userParticipant = this.groupDetails?.participants.find(participant => participant.userId === this.userId);

        if (userParticipant && userParticipant.approvedStatus === 1) {
          // If the user is a participant and approvedStatus is 1, show the group-detail div
          return true;
        } else {
          // If the user is not authorized or approvedStatus is 2, show the unauthorized div
          return false;
        }
      }
    } else {
      // If the group is not private, show the group-detail div
      return true;
    }
  }

  private _fetchGroupMembers(): void {
    this._useCommunityGroups
      .getGroupMembers(+this.groupId)
      .pipe(untilDestroyed(this))
      .subscribe(resp => {
        this.groupMembers = resp.members as GroupParticipant[];

        // Filter participants with approvedStatus = 1
        this.groupMembers = this.groupMembers.filter(member => member.approvedStatus === 1);

        this.loadings.membersList = false;
      });
  }

  private _fetchGroupNews(): void {
    this._useCommunityGroups
      .getGroupNews(+this.groupId)
      .pipe(untilDestroyed(this))
      .subscribe(resp => {
        this.groupNews = resp.groupNews;
        this.loadings.newsList = false;
        this._changeDetector.markForCheck();
      });
  }

  private _fetchGroupEvents(): void {
    const pagination: Partial<Pagination> = {
      page: 1,
      pageSize: 5,
    };
    const filterQuery = removeNullAndUndefinedProperties(this.filterQuery);
    this._useCommunityGroupEvents
      .getFilteredGroupEvents(+this.groupId, filterQuery)
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        this.groupEvents = res;
        this.groupEvents.sort((a, b) => {
          const dateA = new Date(a.dateFrom).getTime();
          const dateB = new Date(b.dateFrom).getTime();
          return dateA - dateB;
        });
        this.loadings.eventsList = false;
      });
  }

  private _fetchData(): void {
    this._fetchGroupDetails();
    this._fetchGroupMembers();
    this._fetchGroupEvents();
    this._fetchGroupNews();
  }

  /**
   * Function is used to accept the group
   * @author  MangoIt Solutions
   * @param   {GroupId}
   * @return  {}
   */
  approvedGroup(groupId: number) {
    this._confirmDialogService.confirmThis(
      this.language.confirmation_message.publish_group,
      () => {
        this.authService.memberSendRequest('get', 'approve-group-by-id/' + groupId + '/' + this.userId, null).subscribe((respData: any) => {
          this.ngOnInit();
        });
      },
      () => {}
    );
  }

  /**
   * Function is used to accept the group
   * @author  MangoIt Solutions
   * @param   {GroupId}
   * @return  {}
   */
  unapproveGroup(groupId: number) {
    this.updateConfirmDialogService.confirmThis(
      this.language.confirmation_message.deny_group,
      reason => {
        let postData = {
          deny_reason: reason,
          deny_by_id: this.userId,
        };
        this.authService.memberSendRequest('put', 'adminDenyGroup/group_id/' + groupId, postData).subscribe((respData: any) => {
          this.ngOnInit();
        });
      },
      () => {}
    );
  }

  /**
   * Function is used to accept the updated group
   * @author  MangoIt Solutions
   * @param   {GroupId}
   * @return  {}
   */
  acceptUpdatedGroup(groupId: number) {
    this._confirmDialogService.confirmThis(
      this.language.confirmation_message.publish_article,
      () => {
        this.authService.memberSendRequest('get', 'approve-updatedGroupByAdmin/group_id/' + groupId + '/' + this.userId, null).subscribe((respData: any) => {
          this.ngOnInit();
          this._fetchData();
        });
      },
      () => {}
    );
  }

  /**
   * Function is used to delete the updated group
   * @author  MangoIt Solutions
   * @param   {GroupId}
   * @return  {}
   */
  deleteUpdateGroup(groupId: number) {
    this._confirmDialogService.confirmThis(
      this.language.community_groups.delete_group_popup,
      () => {
        this.authService.setLoader(true);
        this.authService.memberSendRequest('get', 'get-reset-updatedGroupDetails/group_id/' + groupId, null).subscribe((respData: any) => {
          this.authService.setLoader(false);
          this._router.navigate(['web/community/group/' + groupId + '/details']);
          this._fetchData();
        });
      },
      () => {},
      'deleteUpdate'
    );
  }

  chats() {
    this.authService.setLoader(true);
    this.authService.memberSendRequest('get', 'get-usersgroup-chat/' + this.userId, '').subscribe((resp: any) => {
      setTimeout(() => {
        this.authService.setLoader(false);
      }, 2000);
      this.chatUserArr = resp;
      let grp: any;
      if (this.chatUserArr && this.chatUserArr.length > 0) {
        this.chatUserArr.forEach(element => {
          if (element.type == 'individual') {
            element.lastMessage = JSON.parse(element.lastMessage);
            element.lastMsgTime = element?.lastMessage?.timestamp ? new Date(element.lastMessage.timestamp).toISOString() : new Date().toISOString().split('T')[0];

            let cudate = new Date().toISOString().split('T')[0];
            let msgdate = element.lastMsgTime.split('T')[0];
            if (new Date(msgdate).getTime() == new Date(cudate).getTime()) {
              element.lastMsgTimming = element.lastMsgTime;
            } else {
              element.lastMsgDate = msgdate;
            }
          }
        });
      }
      this.chatUserArr = this.chatUserArr.sort((a: any, b: any) => Number(new Date(a.lastMessage.timestamp)) - Number(new Date(b.lastMessage.timestamp))).reverse();
      this.chatUserArr = this.chatUserArr.filter(x => x.type == 'individual');
    });
  }

  checkChatDetails(userId: any) {
    let chatUser = this.chatUserArr.filter(x => x.id == userId);
    if (chatUser?.length > 0) {
      this._router.navigate(['/web/community/'], { queryParams: { id: userId } });
    } else {
      this._router.navigate(['/web/create-chat']);
    }
  }
}
