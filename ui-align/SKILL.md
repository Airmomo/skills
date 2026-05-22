---
name: ui-align
description: This skill should be used when the user asks to "align UI with design", "compare design and implementation","fix UI differences", "match design mockup", "sync frontend with HTML design", "make implementation match the design",or provides an HTML design file and asks to compare/align it with project code.Automatically compares an HTML design mockup with frontend implementation code and iteratively fixes differences.
version: 0.1.0
---

# UI Design Alignment

Align frontend implementation code with an HTML design mockup through automated comparison and iterative fixing.

## Required Inputs

Extract from the user's message:

1. **Design file** — Path to an HTML file containing the UI design mockup. Accept any file path the user provides (absolute or relative). May appear as `@path/to/design.html` or as a plain path.
2. **Implementation directory** — Path to the directory containing the frontend implementation code. May be a relative or absolute path. If not explicitly provided, infer from the project structure or ask the user.

If either input is missing or ambiguous, ask the user to clarify before proceeding.

## Core Workflow

Execute the following steps in order. This is a **multi-pass process** — repeat the Compare → Fix → Verify cycle until convergence.

### Pass 1: Analyze Design Spec

1. Read the design HTML file in full.
2. Extract a normalized design specification covering:

| Category      | What to Extract                                                                              |
| ------------- | -------------------------------------------------------------------------------------------- |
| Structure     | DOM hierarchy, semantic elements (`<nav>`, `<section>`, etc.), nesting depth                 |
| Layout        | `display` mode (flex/grid/block), direction, alignment, gap, wrapping                        |
| Spacing       | `padding`, `margin`, `gap` — extract exact values and units                                  |
| Typography    | `font-family`, `font-size`, `font-weight`, `line-height`, `letter-spacing`, `text-transform` |
| Colors        | All color values — `color`, `background`, `border-color` — preserve exact format             |
| Borders       | `border-width`, `border-style`, `border-radius`, `border-color`                              |
| Sizing        | `width`, `height`, `min-*`, `max-*`, overflow behavior                                       |
| Effects       | `box-shadow`, `opacity`, `transition`, `transform`, `backdrop-filter`                        |
| Responsive    | `@media` breakpoints, responsive utility classes                                             |
| Interactivity | `:hover`, `:focus`, `:active` states, `cursor` values                                        |
| CSS Variables | `:root` / `:host` custom properties — names and values                                       |

3. Build a mental model of the design's visual hierarchy: what's the outermost layout, how sections are divided, how components relate to each other.

### Pass 2: Analyze Implementation

1. Scan the implementation directory to locate relevant files. Look for:
   - Component files (`.svelte`, `.vue`, `.jsx`, `.tsx`, `.html`)
   - Stylesheet files (`.css`, `.scss`, `.less`, or `<style>` blocks in components)
   - Tailwind/UnoCSS utility classes in markup
   - CSS-in-JS definitions
   - Theme/token files
2. Identify which file(s) correspond to the design mockup. Match by:
   - File/component names hinting at the same UI area
   - Structural similarity between design HTML and component markup
   - User's explicit direction
3. Read the matched files in full. Extract the same categories as Pass 1 for comparison.

### Pass 3: Compare (Generate Diff Report)

Perform element-by-element comparison between design spec and implementation. For each mismatch, record:

- **Location**: Which element/component/selector
- **Property**: The CSS property or structural attribute
- **Design value**: What the design file specifies
- **Implementation value**: What the implementation currently has
- **Severity**: `structural` (missing/wrong elements), `layout` (flex/grid/spacing), `visual` (colors/typography/effects)

Output the diff report in this format:

```
## Diff Report — Design vs Implementation

### Structural Differences
- [structural] Missing `<nav class="sidebar">` — design has a fixed sidebar, implementation renders it as a top bar
- [structural] Design uses `<section class="hero">` → implementation uses `<div class="hero">`

### Layout Differences
- [layout] `.container` gap: design `24px` → implementation `16px`
- [layout] `.card-grid`: design `grid-template-columns: repeat(3, 1fr)` → implementation `repeat(2, 1fr)`

### Visual Differences
- [visual] `--clay` variable: design `#D97757` → implementation `#D67750`
- [visual] `h1 font-size`: design `36px` → implementation `32px`
```

Prioritize `structural` > `layout` > `visual` — structural issues often cause cascading layout/visual problems.

### Pass 4: Fix

Apply fixes for all identified differences. Follow these rules:

1. **Preserve implementation-specific code** — Never remove event handlers, state management, accessibility attributes, or framework-specific syntax (`{#if}`, `v-if`, `{...props}`).
2. **Make targeted edits** — Edit only the properties that differ. Do not rewrite entire components or stylesheets.
3. **Respect the framework** — Apply fixes in the framework's native pattern:
   - Svelte: edit `<style>` blocks or apply Tailwind classes
   - React/Vue: edit CSS modules, styled-components, or utility classes
   - Plain HTML: edit inline styles or `<style>` blocks
4. **Use exact values from the design** — Copy color values, spacing numbers, and other token values verbatim from the design file. Do not approximate.
5. **Handle CSS variables correctly** — If the design defines `:root` variables, ensure the implementation either uses the same variables or maps equivalent values.
6. **Edit one file at a time** — Complete all fixes in one file before moving to the next.

### Pass 5: Verify (Convergence Check)

After all fixes are applied, re-read the modified files and mentally re-compare with the design spec:

- If **no differences remain** → report success, output a summary of changes made.
- If **differences remain** → loop back to Pass 3 (Compare), but only compare the remaining differences. Apply targeted fixes again.
- If **3 full loops completed** without convergence → stop and output the remaining differences for human review. Some differences may be intentional framework adaptations.

## Output

After the workflow completes, output:

1. **Summary** — Total differences found, how many fixed, how many remain (if any).
2. **Changes Made** — List of files edited and what changed in each.
3. **Remaining Issues** (if any) — Differences that could not be auto-fixed, with explanation.

## Handling Edge Cases

- **Design uses plain HTML, implementation uses components**: Map design elements to component boundaries. A `<div class="card">` in design may correspond to a `<Card>` component — compare the rendered output structure, not the source syntax.
- **Design uses CSS variables, implementation uses Tailwind**: Map variable values to Tailwind utility classes or custom CSS. Prefer keeping the implementation's approach; only override specific values that differ.
- **Design includes `<script>` for interactivity**: Ignore script logic; only compare HTML structure and CSS styles.
- **Multiple design files for different pages/views**: Process one design file per invocation. If the user provides multiple, ask which to process first.
- **Implementation has no matching file**: Ask the user which file(s) to compare, or suggest creating a new component based on the design.

## When to Stop Iterating

| Condition                             | Action                                                |
| ------------------------------------- | ----------------------------------------------------- |
| All differences resolved              | Stop, report success                                  |
| 3 loops completed, differences remain | Stop, report remaining issues                         |
| New differences introduced by fixes   | Rollback the problematic fix, continue with remaining |
| User interrupts                       | Stop immediately, report current progress             |

## Additional Resources

- **`references/comparison-methodology.md`** — Detailed methodology for extracting and comparing design tokens, handling framework-specific patterns, and advanced comparison strategies.
