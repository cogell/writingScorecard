# FAST v1.0 - POC Implementation Plan

## Overview

This document outlines the Proof of Concept implementation for FAST (Framework for Assessing Systematic Thinking), a web application that scores conceptual writing on 5 criteria using Claude via the Vercel AI SDK 6.

**Target**: Deploy a working POC that can evaluate text and stream back a calibrated scorecard.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Cloudflare Access                                │
│                    (Protects all resources)                              │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        ▼                           ▼                           ▼
┌───────────────┐          ┌───────────────┐          ┌───────────────┐
│    Client     │   SSE    │   API Worker  │          │  Anthropic    │
│  React+Vite   │◀────────▶│   (ai-sdk)    │─────────▶│  Claude API   │
│  CF Workers   │          │               │          │               │
│ Static Assets │          └───────┬───────┘          └───────────────┘
└───────────────┘                  │
                                   │ Service Binding
                    ┌──────────────┼──────────────┐
                    ▼              ▼              ▼
             ┌──────────┐   ┌──────────┐   ┌──────────┐
             │    D1    │   │    R2    │   │ Durable  │
             │ Database │   │  Bucket  │   │ Objects  │
             │(results) │   │ (files)  │   │ (stream) │
             └──────────┘   └──────────┘   └──────────┘
```

### Component Responsibilities

| Component | Purpose |
|-----------|---------|
| **Client (CF Workers Static Assets)** | React SPA for text input, scorecard display, downloads |
| **API Worker** | Handles evaluation requests, orchestrates AI SDK, applies calibration |
| **D1 Database** | Stores completed scorecards for retrieval/download |
| **R2 Bucket** | Stores uploaded files (.txt, .docx, .pdf) temporarily |
| **Durable Objects** | Manages streaming state, enables reconnection recovery |
| **Cloudflare Access** | Zero-trust auth for POC (no custom auth needed) |

---

## Tech Stack

### Client
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS
- **AI SDK Client**: `@ai-sdk/react` (useChat/useCompletion hooks)
- **Deployment**: Cloudflare Workers with Static Assets

### Backend
- **Runtime**: Cloudflare Workers
- **AI Integration**: Vercel AI SDK 6 (`ai`, `@ai-sdk/anthropic`)
- **Validation**: Zod 4
- **Database**: Cloudflare D1 (SQLite)
- **Storage**: Cloudflare R2
- **State Management**: Durable Objects (for stream recovery)

### Infrastructure
- **Auth**: Cloudflare Access (JWT validation)
- **DNS/CDN**: Cloudflare
- **Secrets**: Cloudflare Worker Secrets (ANTHROPIC_API_KEY)

---

## Project Structure

```
writingScorecard/
├── apps/
│   ├── client/                    # React + Vite frontend
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── TextInput.tsx
│   │   │   │   ├── Scorecard.tsx
│   │   │   │   ├── ScoreRow.tsx
│   │   │   │   └── DownloadButtons.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useEvaluation.ts
│   │   │   ├── lib/
│   │   │   │   └── api.ts
│   │   │   ├── types/
│   │   │   │   └── scorecard.ts
│   │   │   ├── App.tsx
│   │   │   └── main.tsx
│   │   ├── public/
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   ├── wrangler.toml          # CF Workers Static Assets config
│   │   └── package.json
│   │
│   └── api/                       # Cloudflare Worker API
│       ├── src/
│       │   ├── index.ts           # Main worker entry
│       │   ├── routes/
│       │   │   ├── evaluate.ts    # POST /evaluate - streaming evaluation
│       │   │   ├── results.ts     # GET /results/:id - fetch stored result
│       │   │   └── upload.ts      # POST /upload - file upload handler
│       │   ├── services/
│       │   │   ├── scoring.ts     # AI SDK integration, prompt engineering
│       │   │   ├── calibration.ts # Score calibration logic
│       │   │   └── parser.ts      # Parse AI response into structured data
│       │   ├── lib/
│       │   │   ├── ai.ts          # AI SDK client setup
│       │   │   └── auth.ts        # CF Access JWT validation
│       │   ├── durable-objects/
│       │   │   └── StreamSession.ts # DO for stream state management
│       │   └── types/
│       │       └── env.ts         # Worker environment types
│       ├── wrangler.toml
│       └── package.json
│
├── packages/
│   └── shared/                    # Shared types and utilities
│       ├── src/
│       │   ├── types.ts           # Scorecard, Criteria types
│       │   ├── constants.ts       # Criteria definitions, score ranges
│       │   └── validation.ts      # Zod schemas
│       └── package.json
│
├── prd.md
├── poc-plan.md
├── pnpm-workspace.yaml
└── package.json
```

---

## Implementation Phases

### Phase 1: Foundation (Core Flow)
**Goal**: Text in → Score out (no streaming, no persistence)

- [ ] Set up monorepo with pnpm workspaces
- [ ] Create React + Vite client with basic text input form
- [ ] Create API Worker with `/evaluate` endpoint
- [ ] Integrate AI SDK 6 with Anthropic provider
- [ ] Implement scoring prompt with 5 FAST criteria
- [ ] Apply calibration formula: `max(0, provisional - 1.5)`
- [ ] Display scorecard in client
- [ ] Deploy both to Cloudflare (Workers Static Assets + Worker)
- [ ] Configure Cloudflare Access for protection

### Phase 2: Streaming -- CEDRIC CONT
**Goal**: Real-time scorecard generation with progress feedback

- [ ] Implement SSE streaming from API Worker using AI SDK `streamText`
- [ ] Create Durable Object for stream session management
- [ ] Add `useCompletion` hook on client for streaming consumption
- [ ] Implement progressive UI (show scores as they're generated)
- [ ] Handle stream interruption and reconnection
- [ ] Add loading states and progress indicators

### Phase 3: Persistence
**Goal**: Store and retrieve evaluation results

- [ ] Set up D1 database with scorecard schema
- [ ] Save completed evaluations to D1
- [ ] Generate unique evaluation IDs (nanoid)
- [ ] Implement `/results/:id` endpoint
- [ ] Add shareable result URLs
- [ ] Implement download as PDF (`@react-pdf/renderer`, client-side)
- [ ] Implement download as plain text

### Phase 4: File Upload
**Goal**: Support .txt, .docx, .pdf uploads

- [ ] Set up R2 bucket for temporary file storage
- [ ] Implement `/upload` endpoint with file validation
- [ ] Add file type detection and text extraction
  - .txt: direct read
  - .docx: use `mammoth` or similar
  - .pdf: use `pdf-parse` or similar (may need external service)
- [ ] Wire up file upload UI in client
- [ ] Clean up R2 files after processing (TTL or immediate delete)

### Phase 5: Polish
**Goal**: Production-ready POC

- [ ] Error handling (API failures, timeouts, invalid input)
- [ ] Input validation (character limits, empty text)
- [ ] Rate limiting (per CF Access identity)
- [ ] Analytics events (evaluation started, completed, downloaded)
- [ ] Loading skeletons and micro-interactions
- [ ] Mobile-responsive design
- [ ] Copy for landing page and criteria explanations

---

## Data Models

### Scorecard (D1 Schema)

```sql
CREATE TABLE scorecards (
  id TEXT PRIMARY KEY,              -- nanoid
  created_at INTEGER NOT NULL,      -- Unix timestamp

  -- Input
  title TEXT,                       -- Extracted or user-provided
  input_text TEXT NOT NULL,         -- Original submitted text (for results display)
  text_hash TEXT NOT NULL,          -- SHA-256 for deduplication/caching
  word_count INTEGER NOT NULL,

  -- Scores (stored as integers * 10 for precision, e.g., 6.5 → 65)
  overall_score INTEGER NOT NULL,           -- Calibrated average

  -- Provisional scores (from LLM, 0-100 scale)
  clarity_provisional INTEGER NOT NULL,
  simplexity_provisional INTEGER NOT NULL,
  error_correction_provisional INTEGER NOT NULL,
  unity_scope_provisional INTEGER NOT NULL,
  pragmatic_return_provisional INTEGER NOT NULL,

  -- Calibrated scores (provisional - 15, min 0)
  clarity_score INTEGER NOT NULL,
  simplexity_score INTEGER NOT NULL,
  error_correction_score INTEGER NOT NULL,
  unity_scope_score INTEGER NOT NULL,
  pragmatic_return_score INTEGER NOT NULL,

  -- Notes
  clarity_note TEXT,
  simplexity_note TEXT,
  error_correction_note TEXT,
  unity_scope_note TEXT,
  pragmatic_return_note TEXT,

  -- Summary
  summary TEXT NOT NULL,

  -- Metadata
  model_used TEXT NOT NULL,         -- e.g., "claude-sonnet-4-5-20241022"
  processing_time_ms INTEGER,
  cf_access_identity TEXT           -- For future user association
);

