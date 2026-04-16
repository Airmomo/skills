# Auto-optimize — Agent Skill

**Double-layer auto-optimization Agent Skill** — **host-agnostic**: use with any IDE, CLI, or Skill-capable tool (OpenClaw, editor integrations, etc.), not tied to a single vendor.

## One-liner

An **Agent Skill** workflow (entry: root `SKILL.md` + `docs/`): lock requirements first, iterate **multiple Prompt phrasings** in parallel, write **each round to disk** under `tracks/prompt-*/`, use an **acceptance checklist** (not self-score alone) as the delivery bar, and optionally **hash-compare** delivery vs the chosen final track file.

## Why use it?

- Vague requirements → churn without a baseline  
- Only one phrasing → no A/B on “how to ask”  
- “Five iterations” with **no files** → not auditable  
- Self-score 8/10 while features missing  
- **No proof** delivery matches the “final” track file  

This Skill addresses that with **four phases** and **five verifiability rules (R1–R5)**.

## Quick start

1. Keep this repo at your project root (or merge `SKILL.md`, `program.md`, `docs/`, `scripts/` into an existing repo).
2. Optional: add host-specific rules (e.g. `.cursor/rules/`, OpenClaw config) to enforce the workflow.
3. Ask for features in your host; the agent should follow the phases when this Skill is loaded.
4. Verify from **repository root**:

```bash
FINAL_TRACK_FILE=tracks/prompt-a/r05.html DELIVERY_FILE=index.html bash scripts/skill-verify.sh
```

## Layout

| Path | Role |
|------|------|
| `SKILL.md` | Skill entry (YAML `description` for discovery) |
| `program.md` | Shortest path for agents |
| `docs/` | R1–R5 and phase 1–4 norms |
| `scripts/skill-verify.sh` | Optional checks (run from repo root) |

## License

MIT — see [LICENSE](LICENSE).
