import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { GroupParticipant, UserEntity } from '@core/entities';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { UseCommunityGroups } from '@core/usecases/useCommunityGroups';

@UntilDestroy()
@Component({
  selector: 'vc-player-summary-card',
  templateUrl: './player-summary-card.component.html',
  styleUrls: ['./player-summary-card.component.scss'],
})
export class PlayerSummaryCardComponent implements OnInit {
  // @ts-ignore
  @Input() badgeStyle: { backgroundColor: string; color: string; backdropFilter?: string } = { backgroundColor: 'var(--vc-color-yellow)', color: '#fff' };
  @Input() badgeText: string;
  @Input() cssStyle: { [key: string]: string };
  private readonly _useCommunityGroups = new UseCommunityGroups();

  constructor(private _changeDetector: ChangeDetectorRef) {}

  private _user: UserEntity;

  get user(): UserEntity {
    return this._user;
  }

  @Input() set user(value: UserEntity) {
    this._user = value;
    if (this._user && !this._user.imageUrl) {
      // this._loadMemberImages(value);
    }
  }

  private _member: GroupParticipant;

  get member(): GroupParticipant {
    return this._member;
  }

  @Input() set member(value: GroupParticipant) {
    this._member = value;
    if (this._member.user && !this._member.user.imageUrl) {
      // this._loadMemberImages(value.user);
    }
  }

  ngOnInit(): void {}

  // private _loadMemberImages(user: UserEntity): void {
  // 	if (user && user.memberId) {
  // 		this._useCommunityGroups
  // 			.getUserPhoto(+user.memberId)
  // 			.pipe(untilDestroyed(this))
  // 			.subscribe(
  // 				(image: Blob) => {
  // 					user.imageUrl = image;
  // 					this._changeDetector.markForCheck();
  // 				},
  // 				error => {
  // 					console.error('Error fetching image for member:', this.member.user.id, error);
  // 					user.imageUrl = 'assets/img/default-user.png'; // Set default image on error
  // 					this._changeDetector.markForCheck();
  // 				}
  // 			);
  // 	}
  // 	this._changeDetector.detectChanges();
  // }
}
