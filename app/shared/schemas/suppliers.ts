import { z } from 'zod';

export const createSupplierSchema = z.object({
  companyName: z
    .string()
    .min(2, 'Company name is required')
    .max(200, 'Company name must not exceed 200 characters'),
  registrationNumber: z
    .string()
    .min(2, 'Registration number is required')
    .max(50, 'Registration number must not exceed 50 characters'),
  address: z
    .string()
    .min(5, 'Address is required')
    .max(500, 'Address must not exceed 500 characters'),
  contactPerson: z
    .string()
    .min(2, 'Contact person is required')
    .max(100, 'Contact person must not exceed 100 characters'),
  contactPhone: z
    .string()
    .regex(/^\+?[0-9]{7,15}$/, 'Enter a valid phone number (7-15 digits)'),
  contactEmail: z
    .string()
    .email('Enter a valid email address'),
  bankName: z
    .string()
    .min(2, 'Bank name is required')
    .max(100, 'Bank name must not exceed 100 characters'),
  bankAccountNumber: z
    .string()
    .min(5, 'Account number is required')
    .max(30, 'Account number must not exceed 30 characters'),
  bankAccountName: z
    .string()
    .min(2, 'Account name is required')
    .max(200, 'Account name must not exceed 200 characters'),
  taxId: z
    .string()
    .min(2, 'Tax ID is required')
    .max(30, 'Tax ID must not exceed 30 characters'),
});
