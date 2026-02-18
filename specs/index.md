# FAST Writing Scorecard - Specifications

> **FAST** = Framework for Assessing Systematic Thinking

A web application that evaluates conceptual writing on 5 criteria and produces a standardized scorecard. Built for writers working on cross-disciplinary, high-level conceptual content.

---

## Documents

| Document | Description |
|----------|-------------|
| [Product Overview](./product-overview.md) | What the app is, who it's for, core philosophy, and success criteria |
| [Scoring Framework](./scoring-framework.md) | The 5 FAST criteria, full FAST v1.0 rubric, scoring philosophy, and diagnostics |
| [User Experience](./user-experience.md) | Complete user flow, screen layouts, interaction states, and error handling |
| [API Reference](./api-reference.md) | Endpoints, request/response formats, error codes, and CORS behavior |
| [Data Model](./data-model.md) | TypeScript types, Zod validation schemas, and shared constants |
| [Architecture](./architecture.md) | Monorepo structure, tech stack, worker topology, service bindings, and deployment pipeline |
| [Design System](./design-system.md) | Visual identity, color palette, typography, component patterns (references STYLE_GUIDE.md) |
| [Roadmap](./roadmap.md) | Implementation phases, what's shipped, and what's planned |

---

## Key Concepts (Quick Reference)

- **Scorecard**: The output artifact. Contains analysis (core thesis, key terms), 5 criterion scores with evaluation + suggestion, diagnostics, and a summary.
- **Criteria**: Clarity, Simplexity, Error Correction, Unity, Pragmatic / Experience.
- **Overall Score**: Arithmetic mean of the 5 scores (0-10), rounded to 1 decimal place. No calibration offset — the rich FAST v1.0 rubric provides sufficient scoring discipline.
- **Analysis fields**: `coreThesis` and `keyTerms` are populated by the LLM before scoring, forcing chain-of-thought analysis in structured output mode.
- **Diagnostics**: `contextSufficiency` (is the excerpt enough to judge?) and `rhetoricRisk` (does the text exhibit "proof without contact"?).
- **Authentication**: Magic-link email sign-in via BetterAuth. Users must authenticate before accessing the evaluation API.

## Related Files

- [`STYLE_GUIDE.md`](../STYLE_GUIDE.md) - Full design system with CSS variables and component patterns
- [`tmp/FAST_Instructions_Complete_v1.0.md`](../tmp/FAST_Instructions_Complete_v1.0.md) - Source rubric document
- [`plans/prd.md`](../plans/prd.md) - Original product requirements document
- [`plans/poc-plan.md`](../plans/poc-plan.md) - Implementation roadmap
- [`plans/one-worker.md`](../plans/one-worker.md) - Worker consolidation strategy
