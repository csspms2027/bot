import { Client, GatewayIntentBits, ActivityType, Partials } from 'discord.js';
import http from 'http';

const PORT = process.env.PORT || 3000;
http.createServer((req, res) => {
  res.writeHead(200);
  res.end('Bot is running!');
}).listen(PORT, () => {
  console.log(`Health check server running on port ${PORT}`);
});

const token = process.env.DISCORD_TOKEN;
const OWNER_ID = '1290664337018454151';

if (!token) {
  console.error('ERROR: DISCORD_TOKEN environment variable is not set.');
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages
  ],
  partials: [Partials.Channel, Partials.Message, Partials.User]
});

client.on('clientReady', () => {
  console.log(`Bot is online as ${client.user.tag}`);
  client.user.setPresence({
    activities: [{
      name: '😎 Working!',
      type: ActivityType.Playing
    }],
    status: 'online'
  });
});

client.on('messageCreate', async (message) => {
  try {
    if (message.partial) await message.fetch();
    if (message.author?.partial) await message.author.fetch();
  } catch (err) {
    console.error('Failed to fetch partial message:', err.message);
    return;
  }

  if (message.author.bot) return;

  const isDM = !message.guildId;

  if (isDM) {
    try {
      const owner = await client.users.fetch(OWNER_ID);
      await owner.send(
        `📩 **New DM from ${message.author.tag}** (ID: ${message.author.id}):\n${message.content}`
      );
      await message.reply('Your message has been received! I will get back to you soon.');
    } catch (err) {
      console.error('Failed to forward DM:', err.message);
    }
    return;
  }

  const allowedCategory = '📄 | CJS Virtual Assitants';
  if (message.channel.parent?.name === allowedCategory) {
    await message.react('👍');
  }

  if (message.content === '!ping') {
    message.reply('Pong! Bot is online and running.');
  }

  if (message.content === '!status') {
    message.reply('Online and always available!');
  }
});

client.on('error', (error) => {
  console.error('Discord client error:', error.message);
});

client.login(token);
