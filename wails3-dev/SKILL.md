---
name: wails3-dev
description: This skill should be used when the user asks to "set up wails3", "install wails3", "wails3 environment", "create a wails3 app", "new wails3 project", "build a desktop app with Go", "add a service to wails3", "generate wails3 bindings", "wails3 frontend", "improve wails3 app", "wails3 UI", or otherwise develops a cross-platform desktop application with Wails v3. Guides proactive environment setup, best-practice development, UI design-style decisions, and a mandatory HTML-preview checkpoint before implementation.
version: 0.1.0
---

# Wails v3 Development

## Overview

Wails v3 builds cross-platform desktop apps from a Go backend plus a web frontend, compiled into a single native binary. Go services expose exported methods to the frontend; bindings are generated as TypeScript so the web layer calls Go as if native. The frontend is a standard Vite project (Svelte/Vue/React/etc.) embedded into the binary via `//go:embed`.

This skill drives every wails3 task through a fixed five-phase workflow. **Execute the phases in order. Do not skip ahead** — Phase 2 (UI style) and Phase 4 (HTML preview) are mandatory gates.

## Core Workflow

### Phase 0 — Environment Readiness (proactive)

Before any development work, verify the toolchain is present. Run `scripts/check-env.sh`:

```bash
bash scripts/check-env.sh
```

- If anything is missing or `wails3` is absent, **stop and guide the install first** per `references/environment-setup.md`. Provide exact per-OS commands. Confirm by running `wails3 doctor`.
- If all present, state the versions briefly and proceed.

Never assume a clean environment. Always check at the start of a session for this project.

### Phase 1 — Classify the Task

Determine which of these the request is:

1. **New project / new design** — greenfield app or a brand-new screen/feature with no existing UI baseline.
2. **Existing project — modify / optimize / improve** — any change to a project that already has a frontend.

Inspect the project to decide: look for `main.go` with `github.com/wailsapp/wails/v3`, a `frontend/` dir with `package.json`, a `Taskfile.yml`, and `build/config.yml`. Their presence → existing project.

### Phase 2 — UI Design Style Decision (mandatory gate)

This gate's behavior depends on the task type from Phase 1.

**New project / new design — ask the user.** Proactively confirm the UI design style before writing UI code. Offer concrete options (e.g. clean/minimal SaaS dashboard, dense data/admin console, glassmorphism, flat material, dark technical tool). Confirm a color palette direction and a layout density. Do not silently pick a style. Use a clarifying question and record the answer.

**Existing project — inherit the baseline.** When improving, optimizing, or modifying a project already in progress, **the existing UI is the authoritative baseline.** Extract the current design language and match it exactly:

- Framework and styling system from `frontend/package.json` (e.g. Svelte 5 + Tailwind v4).
- Design tokens: primary/neutral palette, radius, spacing scale, typography, dark/light handling.
- Component style: button/input/card shapes, icon set, motion.
- Read existing `.svelte`/`.vue`/`.tsx` components and `vite.config.ts` / `tailwind.config` before producing new UI.

Do not introduce a competing style, a different component library, or a new palette. New components must read as part of the existing app. Only deviate when the user explicitly requests a redesign — and even then, confirm first.

### Phase 3 — Confirm Progress & Requirements

Establish full context before building:

- For an existing project: read `main.go`, the `internal/` services, `Taskfile.yml`, `build/config.yml`, and the relevant frontend pages. Summarize current progress back to the user.
- Restate the concrete deliverable and the acceptance criteria.
- Resolve any ambiguity in the request before proceeding.

### Phase 4 — HTML Preview Checkpoint (mandatory gate)

**This step is mandatory and must not be skipped.** Once progress and requirements are clear (Phase 3 done) and the work touches the UI, ask the user whether to generate an HTML preview first. Ask in the user's language, e.g.:

> 在正式实现之前，是否需要先生成一个 HTML 用于预览前端界面？

Then branch on the answer:

