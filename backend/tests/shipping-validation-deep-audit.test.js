import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import prisma from '../src/common/database/prisma.js';
import { ShippingEngine } from '../src/modules/shipping/shipping.engine.js';
import {
  calculateVolumeCm3,
  calculateVolumetricWeightKg,
  calculateSurfaceAreaM2,
  calculateAreaM2,
  clampNumber,
  round2,
} from '../src/common/helpers/math.helper.js';

describe('DEEP AUDIT: AGENT 3 & 4 - Dynamic Shipping Profiles Engine & Zod Input Validation', () => {
  let adminToken = '';
  let customerToken = '';
  let testProductId = '';
  let createdProfileId = '';
  const timestamp = Date.now();

  beforeAll(async () => {
    // 1. Create Admin User
    const adminRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: `audit_admin_${timestamp}@build8now.com`,
        password: 'AdminPassword123!',
        name: 'Audit Administrator',
        role: 'ADMIN',
      });
    adminToken = adminRes.body.data.token;

    // 2. Create Customer User
    const custRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: `audit_cust_${timestamp}@build8now.com`,
        password: 'CustomerPassword123!',
        name: 'Audit Customer',
        role: 'CUSTOMER',
      });
    customerToken = custRes.body.data.token;

    // 3. Find or Create a Catalog Product for testing
    let prod = await prisma.product.findFirst();
    if (!prod) {
      prod = await prisma.product.create({
        data: {
          name: 'Audit Steel Beam 100mm',
          slug: `audit-steel-beam-${timestamp}`,
          sku: `AUDIT-STL-${timestamp}`,
          category: 'Steel',
          price: 1500.0,
          weightKg: 45.0,
          lengthCm: 200.0,
          widthCm: 20.0,
          heightCm: 15.0,
        },
      });
    }
    testProductId = prod.id;
  });

  // =========================================================================
  // SECTION 1: DYNAMIC SHIPPING PROFILES CRUD OPERATIONS
  // =========================================================================
  describe('1. Dynamic Shipping Profiles CRUD & Association Endpoints', () => {
    it('1.1 Creates shipping profile with multi-criteria rules (POST /api/v1/shipping/profiles)', async () => {
      const payload = {
        name: `Heavy Construction Logistics ${timestamp}`,
        description: 'Multi-criteria profile with weight slabs, distance, volumetric and surface area rules',
        combinationStrategy: 'SUM',
        minCharge: 250.0,
        maxCharge: 12000.0,
        isActive: true,
        rules: [
          {
            ruleType: 'WEIGHT_SLAB',
            minUnit: 0,
            maxUnit: 49.99,
            baseRate: 150.0,
            perUnitRate: 0.0,
            priority: 10,
            isActive: true,
          },
          {
            ruleType: 'WEIGHT_SLAB',
            minUnit: 50.0,
            maxUnit: null,
            baseRate: 150.0,
            perUnitRate: 4.5,
            priority: 10,
            isActive: true,
          },
          {
            ruleType: 'PER_KM_DISTANCE',
            minUnit: 10.0,
            maxUnit: null,
            baseRate: 50.0,
            perUnitRate: 8.0,
            priority: 20,
            isActive: true,
          },
          {
            ruleType: 'VOLUMETRIC',
            minUnit: 20.0,
            maxUnit: null,
            baseRate: 100.0,
            perUnitRate: 15.0,
            priority: 15,
            isActive: true,
          },
          {
            ruleType: 'AREA_SURFACE',
            minUnit: 1.0,
            maxUnit: null,
            baseRate: 40.0,
            perUnitRate: 25.0,
            priority: 12,
            isActive: true,
          },
          {
            ruleType: 'FIXED_FEE',
            baseRate: 60.0,
            perUnitRate: 0,
            priority: 5,
            isActive: true,
          },
        ],
      };

      const res = await request(app)
        .post('/api/v1/shipping/profiles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBeDefined();
      expect(res.body.data.name).toBe(payload.name);
      expect(res.body.data.combinationStrategy).toBe('SUM');
      expect(res.body.data.minCharge).toBe(250.0);
      expect(res.body.data.maxCharge).toBe(12000.0);
      expect(res.body.data.rules.length).toBe(6);
      createdProfileId = res.body.data.id;
    });

    it('1.2 Lists shipping profiles with pagination & filtering (GET /api/v1/shipping/profiles)', async () => {
      const res = await request(app)
        .get('/api/v1/shipping/profiles?page=1&limit=10&isActive=true')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.body.meta).toBeDefined();
      expect(res.body.meta.page).toBe(1);
      expect(res.body.meta.total).toBeGreaterThanOrEqual(1);

      const found = res.body.data.find((p) => p.id === createdProfileId);
      expect(found).toBeDefined();
      expect(found.rules.length).toBe(6);
    });

    it('1.3 Retrieves single shipping profile by ID (GET /api/v1/shipping/profiles/:id)', async () => {
      const res = await request(app)
        .get(`/api/v1/shipping/profiles/${createdProfileId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(createdProfileId);
      expect(res.body.data.rules).toBeInstanceOf(Array);
      expect(res.body.data.rules.length).toBe(6);
    });

    it('1.4 Updates shipping profile and replaces rules atomically (PUT /api/v1/shipping/profiles/:id)', async () => {
      const updatePayload = {
        name: `Updated Logistics Profile ${timestamp}`,
        minCharge: 300.0,
        maxCharge: 15000.0,
        combinationStrategy: 'MAX',
        rules: [
          {
            ruleType: 'WEIGHT_SLAB',
            minUnit: 0,
            maxUnit: 100.0,
            baseRate: 200.0,
            perUnitRate: 5.0,
            priority: 10,
            isActive: true,
          },
          {
            ruleType: 'PER_KM_DISTANCE',
            minUnit: 5.0,
            maxUnit: 500.0,
            baseRate: 75.0,
            perUnitRate: 10.0,
            priority: 20,
            isActive: true,
          },
        ],
      };

      const res = await request(app)
        .put(`/api/v1/shipping/profiles/${createdProfileId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updatePayload);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe(updatePayload.name);
      expect(res.body.data.minCharge).toBe(300.0);
      expect(res.body.data.combinationStrategy).toBe('MAX');
      expect(res.body.data.rules.length).toBe(2);
    });

    it('1.5 Assigns shipping profile to catalog product (POST /api/v1/shipping/assign-product)', async () => {
      const res = await request(app)
        .post('/api/v1/shipping/assign-product')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          productId: testProductId,
          shippingProfileId: createdProfileId,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(testProductId);
      expect(res.body.data.shippingProfileId).toBe(createdProfileId);
    });

    it('1.6 Deactivates shipping profile (DELETE /api/v1/shipping/profiles/:id)', async () => {
      const res = await request(app)
        .delete(`/api/v1/shipping/profiles/${createdProfileId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isActive).toBe(false);

      // Verify DB reflects inactive status
      const dbProfile = await prisma.shippingProfile.findUnique({
        where: { id: createdProfileId },
      });
      expect(dbProfile.isActive).toBe(false);
    });

    it('1.7 Prevents assigning inactive shipping profile to product with 400 Bad Request', async () => {
      const res = await request(app)
        .post('/api/v1/shipping/assign-product')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          productId: testProductId,
          shippingProfileId: createdProfileId, // Now inactive!
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toContain('inactive');
    });

    it('1.8 Rejects unauthorized (non-admin) access to shipping profile modifications with 403', async () => {
      const res = await request(app)
        .post('/api/v1/shipping/profiles')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          name: 'Unauthorized Profile',
          rules: [],
        });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });
  });

  // =========================================================================
  // SECTION 2: MULTI-CRITERIA FREIGHT CALCULATION ENGINE & PRECISION MATH
  // =========================================================================
  describe('2. Multi-Criteria Freight Calculation Engine (Core Math & Combinations)', () => {
    const testProfileSum = {
      id: 'prof-audit-sum',
      name: 'Comprehensive Industrial Multi-Criteria Profile (SUM)',
      combinationStrategy: 'SUM',
      minCharge: 150.0,
      maxCharge: 10000.0,
      rules: [
        {
          id: 'r-weight-base',
          ruleType: 'WEIGHT_SLAB',
          minUnit: 0,
          maxUnit: 49.99,
          baseRate: 100.0,
          perUnitRate: 0.0,
          priority: 10,
          isActive: true,
        },
        {
          id: 'r-weight-heavy',
          ruleType: 'WEIGHT_SLAB',
          minUnit: 50.0,
          maxUnit: null,
          baseRate: 100.0,
          perUnitRate: 5.0, // ₹5/kg above 50kg
          priority: 10,
          isActive: true,
        },
        {
          id: 'r-distance',
          ruleType: 'PER_KM_DISTANCE',
          minUnit: 10.0,
          maxUnit: 500.0,
          baseRate: 50.0,
          perUnitRate: 12.0, // ₹12/km beyond 10km
          priority: 20,
          isActive: true,
        },
        {
          id: 'r-volumetric',
          ruleType: 'VOLUMETRIC',
          minUnit: 20.0,
          maxUnit: null,
          baseRate: 80.0,
          perUnitRate: 10.0,
          priority: 15,
          isActive: true,
        },
        {
          id: 'r-surface',
          ruleType: 'AREA_SURFACE',
          minUnit: 1.0,
          maxUnit: null,
          baseRate: 30.0,
          perUnitRate: 20.0, // ₹20/m2 beyond 1m2
          priority: 12,
          isActive: true,
        },
        {
          id: 'r-fixed',
          ruleType: 'FIXED_FEE',
          baseRate: 50.0,
          priority: 5,
          isActive: true,
        },
      ],
    };

    it('2.1 Volumetric Weight Calculation: (L * W * H) / 5000', () => {
      // Dimensions: 100cm x 50cm x 40cm = 200,000 cm3
      // Volumetric weight = 200,000 / 5000 = 40.0 kg
      const volCm3 = calculateVolumeCm3(100, 50, 40);
      const volWtKg = calculateVolumetricWeightKg(100, 50, 40, 5000);

      expect(volCm3).toBe(200000);
      expect(volWtKg).toBe(40.0);

      // Billable weight should pick maximum of actual weight (15kg) vs volumetric (40kg) -> 40kg
      const result = ShippingEngine.calculate(testProfileSum, {
        weightKg: 15,
        lengthCm: 100,
        widthCm: 50,
        heightCm: 40,
        quantity: 1,
      });

      expect(result.derivedMetrics.volumetricWeightKg).toBe(40.0);
      expect(result.derivedMetrics.billableWeightKg).toBe(40.0);
      expect(result.derivedMetrics.totalActualWeightKg).toBe(15.0);
    });

    it('2.2 Surface Area Calculation: 2 * (LW + WH + HL) / 10000 m2', () => {
      // L=100cm, W=50cm, H=20cm
      // LW = 5000, WH = 1000, HL = 2000 -> Sum = 8000
      // 2 * 8000 / 10000 = 1.60 m2
      const areaM2 = calculateSurfaceAreaM2(100, 50, 20);
      expect(areaM2).toBe(1.6);

      // 2D Footprint fallback (H=0): (100 * 50) / 10000 = 0.50 m2
      const footprintArea = calculateAreaM2(100, 50, 0);
      expect(footprintArea).toBe(0.5);

      const result = ShippingEngine.calculate(testProfileSum, {
        weightKg: 10,
        lengthCm: 100,
        widthCm: 50,
        heightCm: 20,
        quantity: 2, // 2 items -> 1.6 * 2 = 3.2 m2
      });

      expect(result.derivedMetrics.surfaceAreaM2).toBe(1.6);
      expect(result.derivedMetrics.totalSurfaceAreaM2).toBe(3.2);

      // Area rule: baseRate(30) + (3.2m2) * 20 = 30 + 64 = 94
      const areaRule = result.ruleBreakdown.find((r) => r.ruleType === 'AREA_SURFACE');
      expect(areaRule).toBeDefined();
      expect(areaRule.calculatedCost).toBe(94);
    });

    it('2.3 Weight Slabs Calculation with Decimal Weights (e.g. 75.5 kg)', () => {
      // Weight: 75.5 kg matches heavy slab (minUnit: 50)
      // Cost: 100 + (75.5 - 50) * 5.0 = 100 + 25.5 * 5.0 = 100 + 127.5 = 227.50
      const result = ShippingEngine.calculate(testProfileSum, {
        weightKg: 75.5,
        distanceKm: 0,
        quantity: 1,
      });

      const weightRule = result.ruleBreakdown.find((r) => r.ruleType === 'WEIGHT_SLAB');
      expect(weightRule).toBeDefined();
      expect(weightRule.calculatedCost).toBe(227.5);
      expect(weightRule.formulaApplied).toContain('75.5kg - 50kg');
    });

    it('2.4 Slabs Boundary Values (0, 49.99, 50.00)', () => {
      // Exactly at 49.99 kg -> Matches Base slab (0 to 49.99) -> Cost = 100.00
      const resBase = ShippingEngine.calculate(testProfileSum, {
        weightKg: 49.99,
        distanceKm: 0,
        quantity: 1,
      });
      const baseRule = resBase.ruleBreakdown.find((r) => r.ruleType === 'WEIGHT_SLAB');
      expect(baseRule.calculatedCost).toBe(100.0);

      // Exactly at 50.00 kg -> Matches Heavy slab (50.0+) -> 100 + (50 - 50)*5 = 100.00
      const resHeavy = ShippingEngine.calculate(testProfileSum, {
        weightKg: 50.0,
        distanceKm: 0,
        quantity: 1,
      });
      const heavyRule = resHeavy.ruleBreakdown.find((r) => r.ruleType === 'WEIGHT_SLAB');
      expect(heavyRule.calculatedCost).toBe(100.0);
    });

    it('2.5 Per-km Distance Calculation with Base Distance Threshold', () => {
      // Threshold: 10 km (free/base distance). Distance: 35.5 km
      // Billable distance = 35.5 - 10 = 25.5 km
      // Distance cost = baseRate(50) + 25.5 * 12 = 50 + 306 = 356.00
      const result = ShippingEngine.calculate(testProfileSum, {
        weightKg: 20, // Base weight: 100
        distanceKm: 35.5,
        quantity: 1,
      });

      const distRule = result.ruleBreakdown.find((r) => r.ruleType === 'PER_KM_DISTANCE');
      expect(distRule).toBeDefined();
      expect(distRule.calculatedCost).toBe(356.0);
      expect(distRule.formulaApplied).toContain('35.5km - 10km');
    });

    it('2.6 Combination Strategy: SUM (Accumulates all matching rules)', () => {
      const result = ShippingEngine.calculate(testProfileSum, {
        weightKg: 40, // Base weight: 100
        distanceKm: 20, // Distance: 50 + (20-10)*12 = 170
        quantity: 1,
      });

      // Rules matched: Weight (100) + Distance (170) + Fixed Fee (50) = 320
      expect(result.ruleBreakdown.length).toBe(3);
      expect(result.subtotalCost).toBe(320.0);
      expect(result.finalShippingCost).toBe(320.0);
    });

    it('2.7 Combination Strategy: MAX (Selects highest single rule cost)', () => {
      const maxProfile = {
        ...testProfileSum,
        combinationStrategy: 'MAX',
      };

      const result = ShippingEngine.calculate(maxProfile, {
        weightKg: 40, // Weight cost = 100
        distanceKm: 30, // Distance cost = 50 + (30-10)*12 = 290
        quantity: 1, // Fixed fee = 50
      });

      // Highest single rule is Distance (290)
      expect(result.subtotalCost).toBe(290.0);
      expect(result.finalShippingCost).toBe(290.0);
    });

    it('2.8 Combination Strategy: TIERED_SLAB (Accumulates tier rules)', () => {
      const tieredProfile = {
        ...testProfileSum,
        combinationStrategy: 'TIERED_SLAB',
      };

      const result = ShippingEngine.calculate(tieredProfile, {
        weightKg: 40,
        distanceKm: 20,
        quantity: 1,
      });

      expect(result.subtotalCost).toBe(320.0);
      expect(result.finalShippingCost).toBe(320.0);
    });

    it('2.9 Clamping with minCharge threshold (lower bound)', () => {
      const highMinProfile = {
        ...testProfileSum,
        minCharge: 500.0,
      };

      const result = ShippingEngine.calculate(highMinProfile, {
        weightKg: 10, // Weight (100) + Fixed (50) = 150 < 500 minCharge
        distanceKm: 0,
        quantity: 1,
      });

      expect(result.subtotalCost).toBe(150.0);
      expect(result.finalShippingCost).toBe(500.0);
      expect(result.minChargeApplied).toBe(true);
      expect(result.maxChargeApplied).toBe(false);
    });

    it('2.10 Clamping with maxCharge threshold (upper bound cap)', () => {
      const lowMaxProfile = {
        ...testProfileSum,
        maxCharge: 300.0,
      };

      const result = ShippingEngine.calculate(lowMaxProfile, {
        weightKg: 200, // Heavy weight + distance > 1000
        distanceKm: 100,
        quantity: 5,
      });

      expect(result.subtotalCost).toBeGreaterThan(300.0);
      expect(result.finalShippingCost).toBe(300.0);
      expect(result.maxChargeApplied).toBe(true);
      expect(result.minChargeApplied).toBe(false);
    });

    it('2.11 Precision Currency & Metric Rounding to 2 Decimal Places', () => {
      expect(round2(123.4567)).toBe(123.46);
      expect(round2(123.454)).toBe(123.45);
      expect(round2(0.1 + 0.2)).toBe(0.3);

      const result = ShippingEngine.calculate(testProfileSum, {
        weightKg: 75.333,
        distanceKm: 15.667,
        productPrice: 333.333,
        quantity: 1,
      });

      expect(result.derivedMetrics.totalActualWeightKg).toBe(75.33);
      expect(Number.isInteger(result.finalShippingCost * 100)).toBe(true);
    });
  });

  // =========================================================================
  // SECTION 3: API CALCULATION ENDPOINT & REAL PRODUCT INTEGRATION
  // =========================================================================
  describe('3. Public Shipping Calculation API (POST /api/v1/shipping/calculate)', () => {
    let activeProfileForProduct = null;

    beforeAll(async () => {
      // Create an active profile specifically for product calculation tests
      activeProfileForProduct = await prisma.shippingProfile.create({
        data: {
          name: `Active Product Profile ${timestamp}`,
          combinationStrategy: 'SUM',
          minCharge: 100.0,
          maxCharge: 5000.0,
          isActive: true,
          rules: {
            create: [
              {
                ruleType: 'WEIGHT_SLAB',
                minUnit: 0,
                maxUnit: null,
                baseRate: 100.0,
                perUnitRate: 2.0,
                priority: 10,
              },
              {
                ruleType: 'PER_KM_DISTANCE',
                minUnit: 0,
                maxUnit: null,
                baseRate: 50.0,
                perUnitRate: 5.0,
                priority: 20,
              },
            ],
          },
        },
      });

      await prisma.product.update({
        where: { id: testProductId },
        data: { shippingProfileId: activeProfileForProduct.id },
      });
    });

    it('3.1 Calculates shipping dynamically using assigned catalog product dimensions', async () => {
      const res = await request(app)
        .post('/api/v1/shipping/calculate')
        .send({
          productId: testProductId,
          distanceKm: 25,
          quantity: 2,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.finalShippingCost).toBeGreaterThan(0);
      expect(res.body.data.derivedMetrics).toBeDefined();
      expect(res.body.data.derivedMetrics.distanceKm).toBe(25);
      expect(res.body.data.derivedMetrics.quantity).toBe(2);
      expect(res.body.data.ruleBreakdown).toBeInstanceOf(Array);
    });

    it('3.2 Rejects calculation with nonexistent productId with 404 Not Found', async () => {
      const res = await request(app)
        .post('/api/v1/shipping/calculate')
        .send({
          productId: '00000000-0000-0000-0000-000000000000',
          distanceKm: 10,
        });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('3.3 Rejects calculation with nonexistent shippingProfileId with 404 Not Found', async () => {
      const res = await request(app)
        .post('/api/v1/shipping/calculate')
        .send({
          shippingProfileId: '00000000-0000-0000-0000-000000000000',
          weightKg: 50,
          distanceKm: 10,
        });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  });

  // =========================================================================
  // SECTION 4: ZOD INPUT VALIDATION & STANDARDIZED ERROR ENVELOPES
  // =========================================================================
  describe('4. Comprehensive Zod Input Validation & Error Handling (422 Unprocessable Entity)', () => {
    it('4.1 Rejects negative weight with 422 and standardized error details', async () => {
      const res = await request(app)
        .post('/api/v1/shipping/calculate')
        .send({
          weightKg: -10.5,
          distanceKm: 20,
        });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
      expect(res.body.statusCode).toBe(422);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
      expect(res.body.error.details).toBeInstanceOf(Array);

      const weightErr = res.body.error.details.find((d) => d.field === 'weightKg');
      expect(weightErr).toBeDefined();
      expect(weightErr.message).toContain('>= 0');
    });

    it('4.2 Rejects negative dimensions (length, width, height) with 422', async () => {
      const res = await request(app)
        .post('/api/v1/shipping/calculate')
        .send({
          weightKg: 20,
          lengthCm: -100,
          widthCm: -50,
          heightCm: -20,
        });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
      expect(res.body.error.details.length).toBeGreaterThanOrEqual(3);

      const fields = res.body.error.details.map((d) => d.field);
      expect(fields).toContain('lengthCm');
      expect(fields).toContain('widthCm');
      expect(fields).toContain('heightCm');
    });

    it('4.3 Rejects negative distance with 422', async () => {
      const res = await request(app)
        .post('/api/v1/shipping/calculate')
        .send({
          weightKg: 25,
          distanceKm: -50,
        });

      expect(res.status).toBe(422);
      expect(res.body.error.details[0].field).toBe('distanceKm');
    });

    it('4.4 Rejects invalid / zero / negative quantity with 422', async () => {
      const resZero = await request(app)
        .post('/api/v1/shipping/calculate')
        .send({ weightKg: 25, quantity: 0 });
      expect(resZero.status).toBe(422);

      const resNeg = await request(app)
        .post('/api/v1/shipping/calculate')
        .send({ weightKg: 25, quantity: -5 });
      expect(resNeg.status).toBe(422);

      const resFloat = await request(app)
        .post('/api/v1/shipping/calculate')
        .send({ weightKg: 25, quantity: 2.5 });
      expect(resFloat.status).toBe(422);
      expect(resFloat.body.error.details[0].message).toContain('integer');
    });

    it('4.5 Rejects user registration names containing digits or numbers with 422', async () => {
      const namesWithDigits = [
        'Rahul123',
        'Builder 99',
        'Deepak2026',
        '007 James',
        'Contractor #1',
      ];

      for (const name of namesWithDigits) {
        const res = await request(app)
          .post('/api/v1/auth/register')
          .send({
            email: `invalid_name_${Date.now()}_${Math.random().toString(36).substring(7)}@build8now.com`,
            password: 'ValidPassword123!',
            name,
            role: 'CUSTOMER',
          });

        expect(res.status).toBe(422);
        expect(res.body.success).toBe(false);
        expect(res.body.error.code).toBe('VALIDATION_ERROR');

        const nameErr = res.body.error.details.find((d) => d.field === 'name');
        expect(nameErr).toBeDefined();
        expect(nameErr.message).toContain('alphabetic');
      }
    });

    it('4.6 Rejects malformed UUIDs with 422', async () => {
      const res = await request(app)
        .post('/api/v1/shipping/calculate')
        .send({
          productId: 'not-a-valid-uuid-string',
        });

      expect(res.status).toBe(422);
      expect(res.body.error.details[0].field).toBe('productId');
      expect(res.body.error.details[0].message).toContain('product ID');
    });

    it('4.7 Rejects invalid enum values in profile creation with 422', async () => {
      const res = await request(app)
        .post('/api/v1/shipping/profiles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Invalid Enum Profile',
          combinationStrategy: 'INVALID_STRATEGY_TYPE',
          rules: [
            {
              ruleType: 'UNSUPPORTED_RULE_TYPE',
              baseRate: 100,
            },
          ],
        });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('4.8 Enforces consistent error response structure across all validation failures', async () => {
      const res = await request(app)
        .post('/api/v1/shipping/calculate')
        .send({
          weightKg: 'one hundred kilograms', // String instead of number
          lengthCm: -50,
        });

      expect(res.status).toBe(422);
      expect(res.body).toEqual({
        success: false,
        statusCode: 422,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Request validation failed. Please correct the invalid fields.',
          details: expect.arrayContaining([
            expect.objectContaining({
              field: expect.any(String),
              message: expect.any(String),
              rule: expect.any(String),
            }),
          ]),
        },
      });
    });
  });
});
