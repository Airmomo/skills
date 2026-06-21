/**
 * Minimal Claude Agent SDK example (TypeScript).
 *
 * Prerequisites:
 *   - Node.js 18+
 *   - npm install @anthropic-ai/claude-agent-sdk
 *   - export ANTHROPIC_API_KEY=sk-...
 *
 * Run:
 *   npx tsx main.ts
 */
import { query } from "@anthropic-ai/claude-agent-sdk";

const PROMPT =
  "List the TypeScript files in the current directory and summarize what each one does in one line.";

const options = {
  allowedTools: ["Read", "Glob", "Grep"],
  permissionMode: "acceptEdits" as const,
  maxBudgetUsd: 0.2,
};

for await (const message of query({ prompt: PROMPT, options })) {
  if (message.type === "assistant" && message.message?.content) {
    for (const block of message.message.content) {
      if (block.type === "text") {
        console.log(block.text);
      } else if (block.type === "tool_use") {
        console.log(`[tool] ${block.name}`);
      }
    }
  } else if (message.type === "result") {
    const cost =
      message.total_cost_usd != null
        ? `$${message.total_cost_usd.toFixed(4)}`
        : "N/A";
    console.log(`\n[done: ${message.subtype}, cost: ${cost}]`);
  }
}
