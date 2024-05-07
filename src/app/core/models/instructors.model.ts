export interface Instructors {
  instructor_image: any;
  address: string;
  availablity: InstructorsAvailablity[];
  courses_type: null;
  created_at: string;
  emaill: string;
  first_name: string;
  id: number;
  last_name: string;
  phone_no: number;
  qualification: InstructorsQualification[];
  team_id: number;
  updated_at: string;
  approved_status: number;
  author: number;
  updated_record: string;
  deny_by_id: number;
  deny_reason: string;
  user: any;
  course_external_instructor: any;
  active_from: Date;
  active_to: Date;
}

export interface InstructorsAvailablity {
  created_at: string;
  id: number;
  instructor_id: number;
  time_from: string;
  time_to: string;
  updated_at: string;
  weekday: string;
}
export interface InstructorsQualification {
  created_at: string;
  id: number;
  instructor_id: number;
  qualification: string;
  updated_at: string;
}

export interface CourseByExternalInstructor {
  created_at: string;
  date_from: string;
  date_to: string;
  end_time: string;
  id: number;
  name: string;
  picture_video: string;
  start_time: string;
}
