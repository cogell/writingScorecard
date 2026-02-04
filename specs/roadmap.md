# Roadmap

[Back to Index](./index.md)

---

## Phase 1: MVP (Non-Streaming) -- Shipped

The current state of the application. Core evaluation loop works end-to-end with authentication.

### What's built
- Single-page React app with text input form and scorecard display
- **Magic-link email authentication** (BetterAuth + Resend)
- **Session-gated API** -- all `/api/*` routes require authentication
- **Single-worker architecture** -- one Cloudflare Worker serves SPA, auth, and API
- **D1 database** for auth tables (user, session, account, verification)
- **Drizzle ORM** for database schema and queries
- API endpoint (`POST /api/evaluate`) with Zod validation
- Claude integration via Vercel AI SDK (`generateObject`)
- 5-criterion scoring with calibration formula
- Scorecard display with raw/calibrated scores, color coding, and metadata
- Shared types package (`@fast/shared`)
- Veritas design system (cream + forest green, Montserrat/Merriweather)
- GitHub Actions CI/CD pipeline
- Error handling for validation, API failures, and network errors
- User email display and sign-out in header

### What's not built yet
- No persistence for scorecards (evaluations are ephemeral; D1 is only used for auth)
- No file upload (paste-only input)
- No download/export
- No streaming feedback
- No rate limiting
- No dark mode toggle (variables defined but no UI control)

---

## Phase 2: Streaming

Real-time feedback as the evaluation processes.

### Planned features
- Server-Sent Events (SSE) for streaming evaluation progress
- Durable Objects for stream session management and recovery
- Progressive UI showing scores as they arrive from the LLM
- Stream reconnection if connection drops
- `useChat` hook integration on the client

### Architecture impact
- Adds Durable Object binding to API worker
- Client needs SSE handling / EventSource
- Requires session state management for in-flight evaluations

---

## Phase 3: Persistence

Store and retrieve scorecards.

### Planned features
- Scorecard storage in the existing D1 database (auth tables already live there)
- `GET /api/results/:id` endpoint to retrieve saved scorecards
- `PATCH /api/results/:id` to update scorecard title
- Shareable result URLs (send someone a link to view your scorecard)
- PDF download via `@react-pdf/renderer`
- Plain text download

### Architecture impact
- New migration(s) for scorecard tables in the existing D1 database
- Client needs routing for `/results/:id` URLs
- Scorecards saved per-user (associated with authenticated user)

---

## Phase 4: File Upload

Accept documents beyond paste.

### Planned features
- R2 bucket for temporary file storage
- `POST /upload` endpoint
- Supported formats: `.txt`, `.docx`, `.pdf`
- Text extraction: `mammoth` for .docx, `pdf-parse` for .pdf
- File upload UI in the client (drag-and-drop or file picker)
- TTL-based cleanup of temporary files

### Architecture impact
- Adds R2 binding to API worker
- File processing adds dependencies and build size
- Need to handle extraction errors gracefully

---

## Phase 5: Polish

Production hardening and UX improvements.

### Planned features
- Advanced error handling with retry logic
- Rate limiting (per user or per IP)
- Analytics and metrics (submission volume, processing time, error rates)
- Loading skeletons during evaluation
- Mobile-responsive layout
- Landing page copy (explaining FAST, criteria, calibration)
- Criteria explanation modals (click a criterion name to learn more)

---

## Post-MVP (Future)

Features considered but not scheduled.

- **Additional auth methods** -- OAuth providers (Google, GitHub), passkeys
- **Evaluation history** -- view past scorecards for your account
- **Payment integration** -- Stripe for paid evaluations or subscriptions
- **API access** -- third-party integrations via API keys
- **Custom rubrics** -- user-defined criteria or weighting adjustments
- **Batch processing** -- evaluate multiple texts in one submission
- **Collaborative features** -- share scorecards within teams, comment on scores
- **Community enrollment** -- post-evaluation funnel to join the Endemic community
