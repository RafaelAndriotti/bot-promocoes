const axios = require('axios');

// IDs de categorias da Steam relacionadas a multiplayer e co-op
const MULTIPLAYER_CATEGORY_IDS = [
  1,  // Multi-player
  9,  // Co-op
  27, // Cross-Platform Multiplayer
  36, // Online Co-op
  38, // Online Co-op (até 4 jogadores)
  49, // Online PvP
];

/**
 * Busca os detalhes de um jogo na Steam Store API
 * Retorna null se não encontrado ou em caso de erro
 */
async function getGameDetails(appId) {
  try {
    const response = await axios.get('https://store.steampowered.com/api/appdetails', {
      params: {
        appids: appId,
        cc: 'br',
        l: 'pt',
      },
      timeout: 8000,
    });

    const result = response.data[appId];
    if (!result || !result.success) return null;

    return result.data;
  } catch {
    return null;
  }
}

/**
 * Verifica se um jogo tem suporte multiplayer/co-op
 * e retorna informações detalhadas sobre os modos disponíveis
 */
async function getMultiplayerInfo(appId) {
  const details = await getGameDetails(appId);

  if (!details) {
    return { multiplayer: false, multiplayerTypes: [], headerImage: null, description: null, genres: [], steamUrl: null };
  }

  const categories = details.categories || [];
  const isMultiplayer = categories.some(cat => MULTIPLAYER_CATEGORY_IDS.includes(cat.id));
  const multiplayerTypes = categories
    .filter(cat => MULTIPLAYER_CATEGORY_IDS.includes(cat.id))
    .map(cat => cat.description);

  return {
    multiplayer: isMultiplayer,
    multiplayerTypes,
    headerImage: details.header_image || null,
    description: details.short_description || null,
    genres: (details.genres || []).map(g => g.description),
    developers: details.developers || [],
    steamUrl: `https://store.steampowered.com/app/${appId}`,
  };
}

module.exports = { getGameDetails, getMultiplayerInfo };
