---
name: html-doc
description: Generate rich, self-contained HTML documents — reports, slide decks, code reviews, design systems, kanban boards, and more — using the exact CSS design language from https://thariqs.github.io/html-effectiveness/
---

Produce a single, self-contained `.html` file with all CSS and JS inlined. Zero external dependencies (CDN Google Fonts `@import` is the only exception). Must open correctly with `open file.html`, no server.

## When to use HTML instead of markdown

- Visual hierarchy, color coding, multi-column layout
- Interactive elements (drag-and-drop, filters, toggles, keyboard nav)
- Side-by-side comparisons or annotated tables
- Timelines, kanban boards, or SVG diagrams
- Syntax-highlighted code with inline review comments
- Slide presentations
- Status dashboards or metric cards

---

## Design system — exact tokens (copy verbatim into every file)

```css
:root {
  --ivory:    #FAF9F5;
  --slate:    #141413;
  --clay:     #D97757;
  --clay-d:   #B85C3E;
  --oat:      #E3DACC;
  --olive:    #788C5D;
  --rust:     #B04A3F;
  --gray-150: #F0EEE6;
  --gray-300: #D1CFC5;
  --gray-500: #87867F;
  --gray-700: #3D3D3A;
  --white:    #FFFFFF;

  --serif: ui-serif, Georgia, "Times New Roman", serif;
  --sans:  system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  --mono:  ui-monospace, "SF Mono", Menlo, Consolas, monospace;

  --radius-panel: 12px;
  --radius-row:   8px;
  --border: 1.5px solid var(--gray-300);
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body {
  font-family: var(--sans);
  background: var(--ivory);
  color: var(--gray-700);
  font-size: 15px;
  line-height: 1.6;
  padding: 56px 24px 96px;
  -webkit-font-smoothing: antialiased;
}
.page { max-width: 920px; margin: 0 auto; }
```

**Key rule:** `--serif` (ui-serif / Georgia) is used for ALL H1/H2/H3 headings. This is the defining typographic character of the design — not sans-serif.

---

## Typography (exact rules)

```css
h1 {
  font-family: var(--serif);
  font-weight: 500;
  font-size: 36px;        /* adjust per doc: 30–40px typical */
  letter-spacing: -0.01em;
  line-height: 1.2;
  color: var(--slate);
  margin-bottom: 18px;
}
h2 {
  font-family: var(--serif);
  font-weight: 500;
  font-size: 24px;
  letter-spacing: -0.01em;
  margin-bottom: 6px;
}
h3 {
  font-family: var(--serif);
  font-weight: 500;
  font-size: 19px;
  margin-bottom: 4px;
}
.eyebrow {
  font-family: var(--mono);
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--gray-500);
  margin-bottom: 12px;
}
hr.rule { border: none; border-top: 1px solid var(--gray-300); margin: 0 0 22px; }
code.inline {
  font-family: var(--mono); font-size: 0.92em;
  background: var(--gray-150); padding: 1px 6px; border-radius: 4px;
}
```

---

## Reusable component CSS (verbatim from source)

### Numbered section badge (oat pill)
```css
.num {
  display: inline-block;
  font-family: var(--mono); font-size: 12px;
  background: var(--oat); color: var(--slate);
  padding: 2px 8px; border-radius: 8px;
  margin-right: 8px; vertical-align: 3px;
}
```

### Status pill (solid filled)
```css
.pill {
  display: inline-flex; align-items: baseline; gap: 6px;
  font-size: 12px; font-weight: 600;
  border-radius: 999px; padding: 5px 12px; line-height: 1;
}
.pill.sev      { background: var(--clay);     color: var(--white); }
.pill.resolved { background: var(--olive);    color: var(--white); }
.pill.neutral  { background: var(--gray-150); color: var(--gray-700); border: var(--border); }
```

### Risk chip (bordered, dot indicator)
```css
.chip {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 8px 12px; border-radius: 8px; border: var(--border);
  font-family: var(--mono); font-size: 12.5px;
  color: var(--slate); background: var(--white);
  transition: transform 0.12s ease;
}
.chip:hover { transform: translateY(-1px); }
.chip .dot  { width: 9px; height: 9px; border-radius: 50%; flex-shrink: 0; }
.chip.safe      { background: rgba(120,140,93,.10); border-color: rgba(120,140,93,.45); }
.chip.safe .dot { background: var(--olive); }
.chip.attention { background: rgba(217,119,87,.12); border-color: rgba(217,119,87,.55); }
.chip.attention .dot { background: var(--clay); }
```

