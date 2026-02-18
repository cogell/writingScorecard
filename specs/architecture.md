# Architecture

[Back to Index](./index.md)

---

## Monorepo Structure

```
writingScorecard/
  apps/
    api/              # (Legacy) Standalone API worker -- no longer deployed
    client/           # Cloudflare Worker -- single worker serving SPA + API + auth
      migrations/     # D1 database migrations
      src/
        components/   # React components (EmailLogin, TextInput, Scorecard, etc.)
        db/           # Drizzle ORM schema (auth tables)
        hooks/        # React hooks (useEvaluation)
        lib/          # Client-side auth client
        routes/       # API route handlers (evaluate)
        services/     # Scoring service and prompts
        auth.ts       # BetterAuth server configuration
        worker.ts     # Worker entry point (auth + API + static assets)
  packages/
    shared/           # @fast/shared -- types, constants, validation
  specs/              # Specification documents (this directory)
  plans/              # Planning documents (PRD, roadmap, etc.)
  pnpm-workspace.yaml
  package.json        # Root scripts
  tsconfig.json       # Root TypeScript config
```

Managed with **pnpm workspaces**. The shared package is referenced by the client app via workspace protocol.

---

## Tech Stack

### Client / Worker (`apps/client`)

A single Cloudflare Worker serves the React SPA, handles API routes, and manages authentication.

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | React | 18.3.1 |
| Build tool | Vite | 6.0.5 |
| Styling | Tailwind CSS | 3.4.17 |
| Fonts | Google Fonts (Montserrat, Merriweather, JetBrains Mono) | -- |
| Runtime | Cloudflare Workers | ES2022 |
| Auth | BetterAuth | -- |
| Auth transport | Magic link via Resend | -- |
| Database ORM | Drizzle ORM (D1/SQLite) | -- |
| Database | Cloudflare D1 | -- |
| AI SDK | Vercel AI SDK (`ai`) | 4.1.16 |
| Claude provider | `@ai-sdk/anthropic` | 1.1.6 |
| Validation | Zod | 3.24.1 |
| ID generation | nanoid | 5.0.9 |
| TypeScript | TypeScript | 5.7.2 |
| Deploy tool | Wrangler | 3.99.0 |

### Shared (`packages/shared`)

| Layer | Technology | Version |
|-------|-----------|---------|
| Validation | Zod | 3.24.1 |

---

## Worker Topology

A single Cloudflare Worker handles everything: static assets, authentication, and API routes.

```
Browser
  |
  | HTTPS request to writing-scorecard.cogell.workers.dev
  v
Worker (writing-scorecard)
  |
  |-- /api/auth/* --> BetterAuth handler (magic link sign-in, session mgmt)
  |
  |-- /api/* -------> Session validation (401 if unauthenticated)
  |                    |
  |                    |-- POST /api/evaluate --> Claude API (Anthropic)
  |                    |-- GET /api/health ----> health check
  |
  |-- all other -----> Serve static assets (Vite build in ./dist)
  |
  v
Browser receives response
```

### Worker (`apps/client/src/worker.ts`)

- Serves the React SPA's static assets (Vite build output in `./dist`)
- Routes `/api/auth/*` requests to BetterAuth for authentication
- Gates all other `/api/*` routes behind session validation (returns 401 if no valid session)
- Handles `POST /api/evaluate` and `GET /api/health` directly (no proxy or service binding)
- Uses Cloudflare's `ASSETS` binding for static file serving
- Uses `DB` D1 binding for auth database
- Sends admin notification emails on new user signup via BetterAuth `databaseHooks.user.create.after` (fire-and-forget; failures are logged but never break the auth flow)

---

## Key Service: Evaluation Pipeline

Source: `apps/client/src/services/scoring.ts`