CREATE INDEX idx_scorecards_created_at ON scorecards(created_at);
CREATE INDEX idx_scorecards_text_hash ON scorecards(text_hash);
```

### Worker Environment Types

```typescript
// apps/api/src/types/env.ts

export interface Env {
  // Bindings
  DB: D1Database;
  UPLOADS: R2Bucket;
  STREAM_SESSION: DurableObjectNamespace;

  // Environment variables
  ENVIRONMENT: 'development' | 'production';

  // Secrets
  ANTHROPIC_API_KEY: string;
  CF_ACCESS_TEAM_DOMAIN: string;  // e.g., "myteam.cloudflareaccess.com"
  CF_ACCESS_AUD: string;          // Application Audience tag
}
```

### TypeScript Types (shared package)

```typescript
// packages/shared/src/types.ts

export const CRITERIA = [
  'clarity',
  'simplexity',
  'errorCorrection',
  'unityScope',
  'pragmaticReturn'
] as const;

export type Criterion = typeof CRITERIA[number];

export interface CriterionScore {
  criterion: Criterion;
  provisionalScore: number;  // 0-10, from LLM
  calibratedScore: number;   // max(0, provisional - 1.5)
  note: string;
}

export interface Scorecard {
  id: string;
  createdAt: Date;
  title: string;
  inputText: string;         // Original submitted text
  wordCount: number;
  overallScore: number;      // Average of calibrated scores
  scores: CriterionScore[];
  summary: string;
  modelUsed: string;
  processingTimeMs: number;
}

