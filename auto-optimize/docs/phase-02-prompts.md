# Phase 2: outer layer — multiple Prompt schemes

## Core idea

**Same requirement, different phrasing.** Every Prompt describes the **same product**; only **how** you describe it changes, not **what** you build.

## Five dimensions for “different phrasing”

Pick **3–5** dimensions; produce **one** Prompt scheme per dimension (or as your plan defines).

**Dimension 1: abstraction**

```
L1 one line:     "Build an expense tracker"
L2 + features:   "Build an expense tracker with income/expense, monthly stats, category filter"
L3 + tech:       "Build an expense tracker with … stack Next.js + SQLite …"
L4 + edge cases: "… handle empty input, negatives, insufficient balance …"
```

Compare two adjacent levels (e.g. L1 vs L3).

**Dimension 2: quality emphasis**

```
Brevity: "Minimal code, no over-engineering"
Robustness: "Every edge case and error handled gracefully"
Performance: "Prefer speed and memory"
Maintainability: "Clear structure for future changes"
```

**Dimension 3: example-driven**

```
Abstract: "Add income and expense; monthly stats"
Example-driven: "Input 'lunch 35' → line '-35 lunch'; 'this month' → stats"
```

Coverage levels:

```
Level 1: 1–2 normal I/O examples
Level 2: + main scenarios
Level 3: + edges and errors
```

**Dimension 4: role**

```
"You are a senior engineer with 10 years …"
"You are a PM focused on UX …"
"You are a minimalist (YAGNI) …"
```

**Dimension 5: decomposition**

```
A By feature: sub-prompts for ledger, stats, filter
B By role: user vs admin
C No split: one Prompt for everything
```

## Scheme generation rules

- First scheme = user’s **original** wording (baseline).
- Later schemes = pick different **levels** on different dimensions.
- Every scheme must include **all** features from the spec—no silent scope creep.

## Consistency check (mandatory)

> Common failure: schemes drift in scope, so “better score” means “more features,” not “better phrasing.”

After all schemes exist, **must** run:

**Check:**

```
□ Same feature scope
  Extract feature lists; they must match.
  Bad: A has “generate+polish”, B adds “tone + versioning”.

□ Same tech stack
□ Same output type (SPA, API, …)
□ Same acceptance checklist (if phase-1 file exists)
  All schemes must satisfy the **same** acceptance items; no dropping items per scheme.

□ Differences only in phrasing
  OK: abstraction, examples, role, emphasis
  Not OK: different feature count, stack, or architecture
```

**Must output explicitly:**

```
## Scheme consistency check

Feature list: [all features]
Stack: [technologies]

Scheme 1 features: [...] → match ✓ / mismatch ✗ [note]
Scheme 2 features: [...] → match ✓ / mismatch ✗ [note]
Scheme 3 features: [...] → match ✓ / mismatch ✗ [note]

Result: pass / fail (fixed)
```

**If check fails:**

- Do not enter phase 3.
- Fix schemes against phase 1 spec.
- Re-run until pass.

## Gate

Consistency check **passes**. Otherwise **no** phase 3.

## On-disk record (default)

Besides chat, write the full **Scheme consistency check** block (title, feature list, stack, per-scheme lines, **result**) and the **scheme–dimension table** to **`tracks/phase-02-consistency-check.md`** (or maintainer path), **then** phase 3. Details: **`execution.md`** “Multi-scheme inner independence.”

> **Maintainer-tunable**: defaults can be relaxed in host-specific rules or root `SKILL.md`.
