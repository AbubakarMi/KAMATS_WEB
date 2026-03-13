import { z } from 'zod';

export const createSTOSchema = z.object({
  sourceStoreId: z.string().uuid('Select a source store'),
  destinationStoreId: z.string().uuid('Select a destination store'),
  requestedBags: z.coerce
    .number()
    .min(1, 'Must request at least 1 bag')
    .max(100000, 'Must not exceed 100,000 bags'),
  requestedDeliveryDate: z
    .string()
    .min(1, 'Delivery date is required'),
  justification: z
    .string()
    .min(10, 'Justification must be at least 10 characters')
    .max(2000, 'Justification must not exceed 2000 characters'),
  notes: z
    .string()
    .max(2000, 'Notes must not exceed 2000 characters')
    .optional()
    .or(z.literal('')),
});
