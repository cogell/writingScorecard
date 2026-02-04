# FAST Writing Scorecard - Specifications

> **FAST** = Framework for Assessing Systematic Thinking

A web application that evaluates conceptual writing on 5 criteria and produces a standardized scorecard. Built for writers working on cross-disciplinary, high-level conceptual content.

---

## Documents

| Document | Description |
|----------|-------------|
| [Product Overview](./product-overview.md) | What the app is, who it's for, core philosophy, and success criteria |
| [Scoring Framework](./scoring-framework.md) | The 5 FAST criteria, scoring rubrics, calibration formula, and grading philosophy |
| [User Experience](./user-experience.md) | Complete user flow, screen layouts, interaction states, and error handling |
| [API Reference](./api-reference.md) | Endpoints, request/response formats, error codes, and CORS behavior |
| [Data Model](./data-model.md) | TypeScript types, Zod validation schemas, and shared constants |
| [Architecture](./architecture.md) | Monorepo structure, tech stack, worker topology, service bindings, and deployment pipeline |
| [Design System](./design-system.md) | Visual identity, color palette, typography, component patterns (references STYLE_GUIDE.md) |
| [Roadmap](./roadmap.md) | Implementation phases, what's shipped, and what's planned |

---

## Key Concepts (Quick Reference)

- **Scorecard**: The output artifact. Contains 5 criterion scores, an overall score, and a summary.
- **Calibration**: All LLM-generated scores are adjusted by `-1.5` before display to ensure high scores are rare and meaningful.
- **Criteria**: Clarity, Simplexity, Error Correction, Unity/Scope, Pragmatic Return.
- **Overall Score**: Average of the 5 calibrated scores, rounded to 1 decimal place.
- **Provisional vs. Calibrated**: The LLM outputs provisional scores (0-10). The system applies calibration (`max(0, provisional - 1.5)`) to produce calibrated scores shown to the user.
- **Authentication**: Magic-link email sign-in via BetterAuth. Users must authenticate before accessing the evaluation API.

## Related Files

- [`STYLE_GUIDE.md`](../STYLE_GUIDE.md) - Full design system with CSS variables and component patterns
- [`plans/prd.md`](../plans/prd.md) - Original product requirements document
- [`plans/poc-plan.md`](../plans/poc-plan.md) - Implementation roadmap
- [`plans/one-worker.md`](../plans/one-worker.md) - Worker consolidation strategy
