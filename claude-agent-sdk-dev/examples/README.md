# Examples

Minimal runnable Claude Agent SDK agents in both supported languages. Use as scaffolding for new projects.

## `minimal-python/`

Smallest Python agent. Pre-approves `Read` / `Glob` / `Grep`, prints Claude's text and tool calls, reports cost on completion.

```bash
cd minimal-python
pip install claude-agent-sdk
export ANTHROPIC_API_KEY=sk-...
python main.py
```

## `minimal-typescript/`

Smallest TypeScript agent. Same behavior as the Python version.

```bash
cd minimal-typescript
npm install
export ANTHROPIC_API_KEY=sk-...
npx tsx main.ts
```

## Adapting

Common modifications:

- **Change the task:** edit the `PROMPT` constant.
- **Allow more tools:** add to `allowed_tools` / `allowedTools` (e.g. `"Edit"`, `"Bash"`).
- **Lock down:** switch `permissionMode` to `"dontAsk"` and remove any tools you do not want auto-approved. See `references/pitfalls.md` for the interaction between `permissionMode` and `allowedTools`.
- **Stream partial tokens:** set `include_partial_messages=True` (Py) / `includePartialMessages: true` (TS).
- **Return typed data:** add `output_format` / `outputFormat`. See `references/task-recipes.md` Recipe 3.
- **Multi-turn:** use `ClaudeSDKClient` (Py) or `continue: true` (TS). See Recipe 4.

For larger patterns (subagents, custom MCP tools, structured outputs, streaming UX), see `references/task-recipes.md`.
