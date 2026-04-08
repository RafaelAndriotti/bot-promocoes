require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

// ─────────────────────────────────────────
// Coleta os dados de todos os comandos
// ─────────────────────────────────────────
const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  if (command.data) {
    commands.push(command.data.toJSON());
  }
}

// ─────────────────────────────────────────
// Registra os comandos na API do Discord
// ─────────────────────────────────────────
const rest = new REST().setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log(`\n📤 Registrando ${commands.length} comando(s) slash...\n`);

    const data = await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );

    console.log(`✅ ${data.length} comando(s) registrado(s) com sucesso!`);
    console.log('\n🎉 Agora os comandos já estão disponíveis no Discord!\n');
  } catch (error) {
    console.error('❌ Erro ao registrar comandos:', error);
    console.error('\nVerifique se DISCORD_TOKEN e CLIENT_ID estão corretos no .env\n');
  }
})();
