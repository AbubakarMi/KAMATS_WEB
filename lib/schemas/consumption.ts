import { z } from 'zod';

export const createConsumptionSchema = z.object({
  storeId: z.string().uuid('Select a store'),
  treatmentSessionRef: z
    .string()
    .min(3, 'Session reference must be at least 3 characters')
    .max(100, 'Session reference must not exceed 100 characters'),
  volumeTreatedM3: z
    .string()
    .min(1, 'Volume is required')
    .regex(/^\d+(\.\d+)?$/, 'Volume must be a valid number'),
});
