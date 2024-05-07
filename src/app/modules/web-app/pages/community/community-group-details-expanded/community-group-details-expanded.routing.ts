import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GroupNewsComponent } from '@modules/web-app/pages/community/community-group-details-expanded/group-news/group-news.component';
import { GroupMembersComponent } from '@modules/web-app/pages/community/community-group-details-expanded/group-members/group-members.component';
import { GroupTasksComponent } from '@modules/web-app/pages/community/community-group-details-expanded/group-tasks/group-tasks.component';
import { ComingSoonComponent } from '@shared/pages';
import { GroupEventsComponent } from '@modules/web-app/pages/community/community-group-details-expanded/group-events/group-events.component';

const routes: Routes = [
  {
    path: 'news',
    component: GroupNewsComponent,
    data: { title: 'Group News' },
  },
  {
    path: 'tasks',
    component: GroupTasksComponent,
    data: { title: 'Group Tasks' },
  },
  {
    path: 'members',
    component: GroupMembersComponent,
    data: { title: 'Group Members' },
  },
  {
    path: 'events',
    component: GroupEventsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CommunityGroupDetailsExpandedRoutingModule {}
