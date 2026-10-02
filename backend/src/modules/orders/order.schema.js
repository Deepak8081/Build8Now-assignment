import { z } from 'zod';

export const createOrderItemSchema = z.object({
  productId: z.string().uuid('Invalid product ID format'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').default(1),
});

export const createOrderSchema = z.object({
  customerId: z.string().uuid('Invalid customer ID format').optional(),
  items: z.array(createOrderItemSchema).min(1, 'Order must contain at least one item'),
  distanceKm: z.number().min(0, 'Distance must be >= 0').default(10),
  referralCode: z.string().optional(), // override or direct referral code
});

export const cancelOrderSchema = z.object({
  reason: z.string().min(2, 'Cancellation reason is required'),
});
