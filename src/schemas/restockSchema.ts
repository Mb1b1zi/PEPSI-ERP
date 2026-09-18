import { z } from 'zod';

const positiveInt = (msg = 'Must be a positive number') => z.coerce.number().int('Must be a whole number').positive(msg);

/** Blank optional number inputs arrive as `''` from react-hook-form; treat that as absent. */
const optionalPositiveInt = () =>
  z.preprocess(
    (val) => (val === '' || val === undefined || val === null ? undefined : val),
    positiveInt().optional(),
  );

export const confirmRestockSchema = z.object({
  supplyHistoryId: positiveInt(),
  quantityReceived: positiveInt(),
  confirmedById: optionalPositiveInt(),
});

export const rejectRestockSchema = z.object({
  supplyHistoryId: positiveInt(),
  reason: z.string().min(3, 'Reason must be at least 3 characters'),
  confirmedById: optionalPositiveInt(),
  quantityReceived: optionalPositiveInt(),
});

export const updateRestockSchema = z.object({
  quantityDelivered: positiveInt(),
});

export type ConfirmRestockValues = z.infer<typeof confirmRestockSchema>;
export type RejectRestockValues = z.infer<typeof rejectRestockSchema>;
export type UpdateRestockValues = z.infer<typeof updateRestockSchema>;
