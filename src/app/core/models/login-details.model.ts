export interface LoginDetails {
  image: any;
  Club: ClubDetail;
  access_token: string;
  database_id: number;
  email: string;
  firstName: string;
  guestUser: boolean;
  id: string;
  isAdmin: boolean;
  isEditor: boolean;
  isFunctionary: boolean;
  isMember: boolean;
  isSecretary: boolean;
  isMember_light: boolean;
  isMember_light_admin: boolean;
  lastName: string;
  member_id: number;
  phone_nr: number;
  refresh_token: string;
  roles: string[];
  team_id: number;
  userId: string;
  username: string;
  allowAdvertis: any;
  headlineOption: any;
  mobileThemeOption: any;
}

export interface ClubDetail {
  city: string;
  country: string;
  email: string;
  facebookLink: string;
  homepage: string;
  instagramLink: string;
  linkToVV: string;
  logourl: string;
  name: string;
  phone: number;
  postalcode: number;
  state: string;
  street: string;
  street2: string;
  twitterLink: string;
}

export interface UserDetails {
  bd_notification: Date;
  created_at: string;
  email: string;
  firstname: string;
  id: number;
  keycloak_id: string;
  lastname: string;
  member_id: number;
  role: string;
  share_birthday: 1;
  team_id: number;
  username: string;
}

export interface ClubTheme {
  isError: boolean;
  result: Result;
}

export interface Result {
  clubTheme: ClubbThemee;
  message: string;
}

export interface ClubbThemee {
  button_bgcolor: string;
  button_ic_color: string;
  button_text: string;
  icon_color: string;
  id: number;
  logo_url: string;
  navigation_color: string;
  sidebar_color: string;
  team_id: number;
}
