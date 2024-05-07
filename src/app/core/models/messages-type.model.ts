import { UserDetails } from '@core/models/login-details.model';
import { CommunityGroup } from '@core/models/community-group.model';

export interface MessagesType {
  approved_status: number;
  column: string;
  created_at: string;
  esdb_id: string;
  id: number;
  is_read: number;
  kind: string;
  kind_id: number;
  owner: string;
  receiver_id: string;
  sender_id: string;
  type: string;
}

export interface PersonalMessagesType {
  approved_status: number;
  attachments: any[];
  cc: any[];
  column: string;
  content: string;
  created_at: string;
  esdb_id: string;
  id: number;
  is_read: number;
  kind: string;
  kind_id: number;
  owner: string;
  receiver_id: string;
  sender: UserDetails;
  sender_id: string;
  subject: string;
  to: string[];
  type: string;
  user: { club_id: number; email: string; fcmtoken: string; firstName: string; guest: boolean; id: string; image: string; lastName: string; username: string };
}

export interface ClubMessagesType {
  approved_status: number;
  attachments: any[];
  cc: any[];
  column: string;
  content: string;
  created_at: string;
  esdb_id: string;
  id: number;
  is_read: number;
  kind: string;
  kind_id: number;
  owner: string;
  receiver_id: string;
  sender: UserDetails;
  sender_id: string;
  subject: string;
  to: string[];
  type: string;
  user: { club_id: number; email: string; fcmtoken: string; firstName: string; guest: boolean; id: string; image: string; lastName: string; username: string };
}

export interface GroupMessagesType {
  approved_status: number;
  attachments: any[];
  column: string;
  content: string;
  created_at: string;
  esdb_id: string;
  group: CommunityGroup;
  id: number;
  is_read: number;
  kind: string;
  kind_id: number;
  owner: string;
  receiver_id: string;
  sender_id: string;
  subject: string;
  type: string;
  user: { club_id: number; email: string; fcmtoken: string; firstName: string; guest: boolean; id: string; lastName: string; username: string };
}
