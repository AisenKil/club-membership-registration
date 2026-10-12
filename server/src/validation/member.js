export const CLUBS = [
  'Technology & Innovation',
  'Arts & Design',
  'Sports & Wellness',
  'Community Service',
  'Academic Society',
];

export const MEMBERSHIP_TYPES = ['General Member', 'Volunteer', 'Committee Member'];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[0-9+().\-\s]{7,30}$/;

function cleanString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

export function validateMember(payload) {
  const input = payload && typeof payload === 'object' && !Array.isArray(payload) ? payload : {};
  const value = {
    fullName: cleanString(input.fullName),
    email: cleanString(input.email).toLowerCase(),
    phone: cleanString(input.phone),
    studentId: cleanString(input.studentId),
    club: cleanString(input.club),
    membershipType: cleanString(input.membershipType),
    interests: cleanString(input.interests),
    reason: cleanString(input.reason),
    agreeToRules: input.agreeToRules === true,
  };
  const errors = {};

  if (value.fullName.length < 2) errors.fullName = 'Enter a full name with at least 2 characters.';
  else if (value.fullName.length > 100) errors.fullName = 'Full name must be 100 characters or fewer.';

  if (!value.email) errors.email = 'Email is required.';
  else if (value.email.length > 150 || !EMAIL_PATTERN.test(value.email)) errors.email = 'Enter a valid email address (150 characters maximum).';

  if (!value.phone) errors.phone = 'Phone number is required.';
  else if (!PHONE_PATTERN.test(value.phone) || value.phone.replace(/\D/g, '').length < 7) errors.phone = 'Enter a valid phone number containing at least 7 digits.';

  if (value.studentId.length > 50) errors.studentId = 'Student ID must be 50 characters or fewer.';
  if (!CLUBS.includes(value.club)) errors.club = 'Choose a valid club from the list.';
  if (!MEMBERSHIP_TYPES.includes(value.membershipType)) errors.membershipType = 'Choose a valid membership type.';
  if (value.interests.length > 1000) errors.interests = 'Areas of interest must be 1,000 characters or fewer.';
  if (value.reason.length > 1000) errors.reason = 'Your reason for joining must be 1,000 characters or fewer.';
  if (!value.agreeToRules) errors.agreeToRules = 'Agreement to the club guidelines is required.';

  return { value, errors };
}
