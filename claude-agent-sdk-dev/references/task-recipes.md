# Task Recipes — Copy-Adapt Patterns

Working recipes for common agent builds. Each recipe states the **intent**, the **minimal code**, and the **doc to read for the full surface**.

Recipes are intentionally minimal. Strip the comments and copy into a real project; the surrounding application code (CLI parsing, logging, env loading) is not shown.

---

## Recipe 1 — One-shot bug fixer

**Intent:** Run Claude once to find and fix bugs in a file or module.

**Python:**

```python
import asyncio
from claude_agent_sdk import query, ClaudeAgentOptions, ResultMessage

async def main():
    async for message in query(
        prompt="Find and fix the bug in auth.py. Run the tests after.",
        options=ClaudeAgentOptions(
            allowed_tools=["Read", "Edit", "Bash"],
            permission_mode="acceptEdits",
            max_budget_usd=0.50,
        ),
    ):
        if isinstance(message, ResultMessage) and message.subtype.startswith("success"):
            print(message.result)
            print(f"Cost: ${message.total_cost_usd:.4f}")

asyncio.run(main())
```

**TypeScript:**

```typescript
import { query } from "@anthropic-ai/claude-agent-sdk";

for await (const message of query({
  prompt: "Find and fix the bug in auth.ts. Run the tests after.",
  options: {
    allowedTools: ["Read", "Edit", "Bash"],
    permissionMode: "acceptEdits",
    maxBudgetUsd: 0.50,
  },
})) {
  if (message.type === "result" && message.subtype?.startsWith("success")) {
    console.log(message.result);
    console.log(`Cost: $${message.total_cost_usd?.toFixed(4)}`);
  }
}
```

**Doc:** `quickstart.md`, `permissions.md`.

---

## Recipe 2 — Read-only code reviewer

**Intent:** Analyze code without modifying anything. Pre-approve safe tools, deny everything that writes.

**Python:**

```python
from claude_agent_sdk import query, ClaudeAgentOptions, ResultMessage

async for message in query(
    prompt="Review src/auth/ for security issues. Produce a markdown report.",
    options=ClaudeAgentOptions(
        allowed_tools=["Read", "Glob", "Grep"],
        disallowed_tools=["Edit", "Write", "Bash"],
        permission_mode="dontAsk",  # anything not pre-approved is denied, no prompt
    ),
):
    if isinstance(message, ResultMessage):
        print(message.result)
```

**Key points:**
- `permission_mode="dontAsk"` turns anything not pre-approved into a hard deny. Pair with `allowed_tools` for a locked-down agent.
- `disallowed_tools` with bare names removes those tools entirely from Claude's view.

**Doc:** `permissions.md`.

---

## Recipe 3 — Structured-output extractor

**Intent:** Run an agent that uses tools freely, then return validated typed data.

**Python (Pydantic):**

```python
from pydantic import BaseModel
from claude_agent_sdk import query, ClaudeAgentOptions, ResultMessage

class BugReport(BaseModel):
    file: str
    line: int
    severity: str  # "low" | "medium" | "high"
    description: str
    suggested_fix: str

async for message in query(
    prompt="Analyze auth.py and report the most critical bug.",
    options=ClaudeAgentOptions(
        allowed_tools=["Read", "Grep", "Glob"],
        output_format=BugReport.model_json_schema(),
    ),
):
    if isinstance(message, ResultMessage) and message.subtype.startswith("success"):
        if message.structured_output:
            report = BugReport(**message.structured_output)
            print(report)
        else:
            print("Validation failed:", message.subtype)
```

**TypeScript (Zod):**

```typescript
import { z } from "zod";
import { query } from "@anthropic-ai/claude-agent-sdk";
import { zodToJsonSchema } from "zod-to-json-schema";

const BugReport = z.object({
  file: z.string(),
  line: z.number(),
  severity: z.enum(["low", "medium", "high"]),
  description: z.string(),
  suggested_fix: z.string(),
});

for await (const message of query({
  prompt: "Analyze auth.ts and report the most critical bug.",
  options: {
    allowedTools: ["Read", "Grep", "Glob"],
    outputFormat: {
      type: "json_schema",
      schema: zodToJsonSchema(BugReport, "BugReport"),
    },
  },
})) {
  if (message.type === "result" && message.subtype?.startsWith("success")) {
    if (message.structured_output) {
      const report = BugReport.parse(message.structured_output);
      console.log(report);
    } else {
      console.log("Validation failed:", message.subtype);
    }
  }
}
```

**Doc:** `structured-outputs.md`.

---

## Recipe 4 — Multi-turn chat with `ClaudeSDKClient`

**Intent:** Maintain a running conversation across multiple user prompts in one process. Python uses `ClaudeSDKClient`; TypeScript uses `continue: true`.

**Python:**

```python
import asyncio
from claude_agent_sdk import (
    ClaudeSDKClient, ClaudeAgentOptions,
    AssistantMessage, ResultMessage, TextBlock,
)

async def main():
    options = ClaudeAgentOptions(allowed_tools=["Read", "Grep"])
    async with ClaudeSDKClient(options=options) as client:
        for prompt in ["Summarize this module.", "Now refactor it.", "What did you change?"]:
            await client.query(prompt=prompt)
            async for message in client.receive_response():
                if isinstance(message, AssistantMessage):
                    for block in message.content:
                        if isinstance(block, TextBlock):
                            print(block.text)
                elif isinstance(message, ResultMessage):
                    print(f"[{message.subtype}] cost: ${message.total_cost_usd:.4f}")

asyncio.run(main())
```