### Mono tag (small label)
```css
.tag {
  font-family: var(--mono); font-size: 10px;
  text-transform: uppercase; letter-spacing: 0.05em;
  border-radius: 999px; padding: 1px 7px 2px; border: 1px solid transparent;
}
.tag-bug   { background: #F5E2D8; color: var(--clay-d); border-color: #E8C9BA; }
.tag-feat  { background: #E8EDE0; color: #5C6F44;        border-color: #CFDAC0; }
.tag-chore { background: var(--gray-150); color: var(--gray-700); border-color: var(--gray-300); }
```

### White card
```css
.card { background: var(--white); border: var(--border); border-radius: var(--radius-panel); padding: 24px 28px; }
```

### Button
```css
.btn {
  display: inline-flex; align-items: center; justify-content: center;
  height: 36px; padding: 0 16px;
  font-family: var(--sans); font-size: 14px; font-weight: 500;
  border-radius: var(--radius-row); border: 1.5px solid transparent;
  cursor: pointer; transition: background 0.12s ease;
}
.btn-primary   { background: var(--clay);   color: var(--white); }
.btn-primary:hover { background: var(--clay-d); }
.btn-secondary { background: var(--white);  color: var(--slate); border-color: var(--gray-300); }
.btn-secondary:hover { background: var(--gray-150); }
.btn-ghost     { background: transparent;   color: var(--gray-700); }
.btn-ghost:hover { background: var(--gray-150); }
```

---

## Code block (dark panel with syntax highlighting)

```css
.code-panel {
  background: var(--slate);
  border-radius: var(--radius-panel);
  padding: 18px 20px;
  overflow-x: auto;
}
.code-panel pre {
  font-family: var(--mono); font-size: 12.5px;
  line-height: 1.65; color: #E8E6DE; white-space: pre;
}
/* Apply these classes on <span> elements inside <pre> */
.kw  { color: var(--clay); }       /* const, function, return, => */
.str { color: var(--olive); }      /* string literals */
.cm  { color: var(--gray-500); }   /* comments */
.fn  { color: #C9B98A; }           /* identifiers, function names */
```

---

## Document-type patterns (exact CSS from source)

### 1. Approach comparison (3-column grid)

```css
.approaches {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 28px; margin-bottom: 56px;
}
@media (max-width: 1100px) { .approaches { grid-template-columns: 1fr; } }
.approach {
  background: var(--white); border: var(--border);
  border-radius: var(--radius-panel); padding: 24px;
  display: flex; flex-direction: column; gap: 20px;
}
/* Tradeoffs table inside each card */
.tradeoffs { border: var(--border); border-radius: 8px; overflow: hidden; font-size: 13px; }
.tradeoffs .row { display: grid; grid-template-columns: 1fr 1fr; }
.tradeoffs .row + .row { border-top: var(--border); }
.tradeoffs .cell { padding: 10px 14px; }
.tradeoffs .cell:first-child { border-right: var(--border); }
.tradeoffs .head { background: var(--gray-150); font-weight: 600; font-size: 12px;
                   text-transform: uppercase; letter-spacing: 0.04em; color: var(--slate); }
.tradeoffs .pro::before, .tradeoffs .con::before {
  content: ''; display: inline-block; width: 6px; height: 6px;
  border-radius: 50%; margin-right: 8px; vertical-align: 2px;
}
.tradeoffs .pro::before { background: var(--olive); }
.tradeoffs .con::before { background: var(--clay); }
/* Metadata chips row */
.chips { display: flex; flex-wrap: wrap; gap: 8px; }
.chip-meta {
  font-family: var(--mono); font-size: 11.5px;
  background: var(--gray-150); border: var(--border);
  color: var(--gray-700); padding: 5px 10px; border-radius: 8px;
}
.chip-meta strong { color: var(--slate); font-weight: 600; }
/* Recommendation block */
.reco {
  border-left: 4px solid var(--clay);
  background: var(--white);
  border-radius: 0 var(--radius-panel) var(--radius-panel) 0;
  padding: 24px 28px; max-width: 860px;
}
```

### 2. Code review / PR writeup

