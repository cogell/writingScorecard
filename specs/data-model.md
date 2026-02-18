# Data Model

[Back to Index](./index.md)

---

All types, constants, and validation schemas live in `apps/client/src/shared/`.

## Core Types

Source: `apps/client/src/shared/types.ts`

### Criterion

The 5 evaluation dimensions, used as enum keys throughout the system.

```typescript
type Criterion =
  | 'clarity'
  | 'simplexity'
  | 'errorCorrection'
  | 'unity'
  | 'pragmaticExperience';
```

### CriterionScore

A single criterion's evaluation result.

```typescript
interface CriterionScore {
  criterion: Criterion;
  score: number;              // 0-10, from LLM (no calibration offset)
  evaluation: string;         // 1 sentence: what the text does on this criterion, citing text features
  suggestion: string;         // 1 sentence: single most impactful concrete edit
}
```

### Scorecard

The complete evaluation output returned to the client.

```typescript
interface Scorecard {
  id: string;                 // nanoid(10)
  createdAt: Date;            // ISO 8601 timestamp

  // Analysis (LLM "shows its work" — grounds scoring in text analysis)
  coreThesis: string;         // 1-2 sentences: evaluator's read of the central claim
  keyTerms: string[];         // 3-10 terms doing conceptual work in the text

  // Scorecard
  title: string;              // User-provided or LLM-inferred
  inputText: string;          // Original submitted text
  wordCount: number;          // Whitespace-split count
  overallScore: number;       // Arithmetic mean of 5 scores (1 decimal)
  scores: CriterionScore[];   // Array of exactly 5 scores
  summary: string;            // 2-3 sentences: strongest, weakest, biggest lever

  // Diagnostics
  contextSufficiency: 'low' | 'medium' | 'high';
  rhetoricRisk: 'low' | 'medium' | 'high';

  // Metadata
  modelUsed: string;          // e.g., "claude-haiku-4-5"
  processingTimeMs: number;   // Wall-clock evaluation time
  inputTokens: number;        // Prompt tokens consumed
  outputTokens: number;       // Completion tokens consumed
  costUsd: number;            // Calculated from token usage
}
```

### EvaluationRequest

The input payload from the client.

```typescript
interface EvaluationRequest {
  text: string;               // Required, 100-50,000 characters
  title?: string;             // Optional, max 200 characters
}
```

### ApiError

Error response format.

```typescript
interface ApiError {
  error: string;              // Human-readable message
  code: ApiErrorCode;         // Machine-readable code
  details?: unknown;          // Optional additional context
  requestId?: string;         // For debugging
}

type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'TEXT_TOO_SHORT'
  | 'TEXT_TOO_LONG'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'RATE_LIMITED'
  | 'AI_SERVICE_ERROR'
  | 'AI_TIMEOUT'
  | 'INTERNAL_ERROR';
```

---

## Validation Schemas

Source: `apps/client/src/shared/validation.ts`

