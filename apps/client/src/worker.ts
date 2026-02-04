// Single worker handling auth, API routes, and static assets

import { createAuth } from './auth';
import { handleEvaluate } from './routes/evaluate';

interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  BETTER_AUTH_SECRET: string;
  RESEND_API_KEY: string;
  RESEND_FROM_EMAIL: string;
  RESEND_FROM_NAME?: string;
  BETTER_AUTH_URL?: string;
  ANTHROPIC_API_KEY: string;
  ADMIN_NOTIFY_EMAILS?: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Auth routes
    if (url.pathname.startsWith('/api/auth')) {
      const auth = createAuth(env, request);
      return auth.handler(request);
    }

    // API routes (auth-gated)
    if (url.pathname.startsWith('/api/')) {
      // Validate session
      const auth = createAuth(env, request);
      const session = await auth.api.getSession({ headers: request.headers });
      if (!session) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
      }

      // POST /api/evaluate
      if (url.pathname === '/api/evaluate' && request.method === 'POST') {
        return handleEvaluate(request, env);
      }

      // GET /api/health
      if (url.pathname === '/api/health' && request.method === 'GET') {
        return Response.json({ status: 'ok' });
      }

      return Response.json({ error: 'Not found' }, { status: 404 });
    }

    // Serve static assets for all other requests
    return env.ASSETS.fetch(request);
  },
};
