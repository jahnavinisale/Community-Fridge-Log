import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import app from '../src/app.js';
import { connectDB, closeDB } from '../src/config/db.js';
import { config } from '../src/config/env.js';
import { User } from '../src/models/User.js';

describe('Phase 2 Authentication and Role Protection Tests', () => {
  let adminToken = '';
  let volunteerToken = '';
  let testVolunteerId = '';

  beforeAll(async () => {
    await connectDB();

    // Ensure Admin from env vars exists
    let admin = await User.findOne({ email: config.adminEmail.toLowerCase() });
    if (!admin) {
      const adminPasswordHash = await bcrypt.hash(config.adminPassword, 10);
      admin = await User.create({
        name: config.adminName,
        email: config.adminEmail.toLowerCase(),
        passwordHash: adminPasswordHash,
        role: 'admin',
        isActive: true,
      });
    }

    // Ensure Volunteer exists
    let volunteer = await User.findOne({ email: 'sarah.volunteer@communityfridge.org' });
    if (!volunteer) {
      const volPasswordHash = await bcrypt.hash('Volunteer123!', 10);
      volunteer = await User.create({
        name: 'Sarah Jenkins (Volunteer)',
        email: 'sarah.volunteer@communityfridge.org',
        passwordHash: volPasswordHash,
        role: 'volunteer',
        isActive: true,
      });
    }

    testVolunteerId = volunteer._id.toString();

    // Authenticate Admin
    const adminLoginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: config.adminEmail, password: config.adminPassword });
    expect(adminLoginRes.status).toBe(200);
    adminToken = adminLoginRes.body.data.token;

    // Authenticate Volunteer
    const volLoginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'sarah.volunteer@communityfridge.org', password: 'Volunteer123!' });
    expect(volLoginRes.status).toBe(200);
    volunteerToken = volLoginRes.body.data.token;
  });

  afterAll(async () => {
    await closeDB();
  });

  describe('1. Login Endpoint', () => {
    it('succeeds with valid admin credentials from env vars', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: config.adminEmail, password: config.adminPassword });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe(config.adminEmail.toLowerCase());
      expect(res.body.data.user.role).toBe('admin');
      expect(res.body.data.user.passwordHash).toBeUndefined(); // Sensitive hash stripped
    });

    it('succeeds with valid volunteer credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'sarah.volunteer@communityfridge.org', password: 'Volunteer123!' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.role).toBe('volunteer');
    });

    it('rejects wrong password with 401 and INVALID_CREDENTIALS', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: config.adminEmail, password: 'IncorrectPassword' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
      expect(res.body.error.message).toMatch(/invalid.*credentials/i);
    });

    it('rejects non-existent email with 401 and INVALID_CREDENTIALS', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nonexistent@communityfridge.org', password: 'SomePassword123!' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
    });

    it('rejects empty payload with 400 VALIDATION_ERROR via Zod middleware', async () => {
      const res = await request(app).post('/api/auth/login').send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
      expect(Array.isArray(res.body.error.details)).toBe(true);
    });
  });

  describe('2. /api/auth/me Endpoint & JWT Middleware', () => {
    it('returns current user details when valid Bearer token is provided', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${volunteerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('sarah.volunteer@communityfridge.org');
      expect(res.body.data.user.role).toBe('volunteer');
    });

    it('rejects request with missing Authorization header (401 UNAUTHORIZED)', async () => {
      const res = await request(app).get('/api/auth/me');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('rejects request with invalid or malformed token (401 INVALID_TOKEN)', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid.token.string');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_TOKEN');
    });
  });

  describe('3. Role Protection & Admin-Only User Management', () => {
    it('rejects unauthenticated access to GET /api/users (401 UNAUTHORIZED)', async () => {
      const res = await request(app).get('/api/users');
      expect(res.status).toBe(401);
    });

    it('rejects volunteer access to GET /api/users (403 FORBIDDEN)', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${volunteerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('allows admin access to GET /api/users (200 OK)', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(2);
    });

    it('rejects volunteer creating new user via POST /api/users (403 FORBIDDEN)', async () => {
      const res = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${volunteerToken}`)
        .send({
          name: 'Unauthorized User',
          email: 'unauthorized@communityfridge.org',
          password: 'Password123!',
          role: 'volunteer',
        });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('allows admin to create a new volunteer account via POST /api/users (201 Created)', async () => {
      const uniqueEmail = `test.volunteer.${Date.now()}@communityfridge.org`;
      const res = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Phase 2 Test Volunteer',
          email: uniqueEmail,
          password: 'SecurePass123!',
          role: 'volunteer',
          phone: '+44 7700 900888',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Phase 2 Test Volunteer');
      expect(res.body.data.email).toBe(uniqueEmail.toLowerCase());
      expect(res.body.data.role).toBe('volunteer');
      expect(res.body.data.passwordHash).toBeUndefined();
    });

    it('allows admin to update/deactivate volunteer via PATCH /api/users/:id', async () => {
      const res = await request(app)
        .patch(`/api/users/${testVolunteerId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isActive: false });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isActive).toBe(false);

      // Restore active state
      await request(app)
        .patch(`/api/users/${testVolunteerId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isActive: true });
    });

    it('prevents admin from deactivating their own administrative account (400 Bad Request)', async () => {
      // Find admin's ID
      const admin = await User.findOne({ email: config.adminEmail.toLowerCase() });
      const res = await request(app)
        .patch(`/api/users/${admin._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isActive: false });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('SELF_DEACTIVATION_PREVENTED');
    });
  });
});
