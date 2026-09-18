import { z } from 'zod';

export const supplyCreateSchema = z.object({
  productId: z.coerce.number().int('Must be a whole number').positive('Must be a positive number'),
  quantityId: z.coerce.number().int('Must be a whole number').positive('Must be a positive number'),
  amount: z.coerce.number().int('Must be a whole number').positive('Must be a positive number'),
  depotId: z.coerce.number().int('Must be a whole number').positive('Select a depot'),
});

export const supplyDecideSchema = z
  .object({
    status: z.enum(['received', 'rejected']),
    rejectionReason: z.string().optional(),
  })
  .refine((val) => val.status !== 'rejected' || Boolean(val.rejectionReason?.trim()), {
    message: 'Rejection reason is required when rejecting a supply',
    path: ['rejectionReason'],
  });

export type SupplyCreateValues = z.infer<typeof supplyCreateSchema>;
export type SupplyDecideValues = z.infer<typeof supplyDecideSchema>;