```css
.file-card { border: var(--border); border-radius: var(--radius-panel); background: var(--white); margin-bottom: 24px; overflow: hidden; }
.file-head { padding: 16px 20px; border-bottom: 1.5px solid var(--gray-150); display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.file-path { font-family: var(--mono); font-size: 13.5px; color: var(--slate); }
.risk-tag { font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; padding: 3px 8px; border-radius: 6px; font-weight: 600; }
.risk-tag.safe      { background: rgba(120,140,93,.15); color: var(--olive); }
.risk-tag.attention { background: rgba(217,119,87,.15); color: var(--clay); }

/* Diff (dark bg with line numbers) */
.diff { background: var(--slate); font-family: var(--mono); font-size: 12.5px; line-height: 1.7; overflow-x: auto; }
.diff-row { display: grid; grid-template-columns: 48px 18px 1fr; align-items: baseline; padding: 0 14px 0 0; white-space: pre; }
.diff-row .ln   { text-align: right; padding-right: 14px; color: var(--gray-500); user-select: none; }
.diff-row .mark { text-align: center; color: var(--gray-500); }
.diff-row .code { color: #E8E6DC; }
.diff-row.ctx .code { color: #B8B6AC; }
.diff-row.add   { background: rgba(120,140,93,.15); }
.diff-row.add .mark { color: var(--olive); }
.diff-row.del   { background: rgba(176,74,63,.15); }
.diff-row.del .mark { color: var(--rust); }
.diff-row.hunk  { background: rgba(255,255,255,.04); }
.diff-row.hunk .code { color: var(--gray-500); }

/* Review bubbles */
.comments { padding: 18px 20px 20px; display: flex; flex-direction: column; gap: 14px; background: var(--gray-150); }
.bubble {
  position: relative; background: var(--white); border: 1.5px solid var(--gray-300);
  border-left-width: 4px; border-radius: 8px; padding: 12px 14px 12px 16px; max-width: 680px;
}
.bubble.blocking { border-left-color: var(--clay); }
.bubble.nit      { border-left-color: var(--gray-300); }
.bubble::before {
  content: ""; position: absolute; left: -9px; top: 16px;
  width: 12px; height: 12px; background: var(--white);
  border-left: 1.5px solid var(--gray-300); border-bottom: 1.5px solid var(--gray-300);
  transform: rotate(45deg);
}
.bubble.blocking::before { border-left-color: var(--clay); border-bottom-color: var(--clay); }
.bubble .label { display: inline-block; font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 700; margin-right: 8px; }
.bubble.blocking .label { color: var(--clay); }
.bubble.nit      .label { color: var(--gray-500); }
.bubble p { font-size: 13.5px; color: var(--gray-700); }
```

### 3. Status / incident report

```css
/* Stat cards */
.summary-band { display: grid; grid-template-columns: repeat(4,1fr); gap: 14px; margin-bottom: 40px; }
@media (max-width: 720px) { .summary-band { grid-template-columns: repeat(2,1fr); } }
.stat-card { background: var(--white); border: var(--border); border-radius: var(--radius-panel); padding: 20px 22px 18px; }
.stat-card.warn { border-left: 4px solid var(--clay); padding-left: 19px; }
.stat-num   { font-family: var(--serif); font-size: 44px; font-weight: 500; line-height: 1; margin-bottom: 8px; }
.stat-label { font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--gray-500); }
.stat-delta { font-family: var(--mono); font-size: 11px; margin-top: 6px; }
.stat-delta.up   { color: var(--olive); }
.stat-delta.flat { color: var(--gray-500); }

/* Vertical timeline */
.timeline { position: relative; padding: 4px 0 4px 16px; }
.timeline::before { content: ""; position: absolute; left: 16px; top: 8px; bottom: 8px; width: 2px; background: var(--gray-300); }
.tl-entry { position: relative; padding: 0 0 22px 28px; }
.tl-entry:last-child { padding-bottom: 0; }
.tl-dot { position: absolute; left: -5px; top: 6px; width: 12px; height: 12px; border-radius: 50%; background: var(--gray-500); border: 2px solid var(--ivory); box-sizing: content-box; }
.tl-dot.impact    { background: var(--clay); }
.tl-dot.mitigated { background: var(--olive); }
.tl-time { display: inline-block; font-family: var(--mono); font-size: 12px; color: var(--gray-700); background: var(--gray-150); border: 1px solid var(--gray-300); border-radius: 6px; padding: 2px 8px; margin-bottom: 6px; }
.tl-body { font-size: 14px; color: var(--gray-700); }
.tl-body strong { color: var(--slate); font-weight: 600; }

/* TL;DR dark block */
.tldr { background: var(--slate); color: var(--ivory); border-radius: var(--radius-panel); padding: 22px 26px; margin-bottom: 48px; }
.tldr-label { font-family: var(--mono); font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: var(--oat); margin-bottom: 10px; }

/* Impact table — NOTE: border-collapse: separate, not collapse */
table.impact {
  width: 100%; border-collapse: separate; border-spacing: 0;
  background: var(--white); border: var(--border);
  border-radius: var(--radius-panel); overflow: hidden;
}
table.impact th { text-align: left; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: var(--gray-500); background: var(--gray-150); padding: 12px 16px; border-bottom: 1px solid var(--gray-300); }
table.impact td { padding: 12px 16px; font-size: 14px; border-bottom: 1px solid var(--gray-150); vertical-align: middle; }
table.impact tr:last-child td { border-bottom: none; }
.risk-dot { width: 9px; height: 9px; border-radius: 50%; display: inline-block; }
.risk-dot.low  { background: var(--olive); }
.risk-dot.med  { background: var(--clay); }
.risk-dot.high { background: var(--rust); }

/* Inline diff (in incident root-cause section) */
.diff-line      { white-space: pre; font-family: var(--mono); font-size: 13px; }
.diff-line.ctx  { color: var(--gray-300); }
.diff-line.del  { color: #E0897A; }
.diff-line.add  { color: #A3B88A; }
```

