import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import prisma from '../src/common/database/prisma.js';

describe('Task 3: Authentication, RBAC & Object-Level Access Control (ABAC)', () => {
  let adminToken = '';
  let customer1Token = '';
  let customer1Id = '';
  let customer2Token = '';
  let customer2Id = '';
  let influencerToken = '';
  let influencerId = '';
  let customer1OrderId = '';

  const timestamp = Date.now();

  beforeAll(async () => {
    // 1. Create Admin
    const adminRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: `admin_${timestamp}@build8now.com`,
        password: 'Password123!',
        name: 'Admin Tester',
        role: 'ADMIN',
      });
    adminToken = adminRes.body.data.token;

    // 2. Create Influencer
    const infRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: `inf_${timestamp}@build8now.com`,
        password: 'Password123!',
        name: 'Influencer Tester',
        role: 'INFLUENCER',
        influencerType: 'ARCHITECT',
      });
    influencerToken = infRes.body.data.token;
    influencerId = infRes.body.data.user.influencer.id;

    // 3. Create Customer 1 (Referred by Influencer)
    const cust1Res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: `cust1_${timestamp}@gmail.com`,
        password: 'Password123!',
        name: 'Customer One',
        role: 'CUSTOMER',
      });
    customer1Token = cust1Res.body.data.token;
    customer1Id = cust1Res.body.data.user.customer.id;

    // 4. Create Customer 2
    const cust2Res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: `cust2_${timestamp}@gmail.com`,
        password: 'Password123!',
        name: 'Customer Two',
        role: 'CUSTOMER',
      });
    customer2Token = cust2Res.body.data.token;
    customer2Id = cust2Res.body.data.user.customer.id;

    // 5. Place an order for Customer 1
    const product = await prisma.product.findFirst();
    const orderRes = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${customer1Token}`)
      .send({
        items: [{ productId: product.id, quantity: 2 }],
        distanceKm: 15,
      });
    customer1OrderId = orderRes.body.data.id;
  });

  describe('1. Authentication & Token Verification', () => {
    it('returns valid profile on GET /auth/me for authenticated user', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${customer1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe(`cust1_${timestamp}@gmail.com`);
      expect(res.body.data.passwordHash).toBeUndefined(); // Password hash must never leak!
    });

    it('blocks request when Authorization header is missing with 401 Unauthorized', async () => {
      const res = await request(app).get('/api/v1/orders');
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('blocks request with invalid or malformed JWT token with 401', async () => {
      const res = await request(app)
        .get('/api/v1/orders')
        .set('Authorization', 'Bearer invalid.bogus.jwt.token');

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('2. Role-Based Access Control (RBAC)', () => {
    it('allows ADMIN to create new shipping profiles', async () => {
      const res = await request(app)
        .post('/api/v1/shipping/profiles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: `Admin Test Profile ${timestamp}`,
          combinationStrategy: 'SUM',
          minCharge: 100,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('blocks CUSTOMER from creating shipping profiles with 403 Forbidden', async () => {
      const res = await request(app)
        .post('/api/v1/shipping/profiles')
        .set('Authorization', `Bearer ${customer1Token}`)
        .send({
          name: `Unauthorized Customer Profile ${timestamp}`,
        });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
      expect(res.body.error.message).toContain('Access denied');
    });

    it('blocks INFLUENCER from creating loyalty rules with 403 Forbidden', async () => {
      const res = await request(app)
        .post('/api/v1/loyalty/rules')
        .set('Authorization', `Bearer ${influencerToken}`)
        .send({
          name: 'Unauthorized Loyalty Rule',
          ruleTarget: 'CART_VALUE',
          pointType: 'PERCENTAGE',
          pointValue: 10,
        });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });
  });

  describe('3. Object-Level Access Control (ABAC / IDOR Protection)', () => {
    it('allows Customer 1 to view their OWN order by ID', async () => {
      const res = await request(app)
        .get(`/api/v1/orders/${customer1OrderId}`)
        .set('Authorization', `Bearer ${customer1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(customer1OrderId);
    });

    it('blocks Customer 2 from viewing Customer 1 order by ID with 403 Forbidden (IDOR block)', async () => {
      const res = await request(app)
        .get(`/api/v1/orders/${customer1OrderId}`)
        .set('Authorization', `Bearer ${customer2Token}`);

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
      expect(res.body.error.message).toContain('own orders');
    });

    it('blocks unauthorized access to another influencer ledger with 403 Forbidden', async () => {
      // Customer 1 trying to access Influencer ledger
      const res = await request(app)
        .get(`/api/v1/loyalty/ledger/${influencerId}`)
        .set('Authorization', `Bearer ${customer1Token}`);

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });
  });
});
