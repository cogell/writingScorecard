export const CRITERIA = [
  'clarity',
  'simplexity',
  'errorCorrection',
  'unityScope',
  'pragmaticReturn',
] as const;

export type Criterion = (typeof CRITERIA)[number];

export interface CriterionScore {
  criterion: Criterion;
  provisionalScore: number; // 0-10, from LLM
  calibratedScore: number; // max(0, provisional - 1.5)
  note: string;
}

export interface Scorecard {
  id: string;
  createdAt: Date;
  title: string;
  inputText: string; // Original submitted text
  wordCount: number;
  overallScore: number; // Average of calibrated scores
  scores: CriterionScore[];
  summary: string;
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
