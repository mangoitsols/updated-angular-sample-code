import { CommunityGroupTaskEntity } from '@core/entities';

export type CategorizedGroupTasksType = {
  todo: CommunityGroupTaskEntity[];
  inProgress: CommunityGroupTaskEntity[];
  completed: CommunityGroupTaskEntity[];
};
