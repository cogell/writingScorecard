import { TextInput } from './components/TextInput';
import { Scorecard } from './components/Scorecard';
import { useEvaluation } from './hooks/useEvaluation';
import { EmailLogin } from './components/EmailLogin';
import { authClient } from './lib/authClient';

export default function App() {
  const { evaluate, scorecard, isLoading, error, reset } = useEvaluation();
  const { data, isPending } = authClient.useSession();
  const session = data?.session;
  const user = data?.user;

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
    } catch (err) {
      console.error('Sign out failed:', err);
    }
  };

  if (isPending) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-10 max-w-lg">
          <div className="bg-card border border-border p-6 rounded-lg">
            <p className="text-sm text-muted-foreground">Checking session…</p>
          </div>
        </main>
      </div>
    );
  }

  if (!session) {
    return <EmailLogin />;
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-6 max-w-3xl">
        <header className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">
              FAST Writing Scorecard
            </h1>
            <p className="text-muted-foreground">
              Framework for Assessing Systematic Thinking
            </p>
          </div>
          <div className="text-right">
            {user?.email && (
              <p className="text-xs text-muted-foreground">{user.email}</p>
            )}
            <button
              type="button"
              onClick={handleSignOut}
              className="text-xs font-medium text-primary hover:text-emerald-700"
            >
              Sign out
            </button>
          </div>
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
