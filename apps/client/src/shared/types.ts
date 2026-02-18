export const CRITERIA = [
  'clarity',
  'simplexity',
  'errorCorrection',
  'unity',
  'pragmaticExperience',
] as const;

export type Criterion = (typeof CRITERIA)[number];

export type ContextSufficiency = 'low' | 'medium' | 'high';
export type RhetoricRisk = 'low' | 'medium' | 'high';

export interface CriterionScore {
  criterion: Criterion;
  score: number; // 0-10, direct from LLM (no calibration offset)
  evaluation: string;
  suggestion: string;
}

export interface Scorecard {
  id: string;
  createdAt: Date;

  // Analysis
  coreThesis: string;
  keyTerms: string[];

  // Scorecard
  title: string;
  inputText: string; // Original submitted text
  wordCount: number;
  overallScore: number; // Average of direct criterion scores
  scores: CriterionScore[];
  summary: string;

  // Diagnostics
  contextSufficiency: ContextSufficiency;
  rhetoricRisk: RhetoricRisk;

  // Metadata
  modelUsed: string;
  processingTimeMs: number;
  inputTokens: number;
  outputTokens: number;
  costUsd: number; // Total cost in USD
}

export interface EvaluationRequest {
  text: string;
  title?: string; // Optional, will be inferred from text if not provided
}

export interface UpdateScorecardRequest {
  title: string; // User can rename the inferred title
}

export interface EvaluationStreamEvent {
  type: 'score' | 'summary' | 'complete' | 'error';
  data: Partial<CriterionScore> | string | Scorecard | { message: string };
}

export interface ApiError {
  error: string; // Human-readable error message
  code: ApiErrorCode; // Machine-readable error code
  details?: unknown; // Optional additional context
  requestId?: string; // For debugging/support
}

export type ApiErrorCode =
  | 'VALIDATION_ERROR' // Invalid input (400)
  | 'TEXT_TOO_SHORT' // Text below minimum length (400)
  | 'TEXT_TOO_LONG' // Text exceeds maximum length (400)
  | 'UNAUTHORIZED' // Missing or invalid auth (401)
  | 'FORBIDDEN' // Valid auth but not permitted (403)
  | 'NOT_FOUND' // Resource not found (404)
  | 'RATE_LIMITED' // Too many requests (429)
  | 'AI_SERVICE_ERROR' // Anthropic API error (502)
  | 'AI_TIMEOUT' // Anthropic API timeout (504)
  | 'INTERNAL_ERROR'; // Unexpected server error (500)
