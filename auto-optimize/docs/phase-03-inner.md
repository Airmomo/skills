# Phase 3: inner layer — iterate artifacts per Prompt

**R1–R5: see `verifiability.md` (sole authority).**

## Core idea

**Prompt fixed; code/docs change.** Inner loop does not care how the Prompt was produced—only how good the artifact gets.

## Physical artifacts (phase 3 details)

**R1, R2, R4, R5 in `verifiability.md`.** Phase-specific extras:

```
□ Naming: tracks/prompt-{id}/r{round}.{ext}
  e.g. tracks/prompt-a/r01.html, tracks/prompt-a/r02.html

□ Each file header (HTML or language comment) must include:
  - Scheme id
  - Round number
  - Single change this round (one sentence)
  - This round’s score (by dimension)
  - Biggest issue from last round (one sentence)

□ Files must diff cleanly:
  - Diff between consecutive rounds should reflect **only** the stated single change
  - If multiple areas changed, this round’s score is invalid—revert and redo

□ If there is a separate “delivery file” (e.g. root index.html): must satisfy R2; verification R4/R5.
```

## Iteration flow

```
Round 1: generate first version (“works” not “perfect”)
  → Check against tracks/phase-01-acceptance.md (verify what you can)
  → Score (round 1 cap 7; reference only)
  → Log

Round 2+:
  → Prefer turning unchecked acceptance items into checked (still “one change per round”; split across rounds if needed)
  → Re-check acceptance
  → Re-score (reference)
  → If score up → keep (if conflict, acceptance wins)
  → If score down → revert
  → Log

Termination (one track; stop when any holds):

  **① Main — hard gate** — **`tracks/phase-01-acceptance.md`** all items checked (`- [x]` or equivalent), traceably verified.
  **② Cap** — **5** rounds max; if still not all checked → **cannot** treat this track as final-delivery source; phase 4 lists gaps.
  **③ Reference only** — self-score trends **must not** replace ① (e.g. “≥8” alone cannot end the loop).
```

**Note**: self-score bias; **acceptance locked in phase 1** reduces goalpost moving. Independent judges later would still use the checklist as a floor.

## Score objectivity (hard rules)

> Same model as author and grader → inflated scores; **acceptance checklist** is the real bar.

**Rule 1: score by dimension with concrete deductions**

```
Score: 6.5/10
- Correctness (x/x): …
- Presentation (x/x): …
- Code quality (x/x): …
- Robustness (x/x): …
- Maintainability (x/x): …
```

**Invalid scoring:**

- “Feels good, 8/10”
- “Feature complete, good code, 8.5” with no deductions

**Rule 2: round 1 score cap 7**

First version is “rough”; there should always be room to improve.

**Rule 3: before/after each round**

```
Before:
  Biggest issue: …
  Plan: …
  Score before: 6.5/10
  Expectation: …

After:
  Score after: 7.8/10
  Delta: +1.3
  Decision: keep
```

**Rule 4: no self-rationalization**

- “First version is good enough” → not allowed
- “Feature X not in spec” → if it’s in the spec list, it’s required

## Rubric — code (0–10)

| Dimension | Weight | Checks |
|-----------|--------|--------|
| Correctness | 25% | Core paths, edges, no obvious bugs |
| Presentation | 25% | Hierarchy, rhythm, style fit, feedback |
| Code quality | 20% | Structure, DRY, names, deps |
| Robustness | 15% | Errors, validation, a11y, resources |
| Maintainability | 15% | Tokens/CSS vars, modularity, extensibility |

**Anti-drift:**

```
□ “Biggest issue” each round must come from the lowest-scoring dimension (or tie)
□ No more than 2 consecutive rounds changing the **same** dimension only
□ High scores on one dimension cannot hide a failing dimension
```

## Rubric — docs / plans (0–10)

| Dimension | Weight | Checks |
|-----------|--------|--------|
| Completeness | 40% | Answers the question, all key points |
| Accuracy | 30% | Sound arguments, no major errors |
| Clarity | 20% | Structure, concise |
| Actionability | 10% | Next steps, decisions |

## Other inner rules

- One change per round; three changes → three rounds
- Below 6/10, don’t chase “elegance”—fix correctness first
- Every round must have a score
- “Could be better” is not a change—name the concrete change
- Max **5** rounds per track

## Per-scheme summary output

```
Scheme: [id or short name]
Dimension: [1–5]
Final score: X/10
Rounds: N
Start score: Y/10
Key changes: [2–3 best]
Log:
  1: Y → [change] → Z
  2: Z → [change] → W
  …
```

## Gates

```
□ tracks/phase-01-acceptance.md exists (phase-01-spec.md)
□ Each scheme at least 2 rounds
□ Claiming “deliverable” for a track → that track’s acceptance all checked (①)
□ Each round has a traceable dimensional score (reference; R3)
□ Each round has a file tracks/prompt-{id}/r{round}.{ext} (R1)
□ Consecutive diffs match the stated single change
□ Missing files or invalid diffs → that scheme’s iteration is invalid
```
