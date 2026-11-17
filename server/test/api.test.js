import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import app from '../src/app.js';
import { connectDB, closeDB } from '../src/config/db.js';
import { User } from '../src/models/User.js';
import { Item } from '../src/models/Item.js';
import { Fridge } from '../src/models/Fridge.js';
import { LogEntry } from '../src/models/LogEntry.js';

describe('Phase 3 Complete Item, Collect, Dispose, Logs, and Stats API Suite', () => {
  let adminToken = '';
  let volunteerToken = '';
  let testItemId = '';
  let exhaustibleItemId = '';

  beforeAll(async () => {
    await connectDB();

    // Ensure demo accounts
    let admin = await User.findOne({ email: 'admin@communityfridge.org' });
    if (!admin) {
      const adminPasswordHash = await bcrypt.hash('AdminPass123!', 10);
      admin = await User.create({
        name: 'Elena Rostova (Admin)',
        email: 'admin@communityfridge.org',
        passwordHash: adminPasswordHash,
        role: 'admin',
        isActive: true,
      });
    }

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

    let defaultFridge = await Fridge.findOne({ isDefault: true });
    if (!defaultFridge) {
      defaultFridge = await Fridge.create({
        name: 'Main Community Fridge',
        location: '104 High Street, Community Center',
        isDefault: true,
      });
    }

    // Authenticate Admin
    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@communityfridge.org', password: 'AdminPass123!' });
    expect(adminRes.status).toBe(200);
    adminToken = adminRes.body.data.token;

    // Authenticate Volunteer
    const volRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'sarah.volunteer@communityfridge.org', password: 'Volunteer123!' });
    expect(volRes.status).toBe(200);
    volunteerToken = volRes.body.data.token;
  });

  afterAll(async () => {
    await closeDB();
  });

  describe('1. Item Creation, Listing & Details', () => {
    it('POST /api/items creates new food item and records automatic intake log', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const res = await request(app)
        .post('/api/items')
        .set('Authorization', `Bearer ${volunteerToken}`)
        .send({
          name: '[TEST] Fresh Strawberry Punnets',
          category: 'produce',
          quantity: 10,
          unit: 'packs',
          useByDate: tomorrow.toISOString(),
          dateReceived: new Date().toISOString(),
          donatedBy: 'Organic Berry Farm',
          storageLocation: 'fridge',
          storageNote: 'Bottom crisper drawer',
          allergensNote: 'None',
          notes: 'Inspected upon delivery',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data._id).toBeDefined();
      expect(res.body.data.name).toBe('[TEST] Fresh Strawberry Punnets');
      expect(res.body.data.quantity).toBe(10);
      expect(res.body.data.status).toBe('in_stock');

      testItemId = res.body.data._id;

      // Verify automatic intake log was created in DB
      const intakeLog = await LogEntry.findOne({ item: testItemId, type: 'intake' });
      expect(intakeLog).not.toBeNull();
      expect(intakeLog.quantity).toBe(10);
      expect(intakeLog.itemName).toBe('[TEST] Fresh Strawberry Punnets');
    });

    it('POST /api/items rejects invalid payload with 400 VALIDATION_ERROR', async () => {
      const res = await request(app)
        .post('/api/items')
        .set('Authorization', `Bearer ${volunteerToken}`)
        .send({
          name: 'A', // too short (< 2 chars)
          category: 'invalid_category',
          quantity: -3, // negative
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
      expect(Array.isArray(res.body.error.details)).toBe(true);
    });

    it('GET /api/items returns list of active stock', async () => {
      const res = await request(app)
        .get('/api/items')
        .set('Authorization', `Bearer ${volunteerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.items)).toBe(true);
      expect(res.body.data.pagination).toBeDefined();
    });

    it('GET /api/items?category=produce filters items by category', async () => {
      const res = await request(app)
        .get('/api/items?category=produce')
        .set('Authorization', `Bearer ${volunteerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.items.every((i) => i.category === 'produce')).toBe(true);
    });

    it('GET /api/items?expiringWithinDays=2 filters items expiring soon', async () => {
      const res = await request(app)
        .get('/api/items?expiringWithinDays=2')
        .set('Authorization', `Bearer ${volunteerToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data.items)).toBe(true);
    });

    it('GET /api/items/:id returns item details and lifecycle audit logs', async () => {
      const res = await request(app)
        .get(`/api/items/${testItemId}`)
        .set('Authorization', `Bearer ${volunteerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.item._id).toBe(testItemId);
      expect(Array.isArray(res.body.data.logs)).toBe(true);
      expect(res.body.data.logs.length).toBeGreaterThanOrEqual(1);
    });

    it('PATCH /api/items/:id updates item fields', async () => {
      const res = await request(app)
        .patch(`/api/items/${testItemId}`)
        .set('Authorization', `Bearer ${volunteerToken}`)
        .send({ storageNote: 'Moved to middle shelf' });

      expect(res.status).toBe(200);
      expect(res.body.data.storageNote).toBe('Moved to middle shelf');
    });
  });

  describe('2. Collection Business Rules & Quantity Limits', () => {
    it('rejects collecting more than available stock with 400 INSUFFICIENT_QUANTITY', async () => {
      const res = await request(app)
        .post(`/api/items/${testItemId}/collect`)
        .set('Authorization', `Bearer ${volunteerToken}`)
        .send({
          quantity: 999, // available is 10
          reason: 'community_pickup',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INSUFFICIENT_QUANTITY');
    });

    it('successfully collects partial quantity and deducts remaining stock', async () => {
      const res = await request(app)
        .post(`/api/items/${testItemId}/collect`)
        .set('Authorization', `Bearer ${volunteerToken}`)
        .send({
          quantity: 3,
          reason: 'community_pickup',
          note: 'Taken by local community visitor',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.item.quantity).toBe(7); // 10 - 3 = 7
      expect(res.body.data.item.status).toBe('in_stock');
      expect(res.body.data.log.type).toBe('collection');
      expect(res.body.data.log.quantity).toBe(3);
    });
  });

  describe('3. Disposal Business Rules & Mandatory Reasons', () => {
    it('rejects disposal without a reason with 400 VALIDATION_ERROR', async () => {
      const res = await request(app)
        .post(`/api/items/${testItemId}/dispose`)
        .set('Authorization', `Bearer ${volunteerToken}`)
        .send({
          quantity: 1,
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('rejects disposal with invalid reason with 400 VALIDATION_ERROR', async () => {
      const res = await request(app)
        .post(`/api/items/${testItemId}/dispose`)
        .set('Authorization', `Bearer ${volunteerToken}`)
        .send({
          quantity: 1,
          reason: 'invalid_reason_code',
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('rejects disposal with reason "other" when note is missing with 400 VALIDATION_ERROR', async () => {
      const res = await request(app)
        .post(`/api/items/${testItemId}/dispose`)
        .set('Authorization', `Bearer ${volunteerToken}`)
        .send({
          quantity: 1,
          reason: 'other',
          note: '',
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
      expect(res.body.error.details.some((d) => d.field === 'note')).toBe(true);
    });

    it('rejects disposal with reason "other" when note is too short (< 3 chars)', async () => {
      const res = await request(app)
        .post(`/api/items/${testItemId}/dispose`)
        .set('Authorization', `Bearer ${volunteerToken}`)
        .send({
          quantity: 1,
          reason: 'other',
          note: 'no', // only 2 chars
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('rejects disposing more than available stock with 400 INSUFFICIENT_QUANTITY', async () => {
      const res = await request(app)
        .post(`/api/items/${testItemId}/dispose`)
        .set('Authorization', `Bearer ${volunteerToken}`)
        .send({
          quantity: 50, // available is 7
          reason: 'spoiled',
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('INSUFFICIENT_QUANTITY');
    });

    it('succeeds with reason "other" when valid explanation note is provided', async () => {
      const res = await request(app)
        .post(`/api/items/${testItemId}/dispose`)
        .set('Authorization', `Bearer ${volunteerToken}`)
        .send({
          quantity: 1,
          reason: 'other',
          note: 'Package dropped on floor during restocking',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.item.quantity).toBe(6); // 7 - 1 = 6
      expect(res.body.data.log.reason).toBe('other');
    });

    it('succeeds with standard disposal reason (e.g. damaged_packaging)', async () => {
      const res = await request(app)
        .post(`/api/items/${testItemId}/dispose`)
        .set('Authorization', `Bearer ${volunteerToken}`)
        .send({
          quantity: 1,
          reason: 'damaged_packaging',
          note: 'Plastic lid cracked',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.item.quantity).toBe(5); // 6 - 1 = 5
    });
  });

  describe('4. Zero Stock Status Transitions', () => {
    beforeAll(async () => {
      const defaultFridge = await Fridge.findOne();
      const admin = await User.findOne({ role: 'admin' });
      const item = await Item.create({
        name: '[TEST] Single Serving Soup',
        category: 'cooked meal',
        quantity: 2,
        unit: 'portions',
        useByDate: new Date(),
        fridge: defaultFridge._id,
        addedBy: admin._id,
        createdBy: admin._id,
        status: 'in_stock',
      });
      exhaustibleItemId = item._id.toString();
    });

    it('marks item as collected when remaining quantity reaches 0', async () => {
      const res = await request(app)
        .post(`/api/items/${exhaustibleItemId}/collect`)
        .set('Authorization', `Bearer ${volunteerToken}`)
        .send({
          quantity: 2, // collect entire stock
          reason: 'community_pickup',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.item.quantity).toBe(0);
      expect(res.body.data.item.status).toBe('collected');

      // Verify cannot collect again when not in stock
      const retryRes = await request(app)
        .post(`/api/items/${exhaustibleItemId}/collect`)
        .set('Authorization', `Bearer ${volunteerToken}`)
        .send({ quantity: 1 });

      expect(retryRes.status).toBe(400);
      expect(retryRes.body.error.code).toBe('ITEM_NOT_IN_STOCK');
    });
  });

  describe('5. Logs & Summary Stats Endpoints', () => {
    it('GET /api/stats/summary returns status counts', async () => {
      const res = await request(app)
        .get('/api/stats/summary')
        .set('Authorization', `Bearer ${volunteerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(typeof res.body.data.expired).toBe('number');
      expect(typeof res.body.data.useToday).toBe('number');
      expect(typeof res.body.data.within2Days).toBe('number');
      expect(typeof res.body.data.inStock).toBe('number');
    });

    it('GET /api/logs/stats returns dashboard breakdown', async () => {
      const res = await request(app)
        .get('/api/logs/stats')
        .set('Authorization', `Bearer ${volunteerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.urgencySummary).toBeDefined();
      expect(res.body.data.logTotals).toBeDefined();
      expect(Array.isArray(res.body.data.disposalReasonsBreakdown)).toBe(true);
      expect(Array.isArray(res.body.data.categoryBreakdown)).toBe(true);
    });

    it('GET /api/logs returns paginated logs with filters', async () => {
      const res = await request(app)
        .get('/api/logs?type=disposal')
        .set('Authorization', `Bearer ${volunteerToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data.logs)).toBe(true);
      expect(res.body.data.logs.every((l) => l.type === 'disposal')).toBe(true);
    });
  });

  describe('6. Item Deletion', () => {
    it('DELETE /api/items/:id removes the item record', async () => {
      const res = await request(app)
        .delete(`/api/items/${exhaustibleItemId}`)
        .set('Authorization', `Bearer ${volunteerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const checkRes = await request(app)
        .get(`/api/items/${exhaustibleItemId}`)
        .set('Authorization', `Bearer ${volunteerToken}`);

      expect(checkRes.status).toBe(404);
    });
  });
});
