# Product Overview

[Back to Index](./index.md)

---

## What It Is

FAST (Framework for Assessing Systematic Thinking) is a web application that scores conceptual writing on 5 dimensions and returns a standardized scorecard. It uses an LLM (Claude) as the evaluation engine, with the full FAST v1.0 rubric to ensure scores are discriminating and meaningful.

## Who It's For

Writers working on **cross-disciplinary, high-level conceptual content**. The target user is someone producing abstract, disciplinary-agnostic ideas -- not fiction, not marketing copy, not technical documentation. Think: essays on systems thinking, conceptual frameworks, theoretical models, philosophical arguments.

This is explicitly **not** a grammar checker or writing style analyzer. It evaluates the quality of ideas and how well they're communicated.

## Core Philosophy

### "An instrument, not a grade"

FAST is a measurement tool. The framing is deliberate: it tells you how your writing performs on specific dimensions, not whether it's "good" or "bad." A low Pragmatic / Experience score doesn't mean the writing is bad -- it means the ideas don't yet return to lived experience with testable contact.

### Tough, rubric-anchored scoring

The system uses the full FAST v1.0 rubric — with Primary, Secondary, Tertiary, and Supporting Considerations per criterion — to anchor scoring. There is no mechanical calibration offset. Instead, the rich rubric plus aggressive scoring guidance in the system prompt ensure scores are discriminating:
- A **5** indicates competent writing that meets basic expectations
- A **7+** is rare and signals genuinely strong work
- Scoring **7+** across all criteria would be publication-worthy at a top venue

### What FAST measures

FAST measures **disciplined abstraction**, not writing style. The 5 criteria assess:
1. Whether the text says what it means (Clarity)
2. Whether it compresses without losing essentials (Simplexity)
3. Whether it catches its own errors (Error Correction)
4. Whether the ideas integrate without flattening (Unity)
5. Whether the ideas return to lived experience (Pragmatic / Experience)

See [Scoring Framework](./scoring-framework.md) for full rubric details.

## UX Principles

- **Dead simple input** -- minimize friction to first score. Paste text, click evaluate.
- **Transparency** -- show what's being evaluated and how. Display scores, model used, processing cost, and the evaluator's analysis (core thesis, key terms).
- **No chat, no follow-up** -- submit text, get scorecard, done. This is a single-use instrument, not a conversation.

## Success Criteria

### Launch criteria
- 90% of submissions complete in under 2 minutes
- Score consistency: same text scores within +/-0.5 on repeat evaluations
- 5 beta users successfully evaluate 3+ texts each

### Post-launch (month 1)
- Users submit 2+ texts (indicates perceived utility)
- Users download results (indicates perceived value)
- Analytics: submission volume, average text length, processing time, error rates

## What's Explicitly Out of Scope (MVP)

- Batch processing
- History or comparison of past submissions
- Custom rubric adjustments
- Collaborative features
- User accounts (planned post-MVP)
- Payment integration (planned post-MVP)
