import { z } from 'zod';

export const productionSchema = z.object({
  productId: z.coerce.number().int('Must be a whole number').positive('Must be a positive number'),
  quantityProduced: z.coerce.number().int('Must be a whole number').positive('Must be a positive number'),
  productionDate: z.string().optional(),
});

export type ProductionValues = z.infer<typeof productionSchema>;