Built with [Zod](https://zod.dev). Used on both the API (request validation) and in the AI SDK call (response schema enforcement via `generateObject()`).

### evaluationRequestSchema

Validates the incoming request body.

```typescript
z.object({
  text: z.string().min(100).max(50000),
  title: z.string().max(200).optional(),
})
```

### criterionScoreSchema

Validates individual criterion scores in the LLM response.

```typescript
z.object({
  criterion: z.enum(['clarity', 'simplexity', 'errorCorrection', 'unity', 'pragmaticExperience']),
  score: z.number().min(0).max(10),
  evaluation: z.string(),
  suggestion: z.string(),
})
```

### scorecardResponseSchema

The schema passed to `generateObject()` — tells the LLM what structure to output. Field ordering matters: `coreThesis` and `keyTerms` come first to force the LLM to analyze before scoring (chain-of-thought in structured output).

```typescript
z.object({
  // Analysis (populated before scores — forces grounded evaluation)
  coreThesis: z.string(),
  keyTerms: z.array(z.string()).min(3).max(10),

  // Scorecard
  title: z.string(),
  scores: z.array(criterionScoreSchema).length(5),
  summary: z.string(),

  // Diagnostics
  contextSufficiency: z.enum(['low', 'medium', 'high']),
  rhetoricRisk: z.enum(['low', 'medium', 'high']),
})
```

### apiErrorSchema

Validates error response shape.

```typescript
z.object({
  error: z.string(),
  code: z.enum([...all ApiErrorCode values...]),
  details: z.unknown().optional(),
  requestId: z.string().optional(),
})
```

---

## Constants

Source: `apps/client/src/shared/constants.ts`

### Scoring

| Constant | Value | Purpose |
|----------|-------|---------|
| `MIN_TEXT_LENGTH` | 100 | Minimum characters for evaluation |
| `MAX_TEXT_LENGTH` | 50,000 | Maximum characters for evaluation |

### Criterion metadata

```typescript
CRITERION_LABELS: Record<Criterion, string>
// { clarity: 'Clarity', simplexity: 'Simplexity', errorCorrection: 'Error Correction',
//   unity: 'Unity', pragmaticExperience: 'Pragmatic / Experience' }

CRITERION_DESCRIPTIONS: Record<Criterion, string>
// { clarity: 'Precision in language, clean definitions, sharp reasoning',
//   simplexity: 'Captures essence without reduction; releases complexity without deleting it',
//   errorCorrection: 'Corrects errors within/across disciplines; checks contradictions; self-repair',
//   unity: 'Expands capacity to say more with less; integrates without flattening',
//   pragmaticExperience: 'Returns to lived experience; "contact" is part of proof' }
```

### Model pricing

```typescript
MODEL_PRICING = {
  'claude-haiku-4-5': {
    inputPricePerMTok: 1.0,   // $1.00 per million input tokens
    outputPricePerMTok: 5.0,  // $5.00 per million output tokens
  },
}
```

### Helper functions

| Function | Signature | Purpose |
|----------|-----------|---------|
| `calculateOverallScore` | `(scores: number[]) => number` | Arithmetic mean, rounded to 1 decimal |
| `calculateCost` | `(modelId, inputTokens, outputTokens) => number` | Cost in USD |

Removed: `calibrateScore()` and `CALIBRATION_OFFSET` — no longer needed with the rich FAST v1.0 rubric.

---

## Auth Schema

Source: `apps/client/src/db/auth.schema.ts`
Migration: `apps/client/migrations/0001_create_auth.sql`

Auth data is stored in Cloudflare D1 (SQLite) and managed by [Drizzle ORM](https://orm.drizzle.team/). The schema follows BetterAuth conventions.

### user

| Column | Type | Notes |
|--------|------|-------|
| `id` | TEXT (PK) | BetterAuth-generated ID |
| `name` | TEXT | Required |
| `email` | TEXT | Required, unique |
| `email_verified` | INTEGER (boolean) | Default `false` |
| `image` | TEXT | Optional avatar URL |
| `role` | TEXT | Default `"user"` |
| `created_at` | INTEGER (timestamp_ms) | Auto-set |
| `updated_at` | INTEGER (timestamp_ms) | Auto-updated |

### session

| Column | Type | Notes |
|--------|------|-------|
| `id` | TEXT (PK) | Session identifier |
| `expires_at` | INTEGER (timestamp_ms) | Session expiry |
| `token` | TEXT | Unique session token |
| `created_at` | INTEGER (timestamp_ms) | Auto-set |
| `updated_at` | INTEGER (timestamp_ms) | Auto-updated |
| `ip_address` | TEXT | Optional client IP |
| `user_agent` | TEXT | Optional UA string |
| `user_id` | TEXT (FK → user) | Cascade on delete |

Index: `session_userId_idx` on `user_id`

### account

| Column | Type | Notes |
|--------|------|-------|
| `id` | TEXT (PK) | Account identifier |
| `account_id` | TEXT | Provider-specific account ID |
| `provider_id` | TEXT | Auth provider identifier |
| `user_id` | TEXT (FK → user) | Cascade on delete |
| `access_token` | TEXT | Optional |
| `refresh_token` | TEXT | Optional |
| `id_token` | TEXT | Optional |
| `access_token_expires_at` | INTEGER (timestamp_ms) | Optional |
| `refresh_token_expires_at` | INTEGER (timestamp_ms) | Optional |
| `scope` | TEXT | Optional |
| `password` | TEXT | Optional |
| `created_at` | INTEGER (timestamp_ms) | Auto-set |
| `updated_at` | INTEGER (timestamp_ms) | Auto-updated |

Index: `account_userId_idx` on `user_id`

### verification

| Column | Type | Notes |
|--------|------|-------|
| `id` | TEXT (PK) | Verification identifier |
| `identifier` | TEXT | What is being verified (e.g., email) |
| `value` | TEXT | Verification token/value |
| `expires_at` | INTEGER (timestamp_ms) | Token expiry |
| `created_at` | INTEGER (timestamp_ms) | Auto-set |
| `updated_at` | INTEGER (timestamp_ms) | Auto-set |

Index: `verification_identifier_idx` on `identifier`

### Relationships

- `user` → `session` (one-to-many)
- `user` → `account` (one-to-many)
- `session.user_id` and `account.user_id` cascade on user deletion
