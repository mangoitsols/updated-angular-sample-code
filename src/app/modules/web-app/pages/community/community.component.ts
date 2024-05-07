import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CreateAccess, LoginDetails, ParticipateAccess, ThemeType, UserAccess } from '@core/models';
import { AuthService, CommonFunctionService, LanguageService, ThemeService } from '@core/services';
import { appSetting } from '@core/constants';
import { BreadcrumbItem } from '@shared/components/page-header/breadcrumb.type';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { FormControl, FormGroup } from '@angular/forms';
import { CommunityGroupEntity, PaginatedEntity, Pagination } from '@core/entities';
import { UseCommunityGroups } from '@core/usecases/useCommunityGroups';
import { GroupsComponent } from '@modules/web-app/pages/community/groups/groups.component';
import { DomSanitizer } from '@angular/platform-browser';
import { filter } from 'rxjs/operators';

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'app-community',
  templateUrl: './community.component.html',
  styleUrls: ['./community.component.scss'],
})
export class CommunityComponent implements OnInit, OnDestroy {
  language: any;
  userDetails: LoginDetails;
  userAccess: UserAccess;
  createAccess: CreateAccess;
  participateAccess: ParticipateAccess;
  communityCount: number;
  displayMessages = false;
  displayGroups = false;
  setTheme: ThemeType;
  breadCrumbItems: Array<BreadcrumbItem>;
  selectedItems = [];
  groupsFilterDropDownItems: any = [];
  form: FormGroup = new FormGroup({
    groupFilter: new FormControl(),
  });
  userTheme: ThemeType;
  communityGroups: CommunityGroupEntity[] = [];
  useCommunityGroups = new UseCommunityGroups();
  isLoading = true;
  selectedFilter = 1;
  pagination: Pagination = new PaginatedEntity().pagination;
  @ViewChild(GroupsComponent) groupsComponent: GroupsComponent;
  private activatedSub: Subscription;
  displayGroupsNews: boolean = false;
  displayGroupTask: boolean;
  organizerTask: any;
  user_id: any;
  showTabButton: boolean = false;

  constructor(
    private lang: LanguageService,
    private authService: AuthService,
    private router: Router,
    private themes: ThemeService,
    private _changeRef: ChangeDetectorRef,
    private route: ActivatedRoute,
    private commonFunctionService: CommonFunctionService,
    private sanitizer: DomSanitizer
  ) {
    this.language = this.lang.getLanguageFile();

    const getParamFromUrl: string = this.router.url;
    let currentUrl = this.router.url;

    currentUrl = currentUrl.split('?')[1];
    if (
      (currentUrl && (currentUrl.includes('Groups') || currentUrl?.includes('Group_News') || currentUrl?.includes('Group_Task'))) ||
      getParamFromUrl.includes('community-groups') ||
      getParamFromUrl.includes('groups') ||
      getParamFromUrl.includes('groups-joined')
    ) {
      this.displayGroups = true;
      this.onGroups();
    } else {
      this.displayMessages = true;
      this.onMessages();
    }
  }

