import { nanoid } from 'nanoid';
import { evaluationRequestSchema, type ApiErrorCode, type Scorecard } from '../shared/index.ts';
import { evaluateText } from '../services/scoring.ts';

type EvaluateTextFn = typeof evaluateText;

function inferValidationCode(message: string | undefined): ApiErrorCode {
  if (!message) return 'VALIDATION_ERROR';
  if (message.includes('at least')) return 'TEXT_TOO_SHORT';
  if (message.includes('exceed')) return 'TEXT_TOO_LONG';
  return 'VALIDATION_ERROR';
}

export function createEvaluateHandler(evaluator: EvaluateTextFn = evaluateText) {
  return async function handleEvaluate(
    request: Request,
    env: { ANTHROPIC_API_KEY: string },
  ): Promise<Response> {
    const requestId = nanoid(10);

    // Parse and validate request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return Response.json(
        {
          error: 'Invalid JSON body',
          code: 'VALIDATION_ERROR',
          requestId,
        },
        { status: 400 },
      );
    }

    const parsed = evaluationRequestSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.errors[0];
      const code = firstError?.path?.includes('text')
        ? inferValidationCode(firstError.message)
        : 'VALIDATION_ERROR';

      return Response.json(
        {
          error: firstError?.message || 'Invalid request',
          code,
          details: parsed.error.errors,
          requestId,
        },
        { status: 400 },
      );
    }

    const { text, title } = parsed.data;
    const wordCount = text.trim().split(/\s+/).length;

    try {
      // Evaluate the text
      const result = await evaluator(text, env, title);

      // Build the scorecard response
      const scorecard: Scorecard = {
        id: nanoid(10),
        createdAt: new Date(),
        coreThesis: result.coreThesis,
        keyTerms: result.keyTerms,
        title: result.title,
        inputText: text,
        wordCount,
        overallScore: result.overallScore,
        scores: result.scores,
        summary: result.summary,
        contextSufficiency: result.contextSufficiency,
        rhetoricRisk: result.rhetoricRisk,
        modelUsed: result.modelUsed,
        processingTimeMs: result.processingTimeMs,
        inputTokens: result.inputTokens,
        outputTokens: result.outputTokens,
        costUsd: result.costUsd,
      };

      return Response.json(scorecard);
    } catch (error) {
      console.error('Evaluation failed:', { requestId, error });

      if (error instanceof Error) {
        if (error.message.includes('rate limit')) {
          return Response.json(
            {
              error: 'Rate limited by AI service',
              code: 'RATE_LIMITED',
              requestId,
            },
            { status: 429 },
          );
        }

        if (error.message.includes('timeout')) {
          return Response.json(
            {
              error: 'AI service timeout',
              code: 'AI_TIMEOUT',
              requestId,
            },
            { status: 504 },
          );
        }

        if (error.message.includes('FAST criterion integrity error')) {
          return Response.json(
            {
              error: 'Model output failed integrity validation',
              code: 'INTERNAL_ERROR',
              requestId,
            },
            { status: 500 },
          );
        }
      }

      return Response.json(
        {
          error: 'Failed to evaluate text',
          code: 'AI_SERVICE_ERROR',
          requestId,
        },
        { status: 502 },
      );
    }
  };
}

export const handleEvaluate = createEvaluateHandler();
