import { BaseEntity, PaginatedEntity, UserEntity } from '@core/entities';
import { Expose, plainToClass, Transform, Type } from 'class-transformer';
import { Status } from '@core/enums';
import ApprovedStatus = Status.ApprovedStatus;

export class CommunityGroupEventsList extends PaginatedEntity {
  @Type(() => CommunityGroupEventEntity)
  groupEvents: CommunityGroupEventEntity[];
}

export class CommunityGroupEventEntity extends BaseEntity {
  id: number;
  schedule: any;
  type: string;
  name: string;
  description: string;
  author: string;
  // user: UserEntity;
  place: string;
  audience: number;
  participantCount: number;
  image: string;

  @Expose({ name: 'group_id' })
  groupId: number;

  chargeable: number;

  @Expose({ name: 'price_per_participant' })
  pricePerParticipant: number;

  @Expose({ name: 'allowed_persons' })
  allowedPersons: number;

  @Expose({ name: 'date_from' })
  dateFrom: string;

  @Expose({ name: 'date_to' })
  dateTo: string;

  @Expose({ name: 'date_repeat' })
  dateRepeat: string;

  @Expose({ name: 'recurring_dates' })
  @Transform(({ value }) => plainToClass(RecurringDates, JSON.parse(value) as RecurringDates))
  recurringDates: RecurringDates[];

  @Expose({ name: 'start_time' })
  startTime: string;

  @Expose({ name: 'end_time' })
  endTime: string;

  @Expose({ name: 'event_images' })
  @Type(() => EventImage)
  eventImages: EventImage[];

  @Type(() => UserEntity)
  user: UserEntity;
  token: { url: string; isLoading: boolean; imageLoaded: boolean };
}

export class EventImage {
  @Expose({ name: 'event_id' })
  eventId: number;
  @Expose({ name: 'event_image' })
  eventImage: string;
  @Expose({ name: 'event_document' })
  eventDocument: string;
}

export class RecurringDates {
  @Expose({ name: 'date_from' })
  dateFrom: string;
  @Expose({ name: 'start_time' })
  startTime: string;
  @Expose({ name: 'end_time' })
  endTime: string;
}

export class CommunityGroupEventParticipant {
  @Expose({ name: 'users' })
  @Type(() => UserEntity)
  user: UserEntity;

  @Expose({ name: 'approved_status' })
  approvedStatus: ApprovedStatus;
}
