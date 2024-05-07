import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommunityGroupDetailsExpandedComponent } from './community-group-details-expanded.component';
import { CommunityGroupDetailsExpandedRoutingModule } from '@modules/web-app/pages/community/community-group-details-expanded/community-group-details-expanded.routing';
import { GroupNewsComponent } from './group-news/group-news.component';
import { GroupMembersComponent } from './group-members/group-members.component';
import { GroupTasksComponent } from './group-tasks/group-tasks.component';
import { SharedModule } from '@shared/shared.module';
import { WebAppModule } from '@modules/web-app/web-app.module';
import { GroupEventsDetailsComponent } from '@modules/web-app/pages/community/community-group-details-expanded/group-events-details/group-events-details.component';
import { GroupEventsComponent } from '@modules/web-app/pages/community/community-group-details-expanded/group-events/group-events.component';
import { GroupAdminInfoCardComponent } from '@shared/components/group-admin-info-card/group-admin-info-card.component';
import { PaginationBarComponent } from '@shared/components/pagination-bar/pagination-bar.component';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { TippyModule } from '@ngneat/helipopper';
import { DragDropModule } from '@angular/cdk/drag-drop';

@NgModule({
  declarations: [CommunityGroupDetailsExpandedComponent, GroupNewsComponent, GroupMembersComponent, GroupTasksComponent, GroupEventsComponent, GroupEventsDetailsComponent],
  imports: [CommonModule, CommunityGroupDetailsExpandedRoutingModule, SharedModule, WebAppModule, GroupAdminInfoCardComponent, PaginationBarComponent, NgxSkeletonLoaderModule, TippyModule, DragDropModule],
})
export class CommunityGroupDetailsExpandedModule {}
