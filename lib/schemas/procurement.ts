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

const createPOLineSchema = z.object({
  productSpecification: z
    .string()
    .min(3, 'Product specification must be at least 3 characters')
    .max(500, 'Product specification must not exceed 500 characters'),
  quantityBags: z.coerce
    .number()
    .min(1, 'Quantity must be at least 1 bag')
    .max(100000, 'Quantity must not exceed 100,000 bags'),
  standardWeightKg: z.coerce
    .number()
    .min(1, 'Weight must be at least 1 kg')
    .max(1000, 'Weight must not exceed 1,000 kg'),
  unitPrice: z.coerce
    .number()
    .min(0.01, 'Unit price must be at least 0.01'),
});

export const createPOSchema = z.object({
  prId: z.string().uuid('Select a purchase requisition'),
  supplierId: z.string().uuid('Select a supplier'),
  destinationStoreId: z.string().uuid('Select a destination store'),
  expectedDeliveryDate: z.string().min(1, 'Delivery date is required'),
  currency: z.string().default('NGN'),
  notes: z.string().max(2000, 'Notes must not exceed 2000 characters').optional(),
  lines: z.array(createPOLineSchema).min(1, 'At least one line item is required'),
});
