---
name: claude-agent-sdk-dev
description: This skill should be used when the user asks to "build an AI agent with Claude", "use the Claude Agent SDK", "embed Claude Code as a library", "create an autonomous coding agent", "automate code fixes with Claude", "build a Claude-powered CLI tool", "implement subagents", "add hooks to a Claude agent", "configure Claude SDK permissions", "stream Claude agent responses", "use query() / ClaudeAgentOptions", or otherwise develops software using the Claude Agent SDK (Python or TypeScript). Covers project bootstrap, tool/permission/hook/session configuration, message handling, streaming, structured output, MCP/subagent integration, and production hardening. Do NOT use for general Claude Code CLI usage questions, prompt engineering for claude.ai, or Anthropic API (Messages API / Client SDK) direct calls—those belong to claude-code-doc or anthropic-api skills.
version: 0.1.0
---

# Claude Agent SDK Development

## Overview

The Claude Agent SDK embeds the full Claude Code agent loop (tools, context management, hooks, permissions) inside a Python or TypeScript application via a single `query()` function. It is the path to building production AI agents that read files, run commands, edit code, and orchestrate subagents programmatically—without re-implementing tool execution.

This skill drives every Agent SDK task through a fixed workflow. **Follow the phases in order. Do not skip the documentation lookup (Phase 3)** — the SDK surface is large and most bugs come from stale assumptions.

## Core Workflow

### Phase 1 — Classify the Task

Determine which of these the request is:

1. **New project / new agent** — greenfield SDK usage, no existing `query()` calls in the repo.
2. **Existing project — extend / debug** — adding hooks, MCP, subagents, streaming, or fixing behavior in code that already imports `claude_agent_sdk` / `@anthropic-ai/claude-agent-sdk`.
3. **Conceptual / API question** — "how do I …" lookup, no code change requested.

Inspect the project to decide: look for `claude_agent_sdk` in `pyproject.toml`/`requirements.txt`, or `@anthropic-ai/claude-agent-sdk` in `package.json`. Their presence → existing project.

### Phase 2 — Confirm Language

The SDK has two first-class implementations with **non-identical APIs**:

- **Python**: `claude_agent_sdk`, async-first, `from claude_agent_sdk import query, ClaudeAgentOptions`
- **TypeScript**: `@anthropic-ai/claude-agent-sdk`, async iterator, `import { query } from "@anthropic-ai/claude-agent-sdk"`

Snake_case in Python (`allowed_tools`, `max_turns`) vs camelCase in TypeScript (`allowedTools`, `maxTurns`). When the user does not specify, infer from the project's `pyproject.toml` vs `package.json`; if neither exists, ask before writing code.

### Phase 3 — Load Documentation (mandatory)

The full official documentation is mirrored at `docs/claude-agent-sdk/` (relative to the repo root that hosts this skill). **Always consult it before writing non-trivial SDK code** — the SDK evolves quickly and the API surface is broad.

Map the task to the right document using `references/doc-index.md`. Quick orientation:

| Task | Document |
|------|----------|
| Hello world, install, first agent | `docs/claude-agent-sdk/quickstart.md` |
| Capabilities map, decision tree vs Client SDK | `docs/claude-agent-sdk/overview.md` |
| Message lifecycle, turns, compaction | `docs/claude-agent-sdk/agent-loop.md` |
| Full API reference | `docs/claude-agent-sdk/python.md` or `typescript.md` |
| Hooks, MCP, subagents, sessions, permissions, streaming, structured output, custom tools | `docs/claude-agent-sdk/<topic>.md` |

For full category mapping, read `references/doc-index.md`.

### Phase 4 — Configure the Agent

Decide configuration before coding. Walk through these dimensions in order; each maps to a doc:

1. **Tools** — built-in (`Read`, `Edit`, `Bash`, `Glob`, `Grep`) vs custom MCP tools. Start minimal.
2. **Permissions** — `permission_mode` + `allowed_tools` / `disallowed_tools`. **Read `references/pitfalls.md` first** — the interaction between `bypassPermissions` and `allowed_tools` is the #1 source of "tool unexpectedly denied/approved" bugs.
3. **System prompt** — `claude_code` preset (default) vs custom. See `modifying-system-prompts.md`.
4. **Hooks** — only if interception/transformation is required. See `hooks.md`.
5. **Sessions** — resume/fork only if multi-turn persistence is needed. See `sessions.md`.
6. **Streaming** — `include_partial_messages` for real-time UX. See `streaming-output.md`.
7. **Cost limits** — set `max_budget_usd` for any production-facing agent. See `cost-tracking.md`.

### Phase 5 — Implement

Apply these rules:

