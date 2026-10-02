import { z } from 'zod';

export const linkReferralSchema = z.object({
  customerId: z.string().uuid('Invalid customer ID format'),
  referralCode: z.string().min(3, 'Referral code is required'),
});

export const updateInfluencerSchema = z.object({
  type: z.enum(['ARCHITECT', 'CONTRACTOR', 'INTERIOR_DESIGNER', 'BUILDER']).optional(),
  isActive: z.boolean().optional(),
});
