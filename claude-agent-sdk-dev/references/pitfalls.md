# Pitfalls & Best Practices

Top issues encountered with the Claude Agent SDK, each with the **verified fix** and the **source document** it came from. Read this before writing non-trivial SDK code, especially around permissions and message handling.

---

## 1. `bypassPermissions` + `allowed_tools` does not restrict tools

**Symptom:** An agent configured with `allowed_tools=["Read"]` and `permission_mode="bypassPermissions"` still runs `Bash`, `Write`, and `Edit`.

**Cause:** `allowed_tools` only **pre-approves** the tools it lists. Unlisted tools are not matched by any allow rule and fall through to `permission_mode`, where `bypassPermissions` approves them. `allowed_tools` is a pre-approval list, not a constraint.

**Fix:** To block specific tools under `bypassPermissions`, use `disallowed_tools`:

```python
ClaudeAgentOptions(
    permission_mode="bypassPermissions",
    allowed_tools=["Read", "Edit"],          # pre-approve
    disallowed_tools=["Bash(rm *)"],         # actually block
)
```

**Source:** `permissions.md` — "Allow and deny rules".

**TypeScript-only addendum:** To use `permissionMode: "bypassPermissions"` in TS, set **also** `allowDangerouslySkipPermissions: true`. The TS SDK refuses to bypass permissions without this explicit opt-in. Python has no such gate.

---

## 2. Subagent results appear as `UserMessage`, not `AssistantMessage`

**Symptom:** Waiting for the subagent's output in the `AssistantMessage` handler misses it; the result seems to vanish.

**Cause:** When the main agent invokes the `Agent` tool, the SDK executes the subagent, wraps its final output as a `ToolResultBlock`, and feeds it back as a `UserMessage`. This is the same path all tool results take — `UserMessage` is not only for human input.

**Fix:** Handle `UserMessage` when waiting for subagent results. To attribute results, track the `parent_tool_use_id` field that the SDK attaches to messages inside a subagent's context.

**Source:** `subagents.md` — "What subagents inherit"; `agent-loop.md` — "Message types".

---

## 3. `ResultMessage` is not always the last message

**Symptom:** Breaking out of the message loop on the first `ResultMessage` misses trailing events; some state seems inconsistent.

**Cause:** A small number of system events (`prompt_suggestion`, etc.) can arrive after `ResultMessage`.

**Fix:** Iterate the stream to completion. Treat `ResultMessage` as the terminal data event, not as the iteration terminator.

**Source:** `agent-loop.md` — "Message types".

---

## 4. `subtype ≠ "success"` is not a crash

**Symptom:** The agent ran to completion, looks correct, but `subtype` is `"success_max_turns"` or `"success_max_budget"`. Code that branches on `subtype == "success"` treats this as failure.

**Cause:** `subtype` reports **how the loop ended**, not whether the work was correct. A `success_*` prefix means the task produced a result; the suffix reports the limit hit.

**Fix:** Treat any `subtype` starting with `success` as a delivered result. If the suffix matters (e.g. for cost/limit telemetry), branch on it explicitly. Reserve "error" handling for actual error subtypes.

**Source:** `agent-loop.md` — "Handle the result".

---

## 5. `mcp__<server>__<tool>` form is mandatory in `allowed_tools`

**Symptom:** `allowed_tools=["github"]` or `allowed_tools=["*"]` does nothing; startup emits a warning; tools still require approval.

**Cause:** Allow rules accept tool-name globs only after a literal `mcp__<server>__` prefix. The server segment must be glob-free so the rule names a specific configured server. Bare `"*"` or `"mcp__*"` is ignored.

**Fix:** Use the fully qualified form:

```python
allowed_tools=["mcp__github__get_*", "mcp__puppeteer__*"]
```

Deny rules are different — they accept bare globs like `"*"` or `"mcp__*"`.

**Source:** `permissions.md` — "Allow and deny rules".

---

## 6. TypeScript content blocks live at `.message.content`, not `.content`

**Symptom:** Reading `message.content` on an `AssistantMessage` or `UserMessage` in TypeScript returns `undefined` or the wrong shape.

**Cause:** In TypeScript, `AssistantMessage` and `UserMessage` wrap the raw API message in a `.message` field. Content blocks are at `message.message.content`. (In Python, they are at `message.content` directly.)

