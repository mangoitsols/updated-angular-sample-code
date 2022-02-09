import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from './auth.guard';
import { LayoutComponent } from './common/layout/layout.component';
import { PageNotFoundComponent } from './common/page-not-found/page-not-found.component';
import { ClubWallComponent } from './member/club-wall/club-wall.component';
import { ClubNewsDetailsComponent } from './member/news/club-news-details/club-news-details.component';
import { ClubAllNewsComponent } from './member/news/club-all-news/club-all-news.component';
import { CommunityComponent } from './member/community/community.component';
import { DashboardComponent } from './member/dashboard/dashboard.component';
import { OrganizerComponent } from './member/organizer/organizer.component';
import { ProfileClubComponent } from './member/profiles/profile-club/profile-club.component';
import { ProfileBankComponent } from './member/profiles/profile-bank/profile-bank.component';
import { ProfileBankEditComponent } from './member/profiles/profile-bank-edit/profile-bank-edit.component';
import { ProfileEditComponent } from './member/profiles/profile-edit/profile-edit.component';
import { ProfileComponent } from './member/profiles/profile/profile.component';
import { ProfileMyClubComponent } from './member/profiles/profile-my-club/profile-my-club.component';
import { LoginComponent } from './pages/login/login.component';
import { RecoverPasswordComponent } from './pages/recover-password/recover-password.component';
import { CreateTaskComponent } from './member/tasks/create-task/create-task.component';
import { CreateNewsComponent } from './member/news/create-news/create-news.component';
import { CreateChatComponent } from './member/create-chat/create-chat.component';
import { CreateMessageComponent } from './member/messages/create-message/create-message.component';
import { CreateGroupComponent } from './member/groups/create-group/create-group.component';
import { GroupDetailComponent } from './member/groups/group-detail/group-detail.component';
import { TaskDetailComponent } from './member/tasks/task-detail/task-detail.component';
import { UpdateNewsComponent } from './member/news/update-news/update-news.component';
import { UpdateGroupComponent } from './member/groups/update-group/update-group.component';
import { UpdateTaskComponent } from './member/tasks/update-task/update-task.component';
import { ClubNewsComponent } from './member/news/club-news/club-news.component';
import { ClubDatesComponent } from './member/club-dates/club-dates.component';
import { CommunityMessagesComponent } from './member/messages/community-messages/community-messages.component';
import { CommunityGroupsComponent } from './member/groups/community-groups/community-groups.component';
import { OrganizerTaskComponent } from './member/tasks/organizer-task/organizer-task.component';
import { OrganizerDocumentComponent } from './member/documents/organizer-document/organizer-document.component';
import { GroupMessagesComponent } from './member/messages/group-messages/group-messages.component';
import { PersonalMessagesComponent } from './member/messages/personal-messages/personal-messages.component';
import { ClubMessagesComponent } from './member/messages/club-messages/club-messages.component';
import { ContactAdminComponent } from './member/messages/contact-admin/contact-admin.component';
import { MemberProfileComponent } from './member/profiles/member-profile/member-profile.component';
var userDetails = JSON.parse(localStorage.getItem('user-data'));

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'recover-password',
    component: RecoverPasswordComponent,
    data: { title: 'Recover Password' }
  },
  {
    path: '', component: LayoutComponent, canActivate: [AuthGuard], children: [
      { path: '', component: DashboardComponent, data: { title: 'Dashboard' } },
      {
        path: 'clubwall', component: ClubWallComponent, children: [
          { path: 'club-news', component: ClubNewsComponent },
          { path: 'club-dates', component: ClubDatesComponent },
        ]
      },

      {
        path: 'community', component: CommunityComponent, data: { title: 'Community' }, children: [
          { path: 'community-messages', component: CommunityMessagesComponent },
          { path: 'chat', component: CommunityMessagesComponent },
          { path: 'club-msg', component: ClubMessagesComponent },
          { path: 'group-msg', component: GroupMessagesComponent },
          { path: 'personal-msg', component: PersonalMessagesComponent },

          { path: 'community-groups', component: CommunityGroupsComponent },
          { path: 'groups', component: CommunityGroupsComponent },
          { path: 'groups-joined', component: CommunityGroupsComponent },

        ]
      },
      {
        path: 'organizer', component: OrganizerComponent, data: { title: 'Organizer' }, children: [
          { path: 'organizer-documents', component: OrganizerDocumentComponent },
        ]
      },
      { path: 'profile', component: ProfileComponent, data: { title: 'Profile' } },
      { path: 'edit-profile', component: ProfileEditComponent, data: { title: 'Edit Profile' } },
      { path: 'profile-bank', component: ProfileBankComponent, data: { title: 'Profile Bank' } },
      { path: 'profile-edit-bank', component: ProfileBankEditComponent, data: { title: 'Profile Bank Edit' } },
      { path: 'profile-club', component: ProfileClubComponent, data: { title: 'Profile Club' } },
      { path: 'profile-my-club', component: ProfileMyClubComponent, data: { title: 'Profile My Club' } },
      { path: 'dashboard', component: DashboardComponent, data: { title: 'Dashboard' } },
      { path: 'create-task', component: CreateTaskComponent, data: { title: 'Create Task' } },
      { path: 'create-chat', component: CreateChatComponent, data: { title: 'Create Chat' } },
      { path: 'create-news', component: CreateNewsComponent, data: { title: 'Create News' } },
      { path: 'create-message', component: CreateMessageComponent, data: { title: 'Create Message' } },
      { path: 'create-group', component: CreateGroupComponent, data: { title: 'Create Group' } },
      { path: 'group-detail/:groupid', component: GroupDetailComponent, data: { title: 'Group Detail' } },
      { path: 'task-detail/:taskid', component: TaskDetailComponent, data: { title: 'Event Detail' } },
      { path: 'clubnews/:newsid', component: ClubNewsDetailsComponent, data: { title: 'News' } },
      { path: 'clubwall-news/:pageId', component: ClubAllNewsComponent, data: { title: 'News' } },
      { path: 'update-news/:newsid', component: UpdateNewsComponent, data: { title: 'Update News' } },
      { path: 'update-group/:groupId', component: UpdateGroupComponent, data: { title: 'Update Group' } },
      { path: 'update-task/:taskId', component: UpdateTaskComponent, data: { title: 'Update Task' } },
      { path: 'contact-admin', component: ContactAdminComponent },
      { path: 'member-profile/:database_id/:team_id/:member_id', component: MemberProfileComponent },
    ]
  },
  {
    path: '**',
    component: PageNotFoundComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes),
  ],

  exports: [RouterModule]
})
export class AppRoutingModule { }
