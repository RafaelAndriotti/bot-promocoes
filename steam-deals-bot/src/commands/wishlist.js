const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getServerConfig, saveServerConfig } = require('../utils/database');
const { createSuccessEmbed, createErrorEmbed } = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('wishlist')
    .setDescription('📋 Gerencia a lista de desejos do servidor')

    // Subcomando: adicionar
    .addSubcommand(sub =>
      sub
        .setName('adicionar')
        .setDescription('Adiciona um jogo à wishlist do servidor')
        .addStringOption(option =>
          option
            .setName('jogo')
            .setDescription('Nome do jogo para adicionar')
            .setRequired(true)
            .setMinLength(2)
        )
    )

    // Subcomando: remover
    .addSubcommand(sub =>
      sub
        .setName('remover')
        .setDescription('Remove um jogo da wishlist do servidor')
        .addStringOption(option =>
          option
            .setName('jogo')
            .setDescription('Nome do jogo para remover')
            .setRequired(true)
            .setMinLength(2)
        )
    )

    // Subcomando: ver
    .addSubcommand(sub =>
      sub
        .setName('ver')
        .setDescription('Exibe todos os jogos na wishlist do servidor')
    )

    // Subcomando: limpar
    .addSubcommand(sub =>
      sub
        .setName('limpar')
        .setDescription('Remove todos os jogos da wishlist')
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const guildId = interaction.guildId;
    const config = getServerConfig(guildId);
    const wishlist = config.wishlist || [];

    // ── Adicionar ───────────────────────────────────
    if (sub === 'adicionar') {
      const jogo = interaction.options.getString('jogo').trim();

      // Verifica duplicata (case-insensitive)
      const jaExiste = wishlist.some(g => g.toLowerCase() === jogo.toLowerCase());
      if (jaExiste) {
        return interaction.reply({
          embeds: [createErrorEmbed(`**"${jogo}"** já está na wishlist do servidor!`)],
          ephemeral: true,
        });
      }

      if (wishlist.length >= 25) {
        return interaction.reply({
          embeds: [createErrorEmbed('A wishlist está cheia! (máximo de 25 jogos)\nRemova algum com **/wishlist remover** antes de adicionar novos.')],
          ephemeral: true,
        });
      }

      wishlist.push(jogo);
      saveServerConfig(guildId, { ...config, wishlist });

      return interaction.reply({
        embeds: [createSuccessEmbed(
          'Adicionado à wishlist!',
          `🎮 **"${jogo}"** foi adicionado à wishlist do servidor.\n\nQuando este jogo entrar em promoção, o bot poderá alertar automaticamente.\n\n📋 Total na lista: **${wishlist.length}** jogo(s)`
        )],
      });
    }

    // ── Remover ─────────────────────────────────────
    if (sub === 'remover') {
      const jogo = interaction.options.getString('jogo').trim();

      const index = wishlist.findIndex(g => g.toLowerCase() === jogo.toLowerCase());
      if (index === -1) {
        return interaction.reply({
          embeds: [createErrorEmbed(`**"${jogo}"** não está na wishlist.\nUse **/wishlist ver** para ver os jogos disponíveis.`)],
          ephemeral: true,
        });
      }

      const removido = wishlist.splice(index, 1)[0];
      saveServerConfig(guildId, { ...config, wishlist });

      return interaction.reply({
        embeds: [createSuccessEmbed(
          'Removido da wishlist!',
          `🗑️ **"${removido}"** foi removido da wishlist.\n\n📋 Total na lista: **${wishlist.length}** jogo(s)`
        )],
      });
    }

    // ── Ver ─────────────────────────────────────────
    if (sub === 'ver') {
      if (wishlist.length === 0) {
        return interaction.reply({
          embeds: [createErrorEmbed('A wishlist está vazia!\nUse **/wishlist adicionar** para começar.')],
          ephemeral: true,
        });
      }

      const embed = new EmbedBuilder()
        .setColor(0xf5a623)
        .setTitle('📋 Wishlist do Servidor')
        .setDescription(
          wishlist.map((jogo, i) => `**${i + 1}.** 🎮 ${jogo}`).join('\n')
        )
        .setFooter({ text: `${wishlist.length} jogo(s) na lista • /wishlist adicionar | remover` })
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    }

    // ── Limpar ──────────────────────────────────────
    if (sub === 'limpar') {
      if (wishlist.length === 0) {
        return interaction.reply({
          embeds: [createErrorEmbed('A wishlist já está vazia!')],
          ephemeral: true,
        });
      }

      const total = wishlist.length;
      saveServerConfig(guildId, { ...config, wishlist: [] });

      return interaction.reply({
        embeds: [createSuccessEmbed(
          'Wishlist limpa!',
          `🗑️ **${total}** jogo(s) foram removidos da wishlist do servidor.`
        )],
      });
    }
  },
};
