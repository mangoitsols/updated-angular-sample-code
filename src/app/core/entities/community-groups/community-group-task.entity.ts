import { Expose, Type } from 'class-transformer';
import { BaseEntity } from '@core/entities/_extra/base.entity';
import { UserEntity } from '@core/entities';
import { Status } from '@core/enums';
import SubtaskStatus = Status.SubtaskStatus;

export class CommunityGroupTasksList {
  @Type(() => CommunityGroupTaskEntity)
  groupTask: CommunityGroupTaskEntity[];
}

export class CommunityGroupTaskEntity extends BaseEntity {
  title: string;

  @Expose({ name: 'organizer_id' })
  organizerId: number;

  date: string;
  description: string;

  @Expose({ name: 'group_id' })
  groupId: number;

  @Expose({ name: 'event_id' })
  eventId?: number;

  @Expose({ name: 'course_id' })
  courseId: any;

  status: Status.TaskStatus;

  @Expose({ name: 'userstask' })
  @Type(() => UserEntity)
  user: UserEntity;

  @Type(() => Subtask)
  subtasks: Subtask[];

  @Expose({ name: 'task_image' })
  @Type(() => TaskImage)
  taskImage: TaskImage[];

  subtaskCompletedCount: number;
  subtaskCount: number;
  taskType: string;
}

export class Subtask {
  id: number;
  @Expose({ name: 'task_id' })
  taskId: number;

  title: string;
  description: string;

  @Expose({ name: 'assigned_to' })
  assignedTo: string;

  status: SubtaskStatus;
  date: string;
}

export class TaskImage {
  @Expose({ name: 'task_id' })
  taskId: number;

  @Expose({ name: 'task_image' })
  taskImage: string;
}
