import { InitializableEntity } from '@core/entities/_extra/intializable-entity';
import { Exclude, Expose } from 'class-transformer';
import { SafeUrl } from '@angular/platform-browser';

export class UserEntity extends InitializableEntity {
  id: number;

  @Expose({ name: 'keycloak_id' })
  keycloakId: string;

  @Expose({ name: 'username' })
  userName: string;

  @Expose({ name: 'firstname' })
  firstName: string;

  @Expose({ name: 'lastname' })
  lastName: string;

  @Expose({ name: 'team_id' })
  teamId?: string;

  role: string;
  email: string;

  @Expose({ name: 'database_id' })
  databaseId?: number;

  @Expose({ name: 'clubName' })
  clubName?: string;

  @Expose({ name: 'member_id' })
  memberId: string;

  @Expose({ name: 'bd_notification' })
  bdNotification: string;

  @Expose({ name: 'share_birthday' })
  shareBirthday: number;

  @Expose({ name: 'allowAdvertis' })
  allowAdvertisement: number;

  headlineOption: number;

  @Expose({ name: 'old_keyclock_id' })
  oldKeyClockId: string;

  @Expose({ name: 'login_status' })
  loginStatus: number;

  @Expose({ name: 'created_at' })
  createdAt: string;

  @Exclude()
  imageUrl?: SafeUrl;

  constructor(values?: Partial<UserEntity>) {
    super();
    this.initEntity(values);
  }

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
