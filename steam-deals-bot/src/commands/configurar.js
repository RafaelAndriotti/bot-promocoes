const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { getServerConfig, saveServerConfig } = require('../utils/database');
const { createSuccessEmbed, createErrorEmbed } = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('configurar')
    .setDescription('⚙️ Configura o bot para este servidor')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)

    // Subcomando: canal
    .addSubcommand(sub =>
      sub
        .setName('canal')
        .setDescription('Define o canal onde as ofertas automáticas serão enviadas')
        .addChannelOption(option =>
          option
            .setName('canal')
            .setDescription('Canal para receber as promoções')
            .setRequired(true)
        )
    )

    // Subcomando: desconto
    .addSubcommand(sub =>
      sub
        .setName('desconto')
        .setDescription('Define o desconto mínimo para os alertas automáticos')
        .addIntegerOption(option =>
          option
            .setName('porcentagem')
            .setDescription('Desconto mínimo em % (10 a 99)')
            .setMinValue(10)
            .setMaxValue(99)
            .setRequired(true)
        )
    )

    // Subcomando: multiplayer
    .addSubcommand(sub =>
      sub
        .setName('multiplayer')
        .setDescription('Liga ou desliga o filtro de apenas jogos multiplayer/co-op')
        .addBooleanOption(option =>
          option
            .setName('ativar')
            .setDescription('true = somente multiplayer | false = todos os jogos')
            .setRequired(true)
        )
    )

    // Subcomando: status
    .addSubcommand(sub =>
      sub
        .setName('status')
        .setDescription('Exibe a configuração atual do servidor')
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const guildId = interaction.guildId;
    const config = getServerConfig(guildId);

    // ── Canal ───────────────────────────────────────
    if (sub === 'canal') {
      const channel = interaction.options.getChannel('canal');

      // Verifica se o bot tem permissão para enviar mensagens no canal
      const permissions = channel.permissionsFor(interaction.guild.members.me);
      if (!permissions?.has(['SendMessages', 'EmbedLinks'])) {
        return interaction.reply({
          embeds: [createErrorEmbed(`Não tenho permissão para enviar mensagens em ${channel}.\nConceda-me as permissões **Enviar Mensagens** e **Inserir Links** nesse canal.`)],
          ephemeral: true,
        });
      }

      saveServerConfig(guildId, { ...config, channelId: channel.id });

      return interaction.reply({
        embeds: [createSuccessEmbed(
          'Canal configurado!',
          `As promoções automáticas serão enviadas em ${channel}.\n\nUse **/verificar** para testar agora ou aguarde o próximo ciclo automático (a cada 6 horas).`
        )],
      });
    }

    // ── Desconto ────────────────────────────────────
    if (sub === 'desconto') {
      const porcentagem = interaction.options.getInteger('porcentagem');
      saveServerConfig(guildId, { ...config, minDiscount: porcentagem });

      return interaction.reply({
        embeds: [createSuccessEmbed(
          'Desconto mínimo atualizado!',
          `A partir de agora, o bot só alertará sobre jogos com **${porcentagem}% ou mais** de desconto.`
        )],
      });
    }

    // ── Multiplayer ─────────────────────────────────
    if (sub === 'multiplayer') {
      const ativar = interaction.options.getBoolean('ativar');
      saveServerConfig(guildId, { ...config, onlyMultiplayer: ativar });

      return interaction.reply({
        embeds: [createSuccessEmbed(
          `Filtro multiplayer ${ativar ? 'ativado' : 'desativado'}!`,
          ativar
            ? '👥 O bot agora enviará apenas jogos com suporte a **multiplayer ou co-op**.'
            : '🎮 O bot agora enviará **todos os jogos** com desconto, incluindo single-player.'
        )],
      });
    }

    // ── Status ──────────────────────────────────────
    if (sub === 'status') {
      const { EmbedBuilder } = require('discord.js');
      const channelMention = config.channelId ? `<#${config.channelId}>` : '❌ Não configurado';

      const embed = new EmbedBuilder()
        .setColor(0x1b2838)
        .setTitle('⚙️ Configuração atual do servidor')
        .addFields(
          { name: '📢 Canal de alertas', value: channelMention, inline: true },
          { name: '🏷️ Desconto mínimo', value: `**${config.minDiscount}%**`, inline: true },
          { name: '👥 Somente multiplayer', value: config.onlyMultiplayer ? '✅ Sim' : '❌ Não', inline: true },
          { name: '📋 Jogos na wishlist', value: `${(config.wishlist || []).length} jogo(s)`, inline: true },
          { name: '✉️ Deals enviados', value: `${(config.sentDeals || []).length} deal(s) (últimos 200)`, inline: true },
        )
        .setFooter({ text: 'Use /configurar canal | desconto | multiplayer para alterar' })
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    }
  },
};
