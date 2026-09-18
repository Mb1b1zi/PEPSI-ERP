import { z } from 'zod';

export const priceSchema = z.object({
  quantityId: z.coerce.number().int('Must be a whole number').positive('Select a quantity'),
  amount: z.coerce.number().int('Must be a whole number').positive('Amount must be greater than 0'),
});

export type PriceValues = z.infer<typeof priceSchema>;
