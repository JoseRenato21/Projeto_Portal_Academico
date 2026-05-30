// src/controller/controllerGraduacao.js
const service = require('../services/serviceGraduacao');

const controller = {
  getGraduacoes: async (req, res) => {
    try {
      const graduacoes = await service.getGraduacoes();
      res.status(200).json(graduacoes);
    } catch (err) {
      console.error('Erro ao buscar graduações:', err);
      res.status(500).json({ error: 'Erro ao buscar graduações' });
    }
  },
};

module.exports = controller;
