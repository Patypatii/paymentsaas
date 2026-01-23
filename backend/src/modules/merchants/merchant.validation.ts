import { z } from 'zod';

export const merchantRegistrationSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  phoneNumber: z.string().regex(/^\+?[\d\s-]{9,15}$/, 'Invalid phone number format'),
  password: z.string().min(6),
  referralSource: z.string().optional(),
});

export const phoneNumberSchema = z.string().regex(
  /^\+?[\d\s-]{9,15}$/,
  'Phone number must be a valid format'
);
