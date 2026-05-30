// src/controller/controllerInscricao.js
const service = require("../services/serviceInscricao");

const controllerInscricao = {
  // POST /inscricoes
  async createInscricao(req, res) {
    try {
      const { idAluno, idTurma } = req.body;

      const idAlunoNum = parseInt(idAluno, 10);
      const idTurmaNum = parseInt(idTurma, 10);

      if (Number.isNaN(idAlunoNum) || Number.isNaN(idTurmaNum)) {
        return res
          .status(400)
          .json({ error: "idAluno e idTurma devem ser números válidos." });
      }

      const result = await service.createInscricao(idAlunoNum, idTurmaNum);

      // result vem do serviceInscricao: { id_inscricao, jaExistia, status }
      if (result.jaExistia) {
        return res.status(200).json({
          message: "Você já possui uma inscrição para esta turma.",
          ...result,
        });
      }

      return res.status(201).json({
        message: "Inscrição criada com sucesso.",
        ...result,
      });
    } catch (err) {
      console.error("Erro em createInscricao:", err);
      return res.status(400).json({
        error: err.message || "Erro ao criar inscrição.",
      });
    }
  },

  // GET /inscricoes/aluno/:idAluno
  async listarInscricoesAluno(req, res) {
    try {
      const { idAluno } = req.params;
      const idAlunoNum = parseInt(idAluno, 10);

      if (Number.isNaN(idAlunoNum)) {
        return res.status(400).json({ error: "ID do aluno inválido." });
      }

      const lista = await service.listarInscricoesAluno(idAlunoNum);
      return res.status(200).json(lista);
    } catch (err) {
      console.error("Erro em listarInscricoesAluno:", err);
      return res
        .status(500)
        .json({ error: "Erro ao buscar inscrições do aluno." });
    }
  },

  // GET /inscricoes/turma/:idTurma/pendentes
  async listarPendentesDaTurma(req, res) {
    try {
      const { idTurma } = req.params;
      const idTurmaNum = parseInt(idTurma, 10);

      if (Number.isNaN(idTurmaNum)) {
        return res.status(400).json({ error: "ID da turma inválido." });
      }

      const lista = await service.listarPendentesDaTurma(idTurmaNum);
      return res.status(200).json(lista);
    } catch (err) {
      console.error("Erro em listarPendentesDaTurma:", err);
      return res
        .status(500)
        .json({ error: "Erro ao buscar alunos pendentes da turma." });
    }
  },

  // POST /inscricoes/:idInscricao/aprovar
  async aprovarInscricao(req, res) {
    try {
      const { idInscricao } = req.params;
      const idInscricaoNum = parseInt(idInscricao, 10);

      if (Number.isNaN(idInscricaoNum)) {
        return res.status(400).json({ error: "ID da inscrição inválido." });
      }

      const result = await service.aprovarInscricao(idInscricaoNum);
      return res.status(200).json(result);
    } catch (err) {
      console.error("Erro em aprovarInscricao:", err);
      return res.status(400).json({
        error: err.message || "Erro ao aprovar inscrição.",
      });
    }
  },

  // POST /inscricoes/:idInscricao/rejeitar
  async rejeitarInscricao(req, res) {
    try {
      const { idInscricao } = req.params;
      const idInscricaoNum = parseInt(idInscricao, 10);

      if (Number.isNaN(idInscricaoNum)) {
        return res.status(400).json({ error: "ID da inscrição inválido." });
      }

      const result = await service.rejeitarInscricao(idInscricaoNum);
      return res.status(200).json(result);
    } catch (err) {
      console.error("Erro em rejeitarInscricao:", err);
      return res.status(400).json({
        error: err.message || "Erro ao rejeitar inscrição.",
      });
    }
  },
};

module.exports = controllerInscricao;
