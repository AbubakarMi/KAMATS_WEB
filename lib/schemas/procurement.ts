import { z } from 'zod';

export const createPRSchema = z.object({
  storeId: z.string().uuid('Select a destination store'),
  quantityBags: z.coerce
    .number()
    .min(1, 'Quantity must be at least 1 bag')
    .max(100000, 'Quantity must not exceed 100,000 bags'),
  justification: z
    .string()
    .min(10, 'Justification must be at least 10 characters')
    .max(2000, 'Justification must not exceed 2000 characters'),
  requestedDeliveryDate: z
    .string()
    .min(1, 'Delivery date is required'),
});
