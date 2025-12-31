# Plan: Consolidate Two Workers into One

## Goal
Merge `writing-scorecard` (client) and `writing-scorecard-api` into a single Cloudflare Worker for POC simplicity.

## Current State
```
apps/client/  → "writing-scorecard" (serves React SPA, proxies /api/* via service binding)
apps/api/     → "writing-scorecard-api" (handles /api/evaluate with Anthropic)
```

## Target State
```
apps/web/     → "writing-scorecard" (serves React SPA + handles /api/* directly)
```

---

## Implementation Steps

### Phase 1: Restructure Directories

1. **Rename `apps/client/` → `apps/web/`**
2. **Create API subdirectory**:
   ```
   apps/web/src/api/
     routes/evaluate.ts
     services/scoring.ts
     services/prompts.ts
   ```
3. **Copy files from `apps/api/src/`** to new locations

### Phase 2: Merge Worker Entry Point

**Modify `apps/web/src/worker.ts`**:
- Remove service binding proxy
- Import API handlers directly
- Route `/api/*` inline, fall back to `ASSETS.fetch()` for static files

```typescript
// Simplified structure
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // API routes handled directly
    if (url.pathname.startsWith('/api/')) {
      if (url.pathname === '/api/evaluate') return handleEvaluate(request, env);
      if (url.pathname === '/api/health') return Response.json({ status: 'ok' });
      return Response.json({ error: 'Not found' }, { status: 404 });
    }

    // Static assets
    return env.ASSETS.fetch(request);
  }
};
```

### Phase 3: Update Configuration

**`apps/web/wrangler.toml`**:
```toml
name = "writing-scorecard"
main = "src/worker.ts"
compatibility_date = "2024-12-01"

[assets]
directory = "./dist"
binding = "ASSETS"

[vars]
ENVIRONMENT = "development"

[env.production]
name = "writing-scorecard"
[env.production.vars]
ENVIRONMENT = "production"
```

**`apps/web/package.json`**:
- Rename to `@fast/web`
- Add API deps: `@ai-sdk/anthropic`, `ai`, `nanoid`
- Add `concurrently` for dev

**`apps/web/vite.config.ts`**:
- Update proxy target to `http://localhost:8787` (wrangler dev port)

### Phase 4: Update GitHub Actions

**`.github/workflows/deploy.yml`**:
- Remove "Deploy API" step
- Update "Deploy Client" to `workingDirectory: apps/web`

### Phase 5: Cleanup

1. Delete `apps/api/` directory
2. Tag commit before deletion: `git tag pre-consolidation`
3. Set secret: `wrangler secret put ANTHROPIC_API_KEY --env production`

---

## Files to Modify

| Action | Path |
|--------|------|
| RENAME | `apps/client/` → `apps/web/` |
| CREATE | `apps/web/src/api/routes/evaluate.ts` |
| CREATE | `apps/web/src/api/services/scoring.ts` |
| CREATE | `apps/web/src/api/services/prompts.ts` |
| CREATE | `apps/web/.dev.vars` |
| MODIFY | `apps/web/src/worker.ts` |
| MODIFY | `apps/web/wrangler.toml` |
| MODIFY | `apps/web/package.json` |
| MODIFY | `apps/web/vite.config.ts` |
| MODIFY | `pnpm-workspace.yaml` (if needed) |
| MODIFY | `.github/workflows/deploy.yml` |
| DELETE | `apps/api/` |

---

## Local Dev Flow (After)

```bash
pnpm dev  # Runs both Vite (5173) and Wrangler (8787) concurrently
```
- Vite proxies `/api/*` to wrangler dev
- API uses `.dev.vars` for `ANTHROPIC_API_KEY`

---

## Benefits
- Single deployment
- No service binding complexity
- Simpler CI/CD (one wrangler deploy)
- Easier to understand for POC
