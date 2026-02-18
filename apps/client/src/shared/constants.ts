import type { Criterion } from './types.ts';

export const CRITERION_LABELS: Record<Criterion, string> = {
  clarity: 'Clarity',
  simplexity: 'Simplexity',
  errorCorrection: 'Error Correction',
  unity: 'Unity',
  pragmaticExperience: 'Pragmatic / Experience',
};

export const CRITERION_DESCRIPTIONS: Record<Criterion, string> = {
  clarity: 'Precision in language, clean definitions, sharp reasoning',
  simplexity:
    'Captures essence without reduction; releases complexity without deleting it',
  errorCorrection:
    'Corrects errors within/across disciplines; checks contradictions; self-repair',
  unity: 'Expands capacity to say more with less; integrates without flattening',
  pragmaticExperience:
    'Returns to lived experience; "contact" is part of proof',
};

export const MIN_TEXT_LENGTH = 100;
export const MAX_TEXT_LENGTH = 50000;

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
 * Calculate overall score as average of direct criterion scores.
 */
export function calculateOverallScore(scores: number[]): number {
  if (scores.length === 0) return 0;
  const sum = scores.reduce((a, b) => a + b, 0);
  return Math.round((sum / scores.length) * 10) / 10;
}
