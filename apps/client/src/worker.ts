// Worker script to proxy /api/* requests to the API worker
// Static assets are served automatically by the [assets] configuration

interface Env {
  API: Fetcher;
  ASSETS: Fetcher;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Proxy /api/* requests to the API worker
    if (url.pathname.startsWith('/api/')) {
      // Strip /api prefix - the API worker expects /evaluate, not /api/evaluate
      const apiPath = url.pathname.replace(/^\/api/, '');
      const apiUrl = new URL(apiPath, url.origin);
      apiUrl.search = url.search;

      const apiRequest = new Request(apiUrl.toString(), {
        method: request.method,
        headers: request.headers,
        body: request.body,
      });

      return env.API.fetch(apiRequest);
    }

    // Serve static assets for all other requests
    return env.ASSETS.fetch(request);
  },
};
