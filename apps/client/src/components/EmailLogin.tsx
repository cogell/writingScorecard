import { useState } from 'react';
import { authClient } from '../lib/authClient';

export function EmailLogin() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState<string | null>(null);

  const isValidEmail = /\S+@\S+\.\S+/.test(email);
  const isSending = status === 'sending';

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isValidEmail || isSending) {
      return;
    }

    setError(null);
    setStatus('sending');

    try {
      await authClient.signIn.magicLink({
        email,
        callbackURL: '/',
      });
      setStatus('sent');
    } catch (err) {
      console.error('Magic link sign-in failed:', err);
      setError("We couldn't send your sign-in link. Please try again.");
      setStatus('idle');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-10 max-w-lg">
        <div className="bg-card border border-border p-6 rounded-lg space-y-4">
          <header className="space-y-1">
            <h1 className="text-2xl font-bold text-foreground">
              FAST Writing Scorecard
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your email to receive a secure sign-in link.
            </p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-medium text-foreground">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@company.com"
                className="flex h-8 w-full px-2 py-1.5 text-sm bg-background text-foreground border border-input placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSending}
                required
              />
            </div>

            <button
              type="submit"
              disabled={!isValidEmail || isSending}
              className="w-full py-1 px-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-emerald-600 active:bg-emerald-700 focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSending ? 'Sending link...' : 'Send sign-in link'}
            </button>
          </form>

          {status === 'sent' && (
            <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
              Check your inbox for a sign-in link. It expires in about 5 minutes.
            </div>
          )}

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-900">
              {error}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
