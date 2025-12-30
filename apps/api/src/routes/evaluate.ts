import { nanoid } from 'nanoid';
import { evaluationRequestSchema, type Scorecard } from '@fast/shared';
import { evaluateText } from '../services/scoring';
import type { Env } from '../types/env';

export async function handleEvaluate(
  request: Request,
  env: Env
): Promise<Response> {
  // Parse and validate request body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: 'Invalid JSON body', code: 'VALIDATION_ERROR' },
      { status: 400 }
    );
  }

  const parsed = evaluationRequestSchema.safeParse(body);
  if (!parsed.success) {
    const firstError = parsed.error.errors[0];
    const code = firstError?.path?.includes('text')
      ? firstError.message.includes('at least')
        ? 'TEXT_TOO_SHORT'
        : firstError.message.includes('exceed')
          ? 'TEXT_TOO_LONG'
          : 'VALIDATION_ERROR'
      : 'VALIDATION_ERROR';

    return Response.json(
      {
        error: firstError?.message || 'Invalid request',
        code,
        details: parsed.error.errors,
      },
      { status: 400 }
    );
  }

  const { text, title } = parsed.data;
  const wordCount = text.trim().split(/\s+/).length;

  try {
    // Evaluate the text
    const result = await evaluateText(text, env, title);

    // Build the scorecard response
    const scorecard: Scorecard = {
      id: nanoid(10),
      createdAt: new Date(),
      title: result.title,
      inputText: text,
      wordCount,
      overallScore: result.overallScore,
      scores: result.scores,
      summary: result.summary,
      modelUsed: result.modelUsed,
      processingTimeMs: result.processingTimeMs,
    };

    // TODO: Save to D1 in persistence phase

    return Response.json(scorecard);
  } catch (error) {
    console.error('Evaluation failed:', error);

    // Check for Anthropic API errors
    if (error instanceof Error) {
      if (error.message.includes('rate limit')) {
        return Response.json(
          { error: 'Rate limited by AI service', code: 'RATE_LIMITED' },
          { status: 429 }
        );
      }
      if (error.message.includes('timeout')) {
        return Response.json(
          { error: 'AI service timeout', code: 'AI_TIMEOUT' },
          { status: 504 }
        );
      }
    }

    return Response.json(
      { error: 'Failed to evaluate text', code: 'AI_SERVICE_ERROR' },
      { status: 502 }
    );
  }
}
