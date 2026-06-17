# Environment Setup (Wails v3)

Use this reference when Phase 0 of `SKILL.md` finds a missing tool, or when guiding a fresh install. Wails v3 needs Go (backend), Node.js + a JS package manager (frontend tooling), the wails3 CLI, and per-OS WebView runtime dependencies.

## Prerequisites by Platform

### Common (all platforms)

- **Go** ≥ 1.23 (use the latest stable). Verify: `go version`.
- **Node.js** ≥ 20 LTS. Verify: `node -v` and `npm -v`.
- **Task** (the `task` runner) — wails3 v3 projects are Taskfile-driven. Install: `go install github.com/go-task/task/v3/cmd/task@latest`. Verify: `task --version`.
- **wails3 CLI.** Verify: `wails3 version`.

### Windows

- WebView2 runtime is required. On Windows 10/11 it is usually preinstalled (Edge ships it). If missing, install the Evergreen Bootstrapper from Microsoft. Wails can also bundle the fixed-version loader for distribution.
- A C compiler is **not** required for pure-Go builds (Wails uses static linking), but is needed if CGO dependencies are involved (e.g. some SQLite bindings). Install MSYS2 / mingw-w64 only if CGO is in play.

### macOS

- Xcode Command Line Tools: `xcode-select --install`. Provides clang and Git.
- WebKit is built into macOS — no extra WebView install.

### Linux

WebKit2GTK and supporting libs (Debian/Ubuntu):

```bash
sudo apt install libgtk-3-dev libwebkit2gtk-4.1-dev libpkgconf3 pkg-config
```

Fedora:

```bash
sudo dnf install gtk3-devel webkit2gtk4.1-devel pkgconf-pkg-config
```

Arch:

```bash
sudo pacman -S gtk3 webkit2gtk pkgconf
```

Note the `4.1` API series for `libwebkit2gtk` — match what the wails3 version in use expects.

## Installing the wails3 CLI

```bash
go install github.com/wailsapp/wails/v3/cmd/wails3@latest
```

Ensure `$GOPATH/bin` (or `%USERPROFILE%\go\bin` on Windows) is on `PATH`. Verify:

```bash
wails3 version
```

## Choosing a JS Package Manager

Wails v3 projects default to **pnpm** (the proven project in `project-conventions.md` uses it). Install it if not present:

```bash
# via corepack (ships with Node)
corepack enable
corepack prepare pnpm@latest --activate
# verify
pnpm -v
```

npm or yarn also work; keep the choice consistent with the project's `Taskfile.yml` (`PACKAGE_MANAGER` var) and lockfile.

## Verifying the Whole Stack

```bash
wails3 doctor
```

`wails3 doctor` inspects Go, Node, the package manager, the platform WebView toolchain, and the CLI itself, then reports what is missing. Treat its output as authoritative when diagnosing environment problems.

The bundled `scripts/check-env.sh` does a lighter version check (versions of go/node/pnpm/wails3) for a quick triage; run it first, then `wails3 doctor` for anything it flags.

## Creating a New Project

```bash
wails3 init -n my-app -t svelte-ts
```

Templates include `svelte-ts`, `vue-ts`, `react-ts`, `preact-ts`, `solid-ts`, `qwik-ts`, `lit-ts`, plus `plain`. After init:

```bash
cd my-app
task dev
```

`task dev` starts `wails3 dev` (rebuilds Go on change) and the Vite frontend together.

## Troubleshooting

- **`wails3: command not found`** — `$GOPATH/bin` not on `PATH`. Add it and reopen the shell.
- **`task` not found** — install the Task runner (above); wails3 v3 build commands are Taskfile tasks, not direct flags.
- **WebView2 missing on Windows** — install the Evergreen runtime; for offline distribution, bundle the fixed-version loader.
- **Linux build fails on webkit headers** — install the `libwebkit2gtk-4.1-dev` (or distro equivalent) package; rebuild tags may need to match.
- **Bindings generate as `.js` not `.ts`** — the `-ts` flag was omitted. Re-run `wails3 generate bindings -ts`.
