const axios = require('axios');

const BASE_URL = 'https://www.cheapshark.com/api/1.0';

/**
 * Busca as melhores ofertas da Steam (storeID=1)
 * Retorna uma lista formatada de deals
 */
async function getTopDeals({ minDiscount = 70, limit = 30 } = {}) {
  const response = await axios.get(`${BASE_URL}/deals`, {
    params: {
      storeID: 1,          // 1 = Steam
      sortBy: 'DealRating', // Ordena pelos melhores deals
      pageSize: limit,
      onSale: 1,
      lowerPrice: 0,
      upperPrice: 60,
    },
    timeout: 10000,
  });

  return response.data
    .filter(deal => parseFloat(deal.savings) >= minDiscount)
    .map(deal => ({
      id: deal.dealID,
      gameId: deal.gameID,
      title: deal.title,
      salePrice: parseFloat(deal.salePrice),
      normalPrice: parseFloat(deal.normalPrice),
      discount: Math.round(parseFloat(deal.savings)),
      rating: deal.steamRatingText,
      ratingPercent: deal.steamRatingPercent,
      steamAppId: deal.steamAppID,
      thumbnail: deal.thumb,
      dealLink: deal.steamAppID 
        ? `https://store.steampowered.com/app/${deal.steamAppID}` 
        : `https://www.cheapshark.com/redirect?dealID=${deal.dealID}`,
    }));
}

/**
 * Busca um jogo específico pelo nome
 * Retorna os primeiros resultados com detalhes de preço
 */
async function searchGame(title) {
  const response = await axios.get(`${BASE_URL}/games`, {
    params: {
      title,
      storeID: 1,
      exact: 0,
      limit: 5,
    },
    timeout: 10000,
  });
  return response.data;
}

module.exports = { getTopDeals, searchGame };
