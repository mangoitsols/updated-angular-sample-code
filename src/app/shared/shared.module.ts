import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutModule } from '@angular/cdk/layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { ProgressBarModule } from 'angular-progress-bar';
import { NgChartsModule } from 'ng2-charts';
import { ColorPickerModule } from 'ngx-color-picker';
import { NgxDocViewerModule } from 'ngx-doc-viewer';
import { ImageCropperModule } from 'ngx-image-cropper';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastContainerModule } from 'ngx-toastr';
import { MaterialModule } from './material.module';
import { FullCalendarModule } from '@fullcalendar/angular';
import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import { LimitTextPipe, ShortNumberPipe, MemberPhotoPipe } from '@shared/pipes';
import { BackButtonDirective, LazyImgDirective, TooltipDirective } from '@shared/directives';
import { BadgeComponent, DropdownComponent, GroupCardComponent, GroupEventsSummaryCardComponent, GroupNewsDetailDialogComponent, GroupNewsSummaryCardComponent, IconComponent, PageHeaderComponent, TabsSelectionComponent } from '@shared/components';
import { RouterLink, RouterLinkWithHref } from '@angular/router';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { PlayerSummaryCardComponent } from '@shared/components/player-summary-card/player-summary-card.component';
import { VcButtonComponent } from './components/vc-button/vc-button.component';
import { ArchivedDocumentComponent } from '@modules/web-app/pages/documents/archived-document/archived-document.component';
import { ClubDocumentComponent } from '@modules/web-app/pages/documents/club-document/club-document.component';
import { CurrentStatusDocumentComponent } from '@modules/web-app/pages/documents/current-status-document/current-status-document.component';
import { MyDocumentComponent } from '@modules/web-app/pages/documents/my-document/my-document.component';
import { GroupTaskDialogBoxComponent } from './components/group-task-dialog-box/group-task-dialog-box.component';
import { GroupEventSummaryCardHorizontalComponent } from './components/group-event-summary-card-horizontal/group-event-summary-card-horizontal.component';
import { popperVariation, TippyModule, tooltipVariation } from '@ngneat/helipopper';

FullCalendarModule.registerPlugins([interactionPlugin, dayGridPlugin, timeGridPlugin]);

// List of shared components
const components: any = [
  GroupCardComponent,
  IconComponent,
  DropdownComponent,
  PageHeaderComponent,
  GroupNewsSummaryCardComponent,
  TabsSelectionComponent,
  TabsSelectionComponent,
  GroupNewsDetailDialogComponent,
  GroupEventsSummaryCardComponent,
  VcButtonComponent,
  PlayerSummaryCardComponent,
  MyDocumentComponent,
  ClubDocumentComponent,
  ArchivedDocumentComponent,
  CurrentStatusDocumentComponent,
  GroupTaskDialogBoxComponent,
  GroupEventSummaryCardHorizontalComponent, // ConfirmDialogComponent,
  // DenyReasonConfirmDialogComponent,
  // UpdateConfirmDialogComponent
];

// List of shared pipes
const pipes: any = [LimitTextPipe, ShortNumberPipe, MemberPhotoPipe];

// List of shared directives
const directives: any = [BackButtonDirective, LazyImgDirective, TooltipDirective];

// List of standalone components
const standalone: any = [BadgeComponent];

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterLinkWithHref,
    ...standalone,
    RouterLink,
    NgxSkeletonLoaderModule,
    TippyModule.forRoot({
      defaultVariation: 'tooltip',
      variations: {
        tooltip: tooltipVariation,
        popper: popperVariation,
      },
      arrow: true,
    }),
  ],
  declarations: [...components, ...pipes],
  exports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    AngularEditorModule,
    FullCalendarModule,
    NgxPaginationModule,
    NgxDocViewerModule,
    ProgressBarModule,
    ImageCropperModule,
    ColorPickerModule,
    CarouselModule,
    ToastContainerModule,
    NgChartsModule,
    LayoutModule,
    NgxMaterialTimepickerModule,
    MaterialModule,
    ...standalone,
    ...components,
    ...pipes,
  ],
})
export class SharedModule {}
