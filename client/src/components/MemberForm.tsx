import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import axios from 'axios';
import { ArrowRight, CheckCircle2, ClipboardList, UserRoundPlus } from 'lucide-react';
import { CLUBS, EMPTY_MEMBER_FORM, MEMBERSHIP_TYPES } from '../types';
import type { FieldErrors, Member, MemberPayload } from '../types';

interface MemberFormProps {
  editingMember: Member | null;
  saving: boolean;
  onSave: (payload: MemberPayload) => Promise<void>;
  onCancelEdit: () => void;
}

function validateForm(form: MemberPayload): FieldErrors {
  const errors: FieldErrors = {};
  const name = form.fullName.trim();
  const email = form.email.trim();
  const phone = form.phone.trim();

  if (name.length < 2) errors.fullName = 'Enter at least 2 characters.';
  else if (name.length > 100) errors.fullName = 'Name must be 100 characters or fewer.';

  if (!email) errors.email = 'Email is required.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Enter a valid email address.';
  else if (email.length > 150) errors.email = 'Email must be 150 characters or fewer.';

  if (!phone) errors.phone = 'Phone number is required.';
  else if (!/^[0-9+().\-\s]{7,30}$/.test(phone) || phone.replace(/\D/g, '').length < 7) {
    errors.phone = 'Enter a valid phone number with at least 7 digits.';
  }

  if (!form.club) errors.club = 'Choose a club.';
  if (!form.membershipType) errors.membershipType = 'Choose a membership type.';
  if (form.studentId.trim().length > 50) errors.studentId = 'Student ID must be 50 characters or fewer.';
  if (form.interests.length > 1000) errors.interests = 'Keep interests under 1,000 characters.';
  if (form.reason.trim().length > 1000) errors.reason = 'Keep your answer under 1,000 characters.';
  if (!form.agreeToRules) errors.agreeToRules = 'Please confirm that you agree to the club guidelines.';

  return errors;
}

function serverErrors(error: unknown): FieldErrors {
  if (axios.isAxiosError(error)) {
    const errors = error.response?.data?.errors;
    if (errors && typeof errors === 'object') return errors as FieldErrors;
  }
  return {};
}

function errorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) return 'The API could not be reached. Check that Express is running on port 3000.';
    return error.response.data?.message || 'Could not save the membership. Please try again.';
  }
  if (error instanceof Error) return error.message;
  return 'Could not save the membership. Please try again.';
}

