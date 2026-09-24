# Discord Message Splitter Bot

When someone pastes a message that's too long, Discord turns it into a file called **`message.txt`**. This bot spots that file, splits the text into parts under 2,000 characters, and posts the parts a few seconds apart.

```
Long paste → Discord makes message.txt → bot downloads it
→ bot replies "📨 Message from @you, split into 3 parts:"
→ Part 1/3 … wait 2.5 sec … Part 2/3 … wait … Part 3/3
→ (optional) bot deletes the original message.txt post
```

It splits at paragraphs first, then lines, sentences, and words, the same as `Discord_Message_Splitter.html`. It never pings anyone.

---

## Part 1: Create the bot on Discord

1. Go to https://discord.com/developers/applications and click **New Application**. Name it (e.g. "Message Splitter").
2. Open the **Bot** tab.
   - Click **Reset Token**, then copy the token. **This is the bot's password. Keep it secret.**
   - Scroll to **Privileged Gateway Intents** and turn on **Message Content Intent**. Save.
3. Open the **OAuth2** tab, then **URL Generator**.
   - Under **Scopes**, check **bot**.
   - Under **Bot Permissions**, check:
     - View Channels
     - Send Messages
     - Read Message History
     - Manage Messages (only if you'll use `DELETE_ORIGINAL=true`)
   - Copy the link at the bottom, open it, and pick your server.

## Part 2: Set it up on your VPS

You need **Node.js 20.12 or newer**. Check with `node -v`. If it's missing or old (Ubuntu/Debian):

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
```

Get the code and install:

```bash
git clone https://github.com/cwmoore-ai/Gnosta_Capsule_Forge.git
cd Gnosta_Capsule_Forge/discord-bot
npm install
cp .env.example .env
nano .env        # paste your token after DISCORD_TOKEN=
```

Try it:

```bash
npm start
```

You should see `Logged in as Message Splitter#1234`. Paste a long message in Discord to test it, then press **Ctrl+C** to stop.

## Part 3: Keep it running 24/7 with pm2

```bash
sudo npm install -g pm2
pm2 start bot.js --name splitter
pm2 save
pm2 startup      # run the command it prints, so the bot starts after a reboot
```

Handy pm2 commands:

| Command | What it does |
|---|---|
| `pm2 logs splitter` | Watch what the bot is doing |
| `pm2 restart splitter` | Restart (do this after changing `.env`) |
| `pm2 stop splitter` | Stop the bot |
| `pm2 status` | See if it's running |

To update later: `git pull`, then `npm install`, then `pm2 restart splitter`.

---

## Settings (`.env`)

| Setting | Default | What it does |
|---|---|---|
| `DISCORD_TOKEN` | *(required)* | Your bot's token |
| `CHANNEL_IDS` | blank = all | Channels to watch, separated by commas. Threads inside them count too. |
| `MESSAGE_LIMIT` | `2000` | Max characters per part (bots can't go over 2000) |
| `DELAY_SECONDS` | `2.5` | Wait between parts |
| `PART_LABELS` | `true` | Add "Part 1/3" labels |
| `DELETE_ORIGINAL` | `false` | Delete the message.txt post after splitting (needs Manage Messages) |
| `MAX_FILE_KB` | `100` | Skip bigger files so one paste can't flood a channel (100 KB ≈ 50 parts) |

**To get a channel ID:** in Discord go to **Settings → Advanced** and turn on **Developer Mode**. Then right-click (or long-press) the channel and pick **Copy Channel ID**.

## Good to know

- Parts are posted **by the bot**, not by you. The header line says who the message came from.
- The bot only reacts to files named exactly `message.txt`. Other files are left alone.
- If two long messages come in at once in the same channel, the bot finishes one before starting the next, so the parts don't get mixed up.
- **Never** put your `.env` file on GitHub. It's already in `.gitignore`.

## Tests

```bash
npm test
```
