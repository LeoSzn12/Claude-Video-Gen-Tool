import { z } from 'zod';

export const studyCreateSchema = z.object({
  storage_path: z.string().min(1),
  source_type: z.enum(['upload', 'url']).default('upload'),
});

export const studyUploadUrlSchema = z.object({
  fileName: z.string().min(1),
  contentType: z.string().min(1),
});
