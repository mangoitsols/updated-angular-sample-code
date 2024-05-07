import { NewsType } from './news-type.model';

export interface CommunityGroup {
  approved_status: number;
  created_at: string;
  created_by: number; // this is object
  description: string;
  id: number;
  image: string;
  name: string;
  newsGroup: NewsGroup;
  newsGroupCount: number;
  participants: Participants[];
  participantsCount: number;
  team_id: number;
  updated_at: string;
  totalMembers: number;
  totalNews: number;
  updated_record: string;
  deny_by_id: number;
  deny_reason: string;
}

export interface Participants {
  approved_status: number;
  group_id: number;
  groupusers: GroupUsers;
  id: number;
  imagePro: string;
  user_id: number;
}

export interface GroupUsers {
  email: string;
  firstname: string;
  id: number;
  lastname: string;
  username: string;
}

export interface NewsGroup {
  group: CommunityGroup;
  group_id: number;
  id: number;
  news: NewsType[];
  news_id: number;
}
