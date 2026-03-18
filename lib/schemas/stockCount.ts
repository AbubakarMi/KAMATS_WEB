import { z } from 'zod';

export const createStockCountSchema = z.object({
  countType: z.enum(['Full', 'Cycle', 'Spot'], {
    error: 'Select a count type',
  }),
  storeId: z.string().uuid('Select a store'),
  assignedTo: z
    .string()
    .min(1, 'Assigned user is required'),
  scheduledDate: z
    .string()
    .min(1, 'Scheduled date is required'),
});
