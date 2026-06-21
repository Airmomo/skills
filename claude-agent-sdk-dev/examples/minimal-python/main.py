"""
Minimal Claude Agent SDK example (Python).

Prerequisites:
  - Python 3.10+
  - pip install claude-agent-sdk
  - export ANTHROPIC_API_KEY=sk-...

Run:
  python main.py
"""
import asyncio
from claude_agent_sdk import (
    query,
    ClaudeAgentOptions,
    AssistantMessage,
    ResultMessage,
    TextBlock,
    ToolUseBlock,
)


PROMPT = "List the Python files in the current directory and summarize what each one does in one line."


async def main() -> None:
    options = ClaudeAgentOptions(
        allowed_tools=["Read", "Glob", "Grep"],
        permission_mode="acceptEdits",
        max_budget_usd=0.20,
    )

    async for message in query(prompt=PROMPT, options=options):
        if isinstance(message, AssistantMessage):
            for block in message.content:
                if isinstance(block, TextBlock):
                    print(block.text)
                elif isinstance(block, ToolUseBlock):
                    print(f"[tool] {block.name}")
        elif isinstance(message, ResultMessage):
            cost = (
                f"${message.total_cost_usd:.4f}"
                if message.total_cost_usd is not None
                else "N/A"
            )
            print(f"\n[done: {message.subtype}, cost: {cost}]")


if __name__ == "__main__":
    asyncio.run(main())
