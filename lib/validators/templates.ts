import { z } from 'zod';

export const templateCreateSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(['draft', 'published']).optional(),
  version: z.number().int().positive().optional(),
  templateGroupId: z.string().optional(),
  templateJson: z.record(z.unknown()).optional(),
});

export const templateUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  templateJson: z.record(z.unknown()).optional(),
});