export interface EvaluationRequest {
  text: string;
  title?: string;            // Optional, will be inferred from text if not provided
}

// For updating title after evaluation
export interface UpdateScorecardRequest {
  title: string;             // User can rename the inferred title
}

export interface EvaluationStreamEvent {
  type: 'score' | 'summary' | 'complete' | 'error';
  data: Partial<CriterionScore> | string | Scorecard | { message: string };
}

// Error response schema for consistent API error handling
export interface ApiError {
  error: string;           // Human-readable error message
  code: ApiErrorCode;      // Machine-readable error code
  details?: unknown;       // Optional additional context
  requestId?: string;      // For debugging/support
}

export type ApiErrorCode =
  | 'VALIDATION_ERROR'     // Invalid input (400)
  | 'TEXT_TOO_SHORT'       // Text below minimum length (400)
  | 'TEXT_TOO_LONG'        // Text exceeds maximum length (400)
  | 'UNAUTHORIZED'         // Missing or invalid auth (401)
  | 'FORBIDDEN'            // Valid auth but not permitted (403)
  | 'NOT_FOUND'            // Resource not found (404)
  | 'RATE_LIMITED'         // Too many requests (429)
  | 'AI_SERVICE_ERROR'     // Anthropic API error (502)
  | 'AI_TIMEOUT'           // Anthropic API timeout (504)
  | 'INTERNAL_ERROR';      // Unexpected server error (500)

// Zod schema for validation (used in API)
// packages/shared/src/validation.ts
import { z } from 'zod';

export const evaluationRequestSchema = z.object({
  text: z.string()
    .min(100, 'Text must be at least 100 characters')
    .max(50000, 'Text must not exceed 50,000 characters'),
  title: z.string().max(200).optional(),
});

export const apiErrorSchema = z.object({
  error: z.string(),
  code: z.enum([
    'VALIDATION_ERROR',
    'TEXT_TOO_SHORT',
    'TEXT_TOO_LONG',
    'UNAUTHORIZED',
    'FORBIDDEN',
    'NOT_FOUND',
    'RATE_LIMITED',
    'AI_SERVICE_ERROR',
    'AI_TIMEOUT',
    'INTERNAL_ERROR',
  ]),
  details: z.unknown().optional(),
  requestId: z.string().optional(),
});
```

---

## API Design

### Endpoints

#### `POST /evaluate`
Start a new evaluation with streaming response.

**Request:**
```typescript
{
  text: string;        // Required, max ~5000 words
  title?: string;      // Optional
}
```

**Response:** Server-Sent Events stream
```
event: score
data: {"criterion":"clarity","calibratedScore":6.5,"note":"Clear definitions..."}

event: score
data: {"criterion":"simplexity","calibratedScore":5.0,"note":"Good balance..."}

...

event: summary
data: "This text demonstrates strong conceptual clarity..."

