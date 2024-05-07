import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs/internal/Subscription';
import { DatePipe } from '@angular/common';
import { ClubDetail, LoginDetails, ProfileDetails, ThemeType } from '@core/models';
import { AuthService, CommonFunctionService, LanguageService, NotificationService, ThemeService, AcceptdenyService } from '@core/services';
import { ConfirmDialogService, DenyReasonConfirmDialogService, UpdateConfirmDialogService } from '@shared/components';
import { filter } from 'rxjs/operators';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { io, Socket } from 'socket.io-client';
import { environment } from '@env/environment';
import { WeekdaysService } from '@core/services/weekdays.service';

declare var $: any;
@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'app-room-details',
  templateUrl: './room-details.component.html',
  styleUrls: ['./room-details.component.css'],
  providers: [DatePipe],
})
export class RoomDetailsComponent implements OnInit {
  updateRoomData: any;
  roomDetails: any;
  responseMessage: any;
  imageShow: string;
  userDetails: LoginDetails;
  setTheme: ThemeType;
  private activatedSub: Subscription;
  language: any;
  thumbnail: string;
  memberid: number;
  displayError: boolean = false;
  getclubInfo: ClubDetail;
  profile_data: ProfileDetails;
  birthdateStatus: boolean;
  memberStartDateStatus: Date;
  private refreshPage: Subscription;
  private denyRefreshPage: Subscription;
  private removeUpdate: Subscription;
  calendarRooms: any;
  selectLanguage: string;
  allRoomCalndr: any[];
  allWeekDayArray: any[];
  socket: Socket;
  roomId: number;

  constructor(
    private authService: AuthService,
    private commonFunctionService: CommonFunctionService,
    private notificationService: NotificationService,
    private lang: LanguageService,
    private confirmDialogService: ConfirmDialogService,
    private themes: ThemeService,
    private denyReasonService: DenyReasonConfirmDialogService,
    private router: Router,
    private updateConfirmDialogService: UpdateConfirmDialogService,
    private route: ActivatedRoute,
    private acceptdenyService: AcceptdenyService,
    private weekDayService: WeekdaysService
  ) {
    this.userDetails = JSON.parse(localStorage.getItem('user-data'));
    this.roomId = this.route.snapshot.params.roomId;
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        untilDestroyed(this)
      )
      .subscribe((event: NavigationEnd) => {
        this.roomId = this.route.snapshot.params.roomId;
        this.getRoomDetail(this.roomId);
      });

    this.refreshPage = this.confirmDialogService.dialogResponse.subscribe(message => {
      setTimeout(() => {
        this.ngOnInit();
      }, 2000);
    });
    this.denyRefreshPage = this.updateConfirmDialogService.denyDialogResponse.subscribe(resp => {
      setTimeout(() => {
        this.ngOnInit();
      }, 2000);
    });

    this.removeUpdate = this.denyReasonService.remove_deny_update.subscribe(resp => {
      setTimeout(() => {
        this.ngOnInit();
      }, 1000);
    });
  }

  ngOnInit(): void {
    this.socket = io(environment.serverUrl);
    if (localStorage.getItem('club_theme') != null) {
      let theme: ThemeType = JSON.parse(localStorage.getItem('club_theme'));
      this.setTheme = theme;
    }

    this.activatedSub = this.themes.club_theme.subscribe((resp: ThemeType) => {
      this.setTheme = resp;
    });

    this.language = this.lang.getLanguageFile();
    this.selectLanguage = localStorage.getItem('language');
    if (this.selectLanguage == 'sp') {
      this.selectLanguage = 'es';
    }

    this.getRoomDetail(this.roomId);

    this.allWeekDayArray = this.weekDayService.getAllWeekDayArray();
  }

  /**
   * Function is used to get room by Id
   * @author  MangoIt Solutions
   * @param   {id}
   * @return  {object array}
   */
  getRoomDetail(id: number) {
    this.commonFunctionService
      .roomsById(id)
      .then((resp: any) => {
        this.roomDetails = [];
        this.updateRoomData = null;
        this.roomDetails = resp;
        if (this.roomDetails) {
          let tokenUrl = this.commonFunctionService.genrateImageToken(this.roomDetails.id, 'room');
          this.roomDetails['token'] = { url: tokenUrl, isLoading: true, imageLoaded: false };
          this.commonFunctionService.loadImage(this.roomDetails['token']);
        }

        if (this.roomDetails['author'] == JSON.parse(this.userDetails.userId) || this.userDetails.roles[0] == 'admin') {
          if (this.roomDetails.updated_record != null) {
            this.updateRoomData = JSON.parse(this.roomDetails.updated_record);
            if (this.updateRoomData?.newImage && this.updateRoomData?.newImage != '') {
              let updateTokenUrl = this.commonFunctionService.genrateImageToken(this.roomDetails.id, 'updateRoom');
              this.updateRoomData.newImage = { url: updateTokenUrl, isLoading: true, imageLoaded: false };
              this.commonFunctionService.loadImage(this.updateRoomData.newImage);
            }

            this.updateRoomData.weekdays = JSON.parse(this.updateRoomData['weekdays']);
            this.authService.memberSendRequest('get', 'teamUsers/team/' + this.userDetails.team_id, null).subscribe((respData: any) => {
              if (respData && respData.length > 0) {
                respData.forEach(el => {
                  if (el.id == this.updateRoomData.author) {
                    this.updateRoomData.user = el;
                  }
                });
              }
            });
          }
        }
      })
      .catch((erro: any) => {
        this.notificationService.showError(erro, 'Error');
      });
  }

  /**
   * Function is used to display tags name using comma separated values
   * @author  MangoIt Solutions
   * @param   {id}
   * @return  {object array}
   */
  getCommaSeparatedTags(tags) {
    if (!tags || tags.length === 0) {
      return '';
    }
    const tagNames = tags.map(tag => tag.tag_name);
    return tagNames.join(', ');
  }

  updateRoom(roomId: number) {
    this.router.navigate(['/web/update-room/' + roomId]);
  }

  approveRoom(roomId: number) {
    this.acceptdenyService.approvedRooms(roomId, 'web');
  }

  approvedUpdateRoom(roomId: number) {
    this.acceptdenyService.approvedUpdateRooms(roomId, 'web');
  }

  unapprovedRoom(roomId: number) {
    this.acceptdenyService.unapprovedRooms(roomId, 'web');
  }

  deleteRoom(roomId: number) {
    this.acceptdenyService.deleteRoom(roomId, 'web');
  }

  deleteUpdateRoom(roomId: number) {
    this.acceptdenyService.deleteUpdateRoom(roomId, 'web');
  }

  showToggle: boolean = false;
  onShow() {
    let el: HTMLCollectionOf<Element> = document.getElementsByClassName('bunch_drop');
    if (!this.showToggle) {
      this.showToggle = true;
      el[0].className = 'bunch_drop show';
    } else {
      this.showToggle = false;
      el[0].className = 'bunch_drop';
    }
  }

  goBack() {
    this.router.navigate(['/web/room']);
  }

  getDayName(id: any) {
    return this.allWeekDayArray[id];
  }

  ngOnDestroy(): void {
    this.refreshPage.unsubscribe();
    this.activatedSub.unsubscribe();
    this.denyRefreshPage.unsubscribe();
    this.removeUpdate.unsubscribe();
  }
}
