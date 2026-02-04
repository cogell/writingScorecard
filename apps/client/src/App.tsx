import { TextInput } from './components/TextInput';
import { Scorecard } from './components/Scorecard';
import { useEvaluation } from './hooks/useEvaluation';

export default function App() {
  const { evaluate, scorecard, isLoading, error, reset } = useEvaluation();

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-6 max-w-3xl">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-1">
            FAST Writing Scorecard
          </h1>
          <p className="text-muted-foreground">
            Framework for Assessing Systematic Thinking
          </p>
        </header>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200">
            <p className="text-red-800 font-medium">{error.error}</p>
            {error.code && (
              <p className="text-red-600 text-xs mt-1">Error code: {error.code}</p>
            )}
          </div>
        )}

        {scorecard ? (
          <Scorecard scorecard={scorecard} onReset={reset} />
        ) : (
          <div className="bg-card border border-border p-3">
            <TextInput onSubmit={evaluate} isLoading={isLoading} />
          </div>
        )}

      </main>
    </div>
  );
}
