import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeEl from '@angular/common/locales/en';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RecoverPasswordComponent } from './pages/recover-password/recover-password.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthGuard } from './auth.guard';
import { LimitTextPipe } from './pipe/limit-text.pipe';
import { NgxPaginationModule } from 'ngx-pagination';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { LanguageService } from './service/language.service';
import { FullCalendarModule } from '@fullcalendar/angular';
import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import { TooltipDirective } from './tooltip.directive';
import { NgxDocViewerModule } from 'ngx-doc-viewer';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { ConfirmDialogService } from './confirm-dialog/confirm-dialog.service';
import { MatTabsModule } from '@angular/material/tabs';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './member/dashboard/dashboard.component';
import { HeaderComponent } from './common/header/header.component';
import { PageNotFoundComponent } from './common/page-not-found/page-not-found.component';
import { MenuComponent } from './common/menu/menu.component';
import { LayoutComponent } from './common/layout/layout.component';
import { ClubNewsComponent } from './member/news/club-news/club-news.component';
import { ClubAllNewsComponent } from './member/news/club-all-news/club-all-news.component';
import { ClubNewsDetailsComponent } from './member/news/club-news-details/club-news-details.component';
import { ClubDatesComponent } from './member/club-dates/club-dates.component';
import { ClubEventsComponent } from './member/events/club-events/club-events.component';
import { ClubAppointmentsComponent } from './member/club-appointments/club-appointments.component';
import { AuthServiceService } from './service/auth-service.service';
import { ClubWallComponent } from './member/club-wall/club-wall.component';
import { GroupNewsComponent } from './member/news/group-news/group-news.component';
import { BirthdaysComponent } from './member/birthdays/birthdays.component';
import { CommunityComponent } from './member/community/community.component';
import { ProfileComponent } from './member/profiles/profile/profile.component';
import { ProfileViewComponent } from './member/profiles/profile-view/profile-view.component';
import { ProfileEditComponent } from './member/profiles/profile-edit/profile-edit.component';
import { ProfileBankComponent } from './member/profiles/profile-bank/profile-bank.component';
import { CreateTaskComponent } from './member/tasks/create-task/create-task.component';
import { CreateNewsComponent } from './member/news/create-news/create-news.component';
import { CreateGroupComponent } from './member/groups/create-group/create-group.component';
import { CreateMessageComponent } from './member/messages/create-message/create-message.component';
import { ProfileClubComponent } from './member/profiles/profile-club/profile-club.component';
import { UpdateNewsComponent } from './member/news/update-news/update-news.component';
import { UpdateGroupComponent } from './member/groups/update-group/update-group.component';
import { UpdateTaskComponent } from './member/tasks/update-task/update-task.component';
import { ImageViewerComponent } from './member/image-viewer/image-viewer.component';
import { GroupDetailComponent } from './member/groups/group-detail/group-detail.component';
import { OrganizerAllTaskComponent } from './member/tasks/organizer-all-task/organizer-all-task.component';
import { OrganizerPersonalTaskComponent } from './member/tasks/organizer-personal-task/organizer-personal-task.component';
import { OrganizerGroupTaskComponent } from './member/tasks/organizer-group-task/organizer-group-task.component';
import { OrganizerCreatedTaskComponent } from './member/tasks/organizer-created-task/organizer-created-task.component';

FullCalendarModule.registerPlugins([
  interactionPlugin,
  dayGridPlugin,
  timeGridPlugin
]);

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RecoverPasswordComponent,
    DashboardComponent,
    HeaderComponent,
    PageNotFoundComponent,
    MenuComponent,
    LayoutComponent,
    ClubNewsComponent,
    ClubAllNewsComponent,
    ClubNewsDetailsComponent,
    ClubDatesComponent,
    ClubEventsComponent,
    ClubAppointmentsComponent,
    ClubWallComponent,
    GroupNewsComponent,
    BirthdaysComponent,
    LimitTextPipe,
    ProfileViewComponent,
    ProfileEditComponent,
    ProfileBankComponent,
    CreateEventComponent,
    CreateTaskComponent,
    CreateMessageComponent,
    ProfileClubComponent,
    ConfirmDialogComponent,
    AllDocumentsComponent,
    TaskDetailComponent,
    TooltipDirective,
    CreateChatComponent,
    ContactAdminComponent,
    MemberProfileComponent,
    UpdateRoomComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    AngularEditorModule,
    FullCalendarModule,
    NgMultiSelectDropDownModule.forRoot(),
    NgxPaginationModule,
    NgxDocViewerModule,
    MatTabsModule
  ],
  exports: [
    ConfirmDialogComponent
  ],
  providers: [AuthServiceService, LanguageService, AuthGuard, ConfirmDialogService, { provide: LOCALE_ID, useValue: 'en-US' }],
  bootstrap: [AppComponent]
})
export class AppModule { }


// ,{ provide: LOCALE_ID, useValue: "de-at"},{provide: LOCALE_ID, useValue: 'en-US'}
