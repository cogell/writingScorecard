import type { Scorecard as ScorecardType, CriterionScore } from '@fast/shared';
import { CRITERION_LABELS, CRITERION_DESCRIPTIONS } from '@fast/shared';

interface ScorecardProps {
  scorecard: ScorecardType;
  onReset: () => void;
}

function ScoreRow({ score }: { score: CriterionScore }) {
  const label = CRITERION_LABELS[score.criterion];
  const description = CRITERION_DESCRIPTIONS[score.criterion];

  // Color based on calibrated score - using emerald for good scores
  const getScoreColor = (score: number) => {
    if (score >= 7) return 'text-emerald-600';
    if (score >= 5) return 'text-emerald-500';
    if (score >= 3) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <div className="py-3 border-b border-border last:border-b-0">
      <div className="flex justify-between items-start mb-1">
        <div>
          <h3 className="text-sm font-medium text-foreground">{label}</h3>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <div className="text-right">
          <span className={`text-xl font-bold ${getScoreColor(score.calibratedScore)}`}>
            {score.calibratedScore.toFixed(1)}
          </span>
          <span className="text-xs text-muted-foreground block">
            ({score.provisionalScore.toFixed(1)} raw)
          </span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-1.5">{score.note}</p>
    </div>
  );
}

export function Scorecard({ scorecard, onReset }: ScorecardProps) {
  const getOverallColor = (score: number) => {
    if (score >= 7) return 'bg-emerald-100 text-emerald-800';
    if (score >= 5) return 'bg-emerald-50 text-emerald-700';
    if (score >= 3) return 'bg-amber-100 text-amber-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="bg-card border border-border overflow-hidden">
      {/* Header */}
      <div className="px-3 py-3 bg-secondary border-b border-border">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-lg font-semibold text-foreground">{scorecard.title}</h2>
            <p className="text-xs text-muted-foreground">
              {scorecard.wordCount.toLocaleString()} words
              {' '}
              <span className="opacity-70">
                evaluated in {(scorecard.processingTimeMs / 1000).toFixed(1)}s
              </span>
            </p>
          </div>
          <div className={`px-3 py-1.5 ${getOverallColor(scorecard.overallScore)}`}>
            <span className="text-2xl font-bold">{scorecard.overallScore.toFixed(1)}</span>
            <span className="text-xs ml-1">/ 10</span>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="px-3 py-3 bg-accent border-b border-border">
        <p className="text-xs text-accent-foreground">{scorecard.summary}</p>
      </div>

      {/* Scores */}
      <div className="px-3 py-2">
        {scorecard.scores.map((score) => (
          <ScoreRow key={score.criterion} score={score} />
        ))}
      </div>

      {/* Actions */}
      <div className="px-3 py-3 bg-secondary border-t border-border">
        <button
          onClick={onReset}
          className="text-xs text-primary hover:text-emerald-600 font-medium"
        >
          Evaluate another text
        </button>
      </div>

      {/* Metadata Footer */}
      <div className="px-3 py-2 border-t border-border">
        <p className="text-[10px] text-muted-foreground text-center">
          {scorecard.modelUsed} · {(scorecard.processingTimeMs / 1000).toFixed(1)}s · $
          {scorecard.costUsd.toFixed(4)} · {scorecard.inputTokens.toLocaleString()} in /{' '}
          {scorecard.outputTokens.toLocaleString()} out
        </p>
      </div>
    </div>
  );
}
