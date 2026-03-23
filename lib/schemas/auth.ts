import { z } from 'zod';

export const loginSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must not exceed 50 characters'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters'),
});

export const pinSetupSchema = z.object({
  currentPin: z
    .string()
    .regex(/^(\d{4,6})?$/, 'PIN must be 4-6 digits'),
  newPin: z
    .string()
    .regex(/^\d{4,6}$/, 'PIN must be 4-6 digits'),
  confirmPin: z
    .string()
    .regex(/^\d{4,6}$/, 'PIN must be 4-6 digits'),
}).refine((data) => data.newPin === data.confirmPin, {
  message: 'PINs do not match',
  path: ['confirmPin'],
});
