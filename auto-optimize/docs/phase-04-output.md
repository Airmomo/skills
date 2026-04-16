# Phase 4: compare, pick best, ship

**R3 (acceptance first; self-score reference): `verifiability.md`.**

## Pre-compare checks (hard)

```
□ Every scheme finished inner loop per phase-03 termination
□ **tracks/phase-01-acceptance.md** exists and **at least one** track’s final artifact has **all items checked** (no final delivery otherwise)
□ Each scheme has a traceable iteration trail (default: headers in each round’s file)
□ All schemes still match phase-2 scope
```

**Note**: “Full log” here means the required header fields per round are traceable; **no** separate `.md` log required unless the maintainer says so.

If a scheme gained extra features mid-loop:

- Ignore extras in scoring, or mark **not comparable** and exclude.

## Defining “best”

**Precondition**: only among tracks where **`tracks/phase-01-acceptance.md`** is **fully checked** (**R3**). **No track fully checked** → **no** final delivery.

**Best code** and **best Prompt** among passing tracks (priority order):

```
1. Final self-score (highest weight; relative only)
   - Among **acceptance-passing** schemes, highest score wins code
   - That scheme’s Prompt is the best Prompt candidate

2. Start score (if final scores are close)
   - Higher start → Prompt easier to land v1

3. Delta (if start and end are close)
   - Larger improvement → more room to iterate

4. Stability (if still close)
   - Fewer drops across rounds → more reliable
```

## Selection policy

**`verifiability.md` R3.** Summary:

```
At least one track fully checked → among those, pick highest self-score; output code + Prompt
No track fully checked → gate fails; no “winning” final delivery
```

## When no track passes acceptance (hard)

**`verifiability.md` R3.**

Typical causes: acceptance too strict, phase 1 unclear, or inner loop stopped too early.

**If every track fails full acceptance:**

```
□ Do not declare a “best” and ship final
□ Must tell the user:
  1. Which acceptance lines fail per track (vs phase-01-acceptance.md)
  2. How self-scores relate to gaps (explanatory only)
  3. Suggest: relax/split items, add checkable conditions, or iterate more
  4. Ask whether to adjust phase 1 or continue
```

## Analysis output

```
Prompt optimization analysis:
  Best scheme: [id]
  Dimension: [1–5]
  Best score: X/10
  Worst scheme: [id]
  Worst score: Y/10

  Why best beats original:
  - [diff 1]
  - [diff 2]

  Suggestions:
  - Original was missing [X]; adding it helps ~Z%
  - Effective pattern: […]
```

---

## Final output format

After the double-layer run, output to the user:

**Do not regenerate**—select from existing work:

- **Best Prompt** = under **R3** (≥1 track fully checked), among those the **highest self-score** Prompt **verbatim**; if **no** track fully checked, **do not** label as shippable “best”—see “no track passes” above.
- **Best code** = same track’s **final** inner-loop file when termination was legal (acceptance green + `phase-03-inner.md`).

**Delivery vs final file, “verified / same”**: **`verifiability.md` R2, R4, R5**.

```markdown
## Optimization result

**Final score**: X/10 (baseline Y/10, +Z%)
**Delivery source**: tracks/prompt-{id}/r{round}.{ext}
**Consistency note** (R4): class A — attach command + output; class B — “please run locally” and do not claim you verified for the user

### Best Prompt

[Verbatim Prompt of the winning scheme]

### Final artifact

[Verbatim final file from inner loop]
[If delivery file differs from track file, state how]

### Prompt improvement notes

[Why this phrasing beat the original]
[How to describe similar asks next time]
```
