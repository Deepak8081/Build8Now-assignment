import { z } from 'zod';

export const createShippingRuleSchema = z.object({
  ruleType: z.enum([
    'WEIGHT_SLAB',
    'PER_KM_DISTANCE',
    'VOLUMETRIC',
    'AREA_SURFACE',
    'BASE_PRICE_PERCENTAGE',
    'FIXED_FEE',
  ]),
  minUnit: z.number().min(0, 'minUnit must be >= 0').nullable().optional(),
  maxUnit: z.number().min(0, 'maxUnit must be >= 0').nullable().optional(),
  baseRate: z.number().min(0, 'baseRate must be >= 0').default(0),
  perUnitRate: z.number().min(0, 'perUnitRate must be >= 0').default(0),
  priority: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const createShippingProfileSchema = z.object({
  name: z.string().min(2, 'Profile name must be at least 2 characters'),
  description: z.string().optional(),
  combinationStrategy: z.enum(['SUM', 'MAX', 'TIERED_SLAB']).default('SUM'),
  minCharge: z.number().min(0, 'minCharge must be >= 0').nullable().optional(),
  maxCharge: z.number().min(0, 'maxCharge must be >= 0').nullable().optional(),
  isActive: z.boolean().default(true),
  rules: z.array(createShippingRuleSchema).optional().default([]),
});

export const updateShippingProfileSchema = createShippingProfileSchema.partial();

export const assignProfileToProductSchema = z.object({
  productId: z.string().uuid('Invalid product ID format'),
  shippingProfileId: z.string().uuid('Invalid shipping profile ID format').nullable(),
});

// Realistic industrial freight bounds for shipping calculation
export const calculateShippingSchema = z.object({
  productId: z.string().uuid('Invalid product ID format').optional(),
  shippingProfileId: z.string().uuid('Invalid shipping profile ID format').optional(),
  quantity: z
    .number({ invalid_type_error: 'Quantity must be a valid number' })
    .int('Quantity must be an integer')
    .min(1, 'Quantity must be at least 1')
    .max(10000, 'Quantity cannot exceed 10,000 units per order')
    .default(1),
  weightKg: z
    .number({ invalid_type_error: 'Weight must be a valid number' })
    .min(0, 'Weight must be >= 0 kg')
    .max(100000, 'Unit weight cannot exceed 100,000 kg (100 Metric Tons)')
    .optional(),
  lengthCm: z
    .number({ invalid_type_error: 'Length must be a valid number' })
    .min(0, 'Length must be >= 0 cm')
    .max(3000, 'Length cannot exceed 3,000 cm (30 meters)')
    .optional(),
  widthCm: z
    .number({ invalid_type_error: 'Width must be a valid number' })
    .min(0, 'Width must be >= 0 cm')
    .max(500, 'Width cannot exceed 500 cm (5 meters)')
    .optional(),
  heightCm: z
    .number({ invalid_type_error: 'Height must be a valid number' })
    .min(0, 'Height must be >= 0 cm')
    .max(500, 'Height cannot exceed 500 cm (5 meters)')
    .optional(),
  distanceKm: z
    .number({ invalid_type_error: 'Distance must be a valid number' })
    .min(0, 'Distance must be >= 0 km')
    .max(3000, 'Distance cannot exceed 3,000 km')
    .default(0),
  productPrice: z
    .number({ invalid_type_error: 'Product price must be a valid number' })
    .min(0, 'Product price must be >= 0')
    .max(10000000, 'Product price cannot exceed ₹1,00,00,000')
    .optional(),
});
