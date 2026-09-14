import { z } from 'zod';

const positiveInt = (msg = 'Must be a positive number') => z.coerce.number().int('Must be a whole number').positive(msg);
const positiveNumber = (msg = 'Must be a positive number') => z.coerce.number().positive(msg);

/** Blank optional number inputs arrive as `''` from react-hook-form; treat that as absent. */
const optionalPositiveNumber = () =>
  z.preprocess(
    (val) => (val === '' || val === undefined || val === null ? undefined : val),
    positiveNumber().optional(),
  );

export const saleCreateSchema = z.object({
  depotId: positiveInt(),
  productId: positiveInt(),
  quantityId: positiveInt(),
  quantitySold: positiveInt(),
  soldById: positiveInt(),
  amountSold: optionalPositiveNumber(),
});

export const saleUpdateSchema = z.object({
  quantitySold: positiveInt(),
  amountSold: positiveNumber(),
});

export type SaleCreateValues = z.infer<typeof saleCreateSchema>;
export type SaleUpdateValues = z.infer<typeof saleUpdateSchema>;
