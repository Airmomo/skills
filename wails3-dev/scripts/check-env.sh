#!/usr/bin/env bash
# check-env.sh — quick Wails v3 toolchain triage (Phase 0 of SKILL.md).
#
# Detects Go, Node, pnpm, the Task runner, and the wails3 CLI; prints versions
# and flags anything missing. This is a fast pre-check — for a full diagnosis
# run `wails3 doctor` afterwards.
#
# Usage:
#   bash scripts/check-env.sh

set -u

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m'

missing=0

print_ok()   { printf "${GREEN}[OK]${NC}   %s\n" "$1"; }
print_miss() { printf "${RED}[MISS]${NC} %s\n" "$1"; missing=1; }
print_warn() { printf "${YELLOW}[WARN]${NC} %s\n" "$1"; }

echo "=== Wails v3 environment check ==="
echo

# --- Go ---
if command -v go >/dev/null 2>&1; then
  print_ok "Go          $(go version 2>/dev/null)"
else
  print_miss "Go          not found — install from https://go.dev/dl/ (need >= 1.23)"
fi

# --- Node ---
if command -v node >/dev/null 2>&1; then
  print_ok "Node        $(node -v 2>/dev/null)"
else
  print_miss "Node        not found — install Node.js 20+ LTS from https://nodejs.org/"
fi

# --- npm (ships with Node) ---
if command -v npm >/dev/null 2>&1; then
  print_ok "npm         $(npm -v 2>/dev/null)"
else
  print_warn "npm         not found (should ship with Node)"
fi

# --- pnpm (recommended default for wails3 projects) ---
if command -v pnpm >/dev/null 2>&1; then
  print_ok "pnpm        $(pnpm -v 2>/dev/null)"
else
  print_warn "pnpm        not found (recommended) — enable via: corepack enable && corepack prepare pnpm@latest --activate"
fi

# --- Task runner (Taskfile-driven builds) ---
if command -v task >/dev/null 2>&1; then
  print_ok "Task        $(task --version 2>/dev/null)"
else
  print_miss "Task        not found — install: go install github.com/go-task/task/v3/cmd/task@latest"
fi

# --- wails3 CLI ---
if command -v wails3 >/dev/null 2>&1; then
  print_ok "wails3 CLI  $(wails3 version 2>/dev/null | head -n1)"
else
  print_miss "wails3 CLI  not found — install: go install github.com/wailsapp/wails/v3/cmd/wails3@latest"
  print_warn "            then ensure \$GOPATH/bin is on PATH"
fi

echo
if [ "$missing" -eq 0 ]; then
  print_ok "Core toolchain present. Run 'wails3 doctor' for a full platform check."
else
  print_miss "Toolchain incomplete. Install the missing items above, then re-run this script."
fi

# Platform-specific webview/runtime hints
echo
case "$(uname -s 2>/dev/null)" in
  MINGW*|MSYS*|CYGWIN*|Windows*)
    print_warn "Windows: ensure WebView2 runtime is installed (usually ships with Edge).";;
  Darwin)
    print_warn "macOS: run 'xcode-select --install' if Command Line Tools are missing.";;
  Linux)
    print_warn "Linux: install libgtk-3-dev + libwebkit2gtk-4.1-dev + pkg-config (Debian/Ubuntu).";;
esac

exit "$missing"
