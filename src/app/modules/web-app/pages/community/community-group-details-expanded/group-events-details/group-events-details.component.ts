import { Component, inject, OnInit } from '@angular/core';
import { BreadcrumbItem } from '@shared/components/page-header/breadcrumb.type';
import { LanguageService, CommonFunctionService } from '@core/services';
import { ActivatedRoute, Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { CommunityGroupEventEntity, CommunityGroupEventParticipant, UserEntity } from '@core/entities';
import { UseCommunityGroups } from '@core/usecases/useCommunityGroups';
import { user } from '@angular/fire/auth';
import { LoginDetails } from '@core/models';
import { ConfirmDialogService } from '@shared/components';
import { ToastrService } from 'ngx-toastr';
import { Status } from '@core/enums';

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'app-group-events-details',
  templateUrl: './group-events-details.component.html',
  styleUrls: ['./group-events-details.component.scss'],
})
export class GroupEventsDetailsComponent implements OnInit {
  breadcrumbs: BreadcrumbItem[] = [];
  language: any;
  isLoading = true;
  loadings = {
    details: true,
    approved: true,
    unapproved: true,
  };
  groupEventDetails: CommunityGroupEventEntity;
  unApprovedEventUsers: UserEntity[] = [];
  userDetails: LoginDetails;
  role: any;
  userId: string;
  protected readonly user = user;
  private _eventApprovedUsers: CommunityGroupEventParticipant[] = [];
  private readonly groupId: any;
  private readonly eventId: string;
  private _useCommunityGroupEvents = new UseCommunityGroups();
  eventDate: any;

  constructor(
    private lang: LanguageService,
    private _activateRoute: ActivatedRoute,
    private _confirmDialogService: ConfirmDialogService,
    private _router: Router,
    private _toastrService: ToastrService,
    private route: ActivatedRoute,
    private commonFunctionService: CommonFunctionService
  ) {
    this.language = this.lang.getLanguageFile();
    this.eventId = this._activateRoute.snapshot.paramMap.get('eventId');
    this.groupId = this._activateRoute.snapshot.paramMap.get('groupId');
  }

  get isUserAdmin(): boolean {
    return this.role === 'admin' || this.groupEventDetails?.author === this.userId;
  }

  get isUserInApprovedList(): boolean {
    return this.approvedUsers?.some(user => user.id === +this.userId);
  }

  get isUserInUnApprovedList(): boolean {
    return this.unApprovedEventUsers?.some(user => user.id === +this.userId);
  }

  get approvedUsers(): UserEntity[] {
    return this._eventApprovedUsers.filter(item => item.approvedStatus === Status.ApprovedStatus.Approved).map(item => item.user);
  }

  get cancelledUsers(): UserEntity[] {
    return this._eventApprovedUsers.filter(item => item.approvedStatus === Status.ApprovedStatus.Rejected).map(item => item.user);
  }

  ngOnInit(): void {
    this.userDetails = JSON.parse(localStorage.getItem('user-data'));
    this.role = this.userDetails.roles[0];
    this.userId = localStorage.getItem('user-id').toString();

    this.initBreadcrumb();
    this._fetchGroupEventDetails();
    this._fetchGroupApprovedParticipants();
    this._fetchGroupUnApprovedParticipants();

    this.route.params.subscribe(params => {
      this.eventDate = params['dateId'];
    });
  }

  deleteEvent(id: number) {
    if (id) {
      this._confirmDialogService.confirmThis(
        this.language.confirmation_message.delete_event,
        () => {
          this._useCommunityGroupEvents.deleteGroupEvent(id).subscribe(
            () => {
              this._toastrService.success(this.language.success_message.delete_group || 'Delete Event Successfully');
              this._router.navigate(['/web/community/group/' + this.groupId + '/events']);
            },
            error => {
              console.error(error);
            }
          );
        },
        () => {}
      );
    }
  }

  acceptEvent() {
    this._confirmDialogService.confirmThis(
      this.language.confirmation_message.accept_event_invitation,
      () => {
        this._useCommunityGroupEvents
          .participateGroupEvent(this.groupEventDetails.id)
          .pipe(untilDestroyed(this))
          .subscribe(
            () => {
              this._toastrService.success(this.language.success_message.join_group || 'Join Event Successfully');
              this.loadings.approved = true;
              this._fetchGroupApprovedParticipants();
            },
            error => {
              console.error(error);
            }
          );
      },
      () => {}
    );
  }

  rejectEvent() {
    this._confirmDialogService.confirmThis(
      this.language.confirmation_message.deny_event_invitation,
      () => {
        this._useCommunityGroupEvents
          .cancelGroupEvent(this.groupEventDetails.id)
          .pipe(untilDestroyed(this))
          .subscribe(
            () => {
              this._toastrService.success(this.language.success_message.leave_group || 'Cancel Event Successfully');
              this.loadings.unapproved = true;
              this._fetchGroupUnApprovedParticipants();
            },
            error => {
              console.error(error);
            }
          );
      },
      () => {}
    );
  }

  private initBreadcrumb(): void {
    this.breadcrumbs = [
      {
        label: this.language.community.events || 'Events',
        link: `/web/community/group/${this.groupId}/events`,
      },
      { label: this.language.banner.event_details || 'Event Details' },
    ];
  }

  private _fetchGroupEventDetails(): void {
    this._useCommunityGroupEvents
      .getGroupEventById(+this.eventId)
      .pipe(untilDestroyed(this))
      .subscribe(eventDetails => {
        this.groupEventDetails = eventDetails;
        if (this.groupEventDetails?.image && this.groupEventDetails?.image != null) {
          let tokenUrl = this.commonFunctionService.genrateImageToken(this.groupEventDetails.id, 'event');
          this.groupEventDetails.token = { url: tokenUrl, isLoading: true, imageLoaded: false };
          this.commonFunctionService.loadImage(this.groupEventDetails.token);
        }

        this.loadings.details = false;
      });
  }

  private _fetchGroupApprovedParticipants(): void {
    this._useCommunityGroupEvents
      .getGroupEventApprovedParticipant(+this.eventId)
      .pipe(untilDestroyed(this))
      .subscribe(
        participantDetails => {
          this._eventApprovedUsers = participantDetails;
          this.loadings.approved = false;
        },
        error => {
          console.error(error);
          this.loadings.approved = false;
        }
      );
  }

  private _fetchGroupUnApprovedParticipants(): void {
    this._useCommunityGroupEvents
      .getGroupEventUnApprovedParticipant(+this.eventId)
      .pipe(untilDestroyed(this))
      .subscribe(
        participantDetails => {
          this.unApprovedEventUsers = participantDetails;
          this.loadings.unapproved = false;
        },
        error => {
          console.error(error);
          this.loadings.unapproved = false;
        }
      );
  }
}