  ngOnInit(): void {
    if (localStorage.getItem('club_theme') != null) {
      this.setTheme = JSON.parse(localStorage.getItem('club_theme'));
    }
    this.activatedSub = this.themes.club_theme.subscribe((resp: ThemeType) => {
      this.setTheme = resp;
    });

    this.userDetails = JSON.parse(localStorage.getItem('user-data'));
    const userRole = this.userDetails.roles[0];
    this.userAccess = appSetting.role;
    this.createAccess = this.userAccess[userRole].create;
    this.participateAccess = this.userAccess[userRole].participate;

    if (localStorage.getItem('backItem')) {
      if (localStorage.getItem('backItem') === 'groups') {
        localStorage.removeItem('backItem');
        this.onGroups();
      }
    }

    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
      const isCommunityRoute = this.route.snapshot.url.some(segment => segment.path === 'community');
      const titleParam: string = this.route.snapshot.queryParams['title'];

      if (isCommunityRoute && titleParam === 'Groups') {
        this.showTabButton = true;
      } else {
        this.showTabButton = false;
      }
    });

    this.initBreadcrumb();

    const userTheme = JSON.parse(localStorage.getItem('club_theme'));
    if (userTheme) {
      this.userTheme = userTheme;
    }

    this.themes.club_theme.pipe(untilDestroyed(this)).subscribe((theme: ThemeType) => {
      this.userTheme = theme;
    });

    this.groupsFilterDropDownItems = [
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

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const getParamFromUrl: string = this.router.url;

        if (getParamFromUrl.includes('community-groups') || getParamFromUrl.includes('groups') || getParamFromUrl.includes('groups-joined')) {
          this.displayGroups = true;
          this.onGroups();
        } else {
          this.displayMessages = true;
          this.onMessages();
        }

        let currentUrl = this.router.url;
        currentUrl = currentUrl.split('?')[1];

        if (currentUrl?.includes('Group_News')) {
          this.displayGroups = false;
          this.displayMessages = false;
          this.displayGroupsNews = true;
          this.displayGroupTask = false;
          this.initBreadcrumb();
        } else if (currentUrl?.includes('Group_Task')) {
          this.displayGroups = false;
          this.displayMessages = false;
          this.displayGroupsNews = false;
          this.displayGroupTask = true;
          this.initBreadcrumb();
        } else if (currentUrl?.includes('Groups')) {
          this.displayGroups = true;
          this.displayMessages = false;
          this.displayGroupsNews = false;
          this.displayGroupTask = false;
          this.initBreadcrumb();
        }
      }
    });

    this.user_id = localStorage.getItem('user-id');
    var endpoint;
    if (this.userDetails.roles[0] == 'admin') {
      endpoint = 'getAllApprovedTasks';
    } else {
      endpoint = 'getAllApprovedTasks/user/' + this.user_id;
    }

    if (this.participateAccess.task === 'Yes') {
      this.authService.memberSendRequest('get', endpoint, null).subscribe((respData: any) => {
        this.organizerTask = respData.result;
        this.organizerTask.forEach(element => {
          if (element?.image && element?.image != null) {
            let tokenUrl = this.commonFunctionService.genrateImageToken(element.id, 'task');
            element.token = { url: tokenUrl, isLoading: true, imageLoaded: false };
            this.commonFunctionService.loadImage(element.token);
          }
        });
      });
    }
  }

  /**
   * Function is used to display message tab
   * @author  MangoIt Solutions
   */
  onMessages() {
    this.displayMessages = true;
    this.displayGroups = false;
    this.initBreadcrumb();
  }

  /**
   * Function is used to display group tab
   * @author  MangoIt Solutions
   */
  onGroups() {
    this.router.navigate(['./'], { relativeTo: this.route, queryParams: { title: 'Groups' } });
    this.displayGroups = true;
    this.displayMessages = false;
    this.displayGroupsNews = false;
    this.displayGroupTask = false;
    this.initBreadcrumb();
  }

  onGroupNews() {
    this.router.navigate(['./'], { relativeTo: this.route, queryParams: { title: 'Group_News' } });
    this.displayGroups = false;
    this.displayMessages = false;
    this.displayGroupsNews = true;
    this.displayGroupTask = false;
    this.initBreadcrumb();
  }

  onGroupTask() {
    this.router.navigate(['./'], { relativeTo: this.route, queryParams: { title: 'Group_Task' } });
    this.displayGroups = false;
    this.displayMessages = false;
    this.displayGroupsNews = false;
    this.displayGroupTask = true;
    this.initBreadcrumb();
  }

  ngOnDestroy(): void {
    this.activatedSub.unsubscribe();
  }

  onFilterChange(filter: any) {
    this.groupsComponent.onFilterChange(filter);
  }

  private initBreadcrumb(): void {
    if (this.displayGroups) {
      this.displayGroups = true;
      this.displayMessages = false;
      this.displayGroupsNews = false;
      this.displayGroupTask = false;
      this.breadCrumbItems = [{ label: 'Community', link: '' }, { label: this.displayGroups ? this.language.community.groups : '' }];
    } else if (this.displayMessages) {
      this.displayGroups = false;
      this.displayMessages = true;
      this.displayGroupsNews = false;
      this.displayGroupTask = false;
      this.breadCrumbItems = [{ label: 'Community', link: '' }, { label: this.displayMessages ? this.language.community.messages : '' }];
    } else if (this.displayGroupsNews) {
      // this.displayGroups = false;
      this.displayMessages = false;
      this.displayGroupsNews = true;
      this.displayGroupTask = false;
      this.breadCrumbItems = [{ label: 'Community', link: '' }, { label: this.displayGroupsNews ? this.language.community.group_news : '' }];
    } else if (this.displayGroupTask) {
      // this.displayGroups = false;
      this.displayMessages = false;
      this.displayGroupsNews = false;
      this.displayGroupTask = true;
      this.breadCrumbItems = [{ label: 'Community', link: '' }, { label: this.displayGroupTask ? this.language.organizer_task.group_task : '' }];
    }
  }
}
