# Documentation Index — Intent → Document Map

This is the authoritative map from **what you want to do** to **which document to read**. Always consult this before guessing which doc covers a topic.

All paths are relative to the repository root that hosts this skill (i.e. `docs/claude-agent-sdk/<file>.md`). Each doc is also reachable online at `https://code.claude.com/docs/en/agent-sdk/<file>` (append `.md` for the markdown source).

## Getting started

| Intent | Document |
|--------|----------|
| Install the SDK, run a first agent | `quickstart.md` |
| Understand what the SDK is for, compare to Client SDK / Claude Code CLI / Managed Agents | `overview.md` |
| Migrate from old Claude Code SDK (TS/Py) to Agent SDK | `migration-guide.md` |

## Core mechanics

| Intent | Document |
|--------|----------|
| Understand the agent loop, message lifecycle, turns, compaction | `agent-loop.md` |
| Full Python API reference (functions, types, classes) | `python.md` |
| Full TypeScript API reference (functions, types, interfaces) | `typescript.md` |
| Choose input mode: streaming vs single | `streaming-vs-single-mode.md` |
| Get real-time streamed responses | `streaming-output.md` |
| Get validated JSON / typed structured output | `structured-outputs.md` |
| Surface approval prompts & clarifying questions to users | `user-input.md` |

## Configuration & control

| Intent | Document |
|--------|----------|
| Restrict which tools the agent can use; permission modes | `permissions.md` |
| Run custom code at lifecycle events (PreToolUse, PostToolUse, Stop, …) | `hooks.md` |
| Use the default `claude_code` system prompt vs a custom one | `modifying-system-prompts.md` |
| Load Claude Code features (CLAUDE.md, skills, plugins, settings sources) | `claude-code-features.md` |
| Load plugins into the SDK | `plugins.md` |

## Tools & extensibility

| Intent | Document |
|--------|----------|
| Define custom tools via in-process MCP server | `custom-tools.md` |
| Connect external MCP servers (databases, browsers, APIs) | `mcp.md` |
| Scale to many tools (thousands) with on-demand loading | `tool-search.md` |
| Define and invoke subagents | `subagents.md` |
| Use Agent Skills inside the SDK | `skills.md` |
| Use slash commands programmatically | `slash-commands.md` |
| Track and display todos | `todo-tracking.md` |

## State & continuity

| Intent | Document |
|--------|----------|
| Persist / resume / fork conversation sessions | `sessions.md` |
| Mirror session transcripts to external storage (S3, Redis) | `session-storage.md` |
| Snapshot & roll back file changes | `file-checkpointing.md` |

## Production hardening

| Intent | Document |
|--------|----------|
| Track token usage and cost; configure prompt caching | `cost-tracking.md` |
| Export traces / metrics via OpenTelemetry | `observability.md` |
| Deploy the SDK in production (subprocess architecture, scaling, isolation) | `hosting.md` |
| Secure deployments (credentials, network, isolation) | `secure-deployment.md` |

## Special & legacy

| Intent | Document |
|--------|----------|
| Reference for the **removed** V2 TypeScript session API | `typescript-v2-preview.md` |

## Reading order for a new project

1. `overview.md` — decision tree vs alternatives
2. `quickstart.md` — first running agent
3. `agent-loop.md` — understand what `query()` yields
4. `permissions.md` — set safe defaults before any real workload
5. The doc for whichever feature is next on the roadmap (hooks / sessions / streaming / subagents / MCP)

## Reading order for debugging an existing project

1. `agent-loop.md` — confirm understanding of message flow
2. The doc matching the misbehaving feature (use the tables above)
3. `python.md` / `typescript.md` — verify the option name spelling and types
4. `pitfalls.md` (in this skill's `references/`) — common silent bugs
