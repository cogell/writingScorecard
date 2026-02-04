import { generateObject } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
import {
  scorecardResponseSchema,
  calibrateScore,
  calculateOverallScore,
  calculateCost,
  CRITERIA,
  type CriterionScore,
  type ModelId,
} from "../shared";
import { SCORING_PROMPT } from "./prompts";

const MODEL: ModelId = "claude-haiku-4-5";

export async function evaluateText(
  text: string,
  env: { ANTHROPIC_API_KEY: string },
  title?: string,
): Promise<{
  title: string;
  scores: CriterionScore[];
  overallScore: number;
  summary: string;
  modelUsed: string;
  processingTimeMs: number;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
}> {
  const startTime = Date.now();

  const anthropic = createAnthropic({
    apiKey: env.ANTHROPIC_API_KEY,
  });

  const { object, usage } = await generateObject({
    model: anthropic(MODEL),
    system: SCORING_PROMPT,
    prompt: `Evaluate the following text:\n\n${title ? `Title: ${title}\n\n` : ""}${text}`,
    schema: scorecardResponseSchema,
  });

  const inputTokens = usage.promptTokens ?? 0;
  const outputTokens = usage.completionTokens ?? 0;
  const costUsd = calculateCost(MODEL, inputTokens, outputTokens);

  // Apply calibration to each score and ensure all criteria are present
  const calibratedScores: CriterionScore[] = CRITERIA.map((criterion) => {
    const rawScore = object.scores.find((s) => s.criterion === criterion);
    if (!rawScore) {
      throw new Error(`Missing score for criterion: ${criterion}`);
    }
    return {
      criterion,
      provisionalScore: rawScore.provisionalScore,
      calibratedScore: calibrateScore(rawScore.provisionalScore),
      note: rawScore.note,
    };
  });

  const overallScore = calculateOverallScore(
    calibratedScores.map((s) => s.calibratedScore),
  );

  return {
    title: object.title,
    scores: calibratedScores,
    overallScore,
    summary: object.summary,
    modelUsed: MODEL,
    processingTimeMs: Date.now() - startTime,
    inputTokens,
    outputTokens,
    costUsd,
  };
}
