import { z } from 'zod';

export const userCreateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email address'),
  contact: z.string().min(7, 'Enter a valid phone number'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const userEditSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email address'),
  contact: z.string().min(7, 'Enter a valid phone number'),
  password: z
    .string()
    .refine((val) => val === '' || val.length >= 8, 'Password must be at least 8 characters'),
});

export type UserCreateValues = z.infer<typeof userCreateSchema>;
export type UserEditValues = z.infer<typeof userEditSchema>;