### 4. Slide deck (CSS scroll-snap, no JS required)

```css
/* Override body for slides */
body { padding: 0; scroll-snap-type: y mandatory; overflow-x: hidden; }
.slide {
  width: 100vw; height: 100vh;
  scroll-snap-align: start; scroll-snap-stop: always;
  display: flex; align-items: center; justify-content: center;
  padding: 8vh 6vw;
}
.slide-inner { width: 100%; max-width: 780px; }
.slide.invert { background: var(--slate); color: var(--ivory); }
h1 { font-size: clamp(40px, 6vw, 64px); line-height: 1.08; }
h2 { font-size: clamp(30px, 4vw, 42px); line-height: 1.15; }
/* In-progress bar */
.prog-track { width: 100%; height: 5px; background: var(--gray-150); border-radius: 3px; overflow: hidden; margin-bottom: 10px; }
.prog-fill  { height: 100%; background: var(--clay); border-radius: 3px; }
/* Metric display (serif number + mono label) */
.metric-label { font-family: var(--mono); font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--gray-500); margin-bottom: 14px; }
.metric-value { font-family: var(--serif); font-size: 52px; font-weight: 500; line-height: 1; letter-spacing: -0.01em; }
/* Decision card (use on inverted slides) */
.decision-card { border: 1.5px solid var(--clay); border-radius: 14px; padding: 36px 38px; background: rgba(217,119,87,.06); }
```

### 5. Kanban / triage board

```css
.board { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; align-items: start; }
.col { background: var(--white); border: var(--border); border-radius: var(--radius-panel); overflow: hidden; display: flex; flex-direction: column; min-height: 200px; }
.col[data-col="now"]   { border-top: 3px solid var(--clay); }
.col[data-col="next"]  { border-top: 3px solid var(--olive); }
.col[data-col="later"] { border-top: 3px solid var(--gray-500); }
.col[data-col="cut"]   { border-top: 3px solid var(--gray-300); }
.col.dragover { outline: 2px dashed var(--clay); outline-offset: -6px; background: #FBF6F2; }
.col-head { position: sticky; top: 0; z-index: 1; background: var(--white); display: flex; align-items: baseline; gap: 8px; padding: 14px 14px 10px; border-bottom: 1.5px solid var(--gray-150); }
.col-head h2 { font-family: var(--serif); font-weight: 500; font-size: 17px; margin: 0; }
.count { margin-left: auto; font-family: var(--mono); font-size: 11px; color: var(--gray-500); background: var(--gray-150); border: var(--border); border-radius: 999px; padding: 1px 8px; min-width: 26px; text-align: center; }
.col-body { padding: 10px; display: flex; flex-direction: column; gap: 8px; flex: 1; min-height: 60px; }
.ticket { background: var(--white); border: var(--border); border-radius: var(--radius-row); padding: 10px 11px 9px; cursor: grab; user-select: none; transition: border-color 120ms ease, box-shadow 120ms ease, opacity 120ms ease; }
.ticket:hover   { border-color: var(--gray-500); box-shadow: 0 1px 3px rgba(20,20,19,.06); }
.ticket:active  { cursor: grabbing; }
.ticket.dragging { opacity: .4; }
.ticket.dim      { opacity: .25; }
.ttitle { font-size: 13px; line-height: 1.35; color: var(--slate); margin-bottom: 7px; }
.owner { font-family: var(--mono); font-size: 10px; width: 20px; height: 20px; border-radius: 50%; background: var(--oat); color: var(--gray-700); display: flex; align-items: center; justify-content: center; }
@media (max-width: 920px) { .board { grid-template-columns: repeat(2,1fr); } }
```

