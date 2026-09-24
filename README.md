# Gnosta Capsule Forge

Simple browser tools for sharing long messages: turn one into a standalone HTML "capsule" page, or split it into Discord-sized parts.

Each tool is a single HTML file. Nothing to install and no build step. Just open the file in a browser (phone or PC).

## The tools

### `Noema_Capsule_Forge.html` (recommended)

The newer, full-featured forge.

- **Autosave:** your draft is saved in this browser as you type and comes back after a reload.
- **Auto file names:** leave the default name and it stamps the date and time, like `Noema_2026-09-24_1430.html`.
- **Optional link:** add a link with your own label, or leave it blank to hide it.
- **Quick buttons:** Clear Message, Reset All (Local), and Loadout: Quick Capsule (restores the default settings).
- **Capsule extras:** each capsule shows a "Created" time and file name, plus a hidden JSON info block for later use.

### `Gnosta_Capsule_Forge.html`

The original, simpler forge. Same basic idea, but no autosave. Its optional link shows as a "Download Files" button.

### `Discord_Message_Splitter.html`

Breaks a long message into parts that fit Discord's limit, each with its own **Copy** button.

- **Limits:** 2,000 characters (free and Nitro Basic), 4,000 (Nitro), or a custom number.
- **Smart splits:** cuts at paragraphs first, then lines, sentences, and words, so text stays readable.
- **Options:** add "Part 1/3" labels, or wrap each part in a Discord code block (with an optional language for color).
- **Copy Next Part:** a button at the bottom copies the parts in order and checks each one off.
- Your text and settings are saved in this browser.

### `discord-bot/`

A Discord bot that does the splitting automatically. When a long paste turns into `message.txt`, the bot posts it back in parts, a few seconds apart. See [`discord-bot/README.md`](discord-bot/README.md) for setup.

## How to use the capsule forges

1. Open the forge file in your browser.
2. Fill in the title, subtitle, link, and file name.
3. Paste your message.
4. Tap **Generate HTML**.
5. Tap **Download Capsule HTML** to save the capsule file.

If the download is blocked (some in-app browsers do this), tap **Select Output**, copy the text, and paste it into a text editor like Markor. Save it as a `.html` file.

## What a capsule looks like

A capsule is a single dark-themed page with:

- The title, the brand line, and the subtitle
- A **Copy Message** button
- The message in a box you can show or hide
- A link button (if you added one)

## Notes

- Autosave uses browser `localStorage`. It stays on that device and browser only. Use **Reset All (Local)** to clear it.
- Any text you enter is escaped, so symbols like `<`, `>`, and `"` show up as normal text and won't break the page.

---

Carl Moore© · Gnosta™
