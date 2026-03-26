# Agent & Model Commands
Complete reference for OpenClaw agent and model CLI commands.
## agent- Run one agent turn
```bash
openclaw agent --message "Hello" --to +15555550123
openclaw agent --message "What's the weather?" --channel discord
openclaw agent --message "Hello" --local
```
## agents- Manage isolated agents
```bash
# List agents
openclaw agents list
openclaw agents list --json
openclaw agents list --bindings

# Add agent
openclaw agents add work --workspace ~/.openclaw/workspace-work
openclaw agents add personal --workspace ~/.openclaw/workspace-personal --model claude-sonnet-4-6

```
## agents bindings- List routing bindings
```bash
openclaw agents bindings
openclaw agents bindings --agent work
```
## agents bind- Add routing bindings
```bash
openclaw agents bind --agent work --bind telegram:ops
openclaw agents bind --agent work --bind discord:guild-a --bind slack:alerts
```
## agents unbind- Remove routing bindings
```bash
openclaw agents unbind --agent work --bind telegram:ops
openclaw agents unbind --agent work --all
```
## agents set-identity- Set agent identity
```bash
openclaw agents set-identity --workspace ~/.openclaw/workspace --from-identity
openclaw agents set-identity --agent main --name "OpenClaw" --emoji "🦞" --avatar avatars/openclaw.png
```
## agents delete- Delete agent
```bash
openclaw agents delete work
openclaw agents delete personal --force
```
## models- Manage AI models
```bash
# List models
openclaw models list
openclaw models list --all
openclaw models list --provider anthropic

# Model status
openclaw models status
openclaw models status --probe
openclaw models status --check

# Set default model
openclaw models set claude-sonnet-4-6
openclaw models set-image claude-sonnet-4-6

# Model aliases
openclaw models aliases list
openclaw models aliases add fast claude-sonnet-4-6
openclaw models aliases remove fast

# Model fallbacks
openclaw models fallbacks list
openclaw models fallbacks add claude-sonnet-4-5
openclaw models fallbacks remove claude-sonnet-4-5
openclaw models fallbacks clear

# Scan for models
openclaw models scan
openclaw models scan --set-default
openclaw models scan --provider anthropic

# Model auth
openclaw models auth setup-token --provider anthropic
openclaw models auth add --provider anthropic
openclaw models auth paste-token --provider anthropic --profile-id manual
```
## acp- Run ACP bridge
```bash
openclaw acp
```
## sessions- List conversation sessions
```bash
openclaw sessions
openclaw sessions --verbose
openclaw sessions --active 30
```
## memory- Vector search over memory files
```bash
openclaw memory status
openclaw memory index
openclaw memory search "project setup instructions"
```
