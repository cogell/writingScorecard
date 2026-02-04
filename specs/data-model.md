# Data Model

[Back to Index](./index.md)

---

All types, constants, and validation schemas live in the shared package: `packages/shared/src/`.

## Core Types

Source: `packages/shared/src/types.ts`

### Criterion

The 5 evaluation dimensions, used as enum keys throughout the system.

```typescript
type Criterion =
  | 'clarity'
  | 'simplexity'
  | 'errorCorrection'
  | 'unityScope'
  | 'pragmaticReturn';
```

### CriterionScore

A single criterion's evaluation result.

```typescript
interface CriterionScore {
  criterion: Criterion;
  provisionalScore: number;   // 0-10, raw score from LLM
  calibratedScore: number;    // max(0, provisional - 1.5)
  note: string;               // 1-sentence explanation specific to the text
}
```

### Scorecard

The complete evaluation output returned to the client.

```typescript
interface Scorecard {
  id: string;                 // nanoid(10)
  createdAt: Date;            // ISO 8601 timestamp
  title: string;              // User-provided or LLM-inferred
  inputText: string;          // Original submitted text
  wordCount: number;          // Whitespace-split count
  overallScore: number;       // Average of calibrated scores (1 decimal)
  scores: CriterionScore[];   // Array of exactly 5 scores
  summary: string;            // 2-3 sentence assessment
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

Source: `packages/shared/src/validation.ts`

Built with [Zod](https://zod.dev). Used on both the API (request validation) and in the AI SDK call (response schema enforcement).

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
  criterion: z.enum(['clarity', 'simplexity', 'errorCorrection', 'unityScope', 'pragmaticReturn']),
  provisionalScore: z.number().min(0).max(10),
  note: z.string(),
})
```

### scorecardResponseSchema

The schema passed to `generateObject()` -- tells the LLM what structure to output.

```typescript
z.object({
  title: z.string(),
  scores: z.array(criterionScoreSchema).length(5),
  summary: z.string(),
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

Source: `packages/shared/src/constants.ts`

### Scoring

| Constant | Value | Purpose |
|----------|-------|---------|
| `MIN_TEXT_LENGTH` | 100 | Minimum characters for evaluation |
| `MAX_TEXT_LENGTH` | 50,000 | Maximum characters for evaluation |
| `CALIBRATION_OFFSET` | 1.5 | Subtracted from all provisional scores |

### Criterion metadata

```typescript
CRITERION_LABELS: Record<Criterion, string>
// e.g., { clarity: 'Clarity', simplexity: 'Simplexity', ... }

CRITERION_DESCRIPTIONS: Record<Criterion, string>
// e.g., { clarity: 'Precise language, clean definitions...', ... }
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
| `calibrateScore` | `(provisional: number) => number` | `max(0, provisional - 1.5)` |
| `calculateOverallScore` | `(calibrated: number[]) => number` | Average, rounded to 1 decimal |
| `calculateCost` | `(modelId, inputTokens, outputTokens) => number` | Cost in USD |

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

---

## Shared Package Structure

```
packages/shared/
  src/
    index.ts          # Re-exports everything
    types.ts          # TypeScript interfaces and type aliases
    constants.ts      # Scoring constants, labels, pricing, helper functions
    validation.ts     # Zod schemas
  package.json        # @fast/shared
  tsconfig.json
```

The shared package is consumed by `apps/client` via pnpm workspace references.
