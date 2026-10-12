import { Router } from 'express';
import pool from '../db.js';
import { validateMember, CLUBS } from '../validation/member.js';

const router = Router();

function getValidId(rawId) {
  const id = Number(rawId);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

function getQueryString(value, maximumLength = 100) {
  return typeof value === 'string' ? value.trim().slice(0, maximumLength) : '';
}

async function emailAlreadyExists(email, excludedId = 0) {
  const [rows] = await pool.execute(
    'SELECT id FROM members WHERE email = ? AND id <> ? LIMIT 1',
    [email, excludedId],
  );
  return rows.length > 0;
}

function sendValidationError(res, errors) {
  return res.status(400).json({ message: 'Please correct the highlighted fields.', errors });
}

export async function listMembers(req, res) {
  const search = getQueryString(req.query.search, 100);
  const club = getQueryString(req.query.club, 80);
  if (club && !CLUBS.includes(club)) {
    return res.status(400).json({ message: 'Choose a valid club filter.' });
  }
  const searchTerm = `%${search}%`;

  try {
    const [rows] = await pool.execute(
      `SELECT id, full_name AS fullName, email, phone, student_id AS studentId, club,
        membership_type AS membershipType, interests, reason, agree_to_rules AS agreeToRules, created_at AS createdAt
       FROM members
       WHERE (? = '' OR full_name LIKE ? OR email LIKE ? OR phone LIKE ? OR student_id LIKE ? OR club LIKE ? OR membership_type LIKE ?)
         AND (? = '' OR club = ?)
       ORDER BY created_at DESC, id DESC`,
      [search, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, club, club],
    );
    return res.status(200).json(rows);
  } catch (error) {
    console.error('listMembers failed:', error);
    return res.status(500).json({ message: 'Could not load club members.' });
  }
}

export async function getMemberById(req, res) {
  const id = getValidId(req.params.id);
  if (!id) {
    return res.status(400).json({ message: 'Member ID must be a positive integer.' });
  }

  try {
    const [rows] = await pool.execute(`SELECT id, full_name AS fullName, email, phone, student_id AS studentId, club, membership_type AS membershipType, interests, reason, agree_to_rules AS agreeToRules, created_at AS createdAt FROM members WHERE id = ? LIMIT 1`, [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Member not found.' });
    }
    return res.status(200).json(rows[0]);
  } catch (error) {
    console.error('getMemberById failed:', error);
    return res.status(500).json({ message: 'Could not load that member.' });
  }
}

export async function createMember(req, res) {
  const { value, errors } = validateMember(req.body);
  if (Object.keys(errors).length > 0) {
    return sendValidationError(res, errors);
  }

  try {
    if (await emailAlreadyExists(value.email)) {
      return sendValidationError(res, { email: 'A member with this email address is already registered.' });
    }

    const [result] = await pool.execute(
      `INSERT INTO members
        (full_name, email, phone, student_id, club, membership_type, interests, reason, agree_to_rules)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [value.fullName, value.email, value.phone, value.studentId || null, value.club, value.membershipType,
        value.interests || null, value.reason || null, value.agreeToRules ? 1 : 0],
    );
    const [rows] = await pool.execute(`SELECT id, full_name AS fullName, email, phone, student_id AS studentId, club, membership_type AS membershipType, interests, reason, agree_to_rules AS agreeToRules, created_at AS createdAt FROM members WHERE id = ? LIMIT 1`, [result.insertId]);
    return res.status(201).json(rows[0]);
  } catch (error) {
    if (error?.code === 'ER_DUP_ENTRY') {
      return sendValidationError(res, { email: 'A member with this email address is already registered.' });
    }
    console.error('createMember failed:', error);
    return res.status(500).json({ message: 'Could not save the membership. Please try again.' });
  }
}

export async function updateMember(req, res) {
  const id = getValidId(req.params.id);
  if (!id) {
    return res.status(400).json({ message: 'Member ID must be a positive integer.' });
  }

  const { value, errors } = validateMember(req.body);
  if (Object.keys(errors).length > 0) {
    return sendValidationError(res, errors);
  }

  try {
    const [existing] = await pool.execute('SELECT id FROM members WHERE id = ? LIMIT 1', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Member not found.' });
    }

    if (await emailAlreadyExists(value.email, id)) {
      return sendValidationError(res, { email: 'Another member is already using this email address.' });
    }

    await pool.execute(
      `UPDATE members
       SET full_name = ?, email = ?, phone = ?, student_id = ?, club = ?, membership_type = ?,
           interests = ?, reason = ?, agree_to_rules = ?
       WHERE id = ?`,
      [value.fullName, value.email, value.phone, value.studentId || null, value.club, value.membershipType,
        value.interests || null, value.reason || null, value.agreeToRules ? 1 : 0, id],
    );
    const [rows] = await pool.execute(`SELECT id, full_name AS fullName, email, phone, student_id AS studentId, club, membership_type AS membershipType, interests, reason, agree_to_rules AS agreeToRules, created_at AS createdAt FROM members WHERE id = ? LIMIT 1`, [id]);
    return res.status(200).json(rows[0]);
  } catch (error) {
    if (error?.code === 'ER_DUP_ENTRY') {
      return sendValidationError(res, { email: 'Another member is already using this email address.' });
    }
    console.error('updateMember failed:', error);
    return res.status(500).json({ message: 'Could not update the membership.' });
  }
}

export async function deleteMember(req, res) {
  const id = getValidId(req.params.id);
  if (!id) {
    return res.status(400).json({ message: 'Member ID must be a positive integer.' });
  }

  try {
    const [result] = await pool.execute('DELETE FROM members WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Member not found.' });
    }
    return res.status(200).json({ message: 'Member deleted successfully.', id });
  } catch (error) {
    console.error('deleteMember failed:', error);
    return res.status(500).json({ message: 'Could not delete the member.' });
  }
}

router.get('/', listMembers);
router.get('/:id', getMemberById);
router.post('/', createMember);
router.put('/:id', updateMember);
router.delete('/:id', deleteMember);

export default router;