event: complete
data: {"id":"abc123","overallScore":5.8,...}
```

#### `GET /results/:id`
Retrieve a stored evaluation result.

**Response:**
```typescript
{
  scorecard: Scorecard;
}
```

#### `PATCH /results/:id`
Update a scorecard's title (user can rename inferred title).

**Request:**
```typescript
{
  title: string;
}
```

**Response:**
```typescript
{
  scorecard: Scorecard;  // Updated scorecard
}
```

#### `POST /upload`
Upload a file for text extraction.

**Request:** `multipart/form-data` with file field

**Response:**
```typescript
{
  text: string;        // Extracted text
  wordCount: number;
  filename: string;
}
```

---

## Streaming Implementation

### Why Durable Objects?

For the POC, Durable Objects provide:

1. **Stream Recovery**: If client disconnects, DO maintains state. Client can reconnect and resume.
2. **Deduplication**: Same text submitted twice can return cached result from DO.
3. **Metrics**: Track active evaluations, processing times per session.

### Stream Flow

```
Client                    API Worker                 Durable Object              Anthropic
  │                           │                            │                         │
  │ POST /evaluate            │                            │                         │
  │──────────────────────────▶│                            │                         │
  │                           │ Create/get session         │                         │
  │                           │───────────────────────────▶│                         │
  │                           │                            │                         │
  │                           │ Session ID                 │                         │
  │                           │◀───────────────────────────│                         │
  │                           │                            │                         │
  │                           │ streamText()               │                         │
  │                           │────────────────────────────┼────────────────────────▶│
  │                           │                            │                         │
  │ SSE: event:score          │◀───────────────────────────┼─────────────────────────│
  │◀──────────────────────────│                            │                         │
  │                           │ Store partial state        │                         │
  │                           │───────────────────────────▶│                         │
  │                           │                            │                         │
  │ SSE: event:complete       │                            │                         │
  │◀──────────────────────────│                            │                         │
  │                           │                            │                         │
```

### AI SDK 6 Integration

#### Phase 1: Non-Streaming (Simple)

```typescript
// apps/api/src/services/scoring.ts
import { generateObject } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { scorecardResponseSchema } from '@fast/shared';
import { calibrateScore } from './calibration';
import { SCORING_PROMPT } from './prompts';

export async function evaluateText(text: string, title?: string) {
  const { object } = await generateObject({
    model: anthropic('claude-sonnet-4-5-20241022'),
    system: SCORING_PROMPT,
    prompt: `Evaluate the following text:\n\n${title ? `Title: ${title}\n\n` : ''}${text}`,
    schema: scorecardResponseSchema,
  });

  // Apply calibration to each score
  const calibratedScores = object.scores.map((s) => ({
    ...s,
    calibratedScore: calibrateScore(s.provisionalScore),
  }));

  return {
    ...object,
    scores: calibratedScores,
    overallScore: average(calibratedScores.map((s) => s.calibratedScore)),
  };
}
```

#### Phase 2: Streaming with Tool Calls

```typescript
// apps/api/src/services/scoring.ts
import { streamText, tool } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { z } from 'zod';
import { CRITERIA, type Criterion } from '@fast/shared';
import { calibrateScore } from './calibration';

const reportScoreTool = tool({
  description: 'Report a score for a single criterion. Call this once per criterion.',
  parameters: z.object({
    criterion: z.enum(CRITERIA),
    provisionalScore: z.number().min(0).max(10),
    note: z.string().describe('1-2 sentence explanation for THIS text'),
  }),
});

const reportSummaryTool = tool({
  description: 'Report the overall summary after all scores are reported.',
  parameters: z.object({
    title: z.string().describe('Extracted or inferred title'),
    summary: z.string().describe('2-3 sentence overall assessment'),
  }),
});

export async function evaluateTextStreaming(text: string, title?: string) {
  const result = streamText({
    model: anthropic('claude-sonnet-4-5-20241022'),
    system: SCORING_PROMPT_WITH_TOOLS,
    prompt: `Evaluate the following text:\n\n${title ? `Title: ${title}\n\n` : ''}${text}`,
    tools: {
      reportScore: reportScoreTool,
      reportSummary: reportSummaryTool,
    },
    maxSteps: 10, // Allow multiple tool calls (5 scores + 1 summary)
  });

  return result;
}

// apps/api/src/routes/evaluate.ts
import { evaluateTextStreaming } from '../services/scoring';

