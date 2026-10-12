import test from 'node:test';
import assert from 'node:assert/strict';
import { validateMember } from '../src/validation/member.js';

const validMember = {
  fullName: 'Alex Santos',
  email: 'Alex.Santos@example.com',
  phone: '+63 917 123 4567',
  studentId: '2026-00123',
  club: 'Technology & Innovation',
  membershipType: 'General Member',
  interests: 'Web development',
  reason: 'I want to learn with other students.',
  agreeToRules: true,
};

test('accepts a valid member and normalizes the email', () => {
  const result = validateMember(validMember);
  assert.deepEqual(result.errors, {});
  assert.equal(result.value.email, 'alex.santos@example.com');
  assert.equal(result.value.fullName, 'Alex Santos');
});

test('rejects missing required fields and agreement', () => {
  const result = validateMember({});
  assert.ok(result.errors.fullName);
  assert.ok(result.errors.email);
  assert.ok(result.errors.phone);
  assert.ok(result.errors.club);
  assert.ok(result.errors.membershipType);
  assert.ok(result.errors.agreeToRules);
});

test('rejects malformed email, phone, and unknown club', () => {
  const result = validateMember({ ...validMember, email: 'not-an-email', phone: '123', club: 'Not a real club' });
  assert.ok(result.errors.email);
  assert.ok(result.errors.phone);
  assert.ok(result.errors.club);
});

test('rejects overlong optional fields', () => {
  const result = validateMember({ ...validMember, studentId: 'x'.repeat(51), interests: 'x'.repeat(1001) });
  assert.ok(result.errors.studentId);
  assert.ok(result.errors.interests);
});
