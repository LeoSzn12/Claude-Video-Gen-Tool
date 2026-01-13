import { z } from 'zod';

export const jobCreateSchema = z.object({
  templateId: z.string().optional(),
  studyId: z.string().optional(),
  book: z.object({
    title: z.string().min(1),
    author: z.string().optional(),
    synopsis: z.string().min(1),
    genre: z.string().optional(),
    quote: z.string().optional(),
  }),
  options: z
    .object({
      duration: z.number().int().positive().optional(),
      platform: z.string().optional(),
      voice: z.string().optional(),
      music: z.string().optional(),
      includeText: z.boolean().optional(),
      includeCaptions: z.boolean().optional(),
    })
    .optional(),
});

export const jobRemixSchema = z.object({
  parent_job_id: z.string().min(1),
  beat_id: z.string().optional(),
  fasterCuts: z.boolean().optional(),
  moreText: z.boolean().optional(),
  characterFocus: z.boolean().optional(),
});