export async function handleEvaluate(request: Request, env: Env) {
  const { text, title } = await request.json();
  const result = await evaluateTextStreaming(text, title);

  // Stream the response using AI SDK's toDataStreamResponse
  return result.toDataStreamResponse();
}
```

### Client Consumption

#### Phase 1: Non-Streaming

```typescript
// apps/client/src/hooks/useEvaluation.ts
import { useState } from 'react';
import type { Scorecard, ApiError } from '@fast/shared';

export function useEvaluation() {
  const [scorecard, setScorecard] = useState<Scorecard | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const evaluate = async (text: string, title?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, title }),
      });

      if (!response.ok) {
        const err: ApiError = await response.json();
        setError(err);
        return;
      }

      const result: Scorecard = await response.json();
      setScorecard(result);
    } catch (e) {
      setError({ error: 'Network error', code: 'INTERNAL_ERROR' });
    } finally {
      setIsLoading(false);
    }
  };

  return { evaluate, scorecard, isLoading, error };
}
```

#### Phase 2: Streaming with Tool Calls

```typescript
// apps/client/src/hooks/useEvaluation.ts
import { useChat } from '@ai-sdk/react';
import { useMemo } from 'react';
import type { CriterionScore } from '@fast/shared';
import { calibrateScore } from '@fast/shared';

export function useEvaluation() {
  const { messages, isLoading, error, append } = useChat({
    api: '/api/evaluate',
  });

  // Extract scores from tool invocations as they stream in
  const partialScores = useMemo(() => {
    const scores: CriterionScore[] = [];
    let title = '';
    let summary = '';

    for (const message of messages) {
      if (message.role !== 'assistant') continue;

      for (const part of message.toolInvocations ?? []) {
        if (part.toolName === 'reportScore' && part.state === 'result') {
          const { criterion, provisionalScore, note } = part.args;
          scores.push({
            criterion,
            provisionalScore,
            calibratedScore: calibrateScore(provisionalScore),
            note,
          });
        }
        if (part.toolName === 'reportSummary' && part.state === 'result') {
          title = part.args.title;
          summary = part.args.summary;
        }
      }
    }

    return { scores, title, summary };
  }, [messages]);

  const evaluate = async (text: string, title?: string) => {
    await append({
      role: 'user',
      content: JSON.stringify({ text, title }),
    });
  };

  const isComplete = partialScores.scores.length === 5 && partialScores.summary;

  return {
    evaluate,
    isLoading,
    error,
    partialScores,
    isComplete,
  };
}
```

---

## Scoring Prompt

```typescript
// apps/api/src/services/prompts.ts

