// Worker script to proxy /api/* requests to the API worker
// Static assets are served automatically by the [assets] configuration

import { createAuth } from './auth';

interface Env {
  API: Fetcher;
  ASSETS: Fetcher;
  DB: D1Database;
  BETTER_AUTH_SECRET: string;
  RESEND_API_KEY: string;
  RESEND_FROM_EMAIL: string;
  RESEND_FROM_NAME?: string;
  BETTER_AUTH_URL?: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname.startsWith('/api/auth')) {
      const auth = createAuth(env, request);
      return auth.handler(request);
    }

    // Proxy /api/* requests to the API worker (auth-gated)
    if (url.pathname.startsWith('/api/')) {
      // Validate session before proxying
      const auth = createAuth(env, request);
      const session = await auth.api.getSession({ headers: request.headers });
      if (!session) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
      }

      // Strip /api prefix - the API worker expects /evaluate, not /api/evaluate
      const apiPath = url.pathname.replace(/^\/api/, '');
      const apiUrl = new URL(apiPath, url.origin);
      apiUrl.search = url.search;

      // Forward request with user context headers
      const headers = new Headers(request.headers);
      headers.set('X-Auth-User-Id', session.user.id);
      headers.set('X-Auth-User-Email', session.user.email);

      const apiRequest = new Request(apiUrl.toString(), {
        method: request.method,
        headers,
        body: request.body,
      });

      return env.API.fetch(apiRequest);
    }

    // Serve static assets for all other requests
    return env.ASSETS.fetch(request);
  },
};
