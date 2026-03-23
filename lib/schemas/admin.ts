import { z } from 'zod';

export const createUserSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must not exceed 50 characters')
    .regex(/^[a-zA-Z0-9._-]+$/, 'Username may only contain letters, numbers, dots, hyphens, and underscores'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must not exceed 128 characters'),
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(100, 'First name must not exceed 100 characters'),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(100, 'Last name must not exceed 100 characters'),
  email: z
    .string()
    .email('Enter a valid email address'),
  phoneNumber: z
    .string()
    .regex(/^\+?[0-9]{7,15}$/, 'Enter a valid phone number (7-15 digits)')
    .optional()
    .or(z.literal('')),
  storeId: z.string().uuid('Invalid store').optional().or(z.literal('')),
  roleIds: z
    .array(z.string())
    .min(1, 'Select at least one role'),
});

export const updateUserSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100).optional(),
  lastName: z.string().min(1, 'Last name is required').max(100).optional(),
  email: z.string().email('Enter a valid email address').optional(),
  phoneNumber: z
    .string()
    .regex(/^\+?[0-9]{7,15}$/, 'Enter a valid phone number')
    .optional()
    .or(z.literal('')),
  storeId: z.string().uuid('Invalid store').optional().or(z.literal('')),
});

export const createStoreSchema = z.object({
  code: z
    .string()
    .min(2, 'Store code is required')
    .max(20, 'Store code must not exceed 20 characters')
    .regex(/^[A-Z0-9_-]+$/, 'Store code must be uppercase letters, numbers, hyphens, or underscores'),
  name: z
    .string()
    .min(2, 'Store name is required')
    .max(200, 'Store name must not exceed 200 characters'),
  tier: z.enum(['CentralStore', 'UnitStore', 'UserStore'], {
    error: 'Select a store tier',
  }),
  parentStoreId: z.string().uuid('Invalid parent store').optional().or(z.literal('')),
  address: z.string().max(500, 'Address must not exceed 500 characters').optional().or(z.literal('')),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
});

export const updateStoreSchema = z.object({
  name: z
    .string()
    .min(2, 'Store name is required')
    .max(200, 'Store name must not exceed 200 characters'),
  address: z.string().max(500, 'Address must not exceed 500 characters'),
  gpsLatitude: z.string().max(20),
  gpsLongitude: z.string().max(20),
  isActive: z.boolean(),
});

export const registerDeviceSchema = z.object({
  deviceName: z
    .string()
    .min(2, 'Device name is required')
    .max(100, 'Device name must not exceed 100 characters'),
  deviceType: z.enum(['mobile', 'tablet', 'scanner'], {
    error: 'Select a device type',
  }),
  serialNumber: z
    .string()
    .min(3, 'Serial number is required')
    .max(100, 'Serial number must not exceed 100 characters'),
  assignedStoreId: z.string().uuid('Select a store'),
});
