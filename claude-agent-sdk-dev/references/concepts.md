# Core Concepts Reference

Deep-dive into the concepts the SKILL.md mentions only by name. Read this when the high-level summary is not enough.

## The `query()` function

The only entry point. Returns an async iterator that yields messages in order until the agent loop terminates.

**Python:**

```python
from claude_agent_sdk import query, ClaudeAgentOptions, ResultMessage

async for message in query(
    prompt="...",
    options=ClaudeAgentOptions(allowed_tools=["Read", "Edit"]),
):
    if isinstance(message, ResultMessage):
        ...
```

**TypeScript:**

```typescript
import { query } from "@anthropic-ai/claude-agent-sdk";

for await (const message of query({
  prompt: "...",
  options: { allowedTools: ["Read", "Edit"] }
})) {
  if (message.type === "result") { ... }
}
```

The same `query()` is used for one-shot prompts, multi-turn (with `continue` / `resume`), streaming, and structured output. Differences come from options, not from a different function.

## Message types

Five types, in roughly this order within one `query()` call:

| Type | When emitted | What it carries |
|------|--------------|-----------------|
| `SystemMessage` | Lifecycle events: session init, compaction boundary, status banner, worker shutdown | `subtype` field distinguishes them (`"init"`, `"compact_boundary"`, `"informational"`, `"worker_shutting_down"`) |
| `AssistantMessage` | After every Claude response (intermediate and final) | Text blocks + tool-call blocks |
| `UserMessage` | After every tool execution (tool result fed back) and for any user input streamed mid-loop | Tool result content blocks |
| `StreamEvent` | Only when `include_partial_messages` / `includePartialMessages` is `true` | Raw API streaming events (text deltas, tool input chunks) |
| `ResultMessage` | End of the loop | Final text, token usage, cost, session ID, `subtype` |

### Type dispatch differs by language

- **Python:** use `isinstance(message, ResultMessage)` against classes imported from `claude_agent_sdk`.
- **TypeScript:** check `message.type === "result"` / `"assistant"` / `"user"` / `"system"` / `"stream"`. `AssistantMessage` and `UserMessage` wrap the raw API message in a `.message` field, so content blocks live at `message.message.content`, **not** `message.content`.

### `ResultMessage.subtype` values

`subtype` tells whether the loop ended cleanly or hit a limit:

- `"success"` — Claude finished on its own
- `"success_max_turns"` — hit `max_turns`
- `"success_max_budget"` — hit `max_budget_usd`
- error variants

A non-`"success"` subtype is **not** a crash; it is a controlled stop. Inspect it before treating the result as final.

## Turns

A **turn** = one Claude response + the SDK's execution of any tool calls in that response + feeding results back. Turns repeat without yielding control until Claude produces a response with no tool calls.

- `max_turns` / `maxTurns` counts **tool-using** turns only.
- `max_budget_usd` / `maxBudgetUsd` caps total spend.
- Without limits, open-ended prompts ("improve this codebase") can loop a long time. **Set `max_budget_usd` for any production agent.**

## Permission evaluation order

When Claude requests a tool, the SDK evaluates in this order. Each step can resolve the request (allow or block) or pass through:

1. **Hooks** — `PreToolUse` hook can `allow`, `deny`, or pass through. Returning `allow` here does **not** skip later deny/ask rules.
2. **Deny rules** — from `disallowed_tools` and `settings.json`. Match → blocked, even in `bypassPermissions`. Bare-name rules (`Bash`) remove the tool from Claude's context; scoped rules (`Bash(rm *)`) deny only matching calls.
3. **Ask rules** — from `settings.json`. Match → routed to `canUseTool` callback (in `dontAsk` mode, denied instead).
4. **Permission mode** — `bypassPermissions` approves everything reaching this step; `acceptEdits` approves file ops; `plan` routes edits to `canUseTool`; others fall through.
5. **Allow rules** — from `allowed_tools` and `settings.json`. Match → approved.
6. **`canUseTool` callback** — last resort. In `dontAsk`, skipped (denied).

