import { z } from 'zod';
import { CRITERIA } from './types';
import { MIN_TEXT_LENGTH, MAX_TEXT_LENGTH } from './constants';

export const evaluationRequestSchema = z.object({
  text: z
    .string()
    .min(MIN_TEXT_LENGTH, `Text must be at least ${MIN_TEXT_LENGTH} characters`)
    .max(MAX_TEXT_LENGTH, `Text must not exceed ${MAX_TEXT_LENGTH} characters`),
  title: z.string().max(200).optional(),
});

export const updateScorecardRequestSchema = z.object({
  title: z.string().min(1).max(200),
});

export const criterionScoreSchema = z.object({
  criterion: z.enum(CRITERIA),
  provisionalScore: z.number().min(0).max(10),
  note: z.string(),
});

export const scorecardResponseSchema = z.object({
  title: z.string(),
  scores: z.array(criterionScoreSchema).length(5),
  summary: z.string(),
});

export const apiErrorCodeSchema = z.enum([
  'VALIDATION_ERROR',
  'TEXT_TOO_SHORT',
  'TEXT_TOO_LONG',
  'UNAUTHORIZED',
  'FORBIDDEN',
  'NOT_FOUND',
  'RATE_LIMITED',
  'AI_SERVICE_ERROR',
  'AI_TIMEOUT',
  'INTERNAL_ERROR',
]);

export const apiErrorSchema = z.object({
  error: z.string(),
  code: apiErrorCodeSchema,
  details: z.unknown().optional(),
  requestId: z.string().optional(),
});

export type EvaluationRequestInput = z.infer<typeof evaluationRequestSchema>;
export type ScorecardResponseInput = z.infer<typeof scorecardResponseSchema>;
