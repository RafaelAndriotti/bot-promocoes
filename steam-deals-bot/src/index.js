require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');

// ─────────────────────────────────────────
// Criação do cliente Discord
// ─────────────────────────────────────────
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
  ],
});

// Coleção de comandos
client.commands = new Collection();

// ─────────────────────────────────────────
// Carregamento dos Comandos
// ─────────────────────────────────────────
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));

console.log('\n📦 Carregando comandos...');
for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  if (command.data && command.execute) {
    client.commands.set(command.data.name, command);
    console.log(`  ✅ /${command.data.name}`);
  }
}

// ─────────────────────────────────────────
// Carregamento dos Eventos
// ─────────────────────────────────────────
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(f => f.endsWith('.js'));

console.log('\n📡 Carregando eventos...');
for (const file of eventFiles) {
  const event = require(path.join(eventsPath, file));
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
  console.log(`  ✅ ${event.name}`);
}

// ─────────────────────────────────────────
// Login
// ─────────────────────────────────────────
if (!process.env.DISCORD_TOKEN) {
  console.error('\n❌ DISCORD_TOKEN não encontrado! Verifique o arquivo .env\n');
  process.exit(1);
}

client
  .login(process.env.DISCORD_TOKEN)
  .then(() => console.log('\n🚀 Conectando ao Discord...\n'))
  .catch(err => {
    console.error('\n❌ Erro ao conectar:', err.message);
    console.error('Verifique se o DISCORD_TOKEN no arquivo .env está correto.\n');
    process.exit(1);
  });
