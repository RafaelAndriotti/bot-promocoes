const { EmbedBuilder } = require('discord.js');

// Cores do tema Steam
const COLORS = {
  steam: 0x1b2838,
  success: 0x00c851,
  error: 0xff4444,
  warning: 0xffa500,
  gold: 0xf5a623,
};

// ─────────────────────────────────────────
// Embed de uma oferta individual (detalhado)
// ─────────────────────────────────────────
function createDealEmbed(deal, steamInfo) {
  const ratingEmoji = getRatingEmoji(deal.ratingPercent);

  const embed = new EmbedBuilder()
    .setColor(COLORS.steam)
    .setTitle(`🎮 ${deal.title}`)
    .setURL(deal.dealLink)
    .setTimestamp()
    .setFooter({ text: '🛒 Clique no título para abrir a oferta na Steam • Preços em USD' });

  // Descrição do jogo
  if (steamInfo?.description) {
    embed.setDescription(steamInfo.description.slice(0, 220) + '...');
  }

  // Preços
  embed.addFields(
    {
      name: '💰 Preço',
      value: `~~$${deal.normalPrice.toFixed(2)}~~ → **$${deal.salePrice.toFixed(2)}**`,
      inline: true,
    },
    {
      name: '🏷️ Desconto',
      value: `**-${deal.discount}%**`,
      inline: true,
    }
  );

  // Avaliação (se disponível)
  if (deal.rating || deal.ratingPercent) {
    embed.addFields({
      name: `${ratingEmoji} Avaliação`,
      value: `${deal.rating || '—'} (${deal.ratingPercent || '?'}%)`,
      inline: true,
    });
  }

  // Modos multiplayer
  if (steamInfo?.multiplayerTypes?.length > 0) {
    embed.addFields({
      name: '👥 Modos Multiplayer',
      value: steamInfo.multiplayerTypes.join(' • '),
      inline: false,
    });
  }

  // Gêneros
  if (steamInfo?.genres?.length > 0) {
    embed.addFields({
      name: '🎯 Gêneros',
      value: steamInfo.genres.join(', '),
      inline: false,
    });
  }

  // Imagem do jogo
  if (steamInfo?.headerImage) {
    embed.setImage(steamInfo.headerImage);
  } else if (deal.thumbnail) {
    embed.setThumbnail(deal.thumbnail);
  }

  return embed;
}

// ─────────────────────────────────────────
// Embed de lista de ofertas (resumido)
// ─────────────────────────────────────────
function createDealsListEmbed(deals) {
  const embed = new EmbedBuilder()
    .setColor(COLORS.success)
    .setTitle('🔥 Melhores Ofertas na Steam Agora!')
    .setDescription(`**${deals.length}** jogo(s) em promoção encontrados!\n\u200b`)
    .setFooter({ text: 'Dados via CheapShark API • Preços em USD' })
    .setTimestamp();

  deals.slice(0, 10).forEach((deal, i) => {
    const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `**${i + 1}.**`;
    embed.addFields({
      name: `${medal} ${deal.title}`,
      value: `~~$${deal.normalPrice.toFixed(2)}~~ → **$${deal.salePrice.toFixed(2)}** (-${deal.discount}%) | [🛒 Ver oferta](${deal.dealLink})`,
      inline: false,
    });
  });

  return embed;
}

// ─────────────────────────────────────────
// Embed de erro
// ─────────────────────────────────────────
function createErrorEmbed(message) {
  return new EmbedBuilder()
    .setColor(COLORS.error)
    .setTitle('❌ Ops!')
    .setDescription(message)
    .setTimestamp();
}

// ─────────────────────────────────────────
// Embed de sucesso
// ─────────────────────────────────────────
function createSuccessEmbed(title, description) {
  return new EmbedBuilder()
    .setColor(COLORS.success)
    .setTitle(`✅ ${title}`)
    .setDescription(description)
    .setTimestamp();
}

// ─────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────
function getRatingEmoji(percent) {
  const p = parseInt(percent) || 0;
  if (p >= 95) return '⭐⭐⭐⭐⭐';
  if (p >= 85) return '⭐⭐⭐⭐';
  if (p >= 70) return '⭐⭐⭐';
  if (p >= 50) return '⭐⭐';
  return '⭐';
}

module.exports = { createDealEmbed, createDealsListEmbed, createErrorEmbed, createSuccessEmbed };
