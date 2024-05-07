import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommunityGroupEntity, UserEntity } from '@core/entities';
import { SharedModule } from '@shared/shared.module';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService, LanguageService, NotificationService } from '@core/services';
import { UseCommunityGroups } from '@core/usecases/useCommunityGroups';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'vc-group-admin-info-card',
  standalone: true,
  imports: [CommonModule, SharedModule, RouterLink],
  templateUrl: './group-admin-info-card.component.html',
  styleUrls: ['./group-admin-info-card.component.scss'],
  providers: [LanguageService],
})
export class GroupAdminInfoCardComponent implements OnInit {
  private _useCommunityGroups = new UseCommunityGroups();
  protected groupId: any;
  groupDetails: CommunityGroupEntity;
  private _groupAdmin: UserEntity;
  userId: number;
  chatUserArr: {
    lastMsgTime: string;
    lastMsgDate: string;
    lastMsgTimming: string;
    lastMessage: any;
    count: number;
    id: number;
    image: string;
    name: string;
    type: string;
  }[];

  /**
   * Title of the card
   * @type {string}
   * @memberof GroupAdminInfoCardComponent
   * @example 'Group Admin', 'Group Member'
   */
  @Input() title: string;

  /**
   * User object
   * Required to display the Card
   * @type {UserEntity}
   * @memberof GroupAdminInfoCardComponent
   * @example UserEntity({ firstName: 'John', lastName: 'Doe', userName: 'johndoe', clubName: 'VC Club', databaseId: 1 })
   */
  @Input() user: UserEntity;

  /**
   * Link to navigate to when the card is clicked
   * @type {string}
   * @memberof GroupAdminInfoCardComponent
   * @example '/web/community/groups/1/details'
   */
  @Input() link: string;

  /**
   * Whether the card is a mini card or not
   * @type {boolean}
   * @memberof GroupAdminInfoCardComponent
   * @example true
   * @default false
   */
  @Input() miniCard = false;

  /**
   * For Card BackgroundColor
   * @type {string}
   * @memberof GroupAdminInfoCardComponent
   * @example '#F5F5F5'
   * @default ''
   */
  @Input() backgroundColor: string = '';

  /**
   * CSS style object.
   * Pass style object as is.
   *
   * Applied to the svg parent, span element.
   *
   * Example: { 'margin-right': '10px' }
   */
  @Input() cssStyle: { [key: string]: string };

  @Input() showLinkText = true;

  language: any;

  constructor(private _language: LanguageService, private _activateRoute: ActivatedRoute, private _notificationService: NotificationService, private authService: AuthService, private router: Router) {
    this.language = this._language.getLanguageFile();
  }

  ngOnInit(): void {
    // By default, forcing the card to be a mini card
    this.miniCard = true;
    this.userId = +localStorage.getItem('user-id');

    this._activateRoute.params.subscribe(params => {
      this.groupId = params['id'];
    });

    this._fetchGroupDetails();
    this.chats();
  }

  private _fetchGroupDetails(): void {
    this._useCommunityGroups
      .getGroupDetails(+this.groupId)
      .pipe(untilDestroyed(this))
      .subscribe(
        GroupDetails => {
          this.groupDetails = GroupDetails;
          this._groupAdmin = GroupDetails.createdByUser;
        },
        error => {
          this._notificationService.showError('Error fetching group details', 'Error');
        }
      );
  }

  get isGroupAdmin(): boolean {
    return this._groupAdmin?.id === +this.userId;
  }

  chats() {
    this.authService.setLoader(true);
    this.authService.memberSendRequest('get', 'get-usersgroup-chat/' + this.userId, '').subscribe((resp: any) => {
      setTimeout(() => {
        this.authService.setLoader(false);
      }, 2000);
      this.chatUserArr = resp;
      let grp: any;
      if (this.chatUserArr && this.chatUserArr.length > 0) {
        this.chatUserArr.forEach(element => {
          if (element.type == 'individual') {
            element.lastMessage = JSON.parse(element.lastMessage);
            // element.lastMsgTime = new Date(element.lastMessage.timestamp).toISOString();
            element.lastMsgTime = element?.lastMessage?.timestamp ? new Date(element.lastMessage.timestamp).toISOString() : new Date().toISOString().split('T')[0];

            let cudate = new Date().toISOString().split('T')[0];
            let msgdate = element.lastMsgTime.split('T')[0];
            if (new Date(msgdate).getTime() == new Date(cudate).getTime()) {
              element.lastMsgTimming = element.lastMsgTime;
            } else {
              element.lastMsgDate = msgdate;
            }
          }
        });
      }
      this.chatUserArr = this.chatUserArr.sort((a: any, b: any) => Number(new Date(a.lastMessage.timestamp)) - Number(new Date(b.lastMessage.timestamp))).reverse();
      this.chatUserArr = this.chatUserArr.filter(x => x.type == 'individual');
    });
  }

  checkChatDetails(userId: any) {
    let chatUser = this.chatUserArr.filter(x => x.id == userId);
    if (chatUser?.length > 0) {
      this.router.navigate(['/web/community/'], { queryParams: { id: userId } });
    } else {
      this.router.navigate(['/web/create-chat']);
    }
  }

  // private _fetchUserImage(): string {}
}
