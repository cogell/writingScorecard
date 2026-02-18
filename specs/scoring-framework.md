# Scoring Framework

[Back to Index](./index.md)

---

## Rubric Source

The scoring rubric is derived from the **FAST Instructions v1.0** (`tmp/FAST_Instructions_Complete_v1.0.md`). The system prompt includes the full rubric text — Primary rubrics (10-point tables), Secondary rubrics (score-range bands), Tertiary anchors (6-point tables), and Supporting Considerations (what to measure, signals to reward/penalize) — for each of the 5 criteria.

---

## The 5 FAST Criteria

### 1. Clarity (0-10)

**Precision in language, clean definitions, sharp reasoning.**

| Score | Description |
|-------|-------------|
| 1 | Opaque; key terms undefined; reader cannot track claims. |
| 3 | Basic thesis present; definitions partial; reasoning often implied not stated. |
| 5 | Clear in parts; definitions workable; some leaps; occasional equivocation. |
| 7 | Clear and disciplined; minimal ambiguity; good signposting and scope control. |
| 9 | Near-formal clarity; tight premises; crisp distinctions; anticipates misreadings. |
| 10 | Exemplary clarity; reader can restate claims, tests, and implications without loss. |

### 2. Simplexity (0-10)

**Captures essence without reduction; releases complexity without deleting it.**

| Score | Description |
|-------|-------------|
| 1 | Either trivializes (reductive) or drowns in complexity with no compression. |
| 3 | Some compression attempts but loses important nuance or adds needless machinery. |
| 5 | Balanced in segments; uneven; some elegant compressions, some clutter. |
| 7 | Strong "say more with less"; complexity preserved via structure, not bulk. |
| 9 | Striking simplexity; minimal core yields broad explanatory reach without strain. |
| 10 | Master-level simplexity; the core feels inevitable and generative across contexts. |

### 3. Error Correction (0-10)

**Corrects errors within/across disciplines; checks contradictions; self-repair.**

| Score | Description |
|-------|-------------|
| 1 | No error sensitivity; contradictions and category mistakes unnoticed. |
| 3 | Identifies some possible confusions; little repair method or adjudication. |
| 5 | Some internal checking; limited cross-domain reconciliation; mixed success. |
| 7 | Strong cross-checking; actively prevents category errors; makes falsifiable distinctions. |
| 9 | Systematic error-correction engine; stress-tests claims; updates definitions when needed. |
| 10 | Exemplary: turns conflicts into refined structure; produces reliable cross-domain clarity. |

### 4. Unity (0-10)

**Expands capacity to say more with less; integrates without flattening.**

| Score | Description |
|-------|-------------|
| 1 | Fragmented; ideas don't cohere; no consistent framework. |
| 3 | Some linking language; framework inconsistent or ad hoc. |
| 5 | Moderate unity; a core frame exists; integration limited to nearby topics. |
| 7 | Strong unification across multiple regions; preserves differences and levels. |
| 9 | Near-architectonic unity; minimal primitives generate wide coverage; low redundancy. |
| 10 | Exceptional unity; the framework becomes a reusable lens with disciplined scope. |

### 5. Pragmatic / Experience (0-10)

**Returns to lived experience; "contact" is part of proof.**

| Score | Description |
|-------|-------------|
| 1 | No experiential anchor; purely rhetorical or definitional closure. |
| 3 | Some examples; weak operationalization; reader can't test claims in life. |
| 5 | Mixed: some "contact" moments; other parts drift into abstraction-only proof. |
| 7 | Strong contact: phenomenology, cases, or operational tests constrain claims. |
| 9 | Contact-rich and disciplined; experiential method + conceptual structure reinforce. |
| 10 | Exemplary pragmatic proof: claims are inseparable from demonstrable contact conditions. |

---

## Scoring Philosophy

The LLM is instructed to be a **tough, discriminating grader**. Scores reflect genuine quality differences, not encouragement.

### Score distribution guidance

| Score | Meaning | Frequency |
|-------|---------|-----------|
| 0-2 | Fundamentally broken. Would not recommend reading. | Rare (worst texts) |
| 3-4 | Below average. Significant problems in this criterion. | Common for first drafts |
| 5 | Competent. Meets basic expectations, nothing more. | Most professional writing |
| 6 | Good. Better than most professional writing. | Above average |
| 7 | Very good. Would cite as a positive example. | Top ~15% |
| 8 | Excellent. Top 10% of writing evaluated. | Uncommon |
| 9 | Exceptional. Top 1%. Nearly flawless. | Very rare |
| 10 | Perfect. Could not be improved. | Reserved for extraordinary work |

### Calibration approach

There is **no mechanical calibration offset**. The rich FAST v1.0 rubric — with Primary, Secondary, Tertiary, and Supporting Considerations per criterion — provides sufficient anchoring for discriminating scores. The system prompt includes aggressive scoring guidance and a calibration self-check:

> Before finalizing each score, ask yourself: "Is this text actually in the top X% for this criterion?" If giving a 7, it should genuinely be better than ~85% of conceptual writing. Each criterion is evaluated against the full range of conceptual writing, not curved within the single text.

### Overall score

The overall score is the **arithmetic mean** of the 5 scores, rounded to 1 decimal place.

```
overallScore = round(sum(scores) / 5, 1)
```

---

## Required Internal Workflow

The system prompt instructs the LLM to follow this analysis sequence before producing scores:

1. **Identify:** core thesis (1-2 sentences), key terms doing conceptual work (3-10), implied premises (what must be true for the claims to hold)
2. **Score** each criterion using the FAST rubrics
3. **Justify** each score with text-evidence (missing definition, equivocation, scope jump, metaphor-as-proof, category error, etc.)
4. **Produce** per-criterion evaluation and suggestion

To ensure this analysis actually happens (rather than being skipped in structured output mode), the output schema includes `coreThesis` and `keyTerms` fields that the LLM must populate before scores. This "show your work" approach guarantees grounded scoring.

---

## Diagnostics

### Context sufficiency flag

If the excerpt is too short or fragmentary to judge Unity or Error Correction across the full argument, the evaluator flags:

- `contextSufficiency`: `low` | `medium` | `high`

### Rhetoric risk diagnostic

Before finalizing Pragmatic / Experience, the evaluator checks for: definitional closure, premise-control, insulation from falsification, intensity substituting for discrimination.

- `rhetoricRisk`: `low` | `medium` | `high`

---

## Color Coding

Scores are color-coded in the UI to provide immediate visual feedback:

| Score | Color | Tailwind Class | Meaning |
|-------|-------|----------------|---------|
| 7.0+ | Emerald | `text-emerald-600` | Very good to exceptional |
| 5.0 - 6.9 | Green | `text-emerald-500` | Competent to good |
| 3.0 - 4.9 | Amber | `text-amber-600` | Below average |
| < 3.0 | Red | `text-red-600` | Poor |

The overall score box uses matching background tints (e.g., `bg-emerald-100` for scores >= 7).

---

## Transparency

Additional metadata displayed on the scorecard:
- Model used (e.g., `claude-haiku-4-5`)
- Processing time in seconds
- Cost in USD
- Input/output token counts
- Context sufficiency level
- Rhetoric risk level
