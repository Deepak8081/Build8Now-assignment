import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import app from '../src/app.js';
import prisma from '../src/common/database/prisma.js';
import { env } from '../src/config/env.config.js';

describe('COMPREHENSIVE SECURITY, AUTHENTICATION, RBAC & ABAC AUDIT SUITE', () => {
  let adminToken = '';
  let adminUser = null;
  let influencerToken = '';
  let influencerUser = null;
  let influencerId = '';
  let customerToken = '';
  let customerUser = null;
  let customerId = '';

  let otherCustomerToken = '';
  let otherCustomerId = '';
  let otherInfluencerToken = '';
  let otherInfluencerId = '';

  let customerOrderId = '';
  let testProductId = '';
  let testProfileId = '';

  beforeAll(async () => {
    // 1. Fetch or verify seeded accounts
    adminUser = await prisma.user.findUnique({
      where: { email: 'admin@build8now.com' },
      include: { customer: true, influencer: true },
    });

    influencerUser = await prisma.user.findUnique({
      where: { email: 'rahul.architect@build8now.com' },
      include: { customer: true, influencer: true },
    });
    influencerId = influencerUser?.influencer?.id;

    customerUser = await prisma.user.findUnique({
      where: { email: 'priya.sharma@gmail.com' },
      include: { customer: true, influencer: true },
    });
    customerId = customerUser?.customer?.id;

    // Additional customer for ABAC cross-tenant tests
    const cust2User = await prisma.user.findUnique({
      where: { email: 'amit.kumar@gmail.com' },
      include: { customer: true, influencer: true },
    });
    otherCustomerId = cust2User?.customer?.id;

    // Additional influencer for ABAC cross-tenant tests
    const inf2User = await prisma.user.findUnique({
      where: { email: 'designer.priya@build8now.com' },
      include: { customer: true, influencer: true },
    });
    otherInfluencerId = inf2User?.influencer?.id;

    // Get a product for order placement
    const product = await prisma.product.findFirst();
    testProductId = product.id;

    const profile = await prisma.shippingProfile.findFirst();
    testProfileId = profile.id;
  });

  // =========================================================================
  // 1. ADMIN, CUSTOMER, AND INFLUENCER LOGINS WITH VALID CREDENTIALS
  // =========================================================================
  describe('Audit 1: User Logins with Valid Credentials', () => {
    it('1.1 Admin login with admin@build8now.com succeeds with 200 OK and valid JWT token', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'admin@build8now.com',
          password: 'Password123!',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(typeof res.body.data.token).toBe('string');
      expect(res.body.data.user.email).toBe('admin@build8now.com');
      expect(res.body.data.user.role).toBe('ADMIN');
      expect(res.body.data.user.passwordHash).toBeUndefined();

      adminToken = res.body.data.token;
    });

    it('1.2 Influencer login with rahul.architect@build8now.com succeeds with 200 OK and attached influencer profile', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'rahul.architect@build8now.com',
          password: 'Password123!',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe('rahul.architect@build8now.com');
      expect(res.body.data.user.role).toBe('INFLUENCER');
      expect(res.body.data.user.influencer).toBeDefined();
      expect(res.body.data.user.influencer.id).toBe(influencerId);
      expect(res.body.data.user.passwordHash).toBeUndefined();

      influencerToken = res.body.data.token;
    });

    it('1.3 Customer login with priya.sharma@gmail.com succeeds with 200 OK and attached customer profile', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'priya.sharma@gmail.com',
          password: 'Password123!',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe('priya.sharma@gmail.com');
      expect(res.body.data.user.role).toBe('CUSTOMER');
      expect(res.body.data.user.customer).toBeDefined();
      expect(res.body.data.user.customer.id).toBe(customerId);
      expect(res.body.data.user.passwordHash).toBeUndefined();

      customerToken = res.body.data.token;
    });

    it('1.4 Authenticate auxiliary users for cross-tenant ABAC isolation testing', async () => {
      // Login Amit Kumar
      const resCust2 = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'amit.kumar@gmail.com',
          password: 'Password123!',
        });
      expect(resCust2.status).toBe(200);
      otherCustomerToken = resCust2.body.data.token;

      // Login Designer Priya
      const resInf2 = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'designer.priya@build8now.com',
          password: 'Password123!',
        });
      expect(resInf2.status).toBe(200);
      otherInfluencerToken = resInf2.body.data.token;

      // Create an order for Customer (Priya Sharma) to be used in ABAC tests
      const orderRes = await request(app)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          items: [{ productId: testProductId, quantity: 1 }],
          distanceKm: 12,
        });
      expect(orderRes.status).toBe(201);
      customerOrderId = orderRes.body.data.id;
    });
  });

  // =========================================================================
  // 2. REJECTION OF INVALID CREDENTIALS, MALFORMED EMAILS, AND INVALID PASSWORDS
  // =========================================================================
  describe('Audit 2: Rejection of Invalid Credentials & Input Validation', () => {
    it('2.1 Rejects incorrect password with 401 Unauthorized', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'admin@build8now.com',
          password: 'WrongPassword999!',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
      expect(res.body.error.message).toContain('Invalid email or password');
    });

    it('2.2 Rejects non-existent email with 401 Unauthorized without disclosing account existence', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent.user.999@build8now.com',
          password: 'Password123!',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
      expect(res.body.error.message).toContain('Invalid email or password');
    });

    it('2.3 Rejects malformed email string in login with 422/400 Validation Error', async () => {
      const malformedEmails = ['not-an-email', 'admin@', '@build8now.com', 'user@domain..com'];

      for (const malformedEmail of malformedEmails) {
        const res = await request(app)
          .post('/api/v1/auth/login')
          .send({
            email: malformedEmail,
            password: 'Password123!',
          });

        expect([400, 422].includes(res.status)).toBe(true);
        expect(res.body.success).toBe(false);
        expect(res.body.error.code).toBe('VALIDATION_ERROR');
      }
    });

    it('2.4 Rejects missing or empty password in login with 422/400 Validation Error', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'admin@build8now.com',
          password: '',
        });

      expect([400, 422].includes(res.status)).toBe(true);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('2.5 Rejects registration with short password (<6 chars) with 422/400 Validation Error', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: `shortpass_${Date.now()}@build8now.com`,
          password: '123',
          name: 'Short Pass User',
          role: 'CUSTOMER',
        });

      expect([400, 422].includes(res.status)).toBe(true);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
      expect(JSON.stringify(res.body.error)).toContain('at least 6 characters');
    });

    it('2.6 Rejects registration with invalid name format (containing digits/symbols) with 422/400', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: `invalidname_${Date.now()}@build8now.com`,
          password: 'Password123!',
          name: 'User123 <script>',
          role: 'CUSTOMER',
        });

      expect([400, 422].includes(res.status)).toBe(true);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  // =========================================================================
  // 3. BCRYPT PASSWORD HASHING (DATABASE AUDIT & ZERO LEAKAGE)
  // =========================================================================
  describe('Audit 3: Bcrypt Password Hashing & Sensitive Data Leakage Audit', () => {
    it('3.1 Database audit: all stored user passwordHash values use Bcrypt ($2a$ or $2b$) with 60-char length', async () => {
      const users = await prisma.user.findMany();
      expect(users.length).toBeGreaterThan(0);

      for (const u of users) {
        expect(u.passwordHash).toBeDefined();
        expect(typeof u.passwordHash).toBe('string');
        // Bcrypt format check: starts with $2a$ or $2b$ and has cost factor 10
        expect(u.passwordHash).toMatch(/^\$2[ab]\$10\$.{53}$/);
        expect(u.passwordHash.length).toBe(60);
        // Ensure plaintext password is not stored anywhere
        expect(u.passwordHash).not.toBe('Password123!');
      }
    });

    it('3.2 Verify bcrypt.compare cryptographically validates password against database hash', async () => {
      const adminInDb = await prisma.user.findUnique({
        where: { email: 'admin@build8now.com' },
      });

      const isValid = await bcrypt.compare('Password123!', adminInDb.passwordHash);
      const isInvalid = await bcrypt.compare('WrongSecretPassword', adminInDb.passwordHash);

      expect(isValid).toBe(true);
      expect(isInvalid).toBe(false);
    });

    it('3.3 API Leakage Audit: passwordHash is stripped and NEVER exposed in login response', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'admin@build8now.com', password: 'Password123!' });

      expect(res.body.data.user.passwordHash).toBeUndefined();
      expect(JSON.stringify(res.body)).not.toContain('passwordHash');
      expect(JSON.stringify(res.body)).not.toContain('$2a$');
      expect(JSON.stringify(res.body)).not.toContain('$2b$');
    });

    it('3.4 API Leakage Audit: passwordHash is stripped and NEVER exposed in GET /auth/me', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.passwordHash).toBeUndefined();
      expect(JSON.stringify(res.body)).not.toContain('passwordHash');
    });

    it('3.5 API Leakage Audit: passwordHash is stripped in user registration response', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: `leaktest_${Date.now()}@build8now.com`,
          password: 'Password123!',
          name: 'Leak Test User',
          role: 'CUSTOMER',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.user.passwordHash).toBeUndefined();
      expect(JSON.stringify(res.body)).not.toContain('passwordHash');
    });
  });

  // =========================================================================
  // 4. JWT TOKEN GENERATION, PAYLOAD STRUCTURE, EXPIRY & SECRET HANDLING
  // =========================================================================
  describe('Audit 4: JWT Token Architecture & Cryptographic Verification', () => {
    it('4.1 JWT Payload Structure for Admin contains valid claims (role: ADMIN, userId, customerId: null, influencerId: null)', () => {
      const decoded = jwt.verify(adminToken, env.JWT_SECRET);

      expect(decoded.userId).toBe(adminUser.id);
      expect(decoded.email).toBe('admin@build8now.com');
      expect(decoded.role).toBe('ADMIN');
      expect(decoded.customerId).toBeNull();
      expect(decoded.influencerId).toBeNull();
      expect(decoded.iat).toBeDefined();
      expect(decoded.exp).toBeDefined();
      expect(decoded.exp).toBeGreaterThan(decoded.iat);
    });

    it('4.2 JWT Payload Structure for Influencer contains influencerId and role: INFLUENCER', () => {
      const decoded = jwt.verify(influencerToken, env.JWT_SECRET);

      expect(decoded.userId).toBe(influencerUser.id);
      expect(decoded.email).toBe('rahul.architect@build8now.com');
      expect(decoded.role).toBe('INFLUENCER');
      expect(decoded.influencerId).toBe(influencerId);
      expect(decoded.customerId).toBeNull();
    });

    it('4.3 JWT Payload Structure for Customer contains customerId and role: CUSTOMER', () => {
      const decoded = jwt.verify(customerToken, env.JWT_SECRET);

      expect(decoded.userId).toBe(customerUser.id);
      expect(decoded.email).toBe('priya.sharma@gmail.com');
      expect(decoded.role).toBe('CUSTOMER');
      expect(decoded.customerId).toBe(customerId);
      expect(decoded.influencerId).toBeNull();
    });

    it('4.4 Cryptographic secret verification: tokens signed with unauthorized secrets fail validation', () => {
      const forgedToken = jwt.sign(
        { userId: adminUser.id, role: 'ADMIN' },
        'attackers_unauthorized_fake_secret_key'
      );

      expect(() => {
        jwt.verify(forgedToken, env.JWT_SECRET);
      }).toThrow();
    });

    it('4.5 Server rejects forged JWT token signed with an invalid secret with 401 Unauthorized', async () => {
      const forgedToken = jwt.sign(
        { userId: adminUser.id, role: 'ADMIN' },
        'attackers_unauthorized_fake_secret_key'
      );

      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${forgedToken}`);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
      expect(res.body.error.message).toContain('Invalid authentication token');
    });
  });

  // =========================================================================
  // 5. MISSING TOKEN, MALFORMED TOKEN, AND EXPIRED TOKEN REJECTION
  // =========================================================================
  describe('Audit 5: Missing, Malformed, and Expired Token Rejection', () => {
    it('5.1 Rejects requests with missing Authorization header with 401 Unauthorized', async () => {
      const endpoints = ['/api/v1/auth/me', '/api/v1/orders', '/api/v1/shipping/profiles'];

      for (const endpoint of endpoints) {
        const res = await request(app).get(endpoint);
        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
        expect(res.body.error.code).toBe('UNAUTHORIZED');
        expect(res.body.error.message).toContain('Authentication token missing');
      }
    });

    it('5.2 Rejects non-Bearer Authorization header format (e.g. Basic / Token) with 401 Unauthorized', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Basic dXNlcm5hbWU6cGFzc3dvcmQ=');

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('5.3 Rejects malformed or corrupted JWT string with 401 Unauthorized', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.corrupted.token');

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
      expect(res.body.error.message).toContain('Invalid authentication token');
    });

    it('5.4 Rejects expired JWT token with 401 Unauthorized and explicit expiry message', async () => {
      // Create an expired token (expiresIn: -10s)
      const expiredToken = jwt.sign(
        { userId: adminUser.id, role: 'ADMIN' },
        env.JWT_SECRET,
        { expiresIn: '-10s' }
      );

      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
      expect(res.body.error.message).toContain('expired');
    });
  });

  // =========================================================================
  // 6. ROUTE PROTECTION MATRIX (RBAC & ABAC/IDOR DEFENSE)
  // =========================================================================
  describe('Audit 6: Route Protection Matrix & ABAC IDOR Defense', () => {
    // 6.1 Admin-Only Route: POST /api/v1/shipping/profiles
    describe('6.1 Route: POST /shipping/profiles (Admin-Only)', () => {
      it('Admin is authorized (201 Created)', async () => {
        const res = await request(app)
          .post('/api/v1/shipping/profiles')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            name: `Audit Test Profile ${Date.now()}`,
            combinationStrategy: 'SUM',
            minCharge: 150,
          });

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
      });

      it('Customer is blocked with 403 Forbidden', async () => {
        const res = await request(app)
          .post('/api/v1/shipping/profiles')
          .set('Authorization', `Bearer ${customerToken}`)
          .send({ name: `Hacker Profile ${Date.now()}` });

        expect(res.status).toBe(403);
        expect(res.body.error.code).toBe('FORBIDDEN');
        expect(res.body.error.message).toContain('Access denied');
      });

      it('Influencer is blocked with 403 Forbidden', async () => {
        const res = await request(app)
          .post('/api/v1/shipping/profiles')
          .set('Authorization', `Bearer ${influencerToken}`)
          .send({ name: `Influencer Profile ${Date.now()}` });

        expect(res.status).toBe(403);
        expect(res.body.error.code).toBe('FORBIDDEN');
        expect(res.body.error.message).toContain('Access denied');
      });
    });

    // 6.2 Admin-Only Route: POST /api/v1/loyalty/rules
    describe('6.2 Route: POST /loyalty/rules (Admin-Only)', () => {
      it('Admin is authorized (201 Created)', async () => {
        const res = await request(app)
          .post('/api/v1/loyalty/rules')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            name: `Audit Loyalty Rule ${Date.now()}`,
            ruleTarget: 'CART_VALUE',
            pointType: 'PERCENTAGE',
            pointValue: 7.5,
            minOrderValue: 5000,
            priority: 15,
          });

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
      });

      it('Customer is blocked with 403 Forbidden', async () => {
        const res = await request(app)
          .post('/api/v1/loyalty/rules')
          .set('Authorization', `Bearer ${customerToken}`)
          .send({
            name: 'Customer Loyalty Rule',
            ruleTarget: 'CART_VALUE',
            pointType: 'PERCENTAGE',
            pointValue: 50,
          });

        expect(res.status).toBe(403);
        expect(res.body.error.code).toBe('FORBIDDEN');
      });

      it('Influencer is blocked with 403 Forbidden', async () => {
        const res = await request(app)
          .post('/api/v1/loyalty/rules')
          .set('Authorization', `Bearer ${influencerToken}`)
          .send({
            name: 'Influencer Loyalty Rule',
            ruleTarget: 'CART_VALUE',
            pointType: 'PERCENTAGE',
            pointValue: 25,
          });

        expect(res.status).toBe(403);
        expect(res.body.error.code).toBe('FORBIDDEN');
      });
    });

    // 6.3 Admin-Only Route: POST /api/v1/shipping/assign-product
    describe('6.3 Route: POST /shipping/assign-product (Admin-Only)', () => {
      it('Admin is authorized (200 OK)', async () => {
        const res = await request(app)
          .post('/api/v1/shipping/assign-product')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            productId: testProductId,
            shippingProfileId: testProfileId,
          });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
      });

      it('Customer is blocked with 403 Forbidden', async () => {
        const res = await request(app)
          .post('/api/v1/shipping/assign-product')
          .set('Authorization', `Bearer ${customerToken}`)
          .send({
            productId: testProductId,
            shippingProfileId: testProfileId,
          });

        expect(res.status).toBe(403);
        expect(res.body.error.code).toBe('FORBIDDEN');
      });

      it('Influencer is blocked with 403 Forbidden', async () => {
        const res = await request(app)
          .post('/api/v1/shipping/assign-product')
          .set('Authorization', `Bearer ${influencerToken}`)
          .send({
            productId: testProductId,
            shippingProfileId: testProfileId,
          });

        expect(res.status).toBe(403);
        expect(res.body.error.code).toBe('FORBIDDEN');
      });
    });

    // 6.4 Admin-Only Route: GET /api/v1/influencers
    describe('6.4 Route: GET /influencers (Admin-Only)', () => {
      it('Admin is authorized (200 OK)', async () => {
        const res = await request(app)
          .get('/api/v1/influencers')
          .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
      });

      it('Customer is blocked with 403 Forbidden', async () => {
        const res = await request(app)
          .get('/api/v1/influencers')
          .set('Authorization', `Bearer ${customerToken}`);

        expect(res.status).toBe(403);
        expect(res.body.error.code).toBe('FORBIDDEN');
      });

      it('Influencer is blocked with 403 Forbidden', async () => {
        const res = await request(app)
          .get('/api/v1/influencers')
          .set('Authorization', `Bearer ${influencerToken}`);

        expect(res.status).toBe(403);
        expect(res.body.error.code).toBe('FORBIDDEN');
      });
    });

    // 6.5 Object-Level ABAC Protection: GET /api/v1/loyalty/ledger/:influencerId
    describe('6.5 ABAC Protection: GET /loyalty/ledger/:influencerId', () => {
      it('Influencer can view their OWN loyalty ledger (200 OK)', async () => {
        const res = await request(app)
          .get(`/api/v1/loyalty/ledger/${influencerId}`)
          .set('Authorization', `Bearer ${influencerToken}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
      });

      it('Influencer is BLOCKED (403 Forbidden) from viewing another influencer ledger (IDOR Block)', async () => {
        const res = await request(app)
          .get(`/api/v1/loyalty/ledger/${otherInfluencerId}`)
          .set('Authorization', `Bearer ${influencerToken}`);

        expect(res.status).toBe(403);
        expect(res.body.error.code).toBe('FORBIDDEN');
        expect(res.body.error.message).toContain('Object-level access denied');
      });

      it('Customer is BLOCKED (403 Forbidden) from accessing influencer ledger', async () => {
        const res = await request(app)
          .get(`/api/v1/loyalty/ledger/${influencerId}`)
          .set('Authorization', `Bearer ${customerToken}`);

        expect(res.status).toBe(403);
        expect(res.body.error.code).toBe('FORBIDDEN');
      });

      it('Admin can view any influencer ledger (200 OK)', async () => {
        const res = await request(app)
          .get(`/api/v1/loyalty/ledger/${influencerId}`)
          .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
      });
    });

    // 6.6 Object-Level ABAC Protection: GET /api/v1/orders/:orderId
    describe('6.6 ABAC Protection: GET /orders/:id', () => {
      it('Customer can view their OWN order (200 OK)', async () => {
        const res = await request(app)
          .get(`/api/v1/orders/${customerOrderId}`)
          .set('Authorization', `Bearer ${customerToken}`);

        expect(res.status).toBe(200);
        expect(res.body.data.id).toBe(customerOrderId);
        expect(res.body.data.customerId).toBe(customerId);
      });

      it('Customer 2 is BLOCKED (403 Forbidden) from accessing Customer 1 order (IDOR Block)', async () => {
        const res = await request(app)
          .get(`/api/v1/orders/${customerOrderId}`)
          .set('Authorization', `Bearer ${otherCustomerToken}`);

        expect(res.status).toBe(403);
        expect(res.body.error.code).toBe('FORBIDDEN');
        expect(res.body.error.message).toContain('own orders');
      });

      it('Admin can view any order (200 OK)', async () => {
        const res = await request(app)
          .get(`/api/v1/orders/${customerOrderId}`)
          .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body.data.id).toBe(customerOrderId);
      });
    });
  });

  // =========================================================================
  // 7. SQL INJECTION, SANITIZATION, RATE LIMITING, SECURITY HEADERS (HELMET/CORS)
  // =========================================================================
  describe('Audit 7: Security Headers, Rate Limiting, SQL Injection & Sanitization', () => {
    it('7.1 SQL Injection defense: Prisma parameterized query engine safely neutralizes SQL injection attempts', async () => {
      const sqlInjections = [
        "' OR '1'='1",
        "admin'--",
        "' UNION SELECT * FROM User --",
        "1; DROP TABLE User; --",
      ];

      for (const injection of sqlInjections) {
        // Test in login email (should be safely rejected without executing SQL)
        const res = await request(app)
          .post('/api/v1/auth/login')
          .send({
            email: injection,
            password: 'Password123!',
          });

        expect([400, 422].includes(res.status)).toBe(true); // Caught by Zod email format or rejected by Prisma without crash
        expect(res.body.success).toBe(false);

        // Verify Users table still intact
        const count = await prisma.user.count();
        expect(count).toBeGreaterThan(0);
      }
    });

    it('7.2 Security Headers Audit: Helmet sets critical HTTP response headers', async () => {
      const res = await request(app).get('/health');

      expect(res.status).toBe(200);

      // Check essential security headers enforced by Helmet
      expect(res.headers['x-dns-prefetch-control']).toBe('off');
      expect(res.headers['x-frame-options']).toBe('SAMEORIGIN');
      expect(res.headers['strict-transport-security']).toBeDefined();
      expect(res.headers['x-download-options']).toBe('noopen');
      expect(res.headers['x-content-type-options']).toBe('nosniff');
      expect(res.headers['x-permitted-cross-domain-policies']).toBe('none');
    });

    it('7.3 CORS Configuration Audit: Validates Allowed Origins & Preflight OPTIONS', async () => {
      const res = await request(app)
        .options('/api/v1/auth/login')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'POST');

      // CORS Preflight headers check
      expect(res.headers['access-control-allow-origin']).toBe('http://localhost:3000');
      expect(res.headers['access-control-allow-credentials']).toBe('true');
    });

    it('7.4 Rate Limiter Audit: Rate limiter middleware is attached to /api/ endpoints', async () => {
      // Test health endpoint (outside rate limiter) vs API endpoint
      const res = await request(app).get('/api/v1/shipping/profiles').set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      // express-rate-limit standard headers
      expect(res.headers['ratelimit-limit']).toBeDefined();
      expect(res.headers['ratelimit-remaining']).toBeDefined();
      expect(res.headers['ratelimit-reset']).toBeDefined();
    });
  });
});
