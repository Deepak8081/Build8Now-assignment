import { z } from 'zod';

export const createLoyaltyRuleSchema = z.object({
  name: z.string().min(2, 'Rule name must be at least 2 characters'),
  ruleTarget: z.enum(['PRODUCT', 'CATEGORY', 'CART_VALUE']),
  targetValue: z.string().nullable().optional(), // Product ID, Category Name, or min cart amount
  pointType: z.enum(['PERCENTAGE', 'FIXED_POINTS']).default('PERCENTAGE'),
  pointValue: z.number().min(0, 'Point value must be >= 0'),
  minOrderValue: z.number().min(0).default(0).optional(),
  maxPointsCap: z.number().min(0).nullable().optional(),
  priority: z.number().int().default(10), // e.g. Product=30, Category=20, Cart=10
  isActive: z.boolean().default(true),
});

export const updateLoyaltyRuleSchema = createLoyaltyRuleSchema.partial();

export const processOrderLoyaltySchema = z.object({
  orderId: z.string().uuid('Invalid order ID format'),
  idempotencyKey: z.string().min(4, 'idempotencyKey is required for safe processing'),
});

export const refundOrderLoyaltySchema = z.object({
  orderId: z.string().uuid('Invalid order ID format'),
  refundAmount: z.number().min(0.01, 'Refund amount must be > 0'),
  reason: z.string().min(2, 'Refund reason is required'),
  idempotencyKey: z.string().min(4, 'idempotencyKey must be at least 4 characters').optional(),
});
