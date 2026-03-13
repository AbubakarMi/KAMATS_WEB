import { z } from 'zod';

export const createAlertRuleSchema = z.object({
  ruleName: z
    .string()
    .min(3, 'Rule name must be at least 3 characters')
    .max(100, 'Rule name must not exceed 100 characters'),
  module: z
    .string()
    .min(1, 'Module is required'),
  conditionType: z
    .string()
    .min(1, 'Condition type is required'),
  thresholdValue: z.coerce
    .number()
    .min(0, 'Threshold must be 0 or greater'),
  severity: z.enum(['Low', 'Medium', 'High', 'Critical'], {
    required_error: 'Select a severity level',
  }),
  notifyRoles: z
    .array(z.string())
    .min(1, 'Select at least one role to notify'),
  channels: z
    .array(z.string())
    .min(1, 'Select at least one notification channel'),
});
