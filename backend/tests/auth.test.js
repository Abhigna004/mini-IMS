import request from 'supertest';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import app from '../src/app.js';
import pool from '../src/db/pool.js';

// Test-only accounts inserted in beforeAll and removed in afterAll
const SUSPENDED_EMAIL = 'suspended-test@mini-ims.local';
const DELETED_EMAIL   = 'deleted-test@mini-ims.local';

beforeAll(async () => {
  const hash = await bcrypt.hash('Test@123', 12);
  await pool.execute(
    `INSERT IGNORE INTO admin
       (first_name, last_name, email, mobile1, mobile2, password, role,
        created_on, last_login, last_seen, account_status, deleted)
     VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), NOW(), ?, ?)`,
    ['Suspended', 'User', SUSPENDED_EMAIL, '08000000099', '', hash, 'Staff', '0', '0']
  );
  await pool.execute(
    `INSERT IGNORE INTO admin
       (first_name, last_name, email, mobile1, mobile2, password, role,
        created_on, last_login, last_seen, account_status, deleted)
     VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), NOW(), ?, ?)`,
    ['Deleted', 'User', DELETED_EMAIL, '08000000098', '', hash, 'Staff', '1', '1']
  );
});

afterAll(async () => {
  await pool.execute("DELETE FROM admin WHERE email IN (?, ?)", [SUSPENDED_EMAIL, DELETED_EMAIL]);
  await pool.end();
});

describe('POST /api/auth/login', () => {
  it('TC_P2_001: Login with valid Super credentials returns 200 + accessToken + user object + cookie', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@mini-ims.local', password: 'Admin@123' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('accessToken');
    expect(res.body.data.user).toMatchObject({
      email: 'admin@mini-ims.local',
      role: 'Super',
    });
    expect(res.body.data.user).toHaveProperty('id');
    expect(res.body.data.user).toHaveProperty('first_name');
    expect(res.body.data.user).toHaveProperty('last_name');
    const cookies = res.headers['set-cookie'] ?? [];
    expect(cookies.some((c) => c.startsWith('refreshToken='))).toBe(true);
    expect(cookies.some((c) => c.includes('HttpOnly'))).toBe(true);
    expect(cookies.some((c) => c.toLowerCase().includes('samesite=strict'))).toBe(true);
  });

  it('TC_P2_002: Login with valid Staff credentials returns 200 + role Staff + cookie', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'staff@mini-ims.local', password: 'Staff@123' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.role).toBe('Staff');
    const cookies = res.headers['set-cookie'] ?? [];
    expect(cookies.some((c) => c.startsWith('refreshToken='))).toBe(true);
  });

  it('TC_P2_003: Login with wrong password returns 401 generic error', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@mini-ims.local', password: 'wrongpass' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBeTruthy();
  });

  it('TC_P2_004: Login with non-existent email returns same 401 generic error (no user enumeration)', async () => {
    const resNotFound = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@test.com', password: 'anypass' });

    const resWrongPwd = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@mini-ims.local', password: 'wrongpass' });

    expect(resNotFound.status).toBe(401);
    expect(resWrongPwd.status).toBe(401);
    expect(resNotFound.body.success).toBe(false);
    expect(resWrongPwd.body.success).toBe(false);
    // Both should return the same error message (no enumeration)
    expect(resNotFound.body.error).toBe(resWrongPwd.body.error);
  });

  it('TC_P2_005: Login with suspended account (account_status=0) returns 403', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: SUSPENDED_EMAIL, password: 'Test@123' });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('TC_P2_006: Login with soft-deleted account (deleted=1) returns 403', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: DELETED_EMAIL, password: 'Test@123' });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('TC_P2_007: Login with missing email field returns 400 validation error', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ password: 'Admin@123' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('TC_P2_008: Login with missing password field returns 400 validation error', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@mini-ims.local' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('TC_P2_009: Login with invalid email format returns 400 validation error', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'not-an-email', password: 'Admin@123' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('TC_P2_010: Login with uppercase email succeeds (normalizeEmail lowercases it)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ADMIN@MINI-IMS.LOCAL', password: 'Admin@123' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('TC_P2_011: last_login is updated on successful login', async () => {
    const before = Date.now() - 2000; // 2s buffer
    await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@mini-ims.local', password: 'Admin@123' });

    const [[row]] = await pool.execute(
      "SELECT last_login FROM admin WHERE email = 'admin@mini-ims.local'"
    );
    expect(new Date(row.last_login).getTime()).toBeGreaterThanOrEqual(before);
  });

  it('TC_P2_012: LOGIN event is inserted into event_log on successful login', async () => {
    const [before] = await pool.execute(
      "SELECT COUNT(*) AS cnt FROM event_log WHERE event_type = 'LOGIN'"
    );
    const countBefore = before[0].cnt;

    await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@mini-ims.local', password: 'Admin@123' });

    const [after] = await pool.execute(
      "SELECT COUNT(*) AS cnt FROM event_log WHERE event_type = 'LOGIN'"
    );
    expect(Number(after[0].cnt)).toBeGreaterThan(Number(countBefore));
  });

  it('TC_P2_013: FAILED_LOGIN event is inserted into event_log on bad password', async () => {
    const [before] = await pool.execute(
      "SELECT COUNT(*) AS cnt FROM event_log WHERE event_type = 'FAILED_LOGIN'"
    );
    const countBefore = before[0].cnt;

    await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@mini-ims.local', password: 'wrongpass' });

    const [after] = await pool.execute(
      "SELECT COUNT(*) AS cnt FROM event_log WHERE event_type = 'FAILED_LOGIN'"
    );
    // NOTE: FAILED_LOGIN logging is not yet implemented in MI-18 — this test is expected to fail
    expect(Number(after[0].cnt)).toBeGreaterThan(Number(countBefore));
  });

  it('TC_P2_014: Refresh token stored in DB as SHA-256 hash, not raw value', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@mini-ims.local', password: 'Admin@123' });

    expect(res.status).toBe(200);

    const cookies = res.headers['set-cookie'] ?? [];
    const cookieHeader = cookies.find((c) => c.startsWith('refreshToken=')) ?? '';
    const rawToken = cookieHeader.split('=')[1]?.split(';')[0] ?? '';
    expect(rawToken).toBeTruthy();

    const expectedHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const [[row]] = await pool.execute(
      'SELECT token_hash FROM refresh_tokens WHERE token_hash = ? LIMIT 1',
      [expectedHash]
    );
    expect(row).toBeTruthy();
    // The raw token must NOT be stored
    const [[rawRow]] = await pool.execute(
      'SELECT token_hash FROM refresh_tokens WHERE token_hash = ? LIMIT 1',
      [rawToken]
    );
    expect(rawRow).toBeUndefined();
  });
});
