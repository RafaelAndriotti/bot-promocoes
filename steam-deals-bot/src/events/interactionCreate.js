module.exports = {
  name: 'interactionCreate',

  async execute(interaction) {
    // Só processa comandos slash
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
      console.warn(`⚠️  Comando desconhecido recebido: /${interaction.commandName}`);
      return;
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(`❌ Erro no comando /${interaction.commandName}:`, error);

      const errorMessage = {
        content: '❌ Ocorreu um erro ao executar este comando. Tente novamente mais tarde.',
        ephemeral: true,
      };

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(errorMessage).catch(() => {});
      } else {
        await interaction.reply(errorMessage).catch(() => {});
      }
    }
  },
};
