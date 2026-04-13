const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { getServerConfig } = require('../utils/database');
const { checkAndSendDeals } = require('../schedulers/dealsScheduler');
const { createErrorEmbed, createSuccessEmbed } = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('verificar')
    .setDescription('🔍 Força uma verificação manual de ofertas agora')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    const guildId = interaction.guildId;
    const config = getServerConfig(guildId);

    if (!config.channelId) {
      return interaction.reply({
        embeds: [createErrorEmbed('Nenhum canal configurado!\nUse **/configurar canal** primeiro para definir onde as promoções serão enviadas.')],
        ephemeral: true,
      });
    }

    await interaction.reply({
      embeds: [createSuccessEmbed('Verificação iniciada!', `Buscando ofertas com **${config.minDiscount}%+** de desconto${config.onlyMultiplayer ? ' (somente multiplayer)' : ''}...\nAs promoções serão enviadas em <#${config.channelId}> em instantes.`)],
      ephemeral: true,
    });

    try {
      await checkAndSendDeals(guildId, config);
    } catch (error) {
      console.error('[/verificar] Erro:', error.message);
      await interaction.followUp({
        embeds: [createErrorEmbed('Ocorreu um erro durante a verificação. Confira os logs do servidor.')],
        ephemeral: true,
      }).catch(() => {});
    }
  },
};
