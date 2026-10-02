/**
 * Precision Math Helper for Logistics, Currency, Dimensions & Loyalty (Pure Functional & Namespace)
 */

export const round2 = (val) => {
  if (val === null || val === undefined || isNaN(val)) return 0;
  return Math.round((Number(val) + Number.EPSILON) * 100) / 100;
};

export const calculateVolumeCm3 = (lengthCm, widthCm, heightCm) => {
  if (!lengthCm || !widthCm || !heightCm) return 0;
  return round2(Number(lengthCm) * Number(widthCm) * Number(heightCm));
};

export const calculateVolumetricWeightKg = (lengthCm, widthCm, heightCm, divisor = 5000) => {
  if (!lengthCm || !widthCm || !heightCm) return 0;
  const vol = Number(lengthCm) * Number(widthCm) * Number(heightCm);
  return round2(vol / divisor);
};

export const calculateSurfaceAreaM2 = (lengthCm, widthCm, heightCm = 0) => {
  if (!lengthCm || !widthCm) return 0;
  const L = Number(lengthCm);
  const W = Number(widthCm);
  const H = Number(heightCm || 0);
  if (H > 0) {
    return round2((2 * (L * W + W * H + H * L)) / 10000);
  }
  return round2((L * W) / 10000);
};

export const calculateAreaM2 = (lengthCm, widthCm, heightCm = 0) => {
  return calculateSurfaceAreaM2(lengthCm, widthCm, heightCm);
};

export const clampNumber = (val, min = null, max = null) => {
  let result = Number(val);
  if (min !== null && min !== undefined && result < min) {
    result = min;
  }
  if (max !== null && max !== undefined && result > max) {
    result = max;
  }
  return round2(result);
};

export const MathHelper = {
  round2,
  calculateVolumeCm3,
  calculateVolumetricWeightKg,
  calculateAreaM2,
  calculateSurfaceAreaM2,
  clamp: clampNumber,
};