export const SCORING_PROMPT = `You are FAST (Framework for Assessing Systematic Thinking), an expert evaluator of conceptual writing. You assess texts on their ability to communicate complex, cross-disciplinary ideas with precision and utility.

## Your Task
Evaluate the provided text on 5 criteria, providing:
1. A provisional score (0-10) for each criterion
2. A specific note (1 sentence) explaining the score for THIS text
3. A 2-3 sentence overall summary

## The 5 FAST Criteria

### 1. Clarity (0-10)
Precise language, clean definitions, explicit scope. Does the text say exactly what it means? Are terms defined when introduced? Is the boundary of the argument clear?
- 8-10: Every term is precise, definitions are explicit, scope is crystal clear
- 5-7: Mostly clear with occasional ambiguity or undefined terms
- 2-4: Frequent vagueness, key terms undefined or shifting
- 0-1: Unclear what the text is actually claiming

### 2. Simplexity (0-10)
Captures essence while preserving necessary complexity. Does the text find the simplest formulation that doesn't lose important nuance? Does it avoid both over-simplification and unnecessary complexity?
- 8-10: Elegant compression that loses nothing essential
- 5-7: Good balance with minor over/under-simplification
- 2-4: Either too reductive or unnecessarily convoluted
- 0-1: Completely misses the essence or is impenetrably complex

### 3. Error Correction (0-10)
Detects contradictions, acknowledges limitations. Does the text catch its own potential errors? Does it acknowledge where the argument might break down? Does it address counterarguments?
- 8-10: Proactively identifies limitations, handles edge cases, addresses objections
- 5-7: Acknowledges some limitations but misses others
- 2-4: Ignores obvious counterarguments or limitations
- 0-1: Contains unacknowledged contradictions or blind spots

### 4. Unity/Scope (0-10)
High conceptual leverage, wide applicability without vagueness. Does the idea apply broadly while remaining specific enough to be useful? Is there a unifying principle that connects the parts?
- 8-10: Broad applicability with specific mechanisms, strong unifying thread
- 5-7: Good scope with some gaps in applicability or unity
- 2-4: Either too narrow to be useful or too vague to apply
- 0-1: No coherent scope or completely disconnected parts

### 5. Pragmatic Return (0-10)
Operational hooks, concrete implications, testable. Can you DO something with this idea? Are there clear next steps or applications? Could you test whether it's true?
- 8-10: Clear operational implications, testable predictions, actionable
- 5-7: Some practical applications but not fully operationalized
- 2-4: Abstract with few concrete implications
- 0-1: No practical utility, purely speculative

## Output Format

You MUST respond with valid JSON in this exact structure:
{
  "title": "string - extracted or inferred title of the text",
  "scores": [
    {
      "criterion": "clarity",
      "provisionalScore": number,
      "note": "string - specific observation about THIS text"
    },
    {
      "criterion": "simplexity",
      "provisionalScore": number,
      "note": "string"
    },
    {
      "criterion": "errorCorrection",
      "provisionalScore": number,
      "note": "string"
    },
    {
      "criterion": "unityScope",
      "provisionalScore": number,
      "note": "string"
    },
    {
      "criterion": "pragmaticReturn",
      "provisionalScore": number,
      "note": "string"
    }
  ],
  "summary": "string - 2-3 sentence overall assessment"
}

## Scoring Philosophy

You are a TOUGH, discriminating grader. Your scores must reflect genuine quality differences.

**Score Distribution Guidance:**
- **0-2**: Fundamentally broken. Would not recommend reading.
- **3-4**: Below average. Has significant problems in this criterion.
- **5**: Competent. Meets basic expectations, nothing more.
- **6**: Good. Better than most professional writing in this criterion.
- **7**: Very good. Would cite this as a positive example.
- **8**: Excellent. Top 10% of writing you've evaluated.
- **9**: Exceptional. Top 1%. Nearly flawless in this criterion.
- **10**: Perfect. Could not be improved. Reserve for truly extraordinary work.

**Calibration Check:**
Before finalizing each score, ask yourself: "Is this text actually in the top X% for this criterion?" If you're giving a 7, it should genuinely be better than ~85% of conceptual writing. Most professional writing scores 4-6. A text scoring 7+ across all criteria would be publication-worthy in a top-tier venue.

Do not grade on a curve within this single text. Each criterion is evaluated against the full range of conceptual writing you've encountered.`;
```

---

## Deployment Configuration

### Client (`apps/client/wrangler.toml`)

```toml
name = "writing-scorecard"
compatibility_date = "2024-12-01"

[assets]
directory = "./dist"
binding = "ASSETS"

# No routes needed - Workers Static Assets handles SPA routing

[env.production]
name = "writing-scorecard"
```

### API (`apps/api/wrangler.toml`)

```toml
name = "writing-scorecard-api"
main = "src/index.ts"
compatibility_date = "2024-12-01"

# Durable Objects
[durable_objects]
bindings = [
  { name = "STREAM_SESSION", class_name = "StreamSession" }
]

[[migrations]]
tag = "v1"
new_classes = ["StreamSession"]

# D1 Database
[[d1_databases]]
binding = "DB"
database_name = "fast-scorecards"
database_id = "placeholder-will-be-generated"

# R2 Bucket
[[r2_buckets]]
binding = "UPLOADS"
bucket_name = "fast-uploads"

# Environment variables (secrets set via wrangler secret)
[vars]
ENVIRONMENT = "development"

[env.production]
name = "writing-scorecard-api"
[env.production.vars]
ENVIRONMENT = "production"

# Secrets (set via wrangler secret put <NAME>):
# - ANTHROPIC_API_KEY: Your Anthropic API key
# - CF_ACCESS_TEAM_DOMAIN: Your CF Access team domain (e.g., "myteam.cloudflareaccess.com")
# - CF_ACCESS_AUD: The Application Audience tag from CF Access settings
```

### Service Binding (Client → API)

Since both are on Cloudflare, we can use service bindings for faster internal communication:

```toml
# In apps/client/wrangler.toml (if we add a worker for API proxying)
[[services]]
binding = "API"
service = "writing-scorecard-api"
```

However, for the POC with static assets, the client will call the API directly via fetch. We'll configure CORS appropriately or use the same domain with path-based routing.

---

## Cloudflare Access Configuration

### Access Application Setup

1. Create Access Application for `fast.yourdomain.com`
2. Add policy: Allow specific email addresses (beta users)
3. Configure JWT validation in API Worker

### JWT Validation in Worker

```typescript
// apps/api/src/lib/auth.ts
import { Env } from '../types/env';

