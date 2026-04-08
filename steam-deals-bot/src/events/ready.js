const { startScheduler } = require('../schedulers/dealsScheduler');

module.exports = {
  name: 'ready',
  once: true,

  execute(client) {
    console.log('─'.repeat(50));
    console.log(`🟢 Bot online como: ${client.user.tag}`);
    console.log(`📡 Conectado a ${client.guilds.cache.size} servidor(es)`);
    console.log('─'.repeat(50));

    // Define o status do bot no Discord
    client.user.setActivity('🎮 Monitorando ofertas Steam', { type: 3 }); // 3 = Watching

    // Inicia o agendador de verificação automática
    startScheduler(client);
  },
};
