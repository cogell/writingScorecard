import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { createEvaluateHandler } from '../src/routes/evaluate.ts';

type Fixture = { id: string; label: string; text: string };

type CaseResult = {
  id: string;
  label: string;
  status: number;
  overallScore?: number;
  contextSufficiency?: string;
  rhetoricRisk?: string;
  checks: Array<{ name: string; pass: boolean; details?: string }>;
};

type ScorecardPayload = {
  overallScore: number;
  contextSufficiency: 'low' | 'medium' | 'high';
  rhetoricRisk: 'low' | 'medium' | 'high';
  scores: Array<{
    criterion: string;
    score: number;
    evaluation: string;
    suggestion: string;
    provisionalScore?: number;
    calibratedScore?: number;
    note?: string;
  }>;
  summary: string;
  coreThesis: string;
  keyTerms: string[];
};

function requiredFieldChecks(payload: Record<string, unknown>) {
  const requiredTopFields = [
    'id',
    'createdAt',
    'coreThesis',
    'keyTerms',
    'title',
    'inputText',
    'wordCount',
    'overallScore',
    'scores',
    'summary',
    'contextSufficiency',
    'rhetoricRisk',
    'modelUsed',
    'processingTimeMs',
    'inputTokens',
    'outputTokens',
    'costUsd',
  ];

  return requiredTopFields.map((field) => ({
    name: `API includes ${field}`,
    pass: field in payload,
  }));
}

async function run() {
  const key = process.env.ANTHROPIC_API_KEY;
  assert.ok(key, 'ANTHROPIC_API_KEY is required');

  const fixturePath = join(process.cwd(), 'scripts/fixtures/fast-benchmark.json');
  const fixtures = JSON.parse(await readFile(fixturePath, 'utf8')) as Fixture[];

  const evaluate = createEvaluateHandler();
  const caseResults: CaseResult[] = [];

  for (const fixture of fixtures) {
    const request = new Request('http://localhost/api/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: fixture.text, title: fixture.label }),
    });

    const response = await evaluate(request, { ANTHROPIC_API_KEY: key });
    const status = response.status;
    const payload = (await response.json()) as Record<string, unknown>;

    const checks: CaseResult['checks'] = [{ name: 'HTTP 200 response', pass: status === 200 }];

    if (status === 200) {
      checks.push(...requiredFieldChecks(payload));

      const scorecard = payload as unknown as ScorecardPayload;
      const legacyFieldsPresent = scorecard.scores.some(
        (score) =>
          score.provisionalScore !== undefined ||
          score.calibratedScore !== undefined ||
          score.note !== undefined,
      );

      checks.push({
        name: 'No legacy score fields (provisional/calibrated/note)',
        pass: !legacyFieldsPresent,
      });

      checks.push({
        name: 'Criterion payload has evaluation + suggestion',
        pass: scorecard.scores.every(
          (score) => typeof score.evaluation === 'string' && typeof score.suggestion === 'string',
        ),
      });

      caseResults.push({
        id: fixture.id,
        label: fixture.label,
        status,
        overallScore: scorecard.overallScore,
        contextSufficiency: scorecard.contextSufficiency,
        rhetoricRisk: scorecard.rhetoricRisk,
        checks,
      });
    } else {
      caseResults.push({ id: fixture.id, label: fixture.label, status, checks });
    }
  }

  const byId = Object.fromEntries(caseResults.map((c) => [c.id, c]));

  const crossChecks = [
    {
      name: 'Strong text scores higher than weak text overall',
      pass:
        (byId.strong?.overallScore ?? Number.NEGATIVE_INFINITY) >
        (byId.weak?.overallScore ?? Number.POSITIVE_INFINITY),
      details: `${byId.strong?.overallScore} > ${byId.weak?.overallScore}`,
    },
    {
      name: 'Short-context case reports low/medium context sufficiency',
      pass: ['low', 'medium'].includes(byId.short_context?.contextSufficiency ?? ''),
      details: `contextSufficiency=${byId.short_context?.contextSufficiency}`,
    },
    {
      name: 'Injection-like case is treated as content (not blanket high scores)',
      pass: (byId.injection_like?.overallScore ?? 10) < 9.5,
      details: `overallScore=${byId.injection_like?.overallScore}`,
    },
  ];

  const scorecardSource = await readFile(join(process.cwd(), 'src/components/Scorecard.tsx'), 'utf8');
  const appSource = await readFile(join(process.cwd(), 'src/App.tsx'), 'utf8');
  const hookSource = await readFile(join(process.cwd(), 'src/hooks/useEvaluation.ts'), 'utf8');

  const copyChecks = [
    {
      name: 'Rubric-lock messaging present in scorecard UI',
      pass: scorecardSource.includes('Scores are rubric-locked. Submit revised text to re-score.'),
    },
    {
      name: 'Error code display present in app error box',
      pass: appSource.includes('Error code:'),
    },
    {
      name: 'Network error copy present for fetch failures',
      pass: hookSource.includes('Network error - could not connect to server'),
    },
  ];

  const failedChecks = [
    ...caseResults.flatMap((c) => c.checks.filter((x) => !x.pass).map((x) => `${c.id}: ${x.name}`)),
    ...crossChecks.filter((x) => !x.pass).map((x) => `cross: ${x.name} (${x.details})`),
    ...copyChecks.filter((x) => !x.pass).map((x) => `copy: ${x.name}`),
  ];

  const report = {
    generatedAt: new Date().toISOString(),
    caseResults,
    crossChecks,
    copyChecks,
    failedChecks,
    pass: failedChecks.length === 0,
  };

  await mkdir(join(process.cwd(), 'tmp'), { recursive: true });
  await writeFile(join(process.cwd(), 'tmp/fast-v1-qa-report.json'), `${JSON.stringify(report, null, 2)}\n`);

  console.log('Wrote QA report: tmp/fast-v1-qa-report.json');
  if (failedChecks.length > 0) {
    console.error('QA failed checks:');
    for (const failed of failedChecks) {
      console.error(`- ${failed}`);
    }
    process.exit(2);
  }

  console.log('FAST v1.0 QA checks passed.');
}

run().catch((error) => {
  console.error('FAST v1.0 QA run failed.');
  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error(String(error));
  }
  process.exit(1);
});
