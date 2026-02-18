import { z } from 'zod';
import { CRITERIA } from './types.ts';
import { MIN_TEXT_LENGTH, MAX_TEXT_LENGTH } from './constants.ts';

const nonEmptyString = z.string().trim().min(1);

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
  score: z.number().min(0).max(10),
  evaluation: nonEmptyString,
  suggestion: nonEmptyString,
});

export const scorecardContentSchema = z.object({
  // Analysis-first ordering nudges grounded scoring in structured output mode.
  coreThesis: nonEmptyString,
  keyTerms: z.array(nonEmptyString).min(3).max(10),

  // Scorecard
  title: nonEmptyString,
  scores: z.array(criterionScoreSchema).length(5),
  summary: nonEmptyString,

  // Diagnostics
  contextSufficiency: z.enum(['low', 'medium', 'high']),
  rhetoricRisk: z.enum(['low', 'medium', 'high']),
});

export const scorecardResponseSchema = scorecardContentSchema;

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
