import type { Criterion } from './types.js';

export const CRITERION_LABELS: Record<Criterion, string> = {
  clarity: 'Clarity',
  simplexity: 'Simplexity',
  errorCorrection: 'Error Correction',
  unityScope: 'Unity/Scope',
  pragmaticReturn: 'Pragmatic Return',
};

export const CRITERION_DESCRIPTIONS: Record<Criterion, string> = {
  clarity:
    'Precise language, clean definitions, explicit scope. Does the text say exactly what it means?',
  simplexity:
    'Captures essence while preserving necessary complexity. Finds the simplest formulation without losing nuance.',
  errorCorrection:
    'Detects contradictions, acknowledges limitations. Does the text catch its own potential errors?',
  unityScope:
    'High conceptual leverage, wide applicability without vagueness. Does the idea apply broadly while remaining specific?',
  pragmaticReturn:
    'Operational hooks, concrete implications, testable. Can you DO something with this idea?',
};

export const MIN_TEXT_LENGTH = 100;
export const MAX_TEXT_LENGTH = 50000;

export const CALIBRATION_OFFSET = 1.5;

// Claude Haiku 4.5 pricing (USD per million tokens)
// Source: https://platform.claude.com/docs/en/about-claude/pricing
export const MODEL_PRICING = {
  'claude-haiku-4-5': {
    inputPricePerMTok: 1.0, // $1.00 per million input tokens
    outputPricePerMTok: 5.0, // $5.00 per million output tokens
  },
} as const;

export type ModelId = keyof typeof MODEL_PRICING;

/**
 * Calculate cost in USD for given token usage.
 */
export function calculateCost(
  modelId: ModelId,
  inputTokens: number,
  outputTokens: number,
): number {
  const pricing = MODEL_PRICING[modelId];
  const inputCost = (inputTokens * pricing.inputPricePerMTok) / 1_000_000;
  const outputCost = (outputTokens * pricing.outputPricePerMTok) / 1_000_000;
  return inputCost + outputCost;
}

/**
 * Apply calibration to a provisional score.
 * Formula: max(0, provisionalScore - 1.5)
 */
export function calibrateScore(provisionalScore: number): number {
  return Math.max(0, provisionalScore - CALIBRATION_OFFSET);
}

/**
 * Calculate overall score as average of calibrated scores.
 */
export function calculateOverallScore(calibratedScores: number[]): number {
  if (calibratedScores.length === 0) return 0;
  const sum = calibratedScores.reduce((a, b) => a + b, 0);
  return Math.round((sum / calibratedScores.length) * 10) / 10;
}
