export interface Room {
  created_at: string;
  description: string;
  id: number;
  image: any;
  name: string;
  no_of_persons: number;
  price: number;
  room_availablity: RoomAvailability[];
  room_type: string;
  team_id: number;
  updated_at: string;
  author: number;
  approved_status: number;
  updated_record: string;
  deny_by_id: number;
  deny_reason: string;
  user: any;
  roomBooking: any;
  active_from: any;
  active_to: any;
  room_image: any;
}

export interface RoomAvailability {
  created_at: string;
  id: number;
  room_id: number;
  time_from: string;
  time_to: string;
  updated_at: string;
  weekday: string;
}
