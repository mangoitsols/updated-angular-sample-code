import { InitializableEntity } from '@core/entities/_extra/intializable-entity';
import { Expose, Type } from 'class-transformer';
import { UserEntity } from '@core/entities/user.entity';
import { PaginatedEntity } from '@core/entities/_extra/paginated.entity';
import { BaseEntity } from '@core/entities/_extra/base.entity';

export class CommunityGroupsList extends PaginatedEntity {
  @Type(() => CommunityGroupEntity)
  groups: CommunityGroupEntity[];
}

export class CommunityGroupEntity extends BaseEntity {
  id: number;

  name: string;

  description: string;

  @Expose({ name: 'posts' })
  postsCount: number;

  newsCount: number;

  participantsCount: number;

  taskGroupCount: number;

  eventGroupCount: number;

  @Expose({ name: 'group_images' })
  @Type(() => GroupImage)
  groupImages: GroupImage[];

  @Type(() => GroupParticipant)
  participantsApproved: GroupParticipant[];

  @Type(() => GroupParticipant)
  participants?: GroupParticipant[];

  newsGroup: any[];

  constructor(values?: Partial<CommunityGroupEntity>) {
    super();
    this.initEntity(values);
  }
}

export class GroupParticipant extends InitializableEntity {
  id: number;

  @Expose({ name: 'user_id' })
  userId: number;

  @Expose({ name: 'group_id' })
  groupId: number;

  @Expose({ name: 'approved_status' })
  approvedStatus: number;

  @Expose({ name: 'read_status' })
  readStatus: number;

  @Expose({ name: 'group_updated_status' })
  groupUpdatedStatus: number;

  @Type(() => UserEntity)
  user?: UserEntity;

  constructor(values?: Partial<GroupParticipant>) {
    super();
  }
}

export class GroupImage {
  @Expose({ name: 'group_id' })
  groupId: number;

  @Expose({ name: 'group_image' })
  groupImage: string;
}
