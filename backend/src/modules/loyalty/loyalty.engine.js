import { MathHelper } from '../../common/helpers/math.helper.js';

export class LoyaltyEngine {
  /**
   * Calculate loyalty points for an order based on active rules and item hierarchy
   * Precedence Hierarchy:
   * 1. Product-specific Rule (Priority 30+)
   * 2. Category-specific Rule (Priority 20-29)
   * 3. Cart Value / Default Tier Rule (Priority 10-19)
   * 
   * @param {Object} order Order with customer, influencer, items and products
   * @param {Array} rules Array of LoyaltyRule models
   */
  static calculatePoints(order, rules = []) {
    if (!order.influencerId && !order.influencer) {
      return {
        totalPointsEarned: 0,
        eligible: false,
        reason: 'No influencer/architect attributed to this order',
        itemBreakdown: [],
      };
    }

    // Filter strictly active rules
    const activeRules = rules.filter((r) => r.isActive !== false);

    const items = order.items || [];
    const itemBreakdown = [];
    let totalPoints = 0;

    // Filter rules by target
    const productRules = activeRules.filter((r) => r.ruleTarget === 'PRODUCT');
    const categoryRules = activeRules.filter((r) => r.ruleTarget === 'CATEGORY');
    const cartRules = activeRules.filter((r) => r.ruleTarget === 'CART_VALUE');

    // Sort each group by priority descending
    productRules.sort((a, b) => b.priority - a.priority);
    categoryRules.sort((a, b) => b.priority - a.priority);
    cartRules.sort((a, b) => b.priority - a.priority);

    // 1. Process Item-level rules (Product Rule > Category Rule)
    for (const item of items) {
      const product = item.product || {};
      const itemSubtotal = item.subtotal || item.quantity * item.unitPrice;
      let matchedRule = null;
      let rulePrecedenceLevel = 'NONE';

      // Level 1: Match Product-specific rule
      const matchedProductRule = productRules.find(
        (r) => r.targetValue === item.productId || r.targetValue === product.id || r.targetValue === product.sku
      );

      if (matchedProductRule) {
        matchedRule = matchedProductRule;
        rulePrecedenceLevel = 'PRODUCT_RULE (Tier 1 - Highest)';
      }

      // Level 2: Match Category-specific rule if no product rule matched
      if (!matchedRule && product.category) {
        const matchedCategoryRule = categoryRules.find(
          (r) => r.targetValue?.toLowerCase() === product.category.toLowerCase()
        );
        if (matchedCategoryRule) {
          matchedRule = matchedCategoryRule;
          rulePrecedenceLevel = 'CATEGORY_RULE (Tier 2 - Medium)';
        }
      }

      let itemPoints = 0;

      if (matchedRule) {
        if (matchedRule.pointType === 'PERCENTAGE') {
          itemPoints = (itemSubtotal * matchedRule.pointValue) / 100;
        } else {
          // FIXED_POINTS per unit quantity
          itemPoints = matchedRule.pointValue * item.quantity;
        }

        // Apply rule max cap if defined
        if (matchedRule.maxPointsCap && itemPoints > matchedRule.maxPointsCap) {
          itemPoints = matchedRule.maxPointsCap;
        }

        itemPoints = MathHelper.round2(itemPoints);
        totalPoints += itemPoints;

        itemBreakdown.push({
          itemId: item.id,
          productId: item.productId,
          productName: product.name,
          category: product.category,
          quantity: item.quantity,
          itemSubtotal,
          matchedRule: {
            id: matchedRule.id,
            name: matchedRule.name,
            target: matchedRule.ruleTarget,
            pointType: matchedRule.pointType,
            pointValue: matchedRule.pointValue,
            priority: matchedRule.priority,
            precedenceLevel: rulePrecedenceLevel,
          },
          pointsEarned: itemPoints,
        });
      } else {
        itemBreakdown.push({
          itemId: item.id,
          productId: item.productId,
          productName: product.name,
          category: product.category,
          quantity: item.quantity,
          itemSubtotal,
          matchedRule: null,
          pointsEarned: 0,
          note: 'No item-level rule matched; deferred to cart rule',
        });
      }
    }

    // 2. Process Cart-level rules if no item-level points or as additive cart bonus
    const qualifyingCartRule = cartRules.find((r) => {
      const minVal = r.minOrderValue || parseFloat(r.targetValue) || 0;
      return order.subtotal >= minVal;
    });

    let cartBonusPoints = 0;
    if (qualifyingCartRule) {
      if (qualifyingCartRule.pointType === 'PERCENTAGE') {
        cartBonusPoints = (order.subtotal * qualifyingCartRule.pointValue) / 100;
      } else {
        cartBonusPoints = qualifyingCartRule.pointValue;
      }

      if (qualifyingCartRule.maxPointsCap && cartBonusPoints > qualifyingCartRule.maxPointsCap) {
        cartBonusPoints = qualifyingCartRule.maxPointsCap;
      }

      cartBonusPoints = MathHelper.round2(cartBonusPoints);
    }

    // If item rules awarded points, add cart bonus or fallback
    const finalTotalPoints = MathHelper.round2(totalPoints + cartBonusPoints);

    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      influencerId: order.influencerId,
      subtotal: order.subtotal,
      itemPointsEarned: MathHelper.round2(totalPoints),
      cartBonusPoints,
      cartRuleApplied: qualifyingCartRule
        ? {
            id: qualifyingCartRule.id,
            name: qualifyingCartRule.name,
            pointValue: qualifyingCartRule.pointValue,
            precedenceLevel: 'CART_RULE (Tier 3 - Fallback/Bonus)',
          }
        : null,
      totalPointsEarned: finalTotalPoints,
      itemBreakdown,
      rulePrecedenceOrder: [
        '1. Product-specific Rule (Priority 30+)',
        '2. Category-specific Rule (Priority 20-29)',
        '3. Cart Value / General Default Rule (Priority 10-19)',
      ],
    };
  }
}