See `pitfalls.md` for the surprising interactions.

## Hooks

Run user code at lifecycle events. Defined as a dict/list of event-name → callback(s).

Common hook events: `PreToolUse`, `PostToolUse`, `Stop`, `SubagentStop`, `SessionStart`, `SessionEnd`, `UserPromptSubmit`, `PreCompact`, `Notification`.

A `PreToolUse` hook receives the tool name and input, and can return a decision: `allow`, `deny` (with reason), or pass-through. Hooks can also transform tool inputs and outputs.

Use hooks for: audit logging, input validation, blocking destructive ops, redacting secrets, forcing tests after edits.

## Sessions

A **session** is the conversation history the SDK accumulates while the agent works. It is persisted to disk by default (TypeScript can opt out with `persistSession: false`).

Three ways to return to a session:

- **Continue** — pick up the most recent session in the directory. No ID needed. Good for single-conversation apps.
- **Resume** — pass a specific session ID. Required for multi-user apps or returning to a non-latest session.
- **Fork** — start a new session that begins with a copy of an existing one's history. Original is unchanged.

Sessions persist the **conversation**, not the filesystem. For filesystem snapshot/rollback, use **file checkpointing** (`file-checkpointing.md`).

For automatic session management across multiple `query()` calls in one process, use `ClaudeSDKClient` (Python) or `continue: true` (TypeScript).

## Subagents

Separate agent instances spawned by the main agent via the `Agent` tool. Each runs in its own fresh context; only the final message returns to the parent.

Three ways to define them:

- **Programmatic** (recommended): pass `agents={...}` to `query()` options. Each entry has a `description` (when to invoke) and a `prompt` (system prompt for the subagent).
- **Filesystem**: markdown files in `.claude/agents/`.
- **Built-in**: `general-purpose` subagent is always available.

Include `"Agent"` in `allowed_tools` to auto-approve subagent invocations. Without it, each spawn triggers a permission prompt.

**Critical gotcha:** subagent results reach the parent as a `UserMessage` (the SDK wraps them as a tool result), **not** as an `AssistantMessage`. See `pitfalls.md`.

## Structured outputs

Pass an `output_format` (Python) / `outputFormat` (TypeScript) JSON Schema to `query()`. The SDK validates Claude's output against it and re-prompts on mismatch up to a retry limit. On success, the `ResultMessage` includes a `structured_output` field with the validated data.

For type safety, use **Pydantic** (Python) or **Zod** (TypeScript) to define the schema; the SDK converts it to JSON Schema.

If validation fails within the retry limit, the result is an error, not structured data. Always handle both paths.

## Streaming vs single mode

- **Single mode** (default): the SDK waits for each Claude response to complete before yielding. Simpler; use this unless low-latency UX is required.
- **Streaming mode**: enable `include_partial_messages` (Py) / `includePartialMessages` (TS). The SDK yields `StreamEvent` messages with raw deltas in real time.

See `streaming-vs-single-mode.md` for the full comparison and `streaming-output.md` for the streaming API.

## Custom tools via in-process MCP

Define tools as Python/TypeScript functions; the SDK runs an in-process MCP server to expose them to Claude. Tools receive typed arguments and return results. Suitable for: hitting internal APIs, wrapping business logic, integrating with company systems.

See `custom-tools.md` for the decorator/function signatures.

## Filesystem-based configuration

With default options, the SDK loads configuration from `.claude/` in the working directory and `~/.claude/`. This includes:

- `CLAUDE.md` files (project instructions)
- `.claude/settings.json` (settings, permissions)
- `.claude/agents/` (subagent definitions)
- `.claude/skills/` (skills)
- `.claude/commands/` (slash commands)
- `.claude/hooks/` (hook scripts)

To restrict which sources load, set `setting_sources` (Py) / `settingSources` (TS) in options. Common values: `["project", "user", "local"]`.

See `claude-code-features.md` for the full breakdown.
