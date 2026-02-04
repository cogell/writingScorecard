import { useState } from 'react';
import type { Scorecard, ApiError } from '@fast/shared';

export function useEvaluation() {
  const [scorecard, setScorecard] = useState<Scorecard | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const evaluate = async (text: string, title?: string) => {
    setIsLoading(true);
    setError(null);
    setScorecard(null);

    try {
      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ text, title }),
      });

      if (!response.ok) {
        const err: ApiError = await response.json();
        setError(err);
        return;
      }

      const result: Scorecard = await response.json();
      setScorecard(result);
    } catch (e) {
      console.error('Evaluation failed:', e);
      setError({
        error: 'Network error - could not connect to server',
        code: 'INTERNAL_ERROR'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setScorecard(null);
    setError(null);
  };

  return { evaluate, scorecard, isLoading, error, reset };
}