interface CFAccessJWT {
  email: string;
  sub: string;
  aud: string[];
  exp: number;
  iat: number;
}

interface CFAccessCerts {
  keys: JsonWebKey[];
  public_cert: { kid: string; cert: string }[];
  public_certs: { kid: string; cert: string }[];
}

// Cache for CF Access public keys (refresh every 6 hours)
let cachedKeys: { keys: CryptoKey[]; fetchedAt: number } | null = null;
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

async function getCFAccessPublicKeys(env: Env): Promise<CryptoKey[]> {
  const now = Date.now();
  if (cachedKeys && now - cachedKeys.fetchedAt < CACHE_TTL_MS) {
    return cachedKeys.keys;
  }

  const certsUrl = `https://${env.CF_ACCESS_TEAM_DOMAIN}/cdn-cgi/access/certs`;
  const response = await fetch(certsUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch CF Access certs: ${response.status}`);
  }

  const certs: CFAccessCerts = await response.json();

  // Import all public keys
  const keys = await Promise.all(
    certs.keys.map((jwk) =>
      crypto.subtle.importKey(
        'jwk',
        jwk,
        { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
        false,
        ['verify']
      )
    )
  );

  cachedKeys = { keys, fetchedAt: now };
  return keys;
}

function base64UrlDecode(str: string): Uint8Array {
  // Convert base64url to base64
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(base64 + padding);
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

export async function validateCFAccess(
  request: Request,
  env: Env
): Promise<CFAccessJWT | null> {
  const jwt = request.headers.get('CF-Access-JWT-Assertion');
  if (!jwt) return null;

  try {
    const [headerB64, payloadB64, signatureB64] = jwt.split('.');
    if (!headerB64 || !payloadB64 || !signatureB64) {
      return null;
    }

    // Decode payload
    const payload: CFAccessJWT = JSON.parse(
      new TextDecoder().decode(base64UrlDecode(payloadB64))
    );

    // Check expiration
    if (payload.exp * 1000 < Date.now()) {
      return null;
    }

    // Verify audience matches our Access Application
    if (!payload.aud.includes(env.CF_ACCESS_AUD)) {
      return null;
    }

    // Verify signature against CF Access public keys
    const publicKeys = await getCFAccessPublicKeys(env);
    const signedData = new TextEncoder().encode(`${headerB64}.${payloadB64}`);
    const signature = base64UrlDecode(signatureB64);

    for (const key of publicKeys) {
      const valid = await crypto.subtle.verify(
        'RSASSA-PKCS1-v1_5',
        key,
        signature,
        signedData
      );
      if (valid) {
        return payload;
      }
    }

    return null; // No key matched
  } catch {
    return null;
  }
}
```

**Required Environment Variables:**
- `CF_ACCESS_TEAM_DOMAIN`: Your team domain (e.g., `myteam.cloudflareaccess.com`)
- `CF_ACCESS_AUD`: The Application Audience (AUD) tag from your Access Application settings

---

## Cost Estimates

### Anthropic API (Claude Sonnet 4.5)

| Metric | Estimate |
|--------|----------|
| Input tokens (3000 words + prompt) | ~5,000 tokens |
| Output tokens (scorecard JSON) | ~500 tokens |
| Cost per evaluation | ~$0.02-0.03 |
| 100 evals/day | ~$2-3/day |
| 1000 evals/day | ~$20-30/day |

### Cloudflare

| Service | Free Tier | Paid Estimate |
|---------|-----------|---------------|
| Workers | 100k requests/day | $5/month + $0.50/million |
| D1 | 5M rows read, 100k writes/day | $0.75/million reads |
| R2 | 10GB storage, 10M reads | $0.015/GB storage |
| Durable Objects | 1M requests, 1GB-hr | $0.15/million requests |

**POC Monthly Estimate**: $10-50/month (mostly Anthropic API)

---

## Open Questions & Decisions

### Decided for POC

| Question | Decision | Rationale |
|----------|----------|-----------|
| User accounts? | No - CF Access | Simplifies POC, can add later |
| Store results? | Yes - D1 | Enables downloads, shareable links |
| File uploads? | Phase 4 | Start with paste-only, add files later |
| Model? | Claude Sonnet 4.5 | Balance of quality and cost |

### Now Decided

| Question | Decision | Rationale |
|----------|----------|-----------|
| Domain | `writing-scorecard.cogell.workers.dev` | Workers subdomain for POC |
| PDF generation | Client-side (`@react-pdf/renderer`) | Workers can't run Puppeteer; React components = familiar DX |
| Analytics | Cloudflare Analytics | Built-in, no additional setup |
| Title extraction | Infer from text, allow user rename | Best UX - smart default with override |

---

## Local Development Setup

### Prerequisites

```bash
# Install pnpm if not already installed
npm install -g pnpm

# Install wrangler CLI
pnpm add -g wrangler

# Login to Cloudflare (needed for D1/R2 local persistence)
wrangler login
```

### Initial Setup

```bash
# Clone and install dependencies
cd writingScorecard
pnpm install

# Create local D1 database
cd apps/api
wrangler d1 create fast-scorecards --local
# Copy the database_id to wrangler.toml

# Create local R2 bucket (for file uploads in Phase 4)
wrangler r2 bucket create fast-uploads --local

# Set up environment variables
cp .dev.vars.example .dev.vars
# Edit .dev.vars and add your ANTHROPIC_API_KEY
```

### Environment Variables (`.dev.vars`)

```bash
# apps/api/.dev.vars
ANTHROPIC_API_KEY=sk-ant-...
ENVIRONMENT=development

# For local dev, CF Access validation is skipped
# These are only needed for deployed environments
# CF_ACCESS_TEAM_DOMAIN=yourteam.cloudflareaccess.com
# CF_ACCESS_AUD=your-application-aud-tag
```

### Running Locally

```bash
# Terminal 1: Start the API worker
cd apps/api
pnpm dev
# API runs at http://localhost:8787

# Terminal 2: Start the client
cd apps/client
pnpm dev
# Client runs at http://localhost:5173 (Vite default)
```

### Local Development Notes

1. **D1 Local Mode**: Wrangler automatically creates a local SQLite database at `.wrangler/state/v3/d1/`. Data persists between restarts.

2. **R2 Local Mode**: Files are stored in `.wrangler/state/v3/r2/`.

3. **Durable Objects**: Run automatically in local mode with `wrangler dev`.

4. **CF Access Bypass**: In development, skip JWT validation:
   ```typescript
   // apps/api/src/lib/auth.ts
   export async function validateCFAccess(request: Request, env: Env) {
     if (env.ENVIRONMENT === 'development') {
       return { email: 'dev@local', sub: 'dev-user' } as CFAccessJWT;
     }
     // ... production validation
   }
   ```

5. **Hot Reload**: Both Vite (client) and Wrangler (API) support hot reload.

### Database Migrations

```bash
# Create a new migration
cd apps/api
wrangler d1 migrations create fast-scorecards init

# Edit the generated migration file, then apply:
wrangler d1 migrations apply fast-scorecards --local   # Local
wrangler d1 migrations apply fast-scorecards --remote  # Production
```

### Testing Against Production

```bash
# Deploy to preview environment
cd apps/api
wrangler deploy --env preview

cd apps/client
wrangler deploy --env preview

# Access at: https://fast-api.yoursubdomain.workers.dev (preview)
```

### Debugging

```bash
# View API logs in real-time
wrangler tail writing-scorecard-api

# Inspect local D1 database
wrangler d1 execute fast-scorecards --local --command "SELECT * FROM scorecards LIMIT 10"

# Check R2 bucket contents
wrangler r2 object list fast-uploads --local
```

---

## Next Steps

1. **Validate this plan** - Review with stakeholder, clarify open questions
2. **Set up monorepo** - Initialize pnpm workspace, configure TypeScript
3. **Spike AI SDK** - Test Claude integration locally before full build
4. **Build Phase 1** - Core flow without streaming
5. **Deploy** - Get something live behind CF Access
6. **Iterate** - Add streaming, persistence, polish

---

## Appendix: Alternative Architectures Considered

### Option A: Vercel + Cloudflare Hybrid
- **Pros**: Native AI SDK SSE support, simpler streaming
- **Cons**: Split infrastructure, egress costs, complexity

### Option B: Workers without Durable Objects
- **Pros**: Simpler, fewer moving parts
- **Cons**: No stream recovery, harder to track active sessions

### Option C: Queue-based (Cloudflare Queues)
- **Pros**: Better for long-running jobs, retry logic
- **Cons**: Overkill for <2min evaluations, worse UX (polling)

**Selected**: Option B for Phase 1, add Durable Objects in Phase 2 if needed.
