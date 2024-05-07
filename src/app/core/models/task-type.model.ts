import { SafeUrl } from '@angular/platform-browser';
import { UserDetails } from '@core/models/login-details.model';

export interface TaskType {
  approved_status: number;
  created_at: string;
  date: string;
  description: string;
  group_id: number;
  id: number;
  organizer_id: number;
  status: number;
  subtasks: SubTasks[];
  title: string;
  updated_at: string;
  image: string;
  updated_record: string;
  deny_by_id: number;
  deny_reason: string;
}

export interface SubTasks {
  assigned_to: any;
  date: string;
  description: string;
  id: number;
  status: number;
  task_id: number;
  title: string;
}

export interface TaskCollaboratorDetails {
  approved_status: number;
  id: number;
  image: SafeUrl;
  task_id: number;
  user: UserDetails;
  user_id: number;
}
