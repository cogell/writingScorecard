import assert from 'node:assert/strict';
import {
  calculateOverallScore,
  scorecardResponseSchema,
  type CriterionScore,
} from '../src/shared/index.ts';
import { createEvaluateHandler } from '../src/routes/evaluate.ts';
import { mapScoresInCanonicalOrder } from '../src/services/scoring.ts';

function makeScore(
  criterion: CriterionScore['criterion'],
  score: number,
  evaluation = `${criterion} evaluation`,
  suggestion = `${criterion} suggestion`,
): CriterionScore {
  return { criterion, score, evaluation, suggestion };
}

async function run() {
  // 1) Criteria completeness + canonical ordering
  const shuffledScores: CriterionScore[] = [
    makeScore('pragmaticExperience', 4),
    makeScore('clarity', 7),
    makeScore('unity', 5),
    makeScore('simplexity', 6),
    makeScore('errorCorrection', 5),
  ];

  const canonical = mapScoresInCanonicalOrder(shuffledScores);
  assert.deepEqual(
    canonical.map((s) => s.criterion),
    ['clarity', 'simplexity', 'errorCorrection', 'unity', 'pragmaticExperience'],
    'scores should be returned in canonical CRITERIA order',
  );

  // 2) Negative case: duplicate + missing criterion should fail deterministically
  const invalidScores: CriterionScore[] = [
    makeScore('clarity', 7),
    makeScore('clarity', 6),
    makeScore('simplexity', 6),
    makeScore('errorCorrection', 5),
    makeScore('pragmaticExperience', 4),
  ];

  assert.throws(
    () => mapScoresInCanonicalOrder(invalidScores),
    /missing=\[unity\].*duplicate=\[clarity\]/,
    'duplicate + missing criteria should produce deterministic integrity error',
  );

  // 3) Overall score arithmetic (no calibration)
  assert.equal(
    calculateOverallScore([7, 6, 5, 5, 4]),
    5.4,
    'overall score should be direct average rounded to 1 decimal',
  );

  // 4) Schema guard checks (bounds + enums + non-empty strings)
  const validSchemaObject = {
    coreThesis: 'The text argues for recursive self-reference in systems analysis.',
    keyTerms: ['systems', 'recursion', 'feedback', 'observer', 'boundary'],
    title: 'Systems Thinking',
    scores: canonical,
    summary:
      'Strongest in clarity. Weakest in pragmatic experience. Biggest lever is adding a contact test.',
    contextSufficiency: 'medium',
    rhetoricRisk: 'low',
  } as const;

  assert.equal(scorecardResponseSchema.safeParse(validSchemaObject).success, true);

  const tooFewTerms = {
    ...validSchemaObject,
    keyTerms: ['systems', 'feedback'],
  };
  assert.equal(scorecardResponseSchema.safeParse(tooFewTerms).success, false);

  const invalidDiagnostic = {
    ...validSchemaObject,
    rhetoricRisk: 'critical',
  };
  assert.equal(scorecardResponseSchema.safeParse(invalidDiagnostic).success, false);

  const blankEvaluation = {
    ...validSchemaObject,
    scores: [
      { ...canonical[0], evaluation: '   ' },
      canonical[1],
      canonical[2],
      canonical[3],
      canonical[4],
    ],
  };
  assert.equal(scorecardResponseSchema.safeParse(blankEvaluation).success, false);

  // 5) Route-level success check: API shape includes FAST v1.0 fields
  const successHandler = createEvaluateHandler(async (_text, _env, title) => ({
    coreThesis: 'Core thesis for testing.',
    keyTerms: ['systems', 'recursion', 'feedback'],
    title: title ?? 'Generated title',
    scores: canonical,
    overallScore: 5.4,
    summary: 'Strongest in clarity. Weakest in pragmatic experience. Biggest lever is contact.',
    contextSufficiency: 'medium',
    rhetoricRisk: 'low',
    modelUsed: 'claude-haiku-4-5',
    processingTimeMs: 1200,
    inputTokens: 1000,
    outputTokens: 200,
    costUsd: 0.002,
  }));

  const successRequest = new Request('http://localhost/api/evaluate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: 'a'.repeat(120), title: 'Example' }),
  });

  const successResponse = await successHandler(successRequest, { ANTHROPIC_API_KEY: 'test-key' });
  assert.equal(successResponse.status, 200);
  const successPayload = (await successResponse.json()) as Record<string, unknown>;
  assert.equal(typeof successPayload.coreThesis, 'string');
  assert.equal(Array.isArray(successPayload.keyTerms), true);
  assert.equal(typeof successPayload.contextSufficiency, 'string');
  assert.equal(typeof successPayload.rhetoricRisk, 'string');
  const scoreRows = (successPayload.scores as Array<Record<string, unknown>>) ?? [];
  assert.equal(Array.isArray(scoreRows), true);
  assert.equal(scoreRows.length, 5, 'score response should include exactly 5 criteria');
  assert.equal(
    scoreRows.every((row) => !('provisionalScore' in row) && !('calibratedScore' in row) && !('note' in row)),
    true,
    'score rows should not include legacy provisional/calibrated/note fields',
  );

  // 6) Route validation checks
  const shortTextResponse = await successHandler(
    new Request('http://localhost/api/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'too short' }),
    }),
    { ANTHROPIC_API_KEY: 'test-key' },
  );
  assert.equal(shortTextResponse.status, 400);
  assert.equal((await shortTextResponse.json()).code, 'TEXT_TOO_SHORT');

  const longTextResponse = await successHandler(
    new Request('http://localhost/api/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'a'.repeat(50001) }),
    }),
    { ANTHROPIC_API_KEY: 'test-key' },
  );
  assert.equal(longTextResponse.status, 400);
  assert.equal((await longTextResponse.json()).code, 'TEXT_TOO_LONG');

  const invalidJsonResponse = await successHandler(
    new Request('http://localhost/api/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{not-json',
    }),
    { ANTHROPIC_API_KEY: 'test-key' },
  );
  assert.equal(invalidJsonResponse.status, 400);
  assert.equal((await invalidJsonResponse.json()).code, 'VALIDATION_ERROR');

  // 7) Route-level negative check: integrity failure maps to stable API error
  const integrityFailureHandler = createEvaluateHandler(async () => {
    throw new Error('FAST criterion integrity error: missing=[unity] duplicate=[clarity]');
  });

  const originalConsoleError = console.error;
  let integrityResponse: Response;
  try {
    console.error = () => undefined;
    integrityResponse = await integrityFailureHandler(
      new Request('http://localhost/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: 'a'.repeat(120), title: 'Example' }),
      }),
      { ANTHROPIC_API_KEY: 'test-key' },
    );
  } finally {
    console.error = originalConsoleError;
  }
  assert.equal(integrityResponse.status, 500, 'integrity failures should map to HTTP 500');

  const integrityPayload = (await integrityResponse.json()) as {
    code?: string;
    error?: string;
    requestId?: string;
  };
  assert.equal(integrityPayload.code, 'INTERNAL_ERROR');
  assert.equal(integrityPayload.error, 'Model output failed integrity validation');
  assert.ok(integrityPayload.requestId, 'requestId should be present for error correlation');

  console.log('FAST v1.0 verification checks passed.');
}

run().catch((error) => {
  console.error('FAST v1.0 verification checks failed.');
  console.error(error);
  process.exit(1);
});
