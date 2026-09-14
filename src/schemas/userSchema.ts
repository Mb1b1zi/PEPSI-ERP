import { z } from 'zod';

const optionalPositiveInt = () =>
  z.preprocess(
    (val) => (val === '' || val === undefined || val === null ? undefined : val),
    z.coerce.number().int('Must be a whole number').positive('Must be a positive number').optional(),
  );

const optionalPositiveNumber = () =>
  z.preprocess(
    (val) => (val === '' || val === undefined || val === null ? undefined : val),
    z.coerce.number().positive('Must be a positive number').optional(),
  );

export const userSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.union([z.literal(''), z.string().email('Enter a valid email address')]).optional(),
  gender: z.enum(['Male', 'Female'], { message: 'Select a gender' }),
  contact: z.string().min(7, 'Enter a valid phone number'),
  salary: optionalPositiveNumber(),
  roleId: optionalPositiveInt(),
  depotId: optionalPositiveInt(),
});

export type UserValues = z.infer<typeof userSchema>;
