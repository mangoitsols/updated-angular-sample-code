import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { BreadcrumbItem } from '@shared/components/page-header/breadcrumb.type';
import { filter } from 'rxjs/operators';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { LanguageService } from '@core/services';
import { DateTimeUtility } from '@core/utils';
import { CommunityGroupEntity, UserEntity } from '@core/entities';
import { GroupEventsComponent } from '@modules/web-app/pages/community/community-group-details-expanded/group-events/group-events.component';
import { FilterQuery } from '@core/types';
import { GroupNewsComponent } from '@modules/web-app/pages/community/community-group-details-expanded/group-news/group-news.component';
import { UseCommunityGroups } from '@core/usecases/useCommunityGroups';
import { CommunityGroupActionService } from '@core/services/community-groups/community-group-action.service';

@UntilDestroy()
@Component({
  selector: 'vc-community-group-details-expanded',
  templateUrl: './community-group-details-expanded.component.html',
  styleUrls: ['./community-group-details-expanded.component.scss'],
})
export class CommunityGroupDetailsExpandedComponent implements OnInit {
  groupId: string;
  breadcrumbs: BreadcrumbItem[];
  currentRoute: string;
  pageTitle = 'Group Details';
  language: any;
  filterQuery: FilterQuery = {
    year: null,
    month: null,
    day: null,
    contribution: 'all',
  };
  eventsFilterQuery: FilterQuery = {
    year: null,
    month: null,
  };
  groupAdmin: UserEntity = new UserEntity({
    firstName: 'John',
    lastName: 'Doe',
    userName: 'johndoe',
    clubName: 'VC Club',
    databaseId: 1,
  });
  isLoading = true;
  private _groupEventsComponent: GroupEventsComponent;
  private _groupNewsComponent: GroupNewsComponent;
  private groupDetails: CommunityGroupEntity;
  private dateTimeUtility = new DateTimeUtility();
  years = this.dateTimeUtility.getYears(2023, 2027);
  months = this.dateTimeUtility.getMonths();
  days = this.dateTimeUtility.getDays(null, null, true);
  private readonly _useCommunityGroupDetails = new UseCommunityGroups();
  private readonly _userId = +localStorage.getItem('user-id') || +JSON.parse(localStorage.getItem('user-data')).id;

  constructor(private _activatedRoute: ActivatedRoute, private _router: Router, private _languageService: LanguageService, private _groupActionService: CommunityGroupActionService) {
    this.groupId = this._activatedRoute.snapshot.params.id;
    this.language = this._languageService.getLanguageFile();
    this.pageTitle = this.language.community_groups.vc_group_details;

    // Getting group admin from route state
    const navigation = this._router.getCurrentNavigation();
  }

  set currentTab(tab: string) {
    this.currentRoute = this.translateCurrentTab(tab);
    this._setBreadcrumbs(this.translateCurrentTab(tab));
  }

  get isUserMemberOfGroup(): boolean {
    return this.groupDetails.participants.some(participant => participant.userId === this._userId);
  }

  get isUserAdminOfGroup(): boolean {
    return this.groupDetails.createdByUser.id === +this._userId;
  }

  ngOnInit(): void {
    this._getGroupDetails();
  }

  selectedTab(tab: string) {}

  updateDaysList() {
    this.days = this.dateTimeUtility.getDays(+this.filterQuery.month - 1, +this.filterQuery.year, true);
  }

  onOutletLoaded(component: GroupEventsComponent | GroupNewsComponent) {
    if (component instanceof GroupEventsComponent) {
      this._groupEventsComponent = component;
      component.filterQuery = this.eventsFilterQuery;
    }

    if (component instanceof GroupNewsComponent) {
      this._groupNewsComponent = component;
      component.filterQuery = this.filterQuery;
    }
  }

  updateFilter() {
    this._groupNewsComponent.filterQuery = { ...this.filterQuery };
  }

  updateFilterForEvents() {
    this._groupEventsComponent.filterQuery = { ...this.eventsFilterQuery };
  }

  toggleListView(selectedView: string) {
    this._groupEventsComponent.displayListView = selectedView === 'list-view';
  }

  translateCurrentTab(tab: string) {
    let breadcrumb = '';
    switch (tab.toLowerCase()) {
      case 'events':
        breadcrumb = 'Events';
        break;
      case 'news':
        breadcrumb = 'News';
        break;
      case 'tasks':
        breadcrumb = this.language.community_groups.tasks.toLowerCase();
        break;
      case 'members':
        breadcrumb = this.language.community_groups.members.toLowerCase();
        break;
    }
    return breadcrumb;
  }

  joinGroup() {
    this._groupActionService.joinGroup({ id: +this.groupId, name: this.groupDetails.name }).then(() => {
      this._getGroupDetails();
    });
  }

  leaveGroup() {
    this._groupActionService.leaveGroup({ id: +this.groupId, name: this.groupDetails.name }).then(() => {
      this._getGroupDetails();
    });
  }

  private _getGroupDetails() {
    this._useCommunityGroupDetails.getGroupDetails(+this.groupId).subscribe(groupDetails => {
      this.groupDetails = groupDetails;
      this.pageTitle = groupDetails.name;
      this.groupAdmin = groupDetails.createdByUser;
      this._initBreadcrumbs();
      this._fetchUserImage(this.groupAdmin);
    });
  }

  private _initBreadcrumbs() {
    this.breadcrumbs = [
      {
        label: 'Community',
        link: '/web/community',
      },
      {
        label: this.language.community_groups.vc_groups,
        link: '../../groups',
      },
      {
        label: this.groupDetails.name || this.language.community_groups.vc_group_details,
        link: `../${this.groupId}/details`,
      },
      {
        label: 'Expanded',
      },
    ];

    this._getTabRoute();
    this.isLoading = false;
  }

  private _setBreadcrumbs(tab?: string): void {
    // Replace the last breadcrumb with the current tab
    const lastBreadcrumb = this.breadcrumbs.pop();
    this.breadcrumbs.push({
      label: tab ?? lastBreadcrumb.label,
    });
  }

  private _getTabRoute(): void {
    let activeRoute = this._activatedRoute;
    while (activeRoute.firstChild) {
      activeRoute = activeRoute.firstChild;
    }

    activeRoute.url.pipe(untilDestroyed(this)).subscribe(segments => {
      this.currentTab = segments[segments.length - 1].path ?? 'news';
    });

    this._router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .pipe(untilDestroyed(this))
      .subscribe((event: NavigationEnd) => {
        const lastSegment = event.url.split('/').pop();
        this.currentTab = lastSegment ?? 'news';
      });
  }

  private _fetchUserImage(user: UserEntity): void {
    this._useCommunityGroupDetails
      .getUserPhoto(+user.memberId)
      .pipe(untilDestroyed(this))
      .subscribe(photo => {
        user.imageUrl = photo;
        this.groupAdmin = user;
      });
  }
}