- **Yes → generate a single-file HTML preview.** Produce one self-contained `.html` (inline CSS, or Tailwind via Play CDN) that mocks the target screen/component with realistic placeholder data. Base it on `examples/html-preview-template.html`. The preview reflects the agreed UI style (Phase 2) — for existing projects it must match the current look. Open/point the user to the file for review, iterate on the design from feedback, and only move to real implementation once the layout is approved.
- **No → proceed directly to execution** (Phase 5). Do not generate the HTML; implement normally.

The preview is a static visual mock only — no Go bindings, no Wails runtime. Its purpose is to lock the layout/design before committing to real component work.

### Phase 5 — Execute with Best Practices

Implement following `references/development-guide.md`:

- **Backend = services.** One responsibility per service; plain Go struct with a `NewService(...)` constructor; exported methods become the frontend API. Methods return typed structs with `json` tags so the binding generator emits matching TS types. See `examples/minimal-service.go`.
- **Bootstrap in `main.go`.** Construct services, register them via `application.NewService(...)`, embed `frontend/dist`, open a window. See `examples/app-bootstrap.go`.
- **Bindings.** After changing any service signature, regenerate TypeScript bindings (never edit generated files by hand):
  ```bash
  wails3 generate bindings -ts
  ```
  The `-ts` flag is required — omitting it produces `.js` instead of `.ts`.
- **Dev loop.** `task dev` (runs `wails3 dev -config ./build/config.yml`). It rebuilds Go on change and runs the Vite frontend in parallel.
- **Build/package.** `task build` then `task package`. Build config lives in `build/config.yml`; editing `info` requires `wails3 task common:update:build-assets`.
- **Cross-platform.** Use `path` (not `filepath`) for remote/POSIX paths; keep per-OS divergence in the platform Taskfiles (`build/windows`, `build/darwin`, `build/linux`); test window/frame and menu behavior per platform.

Project layout and conventions are documented in `references/project-conventions.md` (derived from a proven wails3 app).

## Hard Rules

- Run Phase 0 every session; do not develop with a broken toolchain.
- Phase 2: new UI → ask for the style; existing UI → match the baseline exactly.
- Phase 4: always offer the HTML preview; branch on the answer, never skip.
- Regenerate bindings with `wails3 generate bindings -ts` after any service change.
- Never hand-edit generated bindings under `frontend/bindings/`.

## Recommended Default Stack

When starting a new project and the user has no preference, recommend the proven stack: **Svelte 5 + Tailwind v4 + Vite + `@wailsio/runtime`**, single-window app, Taskfile-driven builds. This is battle-tested and documented in `references/project-conventions.md`. If the user names another framework, support it — the service/binding model is framework-agnostic.

## Additional Resources

### Reference Files

- **`references/environment-setup.md`** — Per-OS install of Go, Node, pnpm, wails3 CLI, WebView runtime deps, and `wails3 doctor` verification.
- **`references/development-guide.md`** — Best practices: service architecture, binding generation, app lifecycle, dev/build/package, cross-platform pitfalls.
- **`references/project-conventions.md`** — Proven project layout, `Taskfile.yml`, `build/config.yml`, frontend wiring.

### Example Files

- **`examples/minimal-service.go`** — A minimal, idiomatic wails3 service struct.
- **`examples/app-bootstrap.go`** — `main.go` service registration, embed, and window creation.
- **`examples/html-preview-template.html`** — Single-file HTML UI preview starter (Tailwind via Play CDN).

### Utility Scripts

- **`scripts/check-env.sh`** — Detect Go / Node / pnpm / wails3 versions and flag missing tools.

## Quick Reference

| Task | Command |
|---|---|
| Verify environment | `bash scripts/check-env.sh` |
| Install wails3 | `go install github.com/wailsapp/wails/v3/cmd/wails3@latest` |
| Health check | `wails3 doctor` |
| Dev mode | `task dev` (`wails3 dev -config ./build/config.yml`) |
| Generate bindings | `wails3 generate bindings -ts` |
| Build | `task build` |
| Package | `task package` |
