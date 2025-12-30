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
