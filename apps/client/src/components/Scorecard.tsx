import type {
  CriterionScore,
  RhetoricRisk,
  Scorecard as ScorecardType,
} from '../shared';
import { CRITERION_DESCRIPTIONS, CRITERION_LABELS } from '../shared';

interface ScorecardProps {
  scorecard: ScorecardType;
  onReset: () => void;
}

function getScoreColor(score: number) {
  if (score >= 7) return 'text-emerald-600';
  if (score >= 5) return 'text-emerald-500';
  if (score >= 3) return 'text-amber-600';
  return 'text-red-600';
}

function getOverallColor(score: number) {
  if (score >= 7) return 'bg-emerald-100 text-emerald-800';
  if (score >= 5) return 'bg-emerald-50 text-emerald-700';
  if (score >= 3) return 'bg-amber-100 text-amber-800';
  return 'bg-red-100 text-red-800';
}

function rhetoricRiskClass(risk: RhetoricRisk) {
  if (risk === 'high') return 'text-red-700';
  if (risk === 'medium') return 'text-amber-700';
  return 'text-muted-foreground';
}

function ScoreRow({ score }: { score: CriterionScore }) {
  const label = CRITERION_LABELS[score.criterion];
  const description = CRITERION_DESCRIPTIONS[score.criterion];

  return (
    <article className="border-b border-border py-3 last:border-b-0">
      <div className="mb-1 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-foreground">{label}</h3>
          <p className="text-xs text-muted-foreground break-words">{description}</p>
        </div>
        <p className={`shrink-0 text-2xl font-bold tabular-nums ${getScoreColor(score.score)}`}>
          {score.score.toFixed(1)}
        </p>
      </div>

      <p className="text-sm text-foreground break-words">{score.evaluation}</p>
      <p className="mt-1 text-sm text-muted-foreground break-words">
        <span aria-hidden="true">→ </span>
        <span className="sr-only">Suggestion: </span>
        {score.suggestion}
      </p>
    </article>
  );
}

export function Scorecard({ scorecard, onReset }: ScorecardProps) {
  return (
    <section className="overflow-hidden border border-border bg-card">
      {/* Header */}
      <header className="border-b border-border bg-secondary px-3 py-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold text-foreground break-words">{scorecard.title}</h2>
            <p className="text-xs text-muted-foreground">
              {scorecard.wordCount.toLocaleString()} words · evaluated in{' '}
              {(scorecard.processingTimeMs / 1000).toFixed(1)}s
            </p>
          </div>
          <div className={`w-fit px-3 py-1.5 ${getOverallColor(scorecard.overallScore)}`}>
            <span className="text-2xl font-bold tabular-nums">
              {scorecard.overallScore.toFixed(1)}
            </span>
            <span className="ml-1 text-xs">/ 10</span>
          </div>
        </div>
      </header>

      {/* Analysis */}
      <section className="border-b border-border px-3 py-3">
        <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Core thesis
        </h3>
        <p className="text-sm text-foreground break-words">{scorecard.coreThesis}</p>

        <ul className="mt-2 flex flex-wrap gap-1" aria-label="Key terms">
          {scorecard.keyTerms.map((term, index) => (
            <li
              key={`${term}-${index}`}
              className="max-w-full border border-border bg-secondary px-2 py-0.5 text-xs text-muted-foreground break-words"
            >
              {term}
            </li>
          ))}
        </ul>
      </section>

      {/* Summary */}
      <section className="border-b border-border bg-accent px-3 py-3">
        <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-accent-foreground">
          Summary
        </h3>
        <p className="text-sm text-accent-foreground break-words">{scorecard.summary}</p>
      </section>

      {/* Scores */}
      <section className="px-3 py-2" aria-label="Criterion scores">
        {scorecard.scores.map((score) => (
          <ScoreRow key={score.criterion} score={score} />
        ))}
      </section>

      <section className="border-t border-border bg-secondary px-3 py-2">
        <p className="text-xs text-muted-foreground">
          Scores are rubric-locked. Submit revised text to re-score.
        </p>
      </section>

      {/* Actions */}
      <div className="border-t border-border bg-secondary px-3 py-3">
        <button
          type="button"
          onClick={onReset}
          className="text-xs font-medium text-primary hover:text-emerald-700"
        >
          Evaluate another text
        </button>
      </div>

      {/* Metadata Footer */}
      <footer className="border-t border-border px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
        <p className="break-words">
          {scorecard.modelUsed} · {(scorecard.processingTimeMs / 1000).toFixed(1)}s · $
          {scorecard.costUsd.toFixed(4)} · {scorecard.inputTokens.toLocaleString()} in /{' '}
          {scorecard.outputTokens.toLocaleString()} out
        </p>
        <p>
          Context: {scorecard.contextSufficiency} · Rhetoric risk:{' '}
          <span className={rhetoricRiskClass(scorecard.rhetoricRisk)}>
            {scorecard.rhetoricRisk}
          </span>
        </p>
      </footer>
    </section>
  );
}
