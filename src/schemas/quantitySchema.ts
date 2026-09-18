import { z } from 'zod';

export const quantitySchema = z.object({
  value: z.string().min(1, 'Value is required'),
});

export type QuantityValues = z.infer<typeof quantitySchema>;
