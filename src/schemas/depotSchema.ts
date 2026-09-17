import { z } from 'zod';

export const depotSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  location: z.string().min(2, 'Location must be at least 2 characters'),
});

export type DepotValues = z.infer<typeof depotSchema>;
