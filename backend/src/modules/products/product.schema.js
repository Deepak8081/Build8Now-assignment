import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters'),
  slug: z.string().min(2, 'Slug must be at least 2 characters'),
  sku: z.string().min(2, 'SKU must be at least 2 characters'),
  category: z.string().min(2, 'Category is required'),
  price: z.number().min(0, 'Price must be >= 0'),
  weightKg: z.number().min(0, 'Weight must be >= 0'),
  lengthCm: z.number().min(0).optional(),
  widthCm: z.number().min(0).optional(),
  heightCm: z.number().min(0).optional(),
  shippingProfileId: z.string().uuid().optional(),
  isActive: z.boolean().default(true),
});

export const updateProductSchema = createProductSchema.partial();
