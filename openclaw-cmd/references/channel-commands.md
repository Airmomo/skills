# Channel & Messaging Commands
Complete reference for OpenClaw channel and messaging CLI commands.
## channels- Manage chat channel accounts
```bash
# List channels
openclaw channels list
openclaw channels list --json

# Channel status
openclaw channels status
openclaw channels status --probe
# Channel logs
openclaw channels logs --channel all
openclaw channels logs --channel discord --lines 100
# Capabilities probe
openclaw channels capabilities
openclaw channels capabilities --channel discord --target channel:123
# Resolve names
openclaw channels resolve --channel slack "#general" "@jane"
```
## channels add- Add channel accounts
```bash
openclaw channels add --channel telegram --token <bot-token>
openclaw channels add --channel discord --account work --token $DISCORD_BOT_TOKEN
openclaw channels add --channel slack --token $SLACK_BOT_TOKEN
openclaw channels add --channel whatsapp
```
## channels remove- Remove channel accounts
```bash
openclaw channels remove --channel discord --account work
openclaw channels remove --channel telegram --delete
```
## channels login/logout- Interactive login
```bash
openclaw channels login --channel whatsapp
openclaw channels logout --channel whatsapp
```
## message send- Send messages
```bash
openclaw message send --channel discord --target channel:123 --message "hi"
openclaw message send --channel telegram --target @mychat --message "Hello"
openclaw message send --channel whatsapp --target +15555550123 --message "Hi"
openclaw message send --channel slack --target C123 --message "Hello"
# With media
openclaw message send --channel discord --target channel:123 --media ./image.png
# With reply
openclaw message send --channel discord --target channel:123 --message "hi" --reply-to 456
```
## message poll- Create polls
```bash
# Discord poll
openclaw message poll --channel discord --target channel:123 \
  --poll-question "Snack?" --poll-option Pizza --poll-option Sushi \
  --poll-multi --poll-duration-hours 48

# Telegram poll
openclaw message poll --channel telegram --target @mychat \
  --poll-question "Lunch?" --poll-option Pizza --poll-option Sushi \
  --poll-duration-seconds 120 --silent
```
## message react- React to messages
```bash
openclaw message react --channel slack --target C123 --message-id 456 --emoji "✅"
openclaw message react --channel discord --target channel:123 --message-id 456 --emoji "👍"
openclaw message react --channel signal --target signal:group:abc123 --message-id 1737630212345 \
  --emoji "✅" --target-author-uuid 123e4567-e89b-12d3-a456-426614174000
```
## message reactions- List reactions
```bash
openclaw message reactions --channel discord --target channel:123 --message-id 456
```
## message read- Read messages
```bash
openclaw message read --channel discord --target channel:123 --limit 50
openclaw message read --channel slack --target C123 --before 1234567890.123456
```
## message edit- Edit messages
```bash
openclaw message edit --channel discord --target channel:123 --message-id 456 --message "Updated"
```
## message delete- Delete messages
```bash
openclaw message delete --channel discord --target channel:123 --message-id 456
```
## message pin/unpin- Pin messages
```bash
openclaw message pin --channel discord --target channel:123 --message-id 456
openclaw message unpin --channel discord --target channel:123 --message-id 456
```
## message thread- Thread management (Discord)
```bash
openclaw message thread create --target channel:123 --thread-name "Support" --message "Welcome!"
openclaw message thread list --guild-id 123456
openclaw message thread reply --target thread:789 --message "Thanks!"
```
## message broadcast- Broadcast to multiple targets
```bash
openclaw message broadcast --channel discord --targets channel:123 --targets channel:456 --message "Announcement"
```
## Target Formats
- **WhatsApp**: E.164 or group JID
- **Telegram**: chat id or `@username`
- **Discord**: `channel:<id>` or `user:<id>`
- **Google Chat**: `spaces/<spaceId>` or `users/<userId>`
- **Slack**: `channel:<id>` or `user:<id>`
- **Signal**: `+E.164`, `group:<id>`, or `username:<name>`
- **iMessage**: handle, `chat_id:<id>`, or `chat_guid:<guid>`
- **MS Teams**: conversation id or `conversation:<id>` or `user:<aad-object-id>`
