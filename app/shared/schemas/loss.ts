import { z } from 'zod';

export const createWriteOffSchema = z.object({
  storeId: z.string().uuid('Select a store'),
  category: z.enum(
    ['Breakage', 'Evaporation', 'Obsolescence', 'Contamination', 'Theft', 'Other'],
    { required_error: 'Select a category' },
  ),
  bags: z.coerce
    .number()
    .min(1, 'Must write off at least 1 bag')
    .max(100000, 'Must not exceed 100,000 bags'),
  lotId: z.string().optional().or(z.literal('')),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description must not exceed 2000 characters'),
});
