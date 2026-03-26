# Gateway Commands
Complete reference for OpenClaw Gateway CLI commands.
## gateway- Run and manage WebSocket Gateway
```bash
# Run gateway (foreground)
openclaw gateway
openclaw gateway run

# With options
openclaw gateway --port 18789 --bind lan
openclaw gateway --token <token>
```
## gateway health- Check gateway health
```bash
openclaw gateway health --url ws://127.0.0.1:18789
```
## gateway status- Service status + RPC probe
```bash
openclaw gateway status
openclaw gateway status --json
openclaw gateway status --require-rpc
openclaw gateway status --deep
```
## gateway probe- Debug connectivity (always probes)
```bash
openclaw gateway probe
openclaw gateway probe --json
openclaw gateway probe --ssh user@host
```
## gateway discover- Find gateways via Bonjour
```bash
openclaw gateway discover
openclaw gateway discover --timeout 4000
openclaw gateway discover --json
```
## gateway call- Low-level RPC helper
```bash
openclaw gateway call status
openclaw gateway call logs.tail --params '{"sinceMs": 60000}'
```
## Service Management
```bash
# Install gateway service
openclaw gateway install
openclaw gateway install --port 18789 --runtime node

# Service lifecycle
openclaw gateway start
openclaw gateway stop
openclaw gateway restart
openclaw gateway uninstall
```
## logs- Tail Gateway file logs
```bash
openclaw logs --follow
openclaw logs --limit 200
openclaw logs --plain
openclaw logs --json
```
## status- Show session health
```bash
openclaw status
openclaw status --deep
openclaw status --usage
openclaw status --json
```
## health- Fetch Gateway health
```bash
openclaw health
openclaw health --json
```
## tui- Open terminal UI
```bash
openclaw tui
openclaw tui --url ws://127.0.0.1:18789
openclaw tui --session <key>
```
## dashboard- Open Control UI
```bash
openclaw dashboard
```
