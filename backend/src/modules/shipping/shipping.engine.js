import { MathHelper } from '../../common/helpers/math.helper.js';

export class ShippingEngine {
  /**
   * Calculate Shipping Cost based on Profile Rules & Item Dimensions
   * @param {Object} profile ShippingProfile with active rules
   * @param {Object} params Input parameters (weight, dimensions, distance, price, quantity)
   */
  static calculate(profile, params) {
    const {
      weightKg = 0,
      lengthCm = 0,
      widthCm = 0,
      heightCm = 0,
      distanceKm = 0,
      productPrice = 0,
      quantity = 1,
    } = params;

    // 1. Calculate Derived Metrics
    const totalActualWeightKg = MathHelper.round2(weightKg * quantity);
    const volumeCm3 = MathHelper.calculateVolumeCm3(lengthCm, widthCm, heightCm);
    const volumetricWeightKg = MathHelper.calculateVolumetricWeightKg(lengthCm, widthCm, heightCm);
    const totalVolumetricWeightKg = MathHelper.round2(volumetricWeightKg * quantity);
    const surfaceAreaM2 = MathHelper.calculateSurfaceAreaM2(lengthCm, widthCm, heightCm);
    const totalSurfaceAreaM2 = MathHelper.round2(surfaceAreaM2 * quantity);
    const totalPrice = MathHelper.round2(productPrice * quantity);

    // Billable weight is maximum of actual dead-weight and volumetric dimensional weight
    const billableWeightKg = MathHelper.round2(Math.max(totalActualWeightKg, totalVolumetricWeightKg));

    const ruleBreakdown = [];
    const activeRules = (profile.rules || []).filter((r) => r.isActive);

    // Sort rules by priority descending
    activeRules.sort((a, b) => b.priority - a.priority);

    for (const rule of activeRules) {
      let cost = 0;
      let matched = false;
      let metricValue = 0;
      let formula = '';

      switch (rule.ruleType) {
        case 'WEIGHT_SLAB': {
          metricValue = billableWeightKg;
          const min = rule.minUnit ?? 0;
          const max = rule.maxUnit ?? Infinity;

          if (billableWeightKg >= min && billableWeightKg <= max) {
            matched = true;
            const billableUnits = Math.max(0, billableWeightKg - min);
            cost = rule.baseRate + billableUnits * rule.perUnitRate;
            formula = `baseRate(${rule.baseRate}) + (${billableWeightKg}kg - ${min}kg) * rate(${rule.perUnitRate})`;
          }
          break;
        }

        case 'PER_KM_DISTANCE': {
          metricValue = distanceKm;
          const min = rule.minUnit ?? 0;
          const max = rule.maxUnit ?? Infinity;

          if (distanceKm >= min && distanceKm <= max) {
            matched = true;
            const billableDistance = Math.max(0, distanceKm - min);
            cost = rule.baseRate + billableDistance * rule.perUnitRate;
            formula = `baseRate(${rule.baseRate}) + (${distanceKm}km - ${min}km) * rate(${rule.perUnitRate}/km)`;
          }
          break;
        }

        case 'VOLUMETRIC': {
          metricValue = totalVolumetricWeightKg;
          const min = rule.minUnit ?? 0;
          const max = rule.maxUnit ?? Infinity;

          if (totalVolumetricWeightKg >= min && totalVolumetricWeightKg <= max) {
            matched = true;
            cost = rule.baseRate + totalVolumetricWeightKg * rule.perUnitRate;
            formula = `baseRate(${rule.baseRate}) + volWeight(${totalVolumetricWeightKg}kg) * rate(${rule.perUnitRate})`;
          }
          break;
        }

        case 'AREA_SURFACE': {
          metricValue = totalSurfaceAreaM2;
          const min = rule.minUnit ?? 0;
          const max = rule.maxUnit ?? Infinity;

          if (totalSurfaceAreaM2 >= min && totalSurfaceAreaM2 <= max) {
            matched = true;
            cost = rule.baseRate + totalSurfaceAreaM2 * rule.perUnitRate;
            formula = `baseRate(${rule.baseRate}) + area(${totalSurfaceAreaM2}m²) * rate(${rule.perUnitRate}/m²)`;
          }
          break;
        }

        case 'BASE_PRICE_PERCENTAGE': {
          metricValue = totalPrice;
          matched = true;
          cost = rule.baseRate + (totalPrice * rule.perUnitRate) / 100;
          formula = `baseRate(${rule.baseRate}) + (${totalPrice} * ${rule.perUnitRate}%)`;
          break;
        }

        case 'FIXED_FEE': {
          matched = true;
          cost = rule.baseRate;
          formula = `fixedFee(${rule.baseRate})`;
          break;
        }

        default:
          break;
      }

      if (matched) {
        cost = MathHelper.round2(cost);
        ruleBreakdown.push({
          ruleId: rule.id,
          ruleType: rule.ruleType,
          priority: rule.priority,
          metricEvaluated: metricValue,
          calculatedCost: cost,
          formulaApplied: formula,
        });
      }
    }

    // 2. Combine costs based on profile strategy
    let subtotalCost = 0;
    const individualCosts = ruleBreakdown.map((r) => r.calculatedCost);

    if (individualCosts.length > 0) {
      if (profile.combinationStrategy === 'MAX') {
        subtotalCost = Math.max(...individualCosts);
      } else if (profile.combinationStrategy === 'TIERED_SLAB') {
        // In tiered slab, accumulate matching slabs
        subtotalCost = individualCosts.reduce((acc, c) => acc + c, 0);
      } else {
        // Default: SUM strategy
        subtotalCost = individualCosts.reduce((acc, c) => acc + c, 0);
      }
    }

    subtotalCost = MathHelper.round2(subtotalCost);

    // 3. Apply Min / Max profile bounds
    let finalCost = subtotalCost;
    let minChargeApplied = false;
    let maxChargeApplied = false;

    if (profile.minCharge !== null && profile.minCharge !== undefined && finalCost < profile.minCharge) {
      finalCost = profile.minCharge;
      minChargeApplied = true;
    }

    if (profile.maxCharge !== null && profile.maxCharge !== undefined && finalCost > profile.maxCharge) {
      finalCost = profile.maxCharge;
      maxChargeApplied = true;
    }

    finalCost = MathHelper.round2(finalCost);

    return {
      shippingProfile: {
        id: profile.id,
        name: profile.name,
        combinationStrategy: profile.combinationStrategy,
        minCharge: profile.minCharge,
        maxCharge: profile.maxCharge,
      },
      derivedMetrics: {
        quantity,
        totalActualWeightKg,
        volumeCm3,
        volumetricWeightKg,
        totalVolumetricWeightKg,
        billableWeightKg,
        surfaceAreaM2,
        totalSurfaceAreaM2,
        distanceKm,
        totalPrice,
      },
      finalShippingCost: finalCost,
      finalShippingCharge: finalCost,
      billableWeightKg,
      volumetricWeightKg,
      ruleBreakdown,
      subtotalCost,
      minChargeApplied,
      maxChargeApplied,
      currency: 'INR',
    };
  }
}
