const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { searchGame } = require('../services/cheapsharkService');
const { createErrorEmbed } = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('buscar')
    .setDescription('🔎 Busca um jogo específico e exibe seu preço atual na Steam')
    .addStringOption(option =>
      option
        .setName('jogo')
        .setDescription('Nome do jogo para buscar')
        .setRequired(true)
        .setMinLength(2)
    ),

  async execute(interaction) {
    await interaction.deferReply();

    const titulo = interaction.options.getString('jogo');

    try {
      const results = await searchGame(titulo);

      if (!results || results.length === 0) {
        return interaction.editReply({
          embeds: [createErrorEmbed(`Nenhum jogo encontrado para **"${titulo}"**.\nTente um nome diferente ou verifique a ortografia.`)],
        });
      }

      const embed = new EmbedBuilder()
        .setColor(0x1b2838)
        .setTitle(`🔎 Resultados para: "${titulo}"`)
        .setDescription(`Encontrei **${results.length}** resultado(s) na Steam:`)
        .setFooter({ text: 'Preços em USD via CheapShark API' })
        .setTimestamp();

      results.slice(0, 5).forEach((game, i) => {
        const cheapest = game.cheapestPriceEver;
        const currentPrice = game.prices?.[0]?.price ?? null;
        const storeCount = Object.keys(game.deals || {}).length;

        let value = '';

        if (currentPrice !== null) {
          value += `💰 Menor preço atual: **$${parseFloat(currentPrice).toFixed(2)}**\n`;
        }

        if (cheapest) {
          value += `📉 Menor preço histórico: **$${parseFloat(cheapest.price).toFixed(2)}**\n`;
        }

        if (storeCount > 0) {
          value += `🏪 Disponível em **${storeCount}** loja(s)\n`;
        }

        value += `[🛒 Ver na CheapShark](https://www.cheapshark.com/game/${game.gameID})`;

        embed.addFields({
          name: `${i + 1}. ${game.external}`,
          value: value || '📋 Sem dados de preço disponíveis',
          inline: false,
        });
      });

      return interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('[/buscar] Erro:', error.message);
      return interaction.editReply({
        embeds: [createErrorEmbed('Erro ao buscar o jogo. A API pode estar instável, tente novamente.')],
      });
    }
  },
};
