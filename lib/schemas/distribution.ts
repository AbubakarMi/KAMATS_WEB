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

export const createDispatchSchema = z.object({
  stoId: z.string().uuid('Select an authorised STO'),
  vehicleReg: z
    .string()
    .min(3, 'Vehicle registration is required')
    .max(20, 'Vehicle registration must not exceed 20 characters'),
  driverName: z
    .string()
    .min(2, 'Driver name is required')
    .max(100, 'Driver name must not exceed 100 characters'),
  driverPhone: z
    .string()
    .min(7, 'Driver phone number is required')
    .max(20, 'Phone number must not exceed 20 characters'),
});

export const recordDispatchWeightSchema = z.object({
  dispatchedWeightKg: z
    .string()
    .min(1, 'Weight is required')
    .refine((v) => !isNaN(Number(v)) && Number(v) > 0, 'Weight must be a positive number'),
  weightSource: z.enum(['scale', 'manual'], { message: 'Select weight source' }),
});

export const completeDispatchSchema = z.object({
  dispatcherPinToken: z.string().min(1, 'Dispatcher PIN is required'),
  driverPin: z.string().min(1, 'Driver PIN is required'),
  expectedArrivalAt: z.string().min(1, 'Expected arrival time is required'),
});

// === M13 — Transfer Receipt ===

export const createReceiptSchema = z.object({
  consignmentQr: z
    .string()
    .min(1, 'Consignment QR code is required')
    .max(100, 'QR code must not exceed 100 characters'),
});

export const reportDamageSchema = z.object({
  itemId: z.string().min(1, 'Item is required'),
  damageNotes: z
    .string()
    .min(5, 'Damage notes must be at least 5 characters')
    .max(1000, 'Damage notes must not exceed 1000 characters'),
});

export const completeReceiptSchema = z.object({
  receiverPinToken: z.string().min(1, 'Receiver PIN is required'),
  notes: z
    .string()
    .max(2000, 'Notes must not exceed 2000 characters')
    .optional()
    .or(z.literal('')),
});
