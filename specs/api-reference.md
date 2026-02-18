# API Reference

[Back to Index](./index.md)

---

## Base URL

- **Local development (Vite):** `http://localhost:5173` (proxies `/api/*` to Wrangler)
- **Local development (Wrangler):** `http://localhost:8787`
- **Production:** `https://writing-scorecard.cogell.workers.dev`

A single Cloudflare Worker serves both the SPA and the API. All API routes live under `/api/`.

---

## Authentication Routes

### /api/auth/*

All auth routes are handled by BetterAuth. Key routes include:

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/auth/magic-link/sign-in` | POST | Request a magic link email |
| `/api/auth/magic-link/verify` | GET | Verify magic link token (callback from email) |
| `/api/auth/get-session` | GET | Check current session status |
| `/api/auth/sign-out` | POST | End the current session |

Auth routes use cookie-based sessions. The client includes credentials (`credentials: 'include'`) with all requests.

---

## API Endpoints

All `/api/*` routes (except `/api/auth/*`) require an authenticated session. Requests without a valid session cookie receive a `401 Unauthorized` response:

```json
{ "error": "Unauthorized" }
```

### POST /api/evaluate

Evaluate a text and return a scorecard.

**Request body:**

```json
{
  "text": "string (required, 100-50,000 characters)",
  "title": "string (optional, max 200 characters)"
}
```

**Success response (200):**

```json
{
  "id": "abc123def4",
  "createdAt": "2025-01-07T15:30:00.000Z",
  "coreThesis": "The text argues that systems thinking requires recursive self-reference, where the observer is always part of the system being described.",
  "keyTerms": ["systems thinking", "recursive self-reference", "observer", "boundary", "emergence", "feedback loop"],
  "title": "The Nature of Systems Thinking",
  "inputText": "[original submitted text]",
  "wordCount": 1234,
  "overallScore": 5.4,
  "scores": [
    {
      "criterion": "clarity",
      "score": 7,
      "evaluation": "Key terms are defined on introduction and used consistently; scope is explicit ('organizational systems, not physical').",
      "suggestion": "Pin down 'emergence' with a scope clause — emergence-of-what, at-which-level — since it shifts between §2 and §5."
    },
    {
      "criterion": "simplexity",
      "score": 6,
      "evaluation": "Good compression of the core feedback-loop model, but the secondary taxonomy in §3 adds machinery without payoff.",
      "suggestion": "Cut the secondary taxonomy or show how it generates predictions the core model alone cannot."
    },
    {
      "criterion": "errorCorrection",
      "score": 5,
      "evaluation": "Acknowledges the reductionism objection but doesn't resolve it — hand-waves with 'this is beyond mechanistic thinking'.",
      "suggestion": "State what would falsify the central claim; name one failure mode where recursive self-reference breaks down."
    },
    {
      "criterion": "unity",
      "score": 5,
      "evaluation": "A unifying lens exists but strains when applied to the biological examples in §4 — the mapping is asserted not shown.",
      "suggestion": "Make the cross-domain mapping explicit: what in biology corresponds to what in organizations, and where the analogy breaks."
    },
    {
      "criterion": "pragmaticExperience",
      "score": 4,
      "evaluation": "Claims stay abstract; no observation prompts or decision consequences for the reader.",
      "suggestion": "Add a contact test: 'if you map your team's feedback loops using this model, you should notice X; if not, the claim is weakened'."
    }
  ],
  "summary": "Strongest in Clarity — terms are defined and the argument is traceable. Weakest in Pragmatic/Experience — the framework never leaves the page. Biggest lever: add one concrete contact test that lets a reader check the central claim against their own experience.",
  "contextSufficiency": "medium",
  "rhetoricRisk": "low",
  "modelUsed": "claude-haiku-4-5",
  "processingTimeMs": 2400,
  "inputTokens": 4521,
  "outputTokens": 580,
  "costUsd": 0.00743
}
```

**Error responses:**

| Status | Code | Condition |
|--------|------|-----------|
| 401 | `Unauthorized` | No valid session cookie |
| 400 | `VALIDATION_ERROR` | Invalid JSON body or missing required fields |
| 400 | `TEXT_TOO_SHORT` | Text under 100 characters |
| 400 | `TEXT_TOO_LONG` | Text over 50,000 characters |
| 429 | `RATE_LIMITED` | Too many requests |
| 502 | `AI_SERVICE_ERROR` | Claude API returned an error |
| 504 | `AI_TIMEOUT` | Claude API did not respond in time |
| 500 | `INTERNAL_ERROR` | Unexpected server error |

**Error body format:**

```json
{
  "error": "Human-readable error message",
  "code": "MACHINE_READABLE_CODE",
  "details": {},
  "requestId": "optional-request-id"
}
```

---

### GET /api/health

Health check endpoint. Requires authentication.

**Response (200):**

```json
{
  "status": "ok"
}
```

---

### GET /results/:id

**Status:** Not yet implemented (planned for Phase 3: Persistence).

Will retrieve a previously saved scorecard by ID.

---

### PATCH /results/:id

**Status:** Not yet implemented (planned for Phase 3: Persistence).

Will allow updating a scorecard's title.

---

## CORS

Since auth and API are served from the same origin as the SPA, CORS headers are not needed for browser requests. BetterAuth is configured with `trustedOrigins` for local development cross-origin scenarios (Vite on `:5173` → Wrangler on `:8787`).

---

## Request Processing Pipeline

```
Client (browser)
  |
  | POST /api/evaluate (with session cookie)
  v
Worker (Cloudflare)
  |
  | 1. Match /api/* route
  | 2. Validate session via BetterAuth (returns 401 if invalid)
  | 3. Parse JSON body
  | 4. Validate with Zod schema (text length, title length)
  | 5. Call evaluateText() service
  |     a. Create Anthropic client
  |     b. generateObject() with FAST v1.0 SCORING_PROMPT + user text
  |     c. Parse structured response (coreThesis, keyTerms, scores, summary, diagnostics)
  |     d. Calculate overall score (avg of 5 scores, no calibration)
  |     e. Assemble Scorecard with metadata
  | 6. Return Scorecard JSON
  v
Client (browser)
  |
  | Render scorecard view
  v
User sees results
```

---

## Authentication

Authentication uses [BetterAuth](https://www.better-auth.com/) with the **magic link** plugin. Users sign in by entering their email address; a sign-in link is sent via [Resend](https://resend.com/).

### How it works

1. User enters email on the login screen
2. Client calls `POST /api/auth/magic-link/sign-in` with `{ email, callbackURL: "/" }`
3. Server sends an email via Resend containing a signed magic link URL
4. User clicks the link, which hits `/api/auth/magic-link/verify`
5. BetterAuth creates a session and sets a session cookie
6. User is redirected to the app (callbackURL)

### Session management

- Sessions are stored in a D1 database (Cloudflare SQLite)
- BetterAuth manages session cookies automatically
- Session validation happens on every `/api/*` request (except `/api/auth/*`)
- The client uses `authClient.useSession()` (React hook) to check auth state on load

### Database

Auth tables are managed by Drizzle ORM and live in D1. See [Data Model](./data-model.md#auth-schema) for the full schema.

---

## Rate Limiting

**Phase 1 (current):** No rate limiting implemented.

**Planned:** Per-user/IP rate limiting in Phase 5.
