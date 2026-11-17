import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import app from '../src/app.js';
import { connectDB, closeDB } from '../src/config/db.js';
import { User } from '../src/models/User.js';
import { Item } from '../src/models/Item.js';
import { LogEntry } from '../src/models/LogEntry.js';

describe('Phase 8 Complete End-to-End User Flow Walkthrough', () => {
  let adminToken = '';
  let volunteerToken = '';
  let createdItemId = '';
  let newVolunteerId = '';

  beforeAll(async () => {
    await connectDB();
    await User.deleteMany({});
    await Item.deleteMany({});
    await LogEntry.deleteMany({});

    const adminPass = await bcrypt.hash('AdminPass123!', 10);
    const volPass = await bcrypt.hash('Volunteer123!', 10);

    await User.create({
      name: 'Elena Rostova (Admin)',
      email: 'admin@communityfridge.org',
      passwordHash: adminPass,
      role: 'admin',
      isActive: true,
    });

    await User.create({
      name: 'Sarah Jenkins (Volunteer)',
      email: 'sarah.volunteer@communityfridge.org',
      passwordHash: volPass,
      role: 'volunteer',
      isActive: true,
    });
  });

  afterAll(async () => {
    await closeDB();
  });

  it('Step 1: Authenticate Volunteer and Admin', async () => {
    // Volunteer Login
    const volRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'sarah.volunteer@communityfridge.org', password: 'Volunteer123!' });
    expect(volRes.status).toBe(200);
    expect(volRes.body.data.token).toBeDefined();
    expect(volRes.body.data.user.role).toBe('volunteer');
    volunteerToken = volRes.body.data.token;

    // Admin Login
    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@communityfridge.org', password: 'AdminPass123!' });
    expect(adminRes.status).toBe(200);
    expect(adminRes.body.data.token).toBeDefined();
    expect(adminRes.body.data.user.role).toBe('admin');
    adminToken = adminRes.body.data.token;
  });

  it('Step 2: Add Item (Donation Intake)', async () => {
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const formatYMD = (d) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };

    const res = await request(app)
      .post('/api/items')
      .set('Authorization', `Bearer ${volunteerToken}`)
      .send({
        name: 'Greek Yogurt 500g',
        category: 'dairy',
        quantity: 4,
        unit: 'pots',
        useByDate: formatYMD(tomorrow),
        donatedBy: 'Local Co-op',
        storageLocation: 'fridge',
        allergensNote: 'Contains pasteurised cows milk',
        notes: 'Cold chain verified under 4 C on delivery',
      });

    expect(res.status).toBe(201);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.name).toBe('Greek Yogurt 500g');
    expect(res.body.data.quantity).toBe(4);
    createdItemId = res.body.data._id;
  });

  it('Step 3: See Highlight & Urgent Use-By Status', async () => {
    const res = await request(app)
      .get('/api/items?status=in_stock')
      .set('Authorization', `Bearer ${volunteerToken}`);

    expect(res.status).toBe(200);
    const items = res.body.data.items;
    const greekYogurt = items.find((i) => i._id === createdItemId);
    expect(greekYogurt).toBeDefined();
    expect(greekYogurt.useByStatus).toBe('soon'); // expiring tomorrow (within 2 days)
    expect(greekYogurt.daysRemaining).toBe(1);
  });

  it('Step 4: Collect Flow (Quantity Deduction & Audit)', async () => {
    const res = await request(app)
      .post(`/api/items/${createdItemId}/collect`)
      .set('Authorization', `Bearer ${volunteerToken}`)
      .send({
        quantity: 2,
        reason: 'emergency_relief',
        note: 'Added to family emergency hamper pack',
      });

    expect(res.status).toBe(200);
    expect(res.body.data.item.quantity).toBe(2);
    expect(res.body.data.item.status).toBe('in_stock');
    expect(res.body.data.log).toBeDefined();
    expect(res.body.data.log.type).toBe('collection');
    expect(res.body.data.log.quantity).toBe(2);
  });

  it('Step 5: Dispose Flow with Mandatory Audited Reason', async () => {
    // Rejects missing reason
    const badRes = await request(app)
      .post(`/api/items/${createdItemId}/dispose`)
      .set('Authorization', `Bearer ${volunteerToken}`)
      .send({ quantity: 1 });
    expect(badRes.status).toBe(400);

    // Rejects "other" without explanation note
    const badOtherRes = await request(app)
      .post(`/api/items/${createdItemId}/dispose`)
      .set('Authorization', `Bearer ${volunteerToken}`)
      .send({ quantity: 1, reason: 'other' });
    expect(badOtherRes.status).toBe(400);

    // Valid disposal
    const goodRes = await request(app)
      .post(`/api/items/${createdItemId}/dispose`)
      .set('Authorization', `Bearer ${volunteerToken}`)
      .send({
        quantity: 1,
        reason: 'damaged_packaging',
        note: 'Foil seal punctured during transport; discarded to prevent contamination',
      });

    expect(goodRes.status).toBe(200);
    expect(goodRes.body.data.item.quantity).toBe(1);
    expect(goodRes.body.data.log.reason).toBe('damaged_packaging');
  });

  it('Step 6: View Collection and Disposal Logs with Filters & Stats', async () => {
    // Collection logs
    const colRes = await request(app)
      .get('/api/logs?type=collection')
      .set('Authorization', `Bearer ${volunteerToken}`);
    expect(colRes.status).toBe(200);
    expect(colRes.body.data.logs.length).toBeGreaterThanOrEqual(1);
    expect(colRes.body.data.logs[0].type).toBe('collection');

    // Disposal logs
    const dispRes = await request(app)
      .get('/api/logs?type=disposal')
      .set('Authorization', `Bearer ${volunteerToken}`);
    expect(dispRes.status).toBe(200);
    expect(dispRes.body.data.logs.length).toBeGreaterThanOrEqual(1);
    expect(dispRes.body.data.logs[0].reason).toBe('damaged_packaging');

    // Stats Summary
    const statsRes = await request(app)
      .get('/api/stats/summary')
      .set('Authorization', `Bearer ${volunteerToken}`);
    expect(statsRes.status).toBe(200);
    expect(statsRes.body.data.inStock).toBe(1);
    expect(statsRes.body.data.soon).toBe(1);
  });

  it('Step 7: Admin Provision Volunteer & Toggle Deactivation', async () => {
    // Non-admin blocked (403)
    const forbiddenRes = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${volunteerToken}`)
      .send({
        name: 'Rachel Green',
        email: 'rachel.green@communityfridge.org',
        password: 'RachelPassword123!',
        role: 'volunteer',
      });
    expect(forbiddenRes.status).toBe(403);

    // Admin creates volunteer
    const createRes = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Rachel Green',
        email: 'rachel.green@communityfridge.org',
        password: 'RachelPassword123!',
        role: 'volunteer',
        phone: '+44 7700 900123',
      });
    expect(createRes.status).toBe(201);
    newVolunteerId = createRes.body.data._id;

    // Admin deactivates volunteer
    const deactRes = await request(app)
      .patch(`/api/users/${newVolunteerId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ isActive: false });
    expect(deactRes.status).toBe(200);
    expect(deactRes.body.data.isActive).toBe(false);

    // Deactivated volunteer blocked from login (403 Forbidden - inactive)
    const blockedLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'rachel.green@communityfridge.org', password: 'RachelPassword123!' });
    expect(blockedLogin.status).toBe(403);

    // Admin reactivates volunteer
    const reactRes = await request(app)
      .patch(`/api/users/${newVolunteerId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ isActive: true });
    expect(reactRes.status).toBe(200);
    expect(reactRes.body.data.isActive).toBe(true);

    // Reactivated volunteer logs in successfully
    const activeLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'rachel.green@communityfridge.org', password: 'RachelPassword123!' });
    expect(activeLogin.status).toBe(200);
    expect(activeLogin.body.data.token).toBeDefined();
  });
});
