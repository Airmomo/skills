# Node & Browser Commands
Complete reference for OpenClaw node and browser CLI commands.
## nodes- Manage paired nodes
```bash
# Node status
openclaw nodes status
openclaw nodes status --connected

openclaw nodes list

# Describe node
openclaw nodes describe --node mac

# Pending approvals
openclaw nodes pending
openclaw nodes approve <requestId>
openclaw nodes reject <requestId>

# Run command on node
openclaw nodes run --node mac -- ls -la
openclaw nodes run --node mac --cwd /path -- echo "Hello"

# Notify node
openclaw nodes notify --node mac --title "Alert" --body "Check this out"

# Camera
openclaw nodes camera list --node mac
openclaw nodes camera snap --node mac --facing front
openclaw nodes camera clip --node mac --duration 10s

# Canvas
openclaw nodes canvas snapshot --node mac
openclaw nodes canvas present --node mac --target https://example.com
openclaw nodes canvas hide --node mac
openclaw nodes canvas navigate https://example.com --node mac

# Screen record
openclaw nodes screen record --node mac --duration 30s
openclaw nodes screen record --node mac --screen 0

# Location
openclaw nodes location get --node mac
```
## node- Run/manage node host service
```bash
# Run node host
openclaw node run --host gateway-host --port 18789

# Service management
openclaw node status
openclaw node install --host gateway-host --port 18789
openclaw node uninstall
openclaw node start
openclaw node stop
openclaw node restart
```
## browser- Browser control CLI
```bash
# Browser status
openclaw browser status

# Start/stop browser
openclaw browser start
openclaw browser stop

# Tab management
openclaw browser tabs
openclaw browser open https://example.com
openclaw browser focus <targetId>
openclaw browser close <targetId>

# Profile management
openclaw browser profiles
openclaw browser create-profile --name work --color FF5A2D
openclaw browser delete-profile --name work
openclaw browser reset-profile

# Screenshots
openclaw browser screenshot
openclaw browser screenshot --full-page
openclaw browser screenshot --element "selector"

# Page snapshot
openclaw browser snapshot
openclaw browser snapshot --format aria

# Navigation
openclaw browser navigate https://example.com
openclaw browser resize 1920 1080

# Interactions
openclaw browser click <ref>
openclaw browser type <ref> "Hello"
openclaw browser press Enter
openclaw browser hover <ref>
openclaw browser drag <startRef> <endRef>
openclaw browser select <ref> option1 option2
openclaw browser upload /path/to/file.pdf
openclaw browser fill --fields '{"field1": "value1"}'

# Dialogs
openclaw browser dialog --accept
openclaw browser dialog --dismiss --prompt "Text"

# Waiting
openclaw browser wait --time 1000
openclaw browser wait --text "Success"

# Evaluate
openclaw browser evaluate --fn "document.title"

# Console
openclaw browser console
openclaw browser console --level error

# PDF
openclaw browser pdf
```
## devices- Device pairing management
```bash
openclaw devices list
openclaw devices approve --latest
openclaw devices reject <requestId>
openclaw devices remove <deviceId>
openclaw devices clear --yes
```
## sandbox- Sandbox management
```bash
openclaw sandbox list
openclaw sandbox recreate
openclaw sandbox explain
```
