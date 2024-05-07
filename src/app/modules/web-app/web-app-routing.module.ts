import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GlobalSearchComponent } from 'src/app/modules/web-app/common/global-search/global-search.component';
import { LayoutComponent } from 'src/app/modules/web-app/common/layout/layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AuthGuard, PermissionGuard } from '@core/guards';
import { ClubWallComponent } from '@modules/web-app/pages/club-wall/club-wall.component';
import { ClubNewsComponent } from '@modules/web-app/pages/news/club-news/club-news.component';
import { ClubDatesComponent } from '@modules/web-app/pages/club-dates/club-dates.component';
import { CommunityComponent } from '@modules/web-app/pages/community/community.component';
import { CommunityMessagesComponent } from '@modules/web-app/pages/messages/community-messages/community-messages.component';
import { ClubMessagesComponent } from '@modules/web-app/pages/messages/club-messages/club-messages.component';
import { GroupMessagesComponent } from '@modules/web-app/pages/messages/group-messages/group-messages.component';
import { FaqDetailsComponent } from '@modules/web-app/pages/faq/faq-details/faq-details.component';
import { BannerDetailComponent } from '@modules/web-app/pages/banner/banner-detail/banner-detail.component';
import { VereinsFaqComponent } from '@modules/web-app/pages/faq/vereins-faq/vereins-faq.component';
import { PageNotFoundComponent } from '@modules/web-app/shared/page-not-found/page-not-found.component';
import { CommunityGroupDetailsComponent } from '@modules/web-app/pages/community/community-group-details/community-group-details.component';
import { RedirectGroupDetailsGuard } from '@core/guards/redirect-group-details.guard';
import { CommunityGroupDetailsExpandedComponent } from './pages/community/community-group-details-expanded/community-group-details-expanded.component';
import { ComingSoonComponent } from '@shared/pages';
import { GroupEventsDetailsComponent } from '@modules/web-app/pages/community/community-group-details-expanded/group-events-details/group-events-details.component';
import { ProfileComponent } from '@modules/web-app/pages/profiles/profile/profile.component';
import { ProfileEditComponent } from '@modules/web-app/pages/profiles/profile-edit/profile-edit.component';
import { ProfileBankComponent } from '@modules/web-app/pages/profiles/profile-bank/profile-bank.component';
import { ProfileBankEditComponent } from '@modules/web-app/pages/profiles/profile-bank-edit/profile-bank-edit.component';
import { ProfileClubComponent } from '@modules/web-app/pages/profiles/profile-club/profile-club.component';
import { ProfileMyClubComponent } from '@modules/web-app/pages/profiles/profile-my-club/profile-my-club.component';
import { EventsCalendarComponent } from '@modules/web-app/pages/events/events-calendar/events-calendar.component';
import { TagsListComponent } from '@modules/web-app/pages/tags/tags-list/tags-list.component';
import { AppComponent } from './pages/app/app.component';
import { ImpressumComponent } from './pages/impressum/impressum.component';
import { TaskComponent } from './pages/tasks/task/task.component';
import { CoursePermissionGuard } from '@core/guards/course-permission.guard';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent, data: { title: 'Dashboard' } },
      {
        path: 'clubwall',
        component: ClubWallComponent,
        children: [
          { path: 'club-news', component: ClubNewsComponent },
          { path: 'club-dates', component: ClubDatesComponent },
        ],
      },
      {
        path: 'community',
        component: CommunityComponent,
        data: { title: 'Community' },
        children: [
          { path: 'community-messages', component: CommunityMessagesComponent },
          { path: 'chat/:id', component: CommunityMessagesComponent },
          { path: 'club-msg', component: ClubMessagesComponent },
          { path: 'group-msg', component: GroupMessagesComponent },
          { path: 'personal-msg', component: PersonalMessagesComponent },
          { path: 'community-groups', component: CommunityGroupDetailsComponent },
          {
            path: 'groups',
            component: CommunityGroupDetailsComponent,
            canActivate: [AuthGuard],
          },
          { path: 'groups-joined', component: CommunityGroupDetailsComponent },
        ],
      },
      //   --------------------------------------------------------
      {
        path: 'community/group/:id/details',
        data: { title: 'Community Group Details', allow_permission: ['participate'] },
        canActivate: [PermissionGuard],
        component: CommunityGroupDetailsComponent,
      },

      {
        path: 'community/group/:groupId/event/:eventId/details/date/:dateId',
        component: GroupEventsDetailsComponent,
      },
      {
        path: 'community/group/:id',
        data: { allow_permission: ['participate'] },
        canActivate: [RedirectGroupDetailsGuard, PermissionGuard],
        component: CommunityGroupDetailsExpandedComponent,
        loadChildren: () => import('@modules/web-app/pages/community/community-group-details-expanded/community-group-details-expanded.module').then(m => m.CommunityGroupDetailsExpandedModule),
      },

      //   --------------------------------------------------------
      {
        path: 'organizer',
        component: OrganizerComponent,
        data: { title: 'Organizer' },
        children: [
          { path: '', component: EventsCalendarComponent },
          { path: 'organizer-event', component: EventsCalendarComponent },
          { path: 'club-dates', component: ClubDatesComponent },
        ],
      },
      { path: 'documents', component: OrganizerDocumentComponent },
      {
        path: 'tasks',
        component: TaskComponent,
        data: { title: 'Tasks' },
        children: [{ path: 'organizer-task', component: OrganizerTaskComponent }],
      },
      {
        path: 'create-event',
        component: CreateEventComponent,
        canActivate: [PermissionGuard],
        data: { title: 'Create Event', allow_permission: ['create'] },
      },
      {
        path: 'create-task',
        component: CreateTaskComponent,
        canActivate: [PermissionGuard],
        data: { title: 'Create Task', allow_permission: ['create'] },
      },
      {
        path: 'create-chat',
        component: CreateChatComponent,
        canActivate: [PermissionGuard],
        data: { title: 'Create Chat', allow_permission: ['create'] },
      },
      {
        path: 'create-news',
        component: CreateNewsComponent,
        canActivate: [PermissionGuard],
        data: { title: 'Create News', allow_permission: ['create'] },
      },
      {
        path: 'create-course',
        component: CreateCourseComponent,
        canActivate: [PermissionGuard, CoursePermissionGuard],
        data: { title: 'Create Course', allow_permission: ['create'] },
      },
      {
        path: 'create-message',
        component: CreateMessageComponent,
        canActivate: [PermissionGuard],
        data: { title: 'Create Message', allow_permission: ['create'] },
      },
      {
        path: 'create-group',
        component: CreateGroupComponent,
        canActivate: [PermissionGuard],
        data: { title: 'Create Group', allow_permission: ['create'] },
      },
      {
        path: 'create-theme',
        component: CreateThemeComponent,
        canActivate: [PermissionGuard],
        data: { title: 'Create Theme', allow_permission: ['create'] },
      },
      {
        path: 'update-group/:groupId',
        component: UpdateGroupComponent,
        canActivate: [PermissionGuard],
        data: { title: 'Update Group', allow_permission: ['create'] },
      },
      {
        path: 'update-event/:eventId',
        component: UpdateEventComponent,
        canActivate: [PermissionGuard],
        data: { title: 'Update Event', allow_permission: ['create'] },
      },
      {
        path: 'update-banner/:bannerId',
        component: UpdateBannerComponent,
        canActivate: [PermissionGuard],
        data: { title: 'Update Banner', allow_permission: ['create'] },
      },

      {
        path: 'clubnews-detail/:newsid',
        component: ClubNewsDetailsComponent,
        canActivate: [PermissionGuard],
        data: { title: 'News', allow_permission: ['participate'] },
      },

      {
        path: 'event-detail/:eventid',
        component: EventDetailComponent,
        canActivate: [PermissionGuard],
        data: { title: 'Event Detail', allow_permission: ['participate'] },
      },
      {
        path: 'room-detail/:roomId',
        component: RoomDetailsComponent,
        canActivate: [PermissionGuard, CoursePermissionGuard],
        data: { title: 'Room Detail', allow_permission: ['participate'] },
      },
      {
        path: 'course-detail/:courseId',
        component: CourseDetailComponent,
        canActivate: [PermissionGuard, CoursePermissionGuard],
        data: { title: 'Course Detail', allow_permission: ['participate'] },
      },
      {
        path: 'survey-detail/:surveyId',
        component: SurveyDetailComponent,
        canActivate: [PermissionGuard],
        data: { title: 'Servey Detail', allow_permission: ['participate'] },
      },
      {
        path: 'vereins-faq-detail/:faqId',
        component: FaqDetailsComponent,
        canActivate: [PermissionGuard],
        data: { title: 'Vereins Faq Detail', allow_permission: ['participate'] },
      },
      {
        path: 'banner-detail/:bannerId',
        component: BannerDetailComponent,
        canActivate: [PermissionGuard],
        data: { title: 'Banner Detail', allow_permission: ['participate'] },
      },

      { path: 'vereins-faq', component: VereinsFaqComponent, data: { title: 'Vereins Faq' } },
      {
        path: 'faq-category',
        component: FaqCategoryComponent,
        canActivate: [PermissionGuard],
        data: { title: 'Faq Category', allow_permission: ['create'] },
      },
      { path: 'course', component: CourseComponent, data: { title: 'Course' }, canActivate: [CoursePermissionGuard] },
      {
        path: 'instructor',
        component: InstructorComponent,
        canActivate: [PermissionGuard, CoursePermissionGuard],
        data: { title: 'Instructor', allow_permission: ['participate'] },
      },
      {
        path: 'room',
        component: RoomComponent,
        canActivate: [PermissionGuard, CoursePermissionGuard],
        data: { title: 'Room', allow_permission: ['participate'] },
      },
      { path: 'survey', component: ServeyComponent, data: { title: 'Survey' } },
      {
        path: 'show-email',
        component: ShowEmailComponent,
        canActivate: [PermissionGuard],
        data: { title: 'Show Email', allow_permission: ['create'] },
      },
      { path: 'crm-news', component: CrmNewsComponent, data: { title: 'CRM news' } },
      {
        path: 'themes',
        component: ThemesComponent,
        canActivate: [PermissionGuard],
        data: { title: 'Display Themes', allow_permission: ['create'] },
      },
           {
        path: 'banner-statistics',
        component: BannerStatisticsComponent,
        data: { title: 'Banner Statistics' },
      },
      { path: 'search/:searchValue', component: GlobalSearchComponent, data: { title: 'Global Search' } },
      {
        path: 'contact-admin',
        component: ContactAdminComponent,
        canActivate: [PermissionGuard],
        data: { title: 'Contact Admin', allow_permission: ['create'] },
      },

      { path: 'dashboard', component: DashboardComponent, data: { title: 'Dashboard' } },
      { path: 'profile', component: ProfileComponent, data: { title: 'Profile' } },
      { path: 'edit-profile', component: ProfileEditComponent, data: { title: 'Edit Profile' } },
      { path: 'profile-bank', component: ProfileBankComponent, data: { title: 'Profile Bank' } },
      { path: 'profile-edit-bank', component: ProfileBankEditComponent, data: { title: 'Profile Bank Edit' } },
      { path: 'profile-club', component: ProfileClubComponent, data: { title: 'Profile Club' } },
      { path: 'profile-my-club', component: ProfileMyClubComponent, data: { title: 'Profile My Club' } },
      { path: 'coming_soon', component: ComingSoonComponent },
      { path: 'event-calendar', component: EventsCalendarComponent },

      {
        path: 'headline-wording',
        component: HeadlineWordingComponent,
        canActivate: [PermissionGuard, AuthGuard],
        data: { title: 'Headline Wording', allow_permission: ['create'] },
      },
      {
        path: 'intercom',
        component: MobileThemeComponent,
        canActivate: [PermissionGuard, AuthGuard],
        data: { title: 'Mobile Themes', allow_permission: ['create'] },
      },
      { path: 'tags-list', component: TagsListComponent, canActivate: [AuthGuard], data: { title: 'Tags List' } },
      { path: 'app', component: AppComponent, data: { title: 'App' } },
      { path: 'impressum', component: ImpressumComponent, data: { title: 'Impressum' } },
    ],
  },
  {
    path: '**',
    component: PageNotFoundComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WebAppRoutingModule {}
