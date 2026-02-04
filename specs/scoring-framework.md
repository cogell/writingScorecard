# Scoring Framework

[Back to Index](./index.md)

---

## The 5 FAST Criteria

### 1. Clarity (0-10)

**What it measures:** Precise language, clean definitions, explicit scope. Does the text say exactly what it means? Are terms defined when introduced? Is the boundary of the argument clear?

| Score Range | Description |
|-------------|-------------|
| 8-10 | Every term is precise, definitions are explicit, scope is crystal clear |
| 5-7 | Mostly clear with occasional ambiguity or undefined terms |
| 2-4 | Frequent vagueness, key terms undefined or shifting |
| 0-1 | Unclear what the text is actually claiming |

### 2. Simplexity (0-10)

**What it measures:** Captures essence while preserving necessary complexity. Does the text find the simplest formulation that doesn't lose important nuance? Does it avoid both over-simplification and unnecessary complexity?

| Score Range | Description |
|-------------|-------------|
| 8-10 | Elegant compression that loses nothing essential |
| 5-7 | Good balance with minor over/under-simplification |
| 2-4 | Either too reductive or unnecessarily convoluted |
| 0-1 | Completely misses the essence or is impenetrably complex |

### 3. Error Correction (0-10)

**What it measures:** Detects contradictions, acknowledges limitations. Does the text catch its own potential errors? Does it acknowledge where the argument might break down? Does it address counterarguments?

| Score Range | Description |
|-------------|-------------|
| 8-10 | Proactively identifies limitations, handles edge cases, addresses objections |
| 5-7 | Acknowledges some limitations but misses others |
| 2-4 | Ignores obvious counterarguments or limitations |
| 0-1 | Contains unacknowledged contradictions or blind spots |

### 4. Unity/Scope (0-10)

**What it measures:** High conceptual leverage, wide applicability without vagueness. Does the idea apply broadly while remaining specific enough to be useful? Is there a unifying principle that connects the parts?

| Score Range | Description |
|-------------|-------------|
| 8-10 | Broad applicability with specific mechanisms, strong unifying thread |
| 5-7 | Good scope with some gaps in applicability or unity |
| 2-4 | Either too narrow to be useful or too vague to apply |
| 0-1 | No coherent scope or completely disconnected parts |

### 5. Pragmatic Return (0-10)

**What it measures:** Operational hooks, concrete implications, testable predictions. Can you DO something with this idea? Are there clear next steps or applications? Could you test whether it's true?

| Score Range | Description |
|-------------|-------------|
| 8-10 | Clear operational implications, testable predictions, actionable |
| 5-7 | Some practical applications but not fully operationalized |
| 2-4 | Abstract with few concrete implications |
| 0-1 | No practical utility, purely speculative |

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

### Calibration check

Before finalizing each score, the LLM is instructed to ask itself: "Is this text actually in the top X% for this criterion?" If giving a 7, it should genuinely be better than ~85% of conceptual writing. Each criterion is evaluated against the full range of conceptual writing, not curved within the single text.

---

## Calibration

### Formula

```
calibratedScore = max(0, provisionalScore - 1.5)
```

### Why calibrate?

LLMs tend toward generous scoring. The -1.5 offset ensures:
- High scores (7+) are rare and meaningful
- The practical score range after calibration is 0 to 8.5
- A perfect 10 is reserved for truly extraordinary work (requires provisional 10)

### Examples

| Provisional (LLM output) | Calibrated (displayed) | Interpretation |
|---------------------------|------------------------|----------------|
| 10.0 | 8.5 | Exceptional |
| 9.0 | 7.5 | Very good |
| 8.0 | 6.5 | Good |
| 7.0 | 5.5 | Competent |
| 6.0 | 4.5 | Below average |
| 5.0 | 3.5 | Weak |
| 1.5 | 0.0 | Floor (cannot go negative) |
| 0.0 | 0.0 | Floor |

### Overall score

The overall score is the **arithmetic mean** of the 5 calibrated scores, rounded to 1 decimal place.

```
overallScore = round(sum(calibratedScores) / 5, 1)
```

---

## Color Coding

Scores are color-coded in the UI to provide immediate visual feedback:

| Calibrated Score | Color | Tailwind Class | Meaning |
|------------------|-------|----------------|---------|
| 7.0+ | Emerald | `text-emerald-600` | Very good to exceptional |
| 5.0 - 6.9 | Green | `text-emerald-500` | Competent to good |
| 3.0 - 4.9 | Amber | `text-amber-600` | Below average |
| < 3.0 | Red | `text-red-600` | Poor |

The overall score box uses matching background tints (e.g., `bg-emerald-100` for scores >= 7).

---

## Transparency

The scorecard displays both calibrated and provisional scores. Calibrated scores are shown prominently; provisional ("raw") scores appear in smaller text next to each criterion. This transparency lets users understand the calibration system and see the LLM's unmodified assessment alongside the adjusted score.

Additional metadata displayed:
- Model used (e.g., `claude-haiku-4-5`)
- Processing time in seconds
- Cost in USD
- Input/output token counts
