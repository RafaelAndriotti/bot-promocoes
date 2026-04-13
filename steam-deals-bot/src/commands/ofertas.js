const { SlashCommandBuilder } = require('discord.js');
const { getTopDeals } = require('../services/cheapsharkService');
const { createDealsListEmbed, createErrorEmbed } = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ofertas')
    .setDescription('🎮 Exibe as melhores ofertas da Steam agora')
    .addIntegerOption(option =>
      option
        .setName('desconto')
        .setDescription('Desconto mínimo em % (padrão: 70)')
        .setMinValue(10)
        .setMaxValue(99)
        .setRequired(false)
    ),

  async execute(interaction) {
    await interaction.deferReply();

    const minDiscount = interaction.options.getInteger('desconto') ?? 70;

    try {
      const deals = await getTopDeals({ minDiscount, limit: 30 });

      if (deals.length === 0) {
        return interaction.editReply({
          embeds: [createErrorEmbed(`Nenhuma oferta encontrada com **${minDiscount}%** ou mais de desconto no momento.\nTente um desconto menor!`)],
        });
      }

      const embed = createDealsListEmbed(deals);
      return interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('[/ofertas] Erro:', error.message);
      return interaction.editReply({
        embeds: [createErrorEmbed('Erro ao buscar ofertas. A API pode estar instável, tente novamente em instantes.')],
      });
    }
  },
};
