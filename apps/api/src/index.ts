import type { Env } from './types/env';
import { handleEvaluate } from './routes/evaluate';

// Helper to add CORS headers to a response
function addCorsHeaders(response: Response): Response {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  const newHeaders = new Headers(response.headers);
  for (const [key, value] of Object.entries(corsHeaders)) {
    newHeaders.set(key, value);
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    try {
      // Route handling
      if (url.pathname === '/api/health') {
        return addCorsHeaders(
          Response.json({ status: 'ok', environment: env.ENVIRONMENT })
        );
      }

      if (url.pathname === '/api/evaluate' && request.method === 'POST') {
        const response = await handleEvaluate(request, env);
        return addCorsHeaders(response);
      }

      if (url.pathname.startsWith('/api/results/') && request.method === 'GET') {
        // TODO: Implement in persistence phase
        return addCorsHeaders(
          Response.json(
            { error: 'Not implemented yet', code: 'INTERNAL_ERROR' },
            { status: 501 }
          )
        );
      }

      return addCorsHeaders(
        Response.json(
          { error: 'Not found', code: 'NOT_FOUND' },
          { status: 404 }
        )
      );
    } catch (error) {
      console.error('Request failed:', error);
      return addCorsHeaders(
        Response.json(
          { error: 'Internal server error', code: 'INTERNAL_ERROR' },
          { status: 500 }
        )
      );
    }
  },
};
