import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';

import { WebAppRoutingModule } from './web-app-routing.module';
import { DashboardComponent } from '@modules/web-app/pages/dashboard/dashboard.component';
import { HeaderComponent } from '@modules/web-app/common/header/header.component';
import { PageNotFoundComponent } from '@modules/web-app/shared/page-not-found/page-not-found.component';
import { OrganizerComponent } from '@modules/web-app/pages/organizer/organizer.component';
import { CreateNewsComponent } from '@modules/web-app/pages/news/create-news/create-news.component';
import { UpdateNewsComponent } from '@modules/web-app/pages/news/update-news/update-news.component';
import { UpdateEventComponent } from '@modules/web-app/pages/events/update-event/update-event.component';
import { UpdateGroupComponent } from '@modules/web-app/pages/groups/update-group/update-group.component';
import { UpdateTaskComponent } from '@modules/web-app/pages/tasks/update-task/update-task.component';
import { CreateMessageComponent } from '@modules/web-app/pages/messages/create-message/create-message.component';
import { ProfileClubComponent } from '@modules/web-app/pages/profiles/profile-club/profile-club.component';
import { ImageViewerComponent } from '@modules/web-app/pages/image-viewer/image-viewer.component';
import { CreateGroupComponent } from '@modules/web-app/pages/groups/create-group/create-group.component';
import { AppStoreComponent } from '@modules/web-app/pages/app-store/app-store.component';
import { SharedModule } from '@shared/shared.module';
import { GroupsComponent } from './pages/community/groups/groups.component';
import { CommunityGroupDetailsComponent } from './pages/community/community-group-details/community-group-details.component';
import { TagsListComponent } from './pages/tags/tags-list/tags-list.component';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { TagsAddEditComponent } from './pages/tags/tags-add-edit-dialog/tags-add-edit.component';
import { PaginationBarComponent } from '@shared/components/pagination-bar/pagination-bar.component';
import { TippyModule } from '@ngneat/helipopper';
import { SurveyDetailModalComponent } from './pages/servey/survey-detail-modal/survey-detail-modal.component';
import { TaskDetailModalComponent } from './pages/tasks/task-detail-modal/task-detail-modal.component';
import { AppComponent } from './pages/app/app.component';
import { ImpressumComponent } from './pages/impressum/impressum.component';
import { TaskComponent } from './pages/tasks/task/task.component';

@NgModule({
  declarations: [
    DashboardComponent,
    HeaderComponent,
    PageNotFoundComponent,
    MenuComponent,
    LayoutComponent,
    ClubNewsComponent,
    ClubNewsDetailsComponent,
    ClubDatesComponent,
    CrmSurveyViewComponent,
    CreateThemeComponent,
    UpdateThemeComponent,
    ThemesComponent,
    InstructorDetailsComponent,
    RoomDetailsComponent,
    CourseDetailComponent,
    SurveyDetailComponent,
    ComingSoonComponent,
    GlobalSearchComponent,
    LazyImgDirective,
    BannerListComponent,
    CreateBannerComponent,
    UpdateBannerComponent,
    BannerDetailComponent,
    BannerStatisticsComponent,
    EventsCalendarComponent,
    NewsListComponent,
    TagsListComponent,
    TagsAddEditComponent,
    SurveyDetailModalComponent,
    TaskDetailModalComponent,
    AppComponent,
    ImpressumComponent,
    TaskComponent,
  ],
  exports: [ComingSoonComponent],
  imports: [
    CommonModule,
    SharedModule,
    WebAppRoutingModule,
    NgMultiSelectDropDownModule.forRoot(),
    NgxSkeletonLoaderModule.forRoot({
      theme: {
        'border-radius': '15px',
        background: 'var(--vc-skeleton-loader-background)',
      },
    }),
    PaginationBarComponent,
    TippyModule,
    DefaultImageDirective,
  ],
})
export class WebAppModule {}
