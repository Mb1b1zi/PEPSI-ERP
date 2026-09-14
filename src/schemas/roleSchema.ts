import { z } from 'zod';

export const roleSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

export type RoleValues = z.infer<typeof roleSchema>;
