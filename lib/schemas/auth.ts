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

export const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must not exceed 128 characters'),
  confirmPassword: z
    .string()
    .min(1, 'Please confirm your new password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
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
