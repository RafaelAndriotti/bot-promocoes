const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../data/config.json');

// ─────────────────────────────────────────
// Configurações padrão para cada servidor
// ─────────────────────────────────────────
const DEFAULT_CONFIG = {
  channelId: null,       // Canal para alertas automáticos
  minDiscount: 70,       // Desconto mínimo para alertas (%)
  onlyMultiplayer: true, // Filtrar apenas jogos multiplayer/co-op
  wishlist: [],          // Lista de desejos do grupo
  sentDeals: [],         // IDs de deals já enviados (evita duplicatas)
};

/**
 * Carrega todo o banco de dados (arquivo JSON)
 */
function loadDB() {
  if (!fs.existsSync(DB_PATH)) {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    fs.writeFileSync(DB_PATH, JSON.stringify({}));
  }
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
}

/**
 * Salva o banco de dados
 */
function saveDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

/**
 * Retorna as configurações de um servidor específico
 */
function getServerConfig(guildId) {
  const db = loadDB();
  return db[guildId] ? { ...DEFAULT_CONFIG, ...db[guildId] } : { ...DEFAULT_CONFIG };
}

/**
 * Salva as configurações de um servidor
 */
function saveServerConfig(guildId, config) {
  const db = loadDB();
  db[guildId] = config;
  saveDB(db);
}

module.exports = { loadDB, getServerConfig, saveServerConfig };