**Fix:**

```typescript
if (message.type === "assistant") {
  for (const block of message.message.content) {  // not message.content
    ...
  }
}
```

**Source:** `agent-loop.md` — "Handle messages".

---

## 7. Hooks returning `allow` does not skip deny / ask rules

**Symptom:** A `PreToolUse` hook returns `allow`, but a tool call still gets blocked or prompted.

**Cause:** Hooks are evaluated first, but their `allow` decision does not bypass downstream deny/ask rules. Deny rules and ask rules are evaluated regardless of hook result.

**Fix:** Design hook logic with this in mind. If a hook wants to guarantee approval, also configure `allowed_tools` / `disallowed_tools` consistently. Hooks are best for **observation, transformation, and last-line policy**, not as the sole allow-mechanism.

**Source:** `permissions.md` — "How permissions are evaluated".

---

## 8. Open-ended prompts loop indefinitely without limits

**Symptom:** An agent given a prompt like "improve this codebase" runs for many turns, costs pile up, no clear stopping point.

**Cause:** Without `max_turns` or `max_budget_usd`, the loop runs until Claude decides it is done. Open-ended prompts rarely converge.

**Fix:** Set `max_budget_usd` on every production agent. For exploratory work, also set `max_turns`. Tighten the prompt to a concrete deliverable.

**Source:** `agent-loop.md` — "Turns and budget".

---

## 9. `disallowed_tools=["Bash"]` vs `["Bash(rm *)"]` behave differently

**Symptom:** Confused about whether `Bash` is "available but some calls blocked" or "removed entirely."

**Cause:**
- Bare-name deny (`"Bash"`) removes the tool **definition** from the request. Claude never sees it.
- Scoped deny (`"Bash(rm *)"`) keeps `Bash` available but denies calls matching the pattern in every mode, including `bypassPermissions`.

**Fix:** Use the bare name when Claude should not even consider the tool. Use scoped denies for "tool is fine, specific dangerous patterns are not."

**Source:** `permissions.md` — "Allow and deny rules" table.

---

## 10. Structured-output validation failure is an error, not a fallback

**Symptom:** With `output_format` set, sometimes no `structured_output` appears on the result.

**Cause:** If the output does not validate within the retry limit, the SDK returns an **error result**, not unvalidated text. There is no implicit fallback.

**Fix:** Always handle both paths: `structured_output` present (success) and error subtype (validation failed). Tune the schema or the prompt if failures recur.

**Source:** `structured-outputs.md` — "Error handling".

---

## 11. Sessions persist conversation, not files

**Symptom:** Resuming a session expects earlier file edits to be reverted or repeated; they are not.

**Cause:** Sessions persist the **conversation history** only. Filesystem state is whatever the previous run left on disk.

**Fix:** For filesystem snapshot/rollback, use **file checkpointing** (`file-checkpointing.md`). Sessions resume what Claude *knew*, not what Claude *wrote*.

**Source:** `sessions.md` — opening note.

---

## 12. Python always persists sessions; TypeScript can opt out

**Symptom:** Multi-tenant Python app writes one session per request to disk; storage grows unbounded.

**Cause:** Python SDK always persists sessions to disk. There is no `persist_session=False` option in Python.

**Fix:** For Python multi-tenant, manage session directories explicitly and clean them up. For stateless TypeScript tasks, set `persistSession: false`.

**Source:** `sessions.md` — "Choose an approach".

---

## Best practices (positive guidance)

1. **Start minimal.** First agent: `query(prompt=..., options=ClaudeAgentOptions(allowed_tools=[...]))`. Add hooks/MCP/subagents only after the minimal version works.
2. **Set `max_budget_usd` always** for any non-interactive workload.
3. **Validate end-to-end** on a real prompt. Token/cost must appear in `ResultMessage`.
4. **Use `examples/minimal-python/` and `examples/minimal-typescript/`** as scaffolding. Copy, then adapt — do not start from a blank file.
5. **Document the language choice** at the top of any non-trivial SDK file. Python and TypeScript have non-identical APIs.
6. **When in doubt, read the doc.** Use `doc-index.md` to find the right one quickly.
