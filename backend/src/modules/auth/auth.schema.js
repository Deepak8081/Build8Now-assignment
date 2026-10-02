import { z } from 'zod';

export const registerSchema = z.object({
  email: z
    .string({ required_error: 'Email address is required' })
    .trim()
    .email('Invalid email address format')
    .max(150, 'Email address cannot exceed 150 characters'),
  password: z
    .string({ required_error: 'Password is required' })
    .min(6, 'Password must be at least 6 characters long')
    .max(100, 'Password cannot exceed 100 characters'),
  name: z
    .string({ required_error: 'Name is required' })
    .trim()
    .min(2, 'Name must be at least 2 characters long')
    .max(100, 'Name cannot exceed 100 characters')
    .regex(
      /^[a-zA-Z\s\.\-']+$/,
      'Name can only contain alphabetic letters, spaces, dots, and hyphens (numbers and special digits are strictly disallowed)'
    ),
  role: z.enum(['ADMIN', 'CUSTOMER', 'INFLUENCER']).default('CUSTOMER'),

  // Optional Customer specific details
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\s\-()]{7,20}$/, 'Invalid phone number format')
    .optional()
    .nullable(),
  address: z.string().trim().max(250, 'Address cannot exceed 250 characters').optional().nullable(),
  referralCode: z.string().trim().max(50).optional().nullable(),

  // Optional Influencer specific details
  influencerType: z.enum(['ARCHITECT', 'CONTRACTOR', 'INTERIOR_DESIGNER', 'BUILDER']).optional(),
  customReferralCode: z.string().trim().max(50).optional().nullable(),
});

export const loginSchema = z.object({
  email: z.string({ required_error: 'Email is required' }).trim().email('Invalid email address format'),
  password: z.string({ required_error: 'Password is required' }).min(1, 'Password is required'),
});
