import { CommunityGroup } from '@core/models/community-group.model';

export interface EventsType {
  approved_status: number;
  attachments: string;
  audience: number;
  author: number;
  chargeable: string;
  coorganizer: string;
  create_invoice: string;
  created_at: string;
  date_from: string;
  date_to: string;
  description: string;
  end_time: string;
  date_repeat: string;
  group: { event_id: number; group: CommunityGroup; group_id: number; id: number };
  group_id: number;
  id: number;
  invite_friends: string;
  limitation_of_participants: string;
  link_to_ticket_store: string;
  max_on_waiting_list: string;
  name: string;
  official_club_date: Date;
  participants: string;
  picture_video: string;
  place: string;
  price_per_participant: number;
  recurrence: string;
  room: string;
  schedule: string;
  show_guest_list: any;
  start_time: string;
  tags: string;
  team_id: number;
  type: number;
  updated_at: string;
  visibility: number;
  waiting_list: string;
}

export interface CalendarEvents {
  classNames: string;
  description: string;
  end: string;
  event_id: number;
  event_name: string;
  picture_video: string;
  start: string;
  title: string;
  type: number;
  // display:string
}
