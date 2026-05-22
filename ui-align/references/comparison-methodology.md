# Comparison Methodology

Detailed guidance for extracting, normalizing, and comparing design specifications from HTML mockups against frontend implementation code.

## Design Spec Extraction

### HTML Structure Analysis

Parse the design HTML to build a structural tree:

1. **Top-level layout** — Identify the outermost layout strategy:
   - Single column / multi-column / sidebar + main
   - Fixed header/footer/sticky elements
   - Full-width vs contained sections

2. **Section decomposition** — Break the design into logical sections:
   - Header / Navigation
   - Hero / Main content
   - Sidebar / Aside
   - Footer
   - Modals / Overlays

3. **Component identification** — Within each section, identify reusable components:
   - Cards, buttons, form elements, lists
   - Shared patterns (same structure repeated with different content)
   - Component variants (primary/secondary, active/disabled)

4. **Nesting depth** — Record the exact nesting hierarchy. Misaligned nesting is a common source of layout bugs.

### CSS Extraction

Extract styles in this priority order:

1. **CSS Custom Properties (`:root` variables)** — These are the design's token system. Record every variable name and value. If present, the implementation should either adopt these exact variables or map equivalent values.

2. **Embedded stylesheets (`<style>` blocks)** — Parse all rules. For each selector, record:
   - Selector specificity (element, class, id, compound)
   - All property-value pairs
   - Pseudo-class/pseudo-element rules (`:hover`, `::before`, `::after`)
   - Media query breakpoints and contained rules

3. **Inline styles (`style` attributes)** — Extract directly from elements. These take highest specificity.

4. **Class-based patterns** — If the design uses utility classes (Tailwind, Bootstrap), parse the utility values directly from class names.

### Design Token Normalization

Normalize extracted values for reliable comparison:

| Property | Normalization Rule |
|----------|-------------------|
| Colors | Convert all to hex (`#RRGGBB`). If design uses `rgba()`, extract the RGB hex and note opacity separately. If design uses named colors (`red`, `blue`), convert to hex. |
| Spacing | Preserve exact numeric value and unit. `1rem` ≠ `16px` — keep the unit the implementation uses and compare at computed-value level only if units differ. |
| Typography | Record the exact `font-family` stack. `system-ui` and `ui-sans-serif` are equivalent — treat as match. |
| Border radius | Preserve exact value. `999px` ≈ `50%` for circles but not for pills — compare by intent. |
| Shadows | Preserve full `box-shadow` value string. Minor rounding differences (e.g., `0 2px 8px` vs `0 2px 7px`) are acceptable if visual impact is negligible. |

## Implementation Analysis

### File Discovery

Scan the implementation directory with this strategy:

1. **Component files** — Glob for common patterns:
   - `src/**/*.{svelte,vue,jsx,tsx,html}`
   - `components/**/*.{svelte,vue,jsx,tsx}`
   - `pages/**/*.{svelte,vue,jsx,tsx}`
   - `app/**/*.{svelte,vue,jsx,tsx}`

2. **Style files** — Glob for:
   - `src/**/*.css`
   - `src/**/*.scss`
   - `styles/**/*`
   - `*.config.{js,ts}` (Tailwind, PostCSS configs)

3. **Token/theme files** — Look for:
   - `theme.{css,js,ts,json}`
   - `tokens.{css,js,ts,json}`
   - `variables.css`
   - `tailwind.config.*`
   - Any file defining CSS custom properties

### Component-to-Design Mapping

Match implementation files to design sections:

1. **Name matching** — File names often hint at purpose:
   - `Sidebar.svelte` → `<aside class="sidebar">`
   - `Header.vue` → `<header>`
   - `Card.jsx` → `<div class="card">`

2. **Structural matching** — When names don't align, compare DOM structure:
   - Read the component's template/markup section
   - Look for matching class names, element types, nesting patterns
   - A component with `<nav>` and `<ul>` children likely maps to the design's navigation section

3. **Class name matching** — CSS class names are the strongest signal:
   - If design has `.stat-card` and implementation has `class="stat-card"`, they correspond
   - Framework-specific: `className="stat-card"` (React), `class="stat-card"` (Svelte/Vue)

### Framework-Specific Extraction

#### Svelte

```svelte
<script>/* ignore - state/logic */</script>

<main class="container">       <!-- extract: element + class -->
  <h1>{title}</h1>             <!-- extract: element hierarchy, ignore {title} binding -->
  <div class="card">...</div>
</main>

<style>                        <!-- extract all CSS rules -->
  .container { ... }
  h1 { ... }
</style>
```

