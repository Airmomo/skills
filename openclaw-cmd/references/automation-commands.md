# Automation & Utility Commands
Complete reference for OpenClaw automation and utility CLI commands.
## cron- Manage scheduled jobs
```bash
# List cron jobs
openclaw cron list
openclaw cron list --all
openclaw cron status

# Add cron job
openclaw cron add --name "daily-greeting" --every 1d --system-event "Good morning!"
openclaw cron add --name "weekly-report" --cron "0 9 * * 1" --message "Weekly report time"

openclaw cron add --name "one-time" --at "2026-03-21 09:00" --system-event "Event"

# Edit cron job
openclaw cron edit <id> --name "new-name"
openclaw cron edit <id> --enabled true

# Manage cron job
openclaw cron enable <id>
openclaw cron disable <id>
openclaw cron rm <id>

# Run cron job
openclaw cron run <id>
openclaw cron run <id> --force

# View cron runs
openclaw cron runs --id <id>
openclaw cron runs --id <id> --limit 10
```
## hooks- Manage hooks
```bash
openclaw hooks list
openclaw hooks info <hook-name>
openclaw hooks check
openclaw hooks enable <hook-name>
openclaw hooks disable <hook-name>
openclaw hooks install <hook-name>
openclaw hooks update <hook-name>
```
## webhooks- Webhook management
```bash
# Gmail webhook
openclaw webhooks gmail setup --account user@gmail.com
openclaw webhooks gmail run --account user@gmail.com
```
## system- System events/heartbeat
```bash
# System event
openclaw system event --text "System maintenance started"

# Heartbeat
openclaw system heartbeat last
openclaw system heartbeat enable
openclaw system heartbeat disable

# Presence
openclaw system presence
```
## dns- DNS setup helper
```bash
openclaw dns setup
openclaw dns setup --apply
```
## docs- Search docs
```bash
openclaw docs
openclaw docs how to setup gateway
```
## qr- QR code display
```bash
openclaw qr
```
## completion- Shell completion
```bash
openclaw completion
```
## pairing- DM pairing management
```bash
openclaw pairing list
openclaw pairing list --channel discord
openclaw pairing approve discord ABC123
openclaw pairing approve whatsapp XYZ789 --notify
```
## approvals- Approval settings
```bash
openclaw approvals get
openclaw approvals set --mode whitelist
openclaw approvals allowlist add +15555550123
openclaw approvals allowlist remove +15555550123
```
## security- Security audit
```bash
openclaw security audit
openclaw security audit --deep
openclaw security audit --fix
```
## secrets- Secrets management
```bash
openclaw secrets reload
openclaw secrets migrate
```
## skills- List and inspect skills
```bash
openclaw skills list
openclaw skills list --eligible
openclaw skills info <skill-name>
openclaw skills check
```
## plugins- Manage extensions
```bash
openclaw plugins list
openclaw plugins info <plugin-id>
openclaw plugins install <path|.tgz|npm-spec>
openclaw plugins enable <plugin-id>
openclaw plugins disable <plugin-id>
openclaw plugins doctor
```
