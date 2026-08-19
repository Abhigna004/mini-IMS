import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import pool from '../db/pool.js';
import { asyncWrapper } from '../middleware/asyncWrapper.js';
import { AppError } from '../middleware/AppError.js';

// Pre-computed hash used only to keep bcrypt timing constant when email is not found
const DUMMY_HASH = '$2a$12$K.Gvkg2bFgYJRIYXKQ85oOcDqS8c7uVZm.iBl7IHzM3jKVFeSBU/O';

export const login = asyncWrapper(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) throw new AppError(errors.array()[0].msg, 400);

  const { email, password } = req.body;

  const [rows] = await pool.execute(
    'SELECT id, first_name, last_name, email, role, password, account_status, deleted FROM admin WHERE email = ?',
    [email]
  );
  const admin = rows[0];

  // Always run bcrypt to prevent user-enumeration via timing
  const hashToCheck = admin ? admin.password : DUMMY_HASH;
  const passwordMatch = await bcrypt.compare(password, hashToCheck);

  if (!admin || !passwordMatch) {
    throw new AppError('Invalid credentials', 401);
  }

  if (admin.deleted === '1') {
    throw new AppError('Account deleted', 403);
  }

  if (admin.account_status === '0') {
    throw new AppError('Account suspended', 403);
  }

  const accessToken = jwt.sign(
    { sub: admin.id, email: admin.email, role: admin.role },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  const rawRefreshToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawRefreshToken).digest('hex');

  await pool.execute(
    'INSERT INTO refresh_tokens (admin_id, token_hash, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))',
    [admin.id, tokenHash]
  );

  res.cookie('refreshToken', rawRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  await pool.execute('UPDATE admin SET last_login = NOW() WHERE id = ?', [admin.id]);

  await pool.execute(
    "INSERT INTO event_log (admin_id, event_type, ip_address) VALUES (?, 'LOGIN', ?)",
    [admin.id, req.ip]
  );

  res.json({
    success: true,
    data: {
      accessToken,
      user: {
        id: admin.id,
        first_name: admin.first_name,
        last_name: admin.last_name,
        email: admin.email,
        role: admin.role,
      },
    },
  });
});
