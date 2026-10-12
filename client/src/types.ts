export const CLUBS = [
  'Technology & Innovation',
  'Arts & Design',
  'Sports & Wellness',
  'Community Service',
  'Academic Society',
] as const;

export const MEMBERSHIP_TYPES = ['General Member', 'Volunteer', 'Committee Member'] as const;

export type ClubName = (typeof CLUBS)[number];
export type MembershipType = (typeof MEMBERSHIP_TYPES)[number];

export interface MemberPayload {
  fullName: string;
  email: string;
  phone: string;
  studentId: string;
  club: ClubName | '';
  membershipType: MembershipType | '';
  interests: string;
  reason: string;
  agreeToRules: boolean;
}

export interface Member extends MemberPayload {
  id: number;
  createdAt: string;
}

export type FieldErrors = Partial<Record<keyof MemberPayload, string>>;

export const EMPTY_MEMBER_FORM: MemberPayload = {
  fullName: '',
  email: '',
  phone: '',
  studentId: '',
  club: '',
  membershipType: 'General Member',
  interests: '',
  reason: '',
  agreeToRules: false,
};