- **Minimal options first.** Start with `query(prompt=..., options=ClaudeAgentOptions(allowed_tools=[...]))`. Add complexity (hooks, subagents, custom tools) only when the minimal version works.
- **Handle messages by type.** Iterate the stream and dispatch on `SystemMessage` / `AssistantMessage` / `UserMessage` / `ResultMessage`. Never assume the first message is the result. See `references/concepts.md`.
- **Check `ResultMessage.subtype`.** Values like `"success_max_turns"`, `"success_max_budget"` mean the loop hit a limit, not that the task finished cleanly.
- **Use working examples as scaffolding.** Copy from `examples/minimal-python/` or `examples/minimal-typescript/` and adapt.
- **Delegate the write-and-verify loop to the builder subagent for non-trivial work.** When the task involves writing new SDK files, extending an existing SDK agent, or debugging SDK-specific failures, dispatch the `claude-agent-sdk-builder` agent. The builder is part of the standalone [agents collection](https://github.com/Airmomo/agents) (`~/.claude/agents/claude-agent-sdk-builder.md` after install) and is fully self-contained — it bundles its own copy of the SDK documentation and does not depend on this skill. Dispatching it keeps doc snippets and trial output out of the main conversation. Reserve inline implementation for one-liners or trivial edits.

For task-specific recipes (bug-fixer agent, code reviewer, structured-output extractor, multi-subagent pipeline), see `references/task-recipes.md`.

### Phase 6 — Validate

Before declaring done:

- Run the agent end-to-end against a real prompt. Token/cost reports must appear in `ResultMessage`.
- Verify the agent stops on its own (no infinite tool-calling loop). If it loops, set `max_turns` and re-run.
- If `permission_mode` is set, test a tool that should be denied and one that should be allowed — both paths. Permission bugs are silent.
- For production agents, confirm `max_budget_usd` is set and there is a `canUseTool` callback (see `user-input.md`) for any path that needs human approval.

## Documentation Navigation

`references/doc-index.md` is the authoritative map from intent → document. When in doubt about which doc to read, consult it first.

## Core Concepts (quick reference)

Detailed in `references/concepts.md`:

- **`query()` is the only entry point.** Returns an async iterator of messages. The loop runs inside the SDK; code consumes the stream.
- **Five message types.** `SystemMessage` (lifecycle), `AssistantMessage` (Claude's text + tool calls), `UserMessage` (tool results fed back), `StreamEvent` (partial, opt-in), `ResultMessage` (terminal, with cost/session).
- **Turns, not requests.** One turn = one Claude response + tool execution. `max_turns` counts tool-using turns. Without limits, open-ended prompts can loop indefinitely.
- **`allowed_tools` ≠ constraint.** It pre-approves listed tools; unlisted tools still run if `permission_mode` allows. Use `disallowed_tools` to actually block.
- **Python checks types with `isinstance()`; TypeScript checks `message.type === "result"` etc.** `AssistantMessage.message.content` (TS) vs `message.content` (Py).

## Common Pitfalls

Top issues, summarized. Full list with fixes in `references/pitfalls.md`:

1. **`bypassPermissions` + `allowed_tools=["Read"]` still approves every tool.** `allowed_tools` only pre-approves; it does not constrain `bypassPermissions`. Use `disallowed_tools` to block specific tools.
2. **Subagent results appear as `UserMessage`, not `AssistantMessage`.** When the main agent invokes the `Agent` tool, the subagent's final output is wrapped as a `UserMessage` carrying a `ToolResultBlock`.
3. **`ResultMessage` is not always the last message.** A few trailing system events (`prompt_suggestion`) can arrive after it. Iterate the stream to completion.
4. **`subtype` ≠ `"success"` does not mean crashed.** It means a limit was hit. Inspect the subtype string to know which.
5. **MCP tool names in `allowed_tools` must use the `mcp__<server>__<tool>` form.** Bare names are ignored with a startup warning.

## Additional Resources

### Reference Files (in this skill)

- **`references/doc-index.md`** — Intent → document map. **Read first when deciding which doc to consult.**
- **`references/task-recipes.md`** — Copy-adapt recipes: bug fixer, code reviewer, structured-output extractor, multi-subagent pipeline, session resume.
- **`references/concepts.md`** — Core concepts deep-dive: message types, turns, permissions flow, hooks lifecycle, sessions model.
- **`references/pitfalls.md`** — Top pitfalls with verified fixes and the source doc each came from.

### Official Documentation (mirrored)

All 30 official docs at `docs/claude-agent-sdk/` (relative to the repo root). When the local mirror is stale or missing, fetch fresh from `https://code.claude.com/docs/en/agent-sdk/<page>.md` (append `.md` to any page URL).

### Examples (in this skill)

- **`examples/minimal-python/main.py`** — Smallest runnable Python agent.
- **`examples/minimal-typescript/main.ts`** + `package.json` — Smallest runnable TypeScript agent.

Use these as scaffolding for new projects; copy and adapt rather than starting from a blank file.

### Builder Subagent (standalone, lives in the agents collection)

- **`claude-agent-sdk-builder`** — Execution specialist for writing and verifying SDK code. Dispatch it from Phase 5 when the implementation is non-trivial. The agent is part of the standalone [agents collection](https://github.com/Airmomo/agents), installed to `~/.claude/agents/`. It is fully self-contained: it bundles its own copy of the SDK docs at `agents/docs/claude-agent-sdk/` and has no runtime dependency on this skill. Skill and agent are intentionally isolated so each can be installed and used without the other.
