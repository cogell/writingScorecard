import { createAnthropic } from '@ai-sdk/anthropic';
import { generateObject } from 'ai';
import {
  CRITERIA,
  calculateCost,
  calculateOverallScore,
  scorecardContentSchema,
  scorecardResponseSchema,
  type ContextSufficiency,
  type Criterion,
  type CriterionScore,
  type ModelId,
  type RhetoricRisk,
  type ScorecardResponseInput,
} from '../shared/index.ts';
import { SCORING_PROMPT } from './prompts.ts';

const MODEL: ModelId = 'claude-haiku-4-5';
const CACHE_TTL_MS = 30 * 60 * 1000;
const CACHE_MAX_ENTRIES = 128;

type TokenUsage = {
  promptTokens?: number;
  completionTokens?: number;
};

export type EvaluateTextResult = {
  coreThesis: string;
  keyTerms: string[];
  title: string;
  scores: CriterionScore[];
  overallScore: number;
  summary: string;
  contextSufficiency: ContextSufficiency;
  rhetoricRisk: RhetoricRisk;
  modelUsed: string;
  processingTimeMs: number;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
};

export type EvaluateTextOptions = {
  bypassCache?: boolean;
};

const evaluationCache = new Map<
  string,
  { result: Omit<EvaluateTextResult, 'processingTimeMs'>; cachedAt: number }
>();

function makeCacheKey(text: string, title?: string): string {
  return `${MODEL}\n${title ?? ''}\n${text}`;
}

function recoverWrappedParameters(error: unknown): ScorecardResponseInput | null {
  if (!error || typeof error !== 'object') return null;

  const maybeValue = (error as { cause?: { value?: unknown; cause?: { value?: unknown } } }).cause
    ?.value
    ?? (error as { cause?: { cause?: { value?: unknown } } }).cause?.cause?.value;

  if (!maybeValue || typeof maybeValue !== 'object') return null;

  const maybeParameters = (maybeValue as { parameters?: unknown; parameter?: unknown }).parameters
    ?? (maybeValue as { parameter?: unknown }).parameter;

  if (!maybeParameters) return null;

  const parsed = scorecardContentSchema.safeParse(maybeParameters);
  return parsed.success ? parsed.data : null;
}

async function generateSample(
  anthropic: ReturnType<typeof createAnthropic>,
  text: string,
  title?: string,
): Promise<{ object: ScorecardResponseInput; usage: TokenUsage }> {
  try {
    const response = await generateObject({
      model: anthropic(MODEL),
      temperature: 0,
      system: SCORING_PROMPT,
      prompt: `Evaluate the following text:\n\n${title ? `Title: ${title}\n\n` : ''}${text}`,
      schema: scorecardResponseSchema,
    });

    return {
      object: response.object,
      usage: response.usage,
    };
  } catch (error) {
    const recoveredObject = recoverWrappedParameters(error);
    if (!recoveredObject) {
      throw error;
    }

    return {
      object: recoveredObject,
      usage: (error as { usage?: TokenUsage }).usage ?? {},
    };
  }
}

export function mapScoresInCanonicalOrder(scores: CriterionScore[]): CriterionScore[] {
  const scoreMap = new Map<Criterion, CriterionScore>();
  const duplicates = new Set<Criterion>();

  for (const score of scores) {
    if (scoreMap.has(score.criterion)) {
      duplicates.add(score.criterion);
      continue;
    }
    scoreMap.set(score.criterion, score);
  }

  const missing = CRITERIA.filter((criterion) => !scoreMap.has(criterion));

  if (duplicates.size > 0 || missing.length > 0) {
    const duplicateList = [...duplicates].join(', ') || 'none';
    const missingList = missing.join(', ') || 'none';
    throw new Error(
      `FAST criterion integrity error: missing=[${missingList}] duplicate=[${duplicateList}]`,
    );
  }

  return CRITERIA.map((criterion) => scoreMap.get(criterion)!);
}

export async function evaluateText(
  text: string,
  env: { ANTHROPIC_API_KEY: string },
  title?: string,
  options: EvaluateTextOptions = {},
): Promise<EvaluateTextResult> {
  const startTime = Date.now();
  const cacheEnabled = !options.bypassCache;

  const cacheKey = makeCacheKey(text, title);
  const cached = cacheEnabled ? evaluationCache.get(cacheKey) : undefined;
  if (cached && Date.now() - cached.cachedAt < CACHE_TTL_MS) {
    return {
      ...structuredClone(cached.result),
      processingTimeMs: Math.max(1, Date.now() - startTime),
    };
  }

  const anthropic = createAnthropic({
    apiKey: env.ANTHROPIC_API_KEY,
  });

  const { object, usage } = await generateSample(anthropic, text, title);
  const canonicalScores = mapScoresInCanonicalOrder(object.scores);

  const inputTokens = usage.promptTokens ?? 0;
  const outputTokens = usage.completionTokens ?? 0;
  const costUsd = calculateCost(MODEL, inputTokens, outputTokens);
  const overallScore = calculateOverallScore(canonicalScores.map((score) => score.score));

  const baseResult: Omit<EvaluateTextResult, 'processingTimeMs'> = {
    coreThesis: object.coreThesis,
    keyTerms: object.keyTerms,
    title: object.title,
    scores: canonicalScores,
    overallScore,
    summary: object.summary,
    contextSufficiency: object.contextSufficiency,
    rhetoricRisk: object.rhetoricRisk,
    modelUsed: MODEL,
    inputTokens,
    outputTokens,
    costUsd,
  };

  if (cacheEnabled) {
    evaluationCache.set(cacheKey, {
      result: baseResult,
      cachedAt: Date.now(),
    });

    if (evaluationCache.size > CACHE_MAX_ENTRIES) {
      const oldestKey = evaluationCache.keys().next().value;
      if (oldestKey) {
        evaluationCache.delete(oldestKey);
      }
    }
  }

  return {
    ...baseResult,
    processingTimeMs: Math.max(1, Date.now() - startTime),
  };
}
