import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { evaluateText } from '../src/services/scoring.ts';

type Fixture = {
  id: string;
  label: string;
  text: string;
};

type RunResult = {
  run: number;
  overallScore: number;
  criterionScores: Record<string, number>;
  processingTimeMs: number;
  costUsd: number;
};

type FixtureReport = {
  id: string;
  label: string;
  runs: RunResult[];
  overallMin: number;
  overallMax: number;
  overallDelta: number;
  perCriterionDelta: Record<string, number>;
};

function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length));
  return sorted[index];
}

function round(value: number, digits = 3): number {
  const power = 10 ** digits;
  return Math.round(value * power) / power;
}

async function evaluateWithRetries(
  text: string,
  key: string,
  title: string,
  bypassCache: boolean,
  maxAttempts = 3,
) {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await evaluateText(text, { ANTHROPIC_API_KEY: key }, title, { bypassCache });
    } catch (error) {
      lastError = error;
      const message = error instanceof Error ? error.message : String(error);
      const isSchemaMismatch = message.includes('response did not match schema');

      if (!isSchemaMismatch || attempt === maxAttempts) {
        throw error;
      }

      console.warn(`Retrying ${title} after schema mismatch (attempt ${attempt}/${maxAttempts})`);
    }
  }

  throw lastError;
}

async function run() {
  const key = process.env.ANTHROPIC_API_KEY;
  assert.ok(key, 'ANTHROPIC_API_KEY is required');

  const fixturePath = join(process.cwd(), 'scripts/fixtures/fast-benchmark.json');
  const fixtureSource = await readFile(fixturePath, 'utf8');
  const fixtures = JSON.parse(fixtureSource) as Fixture[];
  assert.ok(fixtures.length >= 4, 'expected at least 4 benchmark fixtures');

  const runsPerFixture = Number(process.env.FAST_BENCHMARK_RUNS ?? '3');
  assert.ok(runsPerFixture >= 3, 'FAST_BENCHMARK_RUNS must be >= 3');

  const bypassCache = process.env.FAST_BENCHMARK_BYPASS_CACHE !== '0';

  const reports: FixtureReport[] = [];

  for (const fixture of fixtures) {
    const runs: RunResult[] = [];

    for (let run = 1; run <= runsPerFixture; run += 1) {
      const result = await evaluateWithRetries(fixture.text, key, fixture.label, bypassCache);
      const criterionScores = Object.fromEntries(
        result.scores.map((score) => [score.criterion, score.score]),
      );

      runs.push({
        run,
        overallScore: result.overallScore,
        criterionScores,
        processingTimeMs: result.processingTimeMs,
        costUsd: result.costUsd,
      });
    }

    const overallScores = runs.map((run) => run.overallScore);
    const perCriterionDelta = Object.fromEntries(
      Object.keys(runs[0].criterionScores).map((criterion) => {
        const values = runs.map((run) => run.criterionScores[criterion]);
        const delta = Math.max(...values) - Math.min(...values);
        return [criterion, round(delta, 2)];
      }),
    );

    reports.push({
      id: fixture.id,
      label: fixture.label,
      runs,
      overallMin: Math.min(...overallScores),
      overallMax: Math.max(...overallScores),
      overallDelta: round(Math.max(...overallScores) - Math.min(...overallScores), 2),
      perCriterionDelta,
    });
  }

  const allLatencies = reports.flatMap((report) => report.runs.map((run) => run.processingTimeMs));
  const allCosts = reports.flatMap((report) => report.runs.map((run) => run.costUsd));

  const summary = {
    generatedAt: new Date().toISOString(),
    runsPerFixture,
    bypassCache,
    fixtures: reports,
    latencyMs: {
      min: Math.min(...allLatencies),
      p50: percentile(allLatencies, 50),
      p95: percentile(allLatencies, 95),
      max: Math.max(...allLatencies),
    },
    costUsd: {
      min: round(Math.min(...allCosts), 6),
      median: round(percentile(allCosts, 50), 6),
      max: round(Math.max(...allCosts), 6),
    },
  };

  const outputPath = join(process.cwd(), 'tmp/fast-v1-benchmark-results.json');
  await mkdir(join(process.cwd(), 'tmp'), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');

  console.log(`Wrote benchmark report: ${outputPath}`);
  console.log(`Benchmark mode: ${bypassCache ? 'uncached model sampling' : 'cache-enabled responses'}`);
  console.log(
    `Latency ms: min=${summary.latencyMs.min}, p50=${summary.latencyMs.p50}, p95=${summary.latencyMs.p95}, max=${summary.latencyMs.max}`,
  );
  console.log(
    `Cost USD: min=${summary.costUsd.min}, median=${summary.costUsd.median}, max=${summary.costUsd.max}`,
  );

  for (const report of reports) {
    console.log(`\n[${report.id}] ${report.label}`);
    console.log(`Overall delta: ${report.overallDelta}`);
    for (const [criterion, delta] of Object.entries(report.perCriterionDelta)) {
      console.log(`  ${criterion}: Δ ${delta}`);
    }
  }

  const unstableFindings = reports.flatMap((report) => {
    const criteriaOverThreshold = Object.entries(report.perCriterionDelta)
      .filter(([, delta]) => delta > 0.5)
      .map(([criterion, delta]) => `${report.id}:${criterion}=Δ${delta}`);

    if (report.overallDelta > 0.5) {
      criteriaOverThreshold.push(`${report.id}:overall=Δ${report.overallDelta}`);
    }

    return criteriaOverThreshold;
  });

  if (unstableFindings.length > 0) {
    console.error('\nVariance threshold exceeded (> ±0.5):');
    for (const finding of unstableFindings) {
      console.error(`- ${finding}`);
    }
    process.exit(2);
  }
}

run().catch((error) => {
  console.error('FAST benchmark failed.');
  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error(String(error));
  }
  process.exit(1);
});
