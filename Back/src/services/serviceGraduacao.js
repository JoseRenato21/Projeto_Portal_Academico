// src/services/serviceGraduacao.js
const DB = require('../config/database');

const service = {
  getGraduacoes: async () => {
    const [graduacoes] = await DB.execute(`
      SELECT codigo_graduacao, nome
      FROM graduacao
      ORDER BY nome;
    `);
    return graduacoes;
  },
};

module.exports = service;
