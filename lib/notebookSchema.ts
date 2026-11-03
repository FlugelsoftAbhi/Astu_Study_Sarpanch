import { z } from "zod";

export const NOTEBOOK_MIN_CHARS = 50;
export const NOTEBOOK_MAX_CHARS = 12000;

export const NotebookInputSchema = z.object({
  sourceName: z.string().max(100).default("Lecture Notes"),
  text: z.string().min(NOTEBOOK_MIN_CHARS).max(NOTEBOOK_MAX_CHARS),
});

export const KeyConceptSchema = z.object({
  term: z.string().min(1).max(100),
  definition: z.string().min(1),
  significance: z.string().min(1),
});

export const NotebookFaqSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
});

export const NotebookFlashcardSchema = z.object({
  front: z.string().min(1),
  back: z.string().min(1),
  tag: z.string().default("Concept"),
});

export const NotebookQuizSchema = z.object({
  question: z.string().min(1),
  options: z.array(z.string().min(1)).length(4),
  answerIndex: z.number().int().min(0).max(3),
  explanation: z.string().min(1),
});

export const NotebookStudySetSchema = z.object({
  title: z.string().min(1).max(120),
  briefingDoc: z.string().min(1),
  keyConcepts: z.array(KeyConceptSchema).min(3),
  faqs: z.array(NotebookFaqSchema).min(3),
  flashcards: z.array(NotebookFlashcardSchema).min(6),
  quiz: z.array(NotebookQuizSchema).min(4),
  sourceSnippet: z.string().optional(),
  sourceName: z.string().default("Source Document"),
  createdAt: z.any().optional(),
});

export type NotebookStudySet = z.infer<typeof NotebookStudySetSchema>;
export type KeyConcept = z.infer<typeof KeyConceptSchema>;
export type NotebookFaq = z.infer<typeof NotebookFaqSchema>;
export type NotebookFlashcard = z.infer<typeof NotebookFlashcardSchema>;
export type NotebookQuiz = z.infer<typeof NotebookQuizSchema>;
