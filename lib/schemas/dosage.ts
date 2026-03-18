import { z } from 'zod';

export const createDosageConfigSchema = z.object({
  storeId: z.string().uuid('Select a store'),
  standardRateKgPerM3: z.coerce
    .number()
    .min(0.001, 'Standard rate must be greater than 0')
    .max(10, 'Standard rate must not exceed 10 kg/m\u00B3'),
  acceptableVariancePct: z.coerce
    .number()
    .min(0, 'Variance cannot be negative')
    .max(100, 'Variance must not exceed 100%'),
  thresholdNormalLowPct: z.coerce
    .number()
    .min(0, 'Threshold cannot be negative')
    .max(100, 'Threshold must not exceed 100%'),
  thresholdNormalHighPct: z.coerce
    .number()
    .min(0, 'Threshold cannot be negative')
    .max(200, 'Threshold must not exceed 200%'),
  thresholdElevatedHighPct: z.coerce
    .number()
    .min(0, 'Threshold cannot be negative')
    .max(300, 'Threshold must not exceed 300%'),
  drySeasonMultiplier: z.coerce
    .number()
    .min(0.1, 'Multiplier must be at least 0.1')
    .max(5, 'Multiplier must not exceed 5'),
  wetSeasonMultiplier: z.coerce
    .number()
    .min(0.1, 'Multiplier must be at least 0.1')
    .max(5, 'Multiplier must not exceed 5'),
  drySeasonStart: z
    .string()
    .regex(/^\d{2}-\d{2}$/, 'Format must be MM-DD'),
  drySeasonEnd: z
    .string()
    .regex(/^\d{2}-\d{2}$/, 'Format must be MM-DD'),
  wetSeasonStart: z
    .string()
    .regex(/^\d{2}-\d{2}$/, 'Format must be MM-DD'),
  wetSeasonEnd: z
    .string()
    .regex(/^\d{2}-\d{2}$/, 'Format must be MM-DD'),
});
