import { CommunityGroupEntity, GroupParticipant, PaginatedEntity } from '@core/entities';
import { Type } from 'class-transformer';

export class CommunityGroupMembersList extends PaginatedEntity {
  @Type(() => CommunityGroupEntity)
  members: GroupParticipant[];
}
