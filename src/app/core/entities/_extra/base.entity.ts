import { UserEntity } from '@core/entities';
import { Expose, Type } from 'class-transformer';
import { InitializableEntity } from '@core/entities/_extra/intializable-entity';
import { Status } from '@core/enums';

export class BaseEntity extends InitializableEntity {
  id: number;

  @Expose({ name: 'team_id' })
  teamId: string | number;

  @Expose({ name: 'approved_status' })
  approvedStatus: Status.ApprovedStatus;

  @Expose({ name: 'approved_by' })
  approvedBy: any;

  @Expose({ name: 'is_read' })
  isRead?: number;

  @Expose({ name: 'updated_record' })
  updatedRecord?: any | null;

  @Expose({ name: 'update_approved_status' })
  updateApprovedStatus?: any | null;

  @Expose({ name: 'deny_reason' })
  denyReason: string;

  @Expose({ name: 'deny_by_id' })
  denyById: number;

  @Expose({ name: 'denybyuser' })
  @Type(() => UserEntity)
  denyByUser: UserEntity;

  @Expose({ name: 'created_at' })
  @Type(() => Date)
  createdAt: string;

  @Expose({ name: 'updated_at' })
  @Type(() => Date)
  updatedAt: string;

  @Expose({ name: 'created_by' })
  createdBy: number;

  @Expose({ name: 'createdby' })
  @Type(() => UserEntity)
  createdByUser?: UserEntity;

  constructor(init?: Partial<BaseEntity>) {
    super();
    this.initEntity(init);
  }
}
