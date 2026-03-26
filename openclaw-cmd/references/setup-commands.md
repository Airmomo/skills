# Setup & Configuration Commands

Complete reference for OpenClaw setup and configuration CLI commands.

## Global Flags
- `--dev`: Isolate state under `~/.openclaw-dev`
- `--profile <name>`: Isolate state under `~/.openclaw-<name>`
- `--no-color`: Disable ANSI colors
- `-V`, `--version`: Print version

## setup - Initialize config + workspace
```bash
openclaw setup
openclaw setup --workspace ~/.openclaw/workspace
openclaw setup --wizard
```

## onboard - Interactive onboarding wizard
```bash
openclaw onboard
openclaw onboard --flow quickstart
openclaw onboard --flow manual
openclaw onboard --mode remote --remote-url wss://host:18789
openclaw onboard --non-interactive --auth-choice openai-api-key --openai-api-key $KEY
```
## configure- Interactive configuration wizard
```bash
openclaw configure
```
## config - Non-interactive config helpers
```bash
openclaw config get <path>
openclaw config set <path> <value>
openclaw config set <path> --ref-provider <provider> --ref-source env --ref-id ENV_VAR
openclaw config unset <path>
openclaw config file
openclaw config validate
```
## doctor - Health checks + quick fixes
```bash
openclaw doctor
openclaw doctor --fix
```
## backup- Backup management
```bash
openclaw backup create
openclaw backup verify
```
## reset- Reset local config/state
```bash
openclaw reset --scope config
openclaw reset --scope config+creds+sessions
```
## uninstall- Uninstall gateway + data
```bash
openclaw uninstall --all
openclaw uninstall --service --state
```
## update- Update OpenClaw
```bash
openclaw update
```
