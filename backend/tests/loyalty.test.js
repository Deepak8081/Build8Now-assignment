import { describe, it, expect } from 'vitest';
import { LoyaltyEngine } from '../src/modules/loyalty/loyalty.engine.js';

describe('Task 2: Influencer Loyalty Engine - Precedence, Multi-Item & Edge Tests', () => {
  const activeLoyaltyRules = [
    // Tier 1: Product-specific rule (Highest Priority 30)
    {
      id: 'rule-prod-cement',
      name: 'UltraTech Cement Special Loyalty Promotion',
      ruleTarget: 'PRODUCT',
      targetValue: 'prod-cement-1',
      pointType: 'PERCENTAGE',
      pointValue: 8.0, // 8%
      maxPointsCap: 1000,
      priority: 30,
      isActive: true,
    },
    // Tier 1: Fixed points product rule (Priority 30)
    {
      id: 'rule-prod-special-tool',
      name: 'Power Tool Fixed Reward',
      ruleTarget: 'PRODUCT',
      targetValue: 'prod-tool-fixed',
      pointType: 'FIXED_POINTS',
      pointValue: 50.0, // 50 points per unit
      priority: 30,
      isActive: true,
    },
    // Tier 2: Category-specific rules (Medium Priority 20)
    {
      id: 'rule-cat-cement',
      name: 'Cement Category Default Rebate',
      ruleTarget: 'CATEGORY',
      targetValue: 'Cement',
      pointType: 'PERCENTAGE',
      pointValue: 4.0, // 4%
      priority: 20,
      isActive: true,
    },
    {
      id: 'rule-cat-steel',
      name: 'Steel Category Architect Standard Rebate',
      ruleTarget: 'CATEGORY',
      targetValue: 'Steel',
      pointType: 'PERCENTAGE',
      pointValue: 5.0, // 5%
      priority: 20,
      isActive: true,
    },
    {
      id: 'rule-cat-tiles',
      name: 'Tiles Category Influencer Reward',
      ruleTarget: 'CATEGORY',
      targetValue: 'Tiles',
      pointType: 'PERCENTAGE',
      pointValue: 3.5, // 3.5%
      priority: 20,
      isActive: true,
    },
    // Tier 3: Cart Value / Bulk Order Threshold Rule (Priority 10)
    {
      id: 'rule-cart-bonus-10k',
      name: 'High Value Order Bonus Tier',
      ruleTarget: 'CART_VALUE',
      targetValue: '10000',
      minOrderValue: 10000.0,
      pointType: 'PERCENTAGE',
      pointValue: 2.0, // 2% bonus on total order >= 10k
      maxPointsCap: 2000.0,
      priority: 10,
      isActive: true,
    },
  ];

  describe('1. Rule Precedence Hierarchy Tests', () => {
    it('prioritizes Product Rule (Tier 1) over Category Rule (Tier 2)', () => {
      const order = {
        id: 'ord-p1',
        orderNumber: 'ORD-P1',
        influencerId: 'inf-rahul',
        subtotal: 3800,
        items: [
          {
            id: 'item-1',
            productId: 'prod-cement-1',
            quantity: 10,
            unitPrice: 380,
            subtotal: 3800,
            product: { id: 'prod-cement-1', name: 'UltraTech Cement', category: 'Cement' },
          },
        ],
      };

      const result = LoyaltyEngine.calculatePoints(order, activeLoyaltyRules);

      // Matches Product Rule (8%) = 304 points instead of Category Rule (4% = 152)
      expect(result.itemPointsEarned).toBe(304);
      expect(result.totalPointsEarned).toBe(304);
      expect(result.itemBreakdown[0].matchedRule.precedenceLevel).toContain('Tier 1');
    });

    it('falls back to Category Rule (Tier 2) when no product rule matches', () => {
      const order = {
        id: 'ord-p2',
        orderNumber: 'ORD-P2',
        influencerId: 'inf-rahul',
        subtotal: 5000,
        items: [
          {
            id: 'item-2',
            productId: 'prod-steel-generic',
            quantity: 5,
            unitPrice: 1000,
            subtotal: 5000,
            product: { id: 'prod-steel-generic', name: 'Tata TMT Rebar', category: 'Steel' },
          },
        ],
      };

      const result = LoyaltyEngine.calculatePoints(order, activeLoyaltyRules);

      // Matches Steel Category Rule (5% of 5000) = 250 points
      expect(result.itemPointsEarned).toBe(250);
      expect(result.totalPointsEarned).toBe(250);
      expect(result.itemBreakdown[0].matchedRule.precedenceLevel).toContain('Tier 2');
    });
  });

  describe('2. Multi-Item Mixed Cart Calculations', () => {
    it('calculates distinct rules for each item line and applies Cart bonus for qualifying order', () => {
      const mixedOrder = {
        id: 'ord-mixed',
        orderNumber: 'ORD-MIXED-101',
        influencerId: 'inf-rahul',
        subtotal: 12000,
        items: [
          // Item 1: UltraTech Cement -> Product Rule 8% of 3800 = 304 pts
          {
            id: 'item-1',
            productId: 'prod-cement-1',
            quantity: 10,
            unitPrice: 380,
            subtotal: 3800,
            product: { id: 'prod-cement-1', name: 'UltraTech Cement', category: 'Cement' },
          },
          // Item 2: Tiles -> Category Rule 3.5% of 3200 = 112 pts
          {
            id: 'item-2',
            productId: 'prod-tiles-1',
            quantity: 4,
            unitPrice: 800,
            subtotal: 3200,
            product: { id: 'prod-tiles-1', name: 'Kajaria Floor Tiles', category: 'Tiles' },
          },
          // Item 3: Steel -> Category Rule 5% of 5000 = 250 pts
          {
            id: 'item-3',
            productId: 'prod-steel-1',
            quantity: 5,
            unitPrice: 1000,
            subtotal: 5000,
            product: { id: 'prod-steel-1', name: 'Tata Rebar', category: 'Steel' },
          },
        ],
      };

      const result = LoyaltyEngine.calculatePoints(mixedOrder, activeLoyaltyRules);

      // Item points: 304 + 112 + 250 = 666 pts
      expect(result.itemPointsEarned).toBe(666);

      // Cart subtotal is 12,000 >= 10,000 -> Cart bonus: 2% of 12,000 = 240 pts
      expect(result.cartBonusPoints).toBe(240);

      // Total Points: 666 + 240 = 906 pts
      expect(result.totalPointsEarned).toBe(906);
      expect(result.itemBreakdown.length).toBe(3);
    });

    it('calculates FIXED_POINTS per unit quantity accurately', () => {
      const orderWithFixedItem = {
        id: 'ord-fixed',
        orderNumber: 'ORD-FIXED',
        influencerId: 'inf-rahul',
        subtotal: 3000,
        items: [
          {
            id: 'item-tool',
            productId: 'prod-tool-fixed',
            quantity: 4, // 4 units * 50 pts/unit = 200 pts
            unitPrice: 750,
            subtotal: 3000,
            product: { id: 'prod-tool-fixed', name: 'Demolition Hammer', category: 'Tools' },
          },
        ],
      };

      const result = LoyaltyEngine.calculatePoints(orderWithFixedItem, activeLoyaltyRules);
      expect(result.itemPointsEarned).toBe(200);
      expect(result.totalPointsEarned).toBe(200);
    });

    it('enforces maxPointsCap on high value line items', () => {
      const bulkCementOrder = {
        id: 'ord-cap',
        orderNumber: 'ORD-CAP',
        influencerId: 'inf-rahul',
        subtotal: 50000,
        items: [
          {
            id: 'item-bulk',
            productId: 'prod-cement-1',
            quantity: 130,
            unitPrice: 380,
            subtotal: 49400, // 8% of 49,400 = 3952 -> capped at 1000!
            product: { id: 'prod-cement-1', name: 'UltraTech Cement', category: 'Cement' },
          },
        ],
      };

      const result = LoyaltyEngine.calculatePoints(bulkCementOrder, activeLoyaltyRules);
      expect(result.itemPointsEarned).toBe(1000); // capped at rule maxPointsCap
    });
  });

  describe('3. Negative & Non-Qualifying Scenarios', () => {
    it('returns zero points when order has no attributed influencer', () => {
      const unreferredOrder = {
        id: 'ord-unreferred',
        orderNumber: 'ORD-UNREF',
        influencerId: null, // No influencer
        subtotal: 25000,
        items: [],
      };

      const result = LoyaltyEngine.calculatePoints(unreferredOrder, activeLoyaltyRules);
      expect(result.eligible).toBe(false);
      expect(result.totalPointsEarned).toBe(0);
      expect(result.reason).toContain('No influencer');
    });

    it('ignores inactive rules', () => {
      const inactiveRuleList = activeLoyaltyRules.map((r) => ({ ...r, isActive: false }));
      const order = {
        id: 'ord-inactive',
        orderNumber: 'ORD-INACT',
        influencerId: 'inf-rahul',
        subtotal: 5000,
        items: [
          {
            id: 'item-1',
            productId: 'prod-cement-1',
            quantity: 10,
            unitPrice: 380,
            subtotal: 3800,
            product: { id: 'prod-cement-1', name: 'UltraTech Cement', category: 'Cement' },
          },
        ],
      };

      const result = LoyaltyEngine.calculatePoints(order, inactiveRuleList);
      expect(result.totalPointsEarned).toBe(0);
    });
  });
});
