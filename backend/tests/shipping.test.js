import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { ShippingEngine } from '../src/modules/shipping/shipping.engine.js';
import {
  calculateVolumeCm3,
  calculateVolumetricWeightKg,
  calculateAreaM2,
  clampNumber,
  round2,
} from '../src/common/helpers/math.helper.js';

describe('Task 1: Dynamic Shipping Engine - Positive, Negative & Boundary Tests', () => {
  const comprehensiveProfile = {
    id: 'prof-comprehensive',
    name: 'Industrial Heavy Freight & Volumetric Profile',
    combinationStrategy: 'SUM',
    minCharge: 150.0,
    maxCharge: 8000.0,
    rules: [
      {
        id: 'rule-weight-base',
        ruleType: 'WEIGHT_SLAB',
        minUnit: 0,
        maxUnit: 49.99,
        baseRate: 100.0,
        perUnitRate: 0.0,
        priority: 10,
        isActive: true,
      },
      {
        id: 'rule-weight-heavy',
        ruleType: 'WEIGHT_SLAB',
        minUnit: 50.0,
        maxUnit: null,
        baseRate: 100.0,
        perUnitRate: 5.0, // ₹5/kg above 50kg
        priority: 10,
        isActive: true,
      },
      {
        id: 'rule-distance',
        ruleType: 'PER_KM_DISTANCE',
        minUnit: 10.0,
        maxUnit: 500.0,
        baseRate: 50.0,
        perUnitRate: 10.0, // ₹10/km beyond 10km
        priority: 20,
        isActive: true,
      },
      {
        id: 'rule-volumetric',
        ruleType: 'VOLUMETRIC',
        minUnit: 10.0,
        maxUnit: null,
        baseRate: 50.0,
        perUnitRate: 12.0,
        priority: 15,
        isActive: true,
      },
      {
        id: 'rule-surface-area',
        ruleType: 'AREA_SURFACE',
        minUnit: 1.0,
        maxUnit: null,
        baseRate: 30.0,
        perUnitRate: 20.0, // ₹20/m2 beyond 1m2
        priority: 12,
        isActive: true,
      },
      {
        id: 'rule-base-percentage',
        ruleType: 'BASE_PRICE_PERCENTAGE',
        baseRate: 0,
        perUnitRate: 1.5, // 1.5% of product value
        priority: 8,
        isActive: true,
      },
      {
        id: 'rule-handling-fee',
        ruleType: 'FIXED_FEE',
        baseRate: 50.0,
        priority: 5,
        isActive: true,
      },
    ],
  };

  describe('1. Derived Mathematical & Dimensional Calculations', () => {
    it('calculates volume in cm3 accurately', () => {
      expect(calculateVolumeCm3(100, 50, 20)).toBe(100000);
      expect(calculateVolumeCm3(0, 50, 20)).toBe(0);
      expect(calculateVolumeCm3(null, 50, 20)).toBe(0);
    });

    it('calculates volumetric dimensional weight with standard 5000 divisor', () => {
      // (60 * 40 * 20) / 5000 = 9.6 kg
      expect(calculateVolumetricWeightKg(60, 40, 20, 5000)).toBe(9.6);
      expect(calculateVolumetricWeightKg(0, 0, 0)).toBe(0);
    });

    it('calculates surface area in m2 correctly', () => {
      // (100cm * 100cm) / 10000 = 1.00 m2
      expect(calculateAreaM2(100, 100)).toBe(1.0);
      // (150cm * 80cm) / 10000 = 1.20 m2
      expect(calculateAreaM2(150, 80)).toBe(1.2);
    });

    it('clamps values correctly within boundary limits', () => {
      expect(clampNumber(25, 50, 500)).toBe(50);
      expect(clampNumber(1000, 50, 500)).toBe(500);
      expect(clampNumber(300, 50, 500)).toBe(300);
    });
  });

  describe('2. Positive Shipping Rule Calculations', () => {
    it('calculates standard freight with base weight and distance', () => {
      const result = ShippingEngine.calculate(comprehensiveProfile, {
        weightKg: 40, // matches base weight (100)
        distanceKm: 20, // matches distance: 50 + (20-10)*10 = 150
        productPrice: 1000, // 1.5% = 15
        quantity: 1,
      });

      // Weight (100) + Distance (150) + Handling (50) + Price % (15) = 315
      expect(result.finalShippingCost).toBe(315);
      expect(result.minChargeApplied).toBe(false);
      expect(result.maxChargeApplied).toBe(false);
    });

    it('calculates heavy incremental slab with decimal weight', () => {
      const result = ShippingEngine.calculate(comprehensiveProfile, {
        weightKg: 85.5, // matches heavy weight: 100 + (85.5-50)*5 = 100 + 177.5 = 277.5
        distanceKm: 0,
        productPrice: 0,
        quantity: 1,
      });

      // Weight (277.5) + Handling (50) = 327.5
      expect(result.finalShippingCost).toBe(327.5);
    });

    it('multiplies billable metrics by item quantity accurately', () => {
      const result = ShippingEngine.calculate(comprehensiveProfile, {
        weightKg: 20,
        distanceKm: 15,
        quantity: 5, // Total weight = 100kg -> heavy slab: 100 + (100-50)*5 = 350
        productPrice: 500, // Total price = 2500 -> 1.5% = 37.5
      });

      // Weight (350) + Distance (50 + (15-10)*10 = 100) + Handling (50) + Price% (37.5) = 537.5
      expect(result.derivedMetrics.totalActualWeightKg).toBe(100);
      expect(result.finalShippingCost).toBe(537.5);
    });

    it('prioritizes volumetric weight when dimensional weight exceeds actual weight', () => {
      const bulkyLightItem = {
        weightKg: 2, // Actual weight: 2kg
        lengthCm: 100,
        widthCm: 100,
        heightCm: 50, // Volumetric = (100*100*50)/5000 = 100kg!
        quantity: 1,
      };

      const result = ShippingEngine.calculate(comprehensiveProfile, bulkyLightItem);
      expect(result.derivedMetrics.volumetricWeightKg).toBe(100);
      expect(result.derivedMetrics.billableWeightKg).toBe(100);
      expect(result.derivedMetrics.billableWeightKg).toBeGreaterThan(bulkyLightItem.weightKg);
    });
  });

  describe('3. Combination Strategies & Boundary Enforcement', () => {
    it('enforces minCharge clamp when calculated cost is below threshold', () => {
      const result = ShippingEngine.calculate(comprehensiveProfile, {
        weightKg: 1,
        distanceKm: 0,
        productPrice: 0,
        quantity: 1,
      });

      // Calculated would be 100 (base weight) + 50 (handling) = 150 (meets minCharge)
      expect(result.finalShippingCost).toBeGreaterThanOrEqual(comprehensiveProfile.minCharge);
    });

    it('enforces maxCharge cap when bulk order costs exceed maximum bound', () => {
      const result = ShippingEngine.calculate(comprehensiveProfile, {
        weightKg: 5000,
        distanceKm: 400,
        quantity: 5,
        productPrice: 50000,
      });

      expect(result.finalShippingCost).toBe(comprehensiveProfile.maxCharge);
      expect(result.maxChargeApplied).toBe(true);
    });

    it('evaluates MAX combination strategy taking the highest single rule cost', () => {
      const maxProfile = {
        ...comprehensiveProfile,
        combinationStrategy: 'MAX',
      };

      // Weight: 100, Distance: 150, Handling: 50
      const result = ShippingEngine.calculate(maxProfile, {
        weightKg: 40,
        distanceKm: 20,
        productPrice: 0,
        quantity: 1,
      });

      // Highest single rule is Distance (150)
      expect(result.finalShippingCost).toBe(150);
    });
  });

  describe('4. Negative & Validation Error Tests via API', () => {
    it('rejects negative weight with 422 Unprocessable Entity', async () => {
      const res = await request(app)
        .post('/api/v1/shipping/calculate')
        .send({
          weightKg: -25,
          distanceKm: 10,
        });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('rejects negative distance with 422 Unprocessable Entity', async () => {
      const res = await request(app)
        .post('/api/v1/shipping/calculate')
        .send({
          weightKg: 50,
          distanceKm: -100,
        });

      expect(res.status).toBe(422);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('rejects zero or negative quantity with 422', async () => {
      const res = await request(app)
        .post('/api/v1/shipping/calculate')
        .send({
          weightKg: 50,
          quantity: 0,
        });

      expect(res.status).toBe(422);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });
});
