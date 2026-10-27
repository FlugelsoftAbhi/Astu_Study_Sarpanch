import { z } from "zod";

export const MIN_CHARS = 50;
export const MAX_CHARS = 8000;

export const InputSchema = z.object({
  text: z.string().trim().min(MIN_CHARS).max(MAX_CHARS),
});

// Shape we require back from Gemini. Anything else is rejected.
export const StudySetSchema = z.object({
  title: z.string().min(1).max(120),
  summary: z.string().min(1).max(2000),
  flashcards: z
    .array(z.object({ front: z.string().min(1), back: z.string().min(1) }))
    .min(3)
    .max(15),
  quiz: z
    .array(
      z.object({
        question: z.string().min(1),
        options: z.array(z.string().min(1)).length(4),
        answerIndex: z.number().int().min(0).max(3),
        explanation: z.string().min(1),
      })
    )
    .length(5),
});

export type StudySet = z.infer<typeof StudySetSchema>;
export type StoredSet = StudySet & { id: string; createdAt?: Date | null };
