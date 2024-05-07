export interface ProfileDetails {
  bankData: { name: string; iban: string; bic: string };
  birthDate: Date;
  changeRequest: ChangeRequest;
  city: string;
  country: string;
  countryCode: number;
  currentFunctions: { function: string; since: Date };
  email: string;
  emergencyContact: string;
  emergencyPhone: number;
  firstName: string;
  gender: string;
  lastName: string;
  letterSalutation: string;
  letterSalutationId: number;
  maritalStatus: string;
  maritalStatusId: number;
  memberPhoto: boolean;
  membershipNumber: string;
  membershipStartDate: Date;
  phone: any;
  pobox: string;
  poboxCity: string;
  poboxPostCode: number;
  postCode: number;
  salutation: string;
  salutationId: number;
  shareBirthday: boolean;
  street: string;
  street2: string;
  title: string;
  titleId: number;
  userRole: string;

  facebookLink: string;
  homepage: string;
  instagramLink: string;
  linkToVV: string;
  logourl: string;
  name: string;
  postalcode: number;
  state: string;
  twitterLink: string;
}

export interface ChangeRequest {
  bank: Bank;
  member: Member;
}

export interface Bank {
  dataChanges: { name: string; iban: string; bic: string };
  lastChange: Date;
  rejectReason: string;
  status: string;
}

export interface Member {
  dataChanges: { birthDate: Date; city: string; email: string; phone: number; postCode: number; street: string; street2: string };
  lastChange: Date;
  rejectReason: string;
  status: string;
}
