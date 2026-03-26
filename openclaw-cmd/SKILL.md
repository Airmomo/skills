---
name: openclaw-cmd
description: Comprehensive CLI command reference for OpenClaw - personal AI assistant gateway. Use when users ask about openclaw CLI commands, how to use specific commands, or need help with openclaw command-line operations. Covers setup, gateway, channels, messaging, agents, models, nodes, browser, automation, and utility commands.
---

# OpenClaw CLI Commands

Complete reference for all OpenClaw CLI commands with examples.

## Global Flags
- `--dev`: Isolate state under `~/.openclaw-dev`
- `--profile <name>`: Isolate state under `~/.openclaw-<name>`
- `--no-color`: Disable ANSI colors
- `-V`, `--version`: Print version

## Quick Start
```bash
# First-time setup
openclaw onboard --flow quickstart

# Start gateway
openclaw gateway

# Check status
openclaw status
```

## Command Categories

### Setup & Configuration
- `setup` - Initialize config + workspace
- `onboard` - Interactive onboarding wizard
- `configure` - Interactive configuration wizard
- `config` - Non-interactive config helpers
- `doctor` - Health checks + quick fixes
- `backup` - Backup management
- `reset` - Reset local config/state
- `uninstall` - Uninstall gateway + data
- `update` - Update OpenClaw

→ See [references/setup-commands.md](references/setup-commands.md) for details.

### Gateway & Service
- `gateway` - Run and manage WebSocket Gateway
- `logs` - Tail Gateway file logs
- `status` - Show session health
- `health` - Fetch Gateway health
- `tui` - Open terminal UI
- `dashboard` - Open Control UI

→ See [references/gateway-commands.md](references/gateway-commands.md) for details.

### Channels & Messaging
- `channels` - Manage chat channel accounts (WhatsApp/Telegram/Discord/Slack/etc.)
- `message` - Send messages and channel actions

→ See [references/channel-commands.md](references/channel-commands.md) for details.

### Agents & Models
- `agent` - Run one agent turn
- `agents` - Manage isolated agents
- `models` - Manage AI models
- `acp` - Run ACP bridge
- `sessions` - List conversation sessions
- `memory` - Vector search over memory files

→ See [references/agent-commands.md](references/agent-commands.md) for details.

### Nodes & Browser
- `nodes` - Manage paired nodes
- `node` - Run/manage node host service
- `browser` - Browser control CLI
- `devices` - Device pairing management
- `sandbox` - Sandbox management

→ See [references/node-commands.md](references/node-commands.md) for details.

### Automation & Utilities
- `cron` - Manage scheduled jobs
- `hooks` - Manage hooks
- `webhooks` - Webhook management
- `system` - System events/heartbeat
- `dns` - DNS setup helper
- `docs` - Search docs
- `qr` - QR code display
- `completion` - Shell completion
- `pairing` - DM pairing management
- `approvals` - Approval settings
- `security` - Security audit
- `secrets` - Secrets management
- `skills` - List and inspect skills
- `plugins` - Manage extensions

→ See [references/automation-commands.md](references/automation-commands.md) for details.

## Command Tree Overview
```
openclaw <command>
  setup | onboard | configure | config | doctor
  gateway [run|health|status|probe|discover|install|start|stop|restart]
  channels [list|status|add|remove|login|logout|logs|capabilities|resolve]
  message [send|poll|react|reactions|read|edit|delete|pin|unpin|thread|broadcast]
  agent | agents [list|add|delete|bind|unbind|set-identity]
  models [list|status|set|scan|auth|aliases|fallbacks]
  nodes [status|list|describe|run|camera|canvas|screen|location]
  node [run|status|install|start|stop|restart]
  browser [status|start|stop|tabs|open|close|screenshot|snapshot|navigate|click|type]
  cron [list|add|edit|enable|disable|rm|runs|run]
  hooks [list|info|check|enable|disable|install|update]
  memory [status|index|search]
  security [audit]
  secrets [reload|migrate]
  skills [list|info|check]
  plugins [list|info|install|enable|disable|doctor]
  logs | status | health | tui | dashboard | docs | qr | completion
  backup [create|verify] | reset | uninstall | update
```

## Common Workflows

### First-time setup
```bash
openclaw onboard --flow quickstart
openclaw gateway start
openclaw status
```

### Add a channel
```bash
openclaw channels add --channel telegram --token <bot-token>
openclaw channels status
```

### Send a message
```bash
openclaw message send --channel discord --target channel:123 --message "Hello!"
```

### Check system health
```bash
openclaw doctor
openclaw status --deep
openclaw gateway status
```

### Manage agents
```bash
openclaw agents list
openclaw agents add work --workspace ~/.openclaw/workspace-work
openclaw agents bind --agent work --bind telegram:ops
```
