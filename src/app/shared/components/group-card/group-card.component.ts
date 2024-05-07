import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonFunctionService, LanguageService } from '@core/services';
import { CommunityGroupEntity, GroupImage } from '@core/entities';
import { UseCommunityGroups } from '@core/usecases/useCommunityGroups';
import { Router } from '@angular/router';
import { LoginDetails, ParticipateAccess, UserAccess } from '@core/models';
import { appSetting } from '@core/constants';

@Component({
  selector: 'vc-community-group-card',
  templateUrl: './group-card.component.html',
  styleUrls: ['./group-card.component.scss'],
})
export class GroupCardComponent implements OnInit {
  isMobileView = this._router.url.includes('mobile') || false;
  language: any;
  @Output() clickGroupEvent = new EventEmitter<any>();
  @Output() editGroupEvent = new EventEmitter<any>();
  @Output() deleteGroupEvent = new EventEmitter<any>();
  @Output() joinGroupEvent = new EventEmitter<any>();
  @Output() leaveGroupEvent = new EventEmitter<any>();
  isLoading = true;
  private currentUserId: number;
  participateAccess: ParticipateAccess;
  userAccess: UserAccess;
  userDetails: LoginDetails;

  private _useCommunityGroups = new UseCommunityGroups();
  groupMembers: any;

  constructor(private _lang: LanguageService, private _router: Router, private commonFunctionService: CommonFunctionService) {
    this.currentUserId = +localStorage.getItem('user-id');
  }

  private _group: CommunityGroupEntity;

  get group(): CommunityGroupEntity {
    return this._group;
  }

  @Input() set group(value: CommunityGroupEntity) {
    this._group = value;

    this.groupMembers = this._group?.participants.filter(member => member.approvedStatus === 1);
    if (this._group) {
      // this._group.groupImages.forEach((image: GroupImage) => {
      // 	if (typeof image.groupImage === 'string') {
      // 		image.groupImage = this._useCommunityGroups.convertBase64ToImage(image.groupImage);
      // 	}
      // });
      if (this._group['image'] && this._group['image'] != null) {
        let tokenUrl = this.commonFunctionService.genrateImageToken(this._group.id, 'group');
        this._group['token'] = tokenUrl;
      }
    }
    this.isLoading = false;
  }

  get isAdmin() {
    return this.group?.createdByUser?.id === this.currentUserId || false;
  }

  get isMember() {
    return this.group?.participants?.some(member => member.userId === this.currentUserId) || false;
  }

  ngOnInit(): void {
    this.language = this._lang.getLanguageFile();

    this.userDetails = JSON.parse(localStorage.getItem('user-data'));
    let userRole: string = this.userDetails.roles[0];
    this.userAccess = appSetting.role;
    this.participateAccess = this.userAccess[userRole].participate;
  }

  groupClick() {
    this.clickGroupEvent.emit(this.group);
  }
}