export default function MemberForm({ editingMember, saving, onSave, onCancelEdit }: MemberFormProps) {
  const [form, setForm] = useState<MemberPayload>({ ...EMPTY_MEMBER_FORM });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState('');
  const nameInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingMember) {
      setForm({
        fullName: editingMember.fullName,
        email: editingMember.email,
        phone: editingMember.phone,
        studentId: editingMember.studentId || '',
        club: editingMember.club,
        membershipType: editingMember.membershipType,
        interests: editingMember.interests || '',
        reason: editingMember.reason || '',
        agreeToRules: Boolean(editingMember.agreeToRules),
      });
      setErrors({});
      setSubmitError('');
      nameInput.current?.focus();
    } else {
      setForm({ ...EMPTY_MEMBER_FORM });
      setErrors({});
      setSubmitError('');
    }
  }, [editingMember]);

  function handleChange(event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value, type } = event.target;
    const nextValue = type === 'checkbox' ? (event.target as HTMLInputElement).checked : value;
    setForm((previous) => ({ ...previous, [name]: nextValue } as MemberPayload));
    setErrors((previous) => ({ ...previous, [name as keyof FieldErrors]: undefined }));
    setSubmitError('');
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateForm(form);
    setErrors(nextErrors);
    setSubmitError('');
    if (Object.keys(nextErrors).length > 0) {
      const firstInvalid = Object.keys(nextErrors)[0];
      document.getElementById(firstInvalid)?.focus();
      return;
    }

    try {
      await onSave({
        ...form,
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        studentId: form.studentId.trim(),
        interests: form.interests.trim(),
        reason: form.reason.trim(),
      });
      setForm({ ...EMPTY_MEMBER_FORM });
      setErrors({});
      setSubmitError('');
    } catch (error) {
      setErrors(serverErrors(error));
      setSubmitError(errorMessage(error));
    }
  }

  return (
    <section className="panel form-panel" aria-labelledby="form-heading">
      <div className="panel-heading form-heading">
        <div className="heading-icon"><UserRoundPlus size={19} /></div>
        <div>
          <p className="eyebrow">MEMBERSHIP FORM</p>
          <h2 id="form-heading">{editingMember ? 'Edit member details' : 'Register a member'}</h2>
          <p className="panel-subtitle">Fill in the details below to add a club member.</p>
        </div>
      </div>

      {submitError && <div className="form-alert" role="alert">{submitError}</div>}

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-section-label"><span>01</span> Personal information</div>
        <div className="field-grid">
          <div className="field field-full">
            <label htmlFor="fullName">Full name <span className="required">*</span></label>
            <input ref={nameInput} id="fullName" name="fullName" value={form.fullName} onChange={handleChange} placeholder="e.g. Alex Santos" autoComplete="name" aria-invalid={Boolean(errors.fullName)} aria-describedby={errors.fullName ? 'fullName-error' : undefined} />
            {errors.fullName && <small className="field-error" id="fullName-error">{errors.fullName}</small>}
          </div>
          <div className="field">
            <label htmlFor="email">Email address <span className="required">*</span></label>
            <input id="email" type="email" name="email" value={form.email} onChange={handleChange} placeholder="alex@email.com" autoComplete="email" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'email-error' : undefined} />
            {errors.email && <small className="field-error" id="email-error">{errors.email}</small>}
          </div>
          <div className="field">
            <label htmlFor="phone">Phone number <span className="required">*</span></label>
            <input id="phone" type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="09XX XXX XXXX" autoComplete="tel" aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? 'phone-error' : undefined} />
            {errors.phone && <small className="field-error" id="phone-error">{errors.phone}</small>}
          </div>
          <div className="field field-full">
            <label htmlFor="studentId">Student ID <span className="optional">Optional</span></label>
            <input id="studentId" name="studentId" value={form.studentId} onChange={handleChange} placeholder="e.g. 2026-01234" autoComplete="off" aria-invalid={Boolean(errors.studentId)} aria-describedby={errors.studentId ? 'studentId-error' : undefined} />
            {errors.studentId && <small className="field-error" id="studentId-error">{errors.studentId}</small>}
          </div>
        </div>

        <div className="form-section-label section-spaced"><span>02</span> Club preferences</div>
        <div className="field-grid">
          <div className="field">
            <label htmlFor="club">Club <span className="required">*</span></label>
            <select id="club" name="club" value={form.club} onChange={handleChange} aria-invalid={Boolean(errors.club)} aria-describedby={errors.club ? 'club-error' : undefined}>
              <option value="">Choose a club</option>
              {CLUBS.map((club) => <option key={club} value={club}>{club}</option>)}
            </select>
            {errors.club && <small className="field-error" id="club-error">{errors.club}</small>}
          </div>
          <div className="field">
            <label htmlFor="membershipType">Membership type <span className="required">*</span></label>
            <select id="membershipType" name="membershipType" value={form.membershipType} onChange={handleChange} aria-invalid={Boolean(errors.membershipType)} aria-describedby={errors.membershipType ? 'membershipType-error' : undefined}>
              <option value="">Choose a type</option>
              {MEMBERSHIP_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
            </select>
            {errors.membershipType && <small className="field-error" id="membershipType-error">{errors.membershipType}</small>}
          </div>
          <div className="field field-full">
            <label htmlFor="interests">Areas of interest <span className="optional">Optional</span></label>
            <input id="interests" name="interests" value={form.interests} onChange={handleChange} placeholder="e.g. Web development, photography, event planning" aria-invalid={Boolean(errors.interests)} aria-describedby={errors.interests ? 'interests-error' : undefined} />
            {errors.interests && <small className="field-error" id="interests-error">{errors.interests}</small>}
          </div>
          <div className="field field-full">
            <label htmlFor="reason">Why do you want to join? <span className="optional">Optional</span></label>
            <textarea id="reason" name="reason" value={form.reason} onChange={handleChange} placeholder="Tell us what you hope to learn or contribute…" rows={3} aria-invalid={Boolean(errors.reason)} aria-describedby={errors.reason ? 'reason-error' : undefined} />
            {errors.reason && <small className="field-error" id="reason-error">{errors.reason}</small>}
          </div>
        </div>

        <div className={`agreement-row ${errors.agreeToRules ? 'agreement-invalid' : ''}`}>
          <input id="agreeToRules" name="agreeToRules" type="checkbox" checked={form.agreeToRules} onChange={handleChange} aria-invalid={Boolean(errors.agreeToRules)} aria-describedby={errors.agreeToRules ? 'agreeToRules-error' : undefined} />
          <label htmlFor="agreeToRules">I agree to follow the club's guidelines and code of conduct.</label>
        </div>
        {errors.agreeToRules && <small className="field-error agreement-error" id="agreeToRules-error">{errors.agreeToRules}</small>}

        <div className="form-actions">
          {editingMember && <button type="button" className="button button-quiet" onClick={onCancelEdit} disabled={saving}>Cancel</button>}
          <button type="submit" className="button button-primary submit-button" disabled={saving}>
            {saving ? <span className="spinner" aria-hidden="true" /> : editingMember ? <ClipboardList size={17} /> : <CheckCircle2 size={17} />}
            {saving ? 'Saving…' : editingMember ? 'Save changes' : 'Submit registration'}
            {!saving && <ArrowRight size={16} />}
          </button>
        </div>
        <p className="form-footnote"><span className="required">*</span> Required fields. Your registration is stored in the membership database.</p>
      </form>
    </section>
  );
}
