// src/controller/controllerAluno.js
const service = require('../services/serviceAluno');

const controllerAluno = {
  // GET /aluno/:id/turmas-disponiveis
  async getTurmasDisponiveis(req, res) {
    try {
      const idAluno = parseInt(req.params.id, 10);

      if (Number.isNaN(idAluno)) {
        return res.status(400).json({ error: 'idAluno inválido.' });
      }

      // Service já aplica:
      // - t.ativo = 1
      // - status_inscricoes = 'aberta'
      // - não estar em usuario_graduacao (docência / concluída)
      // - não ter inscrição pendente/aprovada nessa turma
      // - adiciona campo categoria: 'principal' | 'optativa'
      const turmas = await service.getTurmasDisponiveis(idAluno);

      return res.status(200).json(turmas);
    } catch (err) {
      console.error('Erro em getTurmasDisponiveis:', err);
      return res
        .status(500)
        .json({ error: 'Erro ao buscar turmas disponíveis.' });
    }
  },

  // GET /aluno/:id/inscricoes
  async getInscricoesAluno(req, res) {
    try {
      const idAluno = parseInt(req.params.id, 10);

      if (Number.isNaN(idAluno)) {
        return res.status(400).json({ error: 'idAluno inválido.' });
      }

      const inscricoes = await service.getInscricoesAluno(idAluno);
      return res.status(200).json(inscricoes);
    } catch (err) {
      console.error('Erro em getInscricoesAluno:', err);
      return res
        .status(500)
        .json({ error: 'Erro ao buscar inscrições do aluno.' });
    }
  },
};

module.exports = controllerAluno;