```
evaluateText(text, title, env)
  |
  | 1. Create Anthropic client with ANTHROPIC_API_KEY
  | 2. Start timer
  | 3. Call generateObject():
  |      model: claude-haiku-4-5
  |      system: SCORING_PROMPT (FAST v1.0 full rubric from prompts.ts)
  |      prompt: "Evaluate the following text:\n\n{title}\n{text}"
  |      schema: scorecardResponseSchema
  | 4. Parse structured response (coreThesis, keyTerms, scores, summary, diagnostics)
  | 5. overallScore = avg(scores), rounded to 1 decimal (no calibration offset)
  | 6. Calculate cost from token usage
  | 7. Assemble Scorecard object with metadata
  |
  v
Return Scorecard
```

The `generateObject()` function from Vercel's AI SDK enforces the Zod schema on the LLM output, guaranteeing structured JSON with: `coreThesis` and `keyTerms` (chain-of-thought analysis), exactly 5 criterion scores with `evaluation` + `suggestion` per criterion, a summary, and diagnostic flags (`contextSufficiency`, `rhetoricRisk`). Field ordering in the schema places analysis fields before scores to encourage grounded evaluation.

---

## Environment Variables

### Worker

| Variable | Source | Purpose |
|----------|--------|---------|
| `ASSETS` | Asset binding | Reference to static assets (Vite build) |
| `DB` | D1 binding | Cloudflare D1 database for auth tables |
| `BETTER_AUTH_SECRET` | Secret / `.dev.vars` | BetterAuth session encryption key |
| `RESEND_API_KEY` | Secret / `.dev.vars` | Resend API key for sending magic link emails |
| `RESEND_FROM_EMAIL` | Secret / `.dev.vars` | Sender email address for magic links |
| `RESEND_FROM_NAME` | Secret / `.dev.vars` (optional) | Sender display name (defaults to app name) |
| `BETTER_AUTH_URL` | Secret / `.dev.vars` (optional) | Base URL override for BetterAuth |
| `ANTHROPIC_API_KEY` | Secret / `.dev.vars` | Claude API authentication |
| `ADMIN_NOTIFY_EMAILS` | Secret / `.dev.vars` (optional) | Comma-separated admin emails to notify on new user signup |

### Local Development

Local dev vars go in `apps/client/.dev.vars`:

```
BETTER_AUTH_SECRET=<generate with: openssl rand -hex 32>
RESEND_API_KEY=re_xxxxx
RESEND_FROM_EMAIL=your-app@yourdomain.com
ANTHROPIC_API_KEY=sk-ant-xxxxx
```

---

## Local Development

### Setup

```bash
# 1. Apply D1 migrations locally (required before first run)
cd apps/client
wrangler d1 migrations apply writing-scorecard-auth --local

# 2. Start the dev server
pnpm dev
# Wrangler runs on http://localhost:8787
# Vite dev server on http://localhost:5173 (proxies /api/* to :8787)
```

The Vite config proxies `/api` requests to the Wrangler dev server during local development.

---

## Deployment

### CI/CD Pipeline

Source: `.github/workflows/deploy.yml`

Triggered on push to `main`.

Steps:
1. Checkout code
2. Setup pnpm + Node 20
3. `pnpm install --frozen-lockfile`
4. Build `@fast/shared` package
5. Generate Wrangler types
6. TypeScript check
7. Build client (Vite)
8. Apply D1 migrations
9. Deploy worker (`wrangler deploy`)

### Production URL

- **App:** `writing-scorecard.cogell.workers.dev`

### Wrangler Configuration

**Worker** (`apps/client/wrangler.toml`):
- Name: `writing-scorecard`
- Assets directory: `./dist`
- Compatibility flags: `nodejs_compat` (required for BetterAuth crypto APIs)
- D1 binding: `DB` -> `writing-scorecard-auth`
- Production env: `[env.production]`

---

## Cost Profile

Using Claude Haiku 4.5:
- Input: $1.00 per million tokens
- Output: $5.00 per million tokens
- Typical evaluation (~3000 words + system prompt): ~5,000 input tokens, ~500 output tokens
- **Cost per evaluation: ~$0.01-0.03**
- At 100 evals/day: ~$1-3/day
