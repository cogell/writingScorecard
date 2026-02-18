# Spec-Driven Development

## The idea

Specs are the source of truth for what the system is and should be. Plans are scratch work for figuring out what to spec. Beads are the work to close the gap between specs and reality.

## Workflow

### Small features (no exploration needed)

1. **Update specs** -- add the feature to the relevant spec files
2. **Create beads** from the gap between current state and spec
3. **Build**
4. **Adjust specs if needed** -- minor corrections if implementation diverged

### Large features (need to think it through)

1. **Explore in a plan** -- write `plans/<feature>.md` as a single place to think holistically. Iterate, reject ideas, work through tradeoffs. This is scratch work.
2. **Distribute into specs** -- once the design stabilizes, update the relevant spec files with the decisions. The plan's job is done here.
3. **Create beads** from the spec diffs
4. **Build**
5. **Adjust specs if needed**

The plan sticks around as a record of *why* decisions were made. The specs are the record of *what* was decided.

### How to know which path

If you can describe the feature in spec language without needing to weigh alternatives or work through unknowns, go direct to specs. If you find yourself writing "option A vs option B" or "need to figure out...", start with a plan.

## Reviewing feature work

When a feature touches multiple spec files, review the changes as a group:

```bash
# See all spec changes on your branch
git diff main -- specs/

# Or for a specific feature's changes
git log --oneline --all -- specs/
```

The plan file (if one exists) provides the narrative context. The spec diffs show exactly what's changing in the system.

## Specs structure

```
specs/
  index.md              # Table of contents, key concepts glossary
  product-overview.md   # What, who, why, principles
  scoring-framework.md  # Criteria, rubrics, calibration
  user-experience.md    # Screens, flows, states, error handling
  api-reference.md      # Endpoints, formats, error codes
  data-model.md         # Types, schemas, validation, constants
  architecture.md       # Stack, workers, deployment, env vars
  design-system.md      # Visual identity, patterns (refs STYLE_GUIDE.md)
  roadmap.md            # What's shipped, what's planned by phase
```

When adding a feature, you'll typically touch 2-3 of these files. A new API endpoint updates `api-reference.md` and `data-model.md`. A new UI screen updates `user-experience.md` and maybe `design-system.md`.

## Example: adding PDF download

**Small-feature path** (if the design is obvious):
1. Add "PDF Download" section to `user-experience.md`
2. Add `GET /results/:id/pdf` to `api-reference.md`
3. Note `@react-pdf/renderer` in `architecture.md`
4. Create beads from those additions
5. Build

**Large-feature path** (if it needs exploration):
1. Write `plans/pdf-download.md` -- explore library options, layout tradeoffs, whether to render server-side or client-side
2. Settle on an approach
3. Distribute decisions into the same 3 spec files
4. Create beads
5. Build

Same output. The plan just gives you a place to think before committing to spec language.

## Plan lifecycle

Plans are disposable. Once a feature ships and specs are updated, delete the plan.

**Before deleting**, scan it for "why" reasoning that isn't captured in the specs. If the plan contains a non-obvious decision (e.g., "chose SSE over WebSockets because we don't need bidirectional communication"), add it as a brief inline note in the relevant spec. The goal is one sentence, not a paragraph -- just enough that a future reader doesn't re-litigate the decision.

**Then delete the file.** A stale plan that contradicts the current spec is worse than no plan -- it's actively misleading, especially for agents picking up context in a new session. If you ever need the full plan back, it's in git history (`git log -- plans/`).

The `plans/` directory should only contain plans for **in-progress or upcoming work**. If a plan is for something that already shipped, it should be gone.