**TypeScript (using `continue`):**

```typescript
import { query } from "@anthropic-ai/claude-agent-sdk";

const options = { allowedTools: ["Read", "Grep"] };

for (const prompt of ["Summarize this module.", "Now refactor it."]) {
  for await (const message of query({ prompt, options: { ...options, continue: true } })) {
    if (message.type === "result") console.log(message.result);
  }
}
```

**Doc:** `sessions.md`.

---

## Recipe 5 — Subagents for parallel review

**Intent:** Run multiple specialized reviewers concurrently; collect their reports.

**Python:**

```python
import asyncio
from claude_agent_sdk import (
    query, ClaudeAgentOptions, AgentDefinition, ResultMessage,
)

async def main():
    async for message in query(
        prompt="Review src/auth/ for security, style, and test coverage.",
        options=ClaudeAgentOptions(
            allowed_tools=["Read", "Grep", "Glob", "Agent"],  # Agent must be allowed
            agents={
                "security-reviewer": AgentDefinition(
                    description="Security specialist. Use for vulnerability review.",
                    prompt="You are a security reviewer. Focus only on security issues.",
                ),
                "style-checker": AgentDefinition(
                    description="Code style reviewer. Use for style and convention issues.",
                    prompt="You are a style reviewer. Focus only on style and conventions.",
                ),
                "test-coverage": AgentDefinition(
                    description="Test coverage analyst. Use for gaps in test coverage.",
                    prompt="You are a test coverage analyst. Focus only on coverage gaps.",
                ),
            },
        ),
    ):
        if isinstance(message, ResultMessage):
            print(message.result)

asyncio.run(main())
```

**Critical:** Include `"Agent"` in `allowed_tools`. Subagent results reach the parent as a `UserMessage`, not `AssistantMessage` — see `pitfalls.md` #2.

**Doc:** `subagents.md`.

---

## Recipe 6 — Streaming for real-time UX

**Intent:** Show partial output as Claude generates, not just at end of turn.

**Python:**

```python
import asyncio
from claude_agent_sdk import (
    query, ClaudeAgentOptions, AssistantMessage, ResultMessage, TextBlock,
)

async def main():
    async for message in query(
        prompt="Explain how this codebase handles authentication.",
        options=ClaudeAgentOptions(
            allowed_tools=["Read", "Grep"],
            include_partial_messages=True,
        ),
    ):
        # StreamEvent partials arrive here; AssistantMessage carries completed turns
        if isinstance(message, AssistantMessage):
            for block in message.content:
                if isinstance(block, TextBlock):
                    print(block.text, end="", flush=True)
        elif isinstance(message, ResultMessage):
            print(f"\n[done: {message.subtype}, cost: ${message.total_cost_usd:.4f}]")

asyncio.run(main())
```

**Doc:** `streaming-output.md`, `streaming-vs-single-mode.md`.

---

## Recipe 7 — Custom tool via in-process MCP

**Intent:** Expose an internal function as a tool Claude can call.

**Python (sketch — see `custom-tools.md` for full signature):**

```python
from claude_agent_sdk import query, ClaudeAgentOptions, MCPStdioServer

# Define a tool that hits an internal API
# (full decorator / interface in custom-tools.md)
options = ClaudeAgentOptions(
    allowed_tools=["get_user_profile", "Read"],
    mcp_tools=[...],  # tool definitions
)

async for message in query(prompt="...", options=options):
    ...
```

**Doc:** `custom-tools.md` — read it before implementing; the tool-definition interface has specific requirements.

---

## Recipe 8 — Resume a session across process restarts

**Intent:** Capture a session ID, persist it, and resume it later from a different process.

**Python:**

```python
# Process 1: capture the session ID
session_id = None
async for message in query(prompt="Analyze this module.", options=ClaudeAgentOptions()):
    if isinstance(message, ResultMessage):
        session_id = message.session_id

# Persist session_id to disk / DB ...

# Process 2: resume by ID
async for message in query(
    prompt="What did you conclude about the module?",
    options=ClaudeAgentOptions(resume=session_id),
):
    ...
```

**Doc:** `sessions.md` — "Continue, resume, and fork".

---

## Recipe 9 — Locked-down production agent

**Intent:** Maximum safety for an unattended production workload.

```python
ClaudeAgentOptions(
    allowed_tools=["Read", "Grep", "Glob"],          # read-only by default
    disallowed_tools=["Bash", "Write", "Edit"],       # hard-block destructive tools
    permission_mode="dontAsk",                        # no prompts; deny anything else
    max_budget_usd=1.00,                              # cap spend
    max_turns=20,                                     # cap iterations
    setting_sources=["project"],                      # only project settings, ignore user-level
)
```

**Doc:** `permissions.md`, `secure-deployment.md`, `cost-tracking.md`.

---

## Picking a recipe

| If the task is… | Start with |
|-----------------|-----------|
| One-shot scripted work | Recipe 1 |
| Analysis only, no writes | Recipe 2 |
| Need typed data back | Recipe 3 |
| Interactive chat | Recipe 4 |
| Multiple specialized analyses | Recipe 5 |
| User-facing real-time UI | Recipe 6 |
| Integrate internal APIs | Recipe 7 |
| Resume across restarts | Recipe 8 |
| Unattended production | Recipe 9 |

After the recipe runs, consult the corresponding doc for the full option surface.