Drag-and-drop JS:
```js
document.querySelectorAll('.col-body').forEach(zone => {
  zone.addEventListener('dragover',  e => { e.preventDefault(); zone.closest('.col').classList.add('dragover'); });
  zone.addEventListener('dragleave', e => { zone.closest('.col').classList.remove('dragover'); });
  zone.addEventListener('drop', e => {
    e.preventDefault();
    zone.closest('.col').classList.remove('dragover');
    zone.appendChild(document.getElementById(e.dataTransfer.getData('id')));
    updateCounts();
  });
});
document.querySelectorAll('.ticket').forEach(t => {
  t.addEventListener('dragstart', e => { e.dataTransfer.setData('id', t.id); t.classList.add('dragging'); });
  t.addEventListener('dragend',   e => { t.classList.remove('dragging'); });
});
function updateCounts() {
  document.querySelectorAll('.col').forEach(col => {
    col.querySelector('.count').textContent = col.querySelectorAll('.ticket').length;
  });
}
// Copy as markdown
document.getElementById('copyBtn').addEventListener('click', () => {
  let md = '';
  document.querySelectorAll('.col').forEach(col => {
    md += `## ${col.querySelector('h2').textContent.trim()}\n`;
    col.querySelectorAll('.ticket').forEach(t => { md += `- [ ] ${t.dataset.title}\n`; });
    md += '\n';
  });
  navigator.clipboard.writeText(md).then(() => {
    const btn = document.getElementById('copyBtn');
    const orig = btn.textContent;
    btn.textContent = 'Copied!';
    setTimeout(() => btn.textContent = orig, 1500);
  });
});
```

### 6. Milestone / implementation timeline

```css
.milestones { display: flex; flex-direction: column; }
.milestone { display: grid; grid-template-columns: 120px 28px 1fr; gap: 0 18px; }
.milestone .when { text-align: right; font-family: var(--mono); font-size: 12px; color: var(--gray-500); padding-top: 4px; }
.milestone .dot-col { display: flex; flex-direction: column; align-items: center; }
.milestone .dot { width: 14px; height: 14px; border-radius: 50%; background: var(--white); border: 3px solid var(--clay); margin-top: 4px; flex-shrink: 0; }
.milestone .dot.done { background: var(--olive); border-color: var(--olive); }
.milestone .line { width: 2px; flex: 1; background: var(--gray-300); margin: 4px 0; }
.milestone:last-child .line { display: none; }
.milestone .body { padding-bottom: 36px; }
.milestone .body h3 { font-family: var(--serif); font-weight: 500; font-size: 19px; color: var(--slate); margin-bottom: 4px; }
.milestone .body p  { font-size: 14px; color: var(--gray-500); margin-bottom: 10px; max-width: 620px; }
.milestone .tags { display: flex; gap: 8px; flex-wrap: wrap; }
.milestone .tag  { font-family: var(--mono); font-size: 11.5px; background: var(--gray-150); border: 1px solid var(--gray-300); border-radius: 6px; padding: 3px 8px; color: var(--gray-700); }
```

### 7. Research / feature explainer (sticky TOC)

```css
.layout { display: grid; grid-template-columns: 200px 1fr; gap: 56px; max-width: 1020px; margin: 0 auto; }
.toc { position: sticky; top: 40px; align-self: start; }
.toc a { display: block; font-size: 13px; color: var(--gray-500); text-decoration: none; padding: 5px 12px; border-left: 2px solid var(--gray-300); }
.toc a:hover, .toc a.active { color: var(--slate); border-left-color: var(--clay); }
details.deep-dive { border: var(--border); border-radius: var(--radius-row); padding: 12px 16px; margin-top: 12px; }
details.deep-dive summary { cursor: pointer; font-weight: 500; list-style: none; font-size: 14px; }
details.deep-dive[open] summary { color: var(--clay); }
```

---

## Mandatory rules

1. **Self-contained** — all CSS and JS inline. CDN fonts OK.
2. **Serif headings** — H1/H2/H3 always use `font-family: var(--serif)`. Never sans for headings.
3. **Real content** — realistic names, metrics, domain data. No "Lorem ipsum".
4. **Fully wired** — every interactive element works on open. No stubs.
5. **Table borders** — use `border-collapse: separate; border-spacing: 0` with `border-radius` on the table and `overflow: hidden`. Never `border-collapse: collapse`.
6. **1.5px borders** — use `var(--border)` = `1.5px solid var(--gray-300)` everywhere. Never plain `1px`.
7. **Max-width container** — `.page { max-width: 920px; margin: 0 auto; }`.
8. **Filename** — suggest kebab-case: `incident-2025-04.html`, `debounce-approaches.html`.
