# Product Requirements Document: FAST v1.0

## Quick Context

Web app that scores conceptual writing on 5 criteria (Clarity, Simplexity, Error Correction, Unity/Scope, Pragmatic Return) and outputs standardized scorecard. Target: writers working on cross-disciplinary/high-level conceptual content.

---

## 1. Core User Flow

**Input → Process → Output**

1. User pastes/uploads text 
2. System processes via LLM 
3. User receives standardized scorecard 

**Scorecard format (required):**

```
Title - [Overall Score]

Clarity — [score] | [specific note on this text]
Simplexity — [score] | [specific note]
Error Correction — [score] | [specific note]
Unity/Scope — [score] | [specific note]
Pragmatic Return — [score] | [specific note]

Summary: [2-3 sentence assessment]

```

---

## 2. Technical Requirements

### Scoring Engine

- **Model**: Claude Sonnet 4.5 via Anthropic API ?
- **Calibration rule**: `Calibrated Score = max(0, Provisional Score - 1.5)`
    - System must ALWAYS apply this before displaying
    - Only show calibrated scores to user
- **Score range**: 0-10 (after calibration, practical range 0-8.5)
- **Consistency**: Same text should score within ±0.5 on repeat evaluations

### Input Constraints

- Text only (no formatting preservation needed for MVP)
- Character limit: ~5000 words (engineering: determine token implications)
- Accepted formats: Paste, .txt, .docx, .pdf upload

### Output Requirements

- Display format: Exactly as shown above (scores left, notes right, summary below)
- Downloadable as: PDF, plain text
- **Engineering Q**: Should we store results? If yes, for how long?
- ❌ No Chat post score

---

## 3. Key Features (MVP)

✅ **Must Have:**

- Single text submission
- 5-criteria scoring with calibration
- Standardized scorecard output
- Download results
- Basic error handling (text too long, API failure)

🔄 **Engineering to Validate:**

- Processing time estimate (target <2 min)
- Rate limiting strategy (cost per evaluation? subscription? credits?)
- Authentication (email/password vs. magic link vs. OAuth)

❌ **Explicitly Not MVP:**

- Batch processing
- History/comparison of past submissions
- Custom rubric adjustments
- Collaborative features

## 3.1 Post MVP

- User accounts
- Stripe for $$

---

## 4. User Experience Priorities

**Primary goal**: User gets reliable, actionable feedback on conceptual coherence

**UX principles**:

- Dead simple input (minimize friction to first score)
- Transparency about what's being evaluated (link to criteria definitions)
- Clear "this is an instrument, not a grade" framing

**Copy/messaging must emphasize**:

- FAST measures disciplined abstraction, not writing style
- Scores are calibrated conservative (high score = genuinely strong)
- Designed for cross-disciplinary conceptual work

---

## 5. Success Metrics

**Launch criteria**:

- 90% of submissions complete in <2 min
- Score consistency: ±0.5 on identical text resubmissions
- 5 beta users successfully evaluate 3+ texts each
- 5 Anthology contributors use it and say it was helpful

**Post-launch (month 1)**:

- User submits 2+ texts (indicates utility)
- User downloads results (indicates value)
- **Engineering**: What analytics should we track? (submission volume, avg text length, processing time, errors?)

---

## 6. Engineering Handoff Checklist

**What I need from you:**

1. **Architecture decisions**:
    - [ ]  Frontend framework recommendation (leaning Next.js?)
    - [ ]  Database: Do we need one for MVP? (if storing results)
    - [ ]  Hosting/deployment strategy (Vercel?)
2. **Cost/feasibility validation**:
    - [ ]  API cost per evaluation (estimate at 3000 words)
    - [ ]  Rate limiting approach (per user? global?)
    - [ ]  Scalability concerns at 100 evals/day? 1000?
3. **Technical risks**:
    - [ ]  What's the failure mode if API is down?
    - [ ]  How do we handle partial responses?
    - [ ]  Security considerations for file uploads?
4. **Implementation estimate**:
    - [ ]  Hours/days for MVP based on above scope?
    - [ ]  What's complex vs. straightforward?
    - [ ]  What are ongoing cost commitments?

---

## 7. Open Questions (for you)

**Product decisions I need input on**:

1. Should MVP include user accounts, or allow anonymous evals?
    - Tradeoff: Accounts = friction vs. Easy monetization later
2. Do we store evaluations on backend, or just let user download?
    - Tradeoff: Storage cost vs. enabling future features/marketing insights
3. What's the right character limit for MVP? (affects cost + UX)
4. How can we generate a mechanism that enrolls people in the community? 
    1. Just email funnel? Scorecard references? Post eval funnel? only if high score, xyz? 

**Technical blockers?**

- Anything here that's way harder than I'm assuming?
- Dependencies I'm missing?

---

## 8. Next Steps

**We can do now**:

- Draft copy for landing page + in-app instructions
- Mockup scorecard output format
- Define criteria descriptions for user-facing docs
- Develop Rubric standardization with Bonnie

**Needs engineering**:

- Validate technical approach (especially API integration + calibration)
- Build prototype
- Recommend specific implementation decisions (auth, storage, hosting)
- Decide model evaluation architecture. single evaluation models? multiple specialized evaluation agents?

**Timeline goal**: Ship to 10 beta users in [TIMEFRAME - engineering to advise]

---

## Appendix: The 5 FAST Criteria (Summary)

Reference for engineering context—these drive the scoring logic.

1. **Clarity**: Precise language, clean definitions, explicit scope
2. **Simplexity**: Captures essence + preserves necessary complexity
3. **Error Correction**: Detects contradictions, acknowledges limitations
4. **Unity/Scope**: High conceptual leverage, wide applicability without vagueness
5. **Pragmatic Return**: Operational hooks, concrete implications, testable

**Scoring philosophy**: Conservative calibration (-1.5) means high scores are rare and meaningful.

---

**Questions for first engineering review?**
