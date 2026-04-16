#!/usr/bin/env bash
# Auto-optimize Skill — verify repo layout and optional delivery vs final-track bytes.
# Run from repository root:
#   bash scripts/skill-verify.sh
#   FINAL_TRACK_FILE=tracks/prompt-d/r09.html DELIVERY_FILE=index.html bash scripts/skill-verify.sh
#
# Exit: 0 = pass; non-zero = do not claim delivery matches final track file.

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

DELIVERY="${DELIVERY_FILE:-index.html}"
FINAL="${FINAL_TRACK_FILE:-}"

fail=0

echo "== Skill verify (repo: $ROOT) =="

ACC="tracks/phase-01-acceptance.md"
if [[ ! -f "$ACC" ]]; then
  echo "FAIL: $ACC missing (phase 1 acceptance checklist required; see phase-01-spec.md)"
  fail=1
else
  echo "OK: $ACC exists"
  if grep -qE '^- \[ \]' "$ACC" 2>/dev/null; then
    echo "FAIL: $ACC still has unchecked items (- [ ]); acceptance must be all done before claiming delivery-ready"
    fail=1
  else
    echo "OK: $ACC has no unchecked - [ ] items (or no checklist lines)"
  fi
  if ! grep -qE '^- \[' "$ACC" 2>/dev/null; then
    echo "WARN: $ACC has no lines like '- [x]' / '- [ ]' — phase-01-spec.md expects at least one acceptance line"
  fi
fi

shopt -s nullglob
dirs=(tracks/prompt-*/)
if [[ ${#dirs[@]} -eq 0 ]]; then
  echo "SKIP: no tracks/prompt-*/ (inner loop artifacts not present yet)"
else
  for d in "${dirs[@]}"; do
    r01=( "${d}"r01.* )
    if [[ ${#r01[@]} -eq 0 ]]; then
      echo "FAIL: $d missing r01.*"
      fail=1
    else
      echo "OK: $d has r01 (${r01[0]})"
    fi
    r02=( "${d}"r02.* )
    if [[ ${#r02[@]} -eq 0 ]]; then
      echo "FAIL: $d missing r02.* (phase-03-inner.md: each prompt track needs ≥2 rounds)"
      fail=1
    else
      echo "OK: $d has r02 (${r02[0]})"
    fi
  done
fi

if [[ -n "$FINAL" ]]; then
  if [[ ! -f "$FINAL" ]]; then
    echo "FAIL: FINAL_TRACK_FILE not found: $FINAL"
    fail=1
  elif [[ ! -f "$DELIVERY" ]]; then
    echo "FAIL: DELIVERY_FILE not found: $DELIVERY"
    fail=1
  else
    if command -v shasum >/dev/null 2>&1; then
      h1=$(shasum -a 256 "$DELIVERY" | awk '{print $1}')
      h2=$(shasum -a 256 "$FINAL" | awk '{print $1}')
      if [[ "$h1" == "$h2" ]]; then
        echo "OK: $DELIVERY sha256 matches $FINAL"
      else
        echo "FAIL: $DELIVERY sha256 $h1 != $FINAL sha256 $h2"
        fail=1
      fi
    else
      echo "WARN: shasum not found; trying cmp"
      if cmp -s "$DELIVERY" "$FINAL"; then
        echo "OK: $DELIVERY bytes match $FINAL (cmp)"
      else
        echo "FAIL: $DELIVERY differs from $FINAL (cmp)"
        fail=1
      fi
    fi
  fi
else
  echo "SKIP: byte-compare (set FINAL_TRACK_FILE=tracks/prompt-x/rNN.ext to compare with DELIVERY_FILE=$DELIVERY)"
fi

exit "$fail"
