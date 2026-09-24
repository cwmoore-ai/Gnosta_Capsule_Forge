// Discord Message Splitter bot
// Watches for Discord's auto-made "message.txt" files (what Discord sends when a
// paste is over the character limit), splits the text, and posts it in parts.

const { Client, Events, GatewayIntentBits } = require("discord.js");
const { buildParts } = require("./split");

// Load settings from .env (Node 20.12+)
try {
  process.loadEnvFile(__dirname + "/.env");
} catch (e) {
  // no .env file; fall back to real environment variables
}

const config = {
  token: process.env.DISCORD_TOKEN,
  channelIds: (process.env.CHANNEL_IDS || "").split(",").map((s) => s.trim()).filter(Boolean),
  limit: Math.min(parseInt(process.env.MESSAGE_LIMIT, 10) || 2000, 2000),
  delayMs: (parseFloat(process.env.DELAY_SECONDS) || 2.5) * 1000,
  labels: (process.env.PART_LABELS || "true").toLowerCase() !== "false",
  deleteOriginal: (process.env.DELETE_ORIGINAL || "false").toLowerCase() === "true",
  maxFileBytes: (parseInt(process.env.MAX_FILE_KB, 10) || 100) * 1024,
};

if (!config.token) {
  console.error("Missing DISCORD_TOKEN. Copy .env.example to .env and add your bot token.");
  process.exit(1);
}

// Never ping anyone when posting split parts.
const NO_PINGS = { parse: [] };

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// One queue per channel, so two long messages sent at once don't get mixed together.
const queues = new Map();
function enqueue(channelId, job) {
  const prev = queues.get(channelId) || Promise.resolve();
  const next = prev.then(job).catch((err) => console.error("Job failed:", err));
  queues.set(channelId, next);
  next.finally(() => {
    if (queues.get(channelId) === next) queues.delete(channelId);
  });
}

// A thread counts as watched if its parent channel is watched.
function isWatched(channel) {
  return config.channelIds.includes(channel.id) || config.channelIds.includes(channel.parentId);
}

function findMessageTxt(message) {
  return message.attachments.find((a) => a.name === "message.txt");
}

async function handleMessage(message) {
  const file = findMessageTxt(message);

  if (file.size > config.maxFileBytes) {
    console.log(`Skipped ${file.size}-byte file in #${message.channel.name} (over MAX_FILE_KB).`);
    return;
  }

  const res = await fetch(file.url);
  if (!res.ok) throw new Error(`Download failed: HTTP ${res.status}`);
  let text = await res.text();

  // Keep any words typed alongside the file.
  if (message.content && message.content.trim()) {
    text = message.content.trim() + "\n\n" + text;
  }
  if (!text.trim()) return;

  const parts = buildParts(text, config.limit, { labels: config.labels });
  const header = `📨 Message from <@${message.author.id}>, split into ${parts.length} part${parts.length === 1 ? "" : "s"}:`;

  if (config.deleteOriginal) {
    await message.channel.send({ content: header, allowedMentions: NO_PINGS });
  } else {
    await message.reply({ content: header, allowedMentions: NO_PINGS });
  }

  for (const part of parts) {
    await sleep(config.delayMs);
    await message.channel.send({ content: part, allowedMentions: NO_PINGS });
  }

  if (config.deleteOriginal) {
    try {
      await message.delete();
    } catch (err) {
      console.error("Couldn't delete original (does the bot have Manage Messages?):", err.message);
    }
  }

  console.log(`Split a message from ${message.author.tag} in #${message.channel.name} into ${parts.length} parts.`);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once(Events.ClientReady, (c) => {
  console.log(`Logged in as ${c.user.tag}.`);
  console.log(
    config.channelIds.length
      ? `Watching channels: ${config.channelIds.join(", ")}`
      : "Watching every channel the bot can see."
  );
});

client.on(Events.MessageCreate, (message) => {
  if (message.author.bot) return;
  if (!message.inGuild()) return;
  if (config.channelIds.length && !isWatched(message.channel)) return;
  if (!findMessageTxt(message)) return;

  enqueue(message.channelId, () => handleMessage(message));
});

client.on(Events.Error, (err) => console.error("Client error:", err));

client.login(config.token);
