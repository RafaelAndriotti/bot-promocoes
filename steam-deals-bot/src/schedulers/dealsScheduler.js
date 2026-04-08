const cron = require('node-cron');
const { getTopDeals } = require('../services/cheapsharkService');
const { getMultiplayerInfo } = require('../services/steamService');
const { createDealEmbed } = require('../utils/embeds');
const { loadDB, getServerConfig, saveServerConfig } = require('../utils/database');

let discordClient = null;

// ─────────────────────────────────────────
// Verifica e envia novas ofertas para um servidor
// ─────────────────────────────────────────
async function checkAndSendDeals(guildId, config) {
  // Pula se não tiver canal configurado
  if (!config.channelId) return;

  // Tenta buscar o canal
  const channel = await discordClient.channels.fetch(config.channelId).catch(() => null);
  if (!channel) {
    console.warn(`[${guildId}] Canal não encontrado (${config.channelId}). Configure novamente com /configurar canal.`);
    return;
  }

  console.log(`[${guildId}] Buscando ofertas (mínimo ${config.minDiscount}%${config.onlyMultiplayer ? ', apenas multiplayer' : ''})...`);

  // Busca os deals na CheapShark
  const allDeals = await getTopDeals({ minDiscount: config.minDiscount, limit: 30 });

  // Filtra apenas os deals não enviados ainda
  const sentDeals = new Set(config.sentDeals || []);
  const newDeals = allDeals.filter(d => !sentDeals.has(d.id));

  if (newDeals.length === 0) {
    console.log(`[${guildId}] Sem novas ofertas no momento.`);
    return;
  }

  // Filtra por multiplayer (se configurado)
  let dealsToSend = [];

  if (config.onlyMultiplayer) {
    for (const deal of newDeals.slice(0, 25)) {
      if (!deal.steamAppId) continue;

      const info = await getMultiplayerInfo(deal.steamAppId);

      if (info.multiplayer) {
        dealsToSend.push({ ...deal, steamInfo: info });
      }

      // Para após encontrar 5 jogos multiplayer
      if (dealsToSend.length >= 5) break;

      // Pequena pausa para evitar rate limit da Steam API
      await new Promise(r => setTimeout(r, 500));
    }
  } else {
    dealsToSend = newDeals.slice(0, 5).map(d => ({ ...d, steamInfo: null }));
  }

  if (dealsToSend.length === 0) {
    console.log(`[${guildId}] Nenhum jogo multiplayer novo encontrado.`);
    return;
  }

  // Envia mensagem de introdução
  await channel.send({
    content: `🎮 **Novas ofertas na Steam!** Encontrei **${dealsToSend.length}** jogo(s) com **${config.minDiscount}%+** de desconto${config.onlyMultiplayer ? ' para jogar em grupo! 👥' : '!'}`,
  });

  // Envia um embed para cada jogo
  for (const deal of dealsToSend) {
    await channel.send({ embeds: [createDealEmbed(deal, deal.steamInfo)] });
    await new Promise(r => setTimeout(r, 300)); // delay entre mensagens
  }

  // Salva os IDs enviados (mantém apenas os últimos 200)
  const updatedSentDeals = [...sentDeals, ...dealsToSend.map(d => d.id)].slice(-200);
  saveServerConfig(guildId, { ...config, sentDeals: updatedSentDeals });

  console.log(`[${guildId}] ✅ ${dealsToSend.length} oferta(s) enviada(s) com sucesso!`);
}

// ─────────────────────────────────────────
// Inicia o agendador
// ─────────────────────────────────────────
function startScheduler(client) {
  discordClient = client;

  // Verifica a cada 6 horas (0h, 6h, 12h, 18h)
  cron.schedule('0 */6 * * *', async () => {
    console.log('\n⏰ [Scheduler] Iniciando verificação automática de ofertas...');

    const db = loadDB();
    const guilds = Object.entries(db);

    if (guilds.length === 0) {
      console.log('[Scheduler] Nenhum servidor configurado ainda.');
      return;
    }

    for (const [guildId, config] of guilds) {
      try {
        await checkAndSendDeals(guildId, config);
      } catch (error) {
        console.error(`[Scheduler] Erro ao processar servidor ${guildId}:`, error.message);
      }
    }

    console.log('[Scheduler] ✅ Verificação concluída!\n');
  });

  console.log('⏰ Scheduler iniciado — verificação automática a cada 6 horas.');
}

module.exports = { startScheduler, checkAndSendDeals };