Key points:
- `<style>` in Svelte is scoped by default — styles only apply within the component
- Class names get hashed at build time — compare the original class names, not hashed ones
- `{#if}`, `{#each}`, `{#await}` blocks affect conditional rendering — note which elements are conditional

#### React (JSX)

```jsx
return (
  <main className="container">     // className, not class
    <h1>{title}</h1>
    <div className="card">...</div>
  </main>
);
```

Key points:
- `className` instead of `class`
- `style={{ fontSize: 16 }}` — CSS-in-JS object notation, convert to standard CSS
- CSS Modules: `styles.container` → look up the corresponding `.module.css` file
- styled-components: parse template literals for CSS rules

#### Vue

```vue
<template>
  <main class="container">
    <h1>{{ title }}</h1>
  </main>
</template>

<style scoped>                     <!-- scoped, similar to Svelte -->
.container { ... }
</style>
```

Key points:
- `<style scoped>` behaves like Svelte's scoped styles
- `<style>` without `scoped` is global
- `v-bind:class` and `:class` dynamic bindings — record the static class portion

#### Tailwind / Utility CSS

When the implementation uses utility classes:

1. Parse each class name to extract CSS properties:
   - `p-4` → `padding: 1rem`
   - `text-lg` → `font-size: 1.125rem` (check Tailwind config for custom values)
   - `bg-clay-500` → check if custom color defined in config

2. Compare extracted values against design spec values, not against class names.

3. If design uses CSS variables but implementation uses Tailwind, determine if the Tailwind theme references the same variables or defines standalone values.

## Comparison Strategy

### Priority Order

Compare in this order — earlier categories have more visual impact and fixing them first reduces cascading issues:

1. **CSS Variables / Design Tokens** — If the foundation is wrong, everything built on it is wrong.
2. **Layout Structure** — `display`, `flex-direction`, `grid-template-columns`, position mode
3. **Spacing System** — `gap`, `padding`, `margin`
4. **Typography Scale** — `font-size`, `font-weight`, `line-height`, `font-family`
5. **Color Palette** — All color properties
6. **Borders & Radii** — Border style, width, color, radius
7. **Effects** — Shadows, opacity, transitions, transforms
8. **Responsive** — Media queries, breakpoints, responsive overrides
9. **Interactive States** — `:hover`, `:focus`, `:active` styles

### Tolerance Thresholds

Not all differences require fixing. Use these thresholds:

| Property | Tolerance | Rationale |
|----------|-----------|-----------|
| Color values | Exact match | Even small color differences are visually noticeable |
| Font size | ±1px | Sub-pixel differences from unit conversion are acceptable |
| Spacing (padding/margin/gap) | ±2px | Minor spacing differences rarely break layout |
| Border radius | ±2px | Minor radius differences are visually equivalent |
| Box shadow | Exact spread/radius, ±1px offset | Shadow shape matters more than exact offset |
| Line height | ±0.1 | Line height tolerance is high visually |
| Font weight | Exact match | Weight differences affect readability |

Properties within tolerance should be noted in the diff report but marked as `[acceptable]` and skipped during fixing.

### False Positive Prevention

Some apparent differences are intentional adaptations:

1. **Framework wrappers** — Svelte/Vue/React components may add wrapper `<div>` elements. Compare the rendered output, not source structure.

2. **Content variation** — Design mockup may have placeholder text ("Lorem ipsum") while implementation uses real content. Do not flag content differences as style differences.

3. **State-dependent rendering** — Elements visible only on `:hover`, `:focus`, or in specific app state may not appear in the initial comparison. Note these as `[conditional]`.

4. **Accessibility additions** — Implementation may add `aria-*` attributes, `role` attributes, or visually hidden elements. Never flag or remove these.

## Fix Application Strategy

### Edit Granularity

Apply fixes at the finest granularity possible:

1. **Single property fix** — If only `font-size` differs, edit only `font-size`. Do not rewrite the entire rule.
2. **Single rule fix** — If multiple properties in one rule differ, edit that rule only.
3. **Single file fix** — Complete all fixes in one file before moving to the next.

### Ordering Fixes

Apply fixes in reverse priority order (effects first, tokens last):

1. Fix visual properties (colors, typography, borders, effects)
2. Fix spacing (padding, margin, gap)
3. Fix layout (flex, grid, position)
4. Fix structure (element nesting, class names)
5. Fix tokens (CSS variables) — last because changing variables cascades

This ordering minimizes cascading side effects — fixing a color value doesn't change layout, but changing a CSS variable that controls spacing might.

### Rollback Strategy

If a fix introduces new differences (detected during Verify pass):

1. Undo the specific edit that caused the regression.
2. Mark that difference as `[deferred]` — could not be auto-fixed without side effects.
3. Continue with remaining fixes.
4. Include deferred items in the final report with explanation.
