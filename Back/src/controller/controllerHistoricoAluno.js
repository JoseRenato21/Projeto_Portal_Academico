// src/controller/controllerHistoricoAluno.js

const service = require("../services/serviceHistoricoAluno");

const controllerHistoricoAluno = {
  // ========= EXTRA: Histórico completo de um aluno =========
  async getHistoricoAlunoPorAluno(req, res) {
    try {
      console.log("[controllerHistoricoAluno] getHistoricoAlunoPorAluno");
      const { id_aluno } = req.params;

      if (!id_aluno) {
        return res.status(400).json({ error: "id_aluno é obrigatório" });
      }

      const data = await service.getHistoricoAlunoPorAluno(id_aluno);
      return res.status(200).json(data);
    } catch (err) {
      console.error("Erro em getHistoricoAlunoPorAluno:", err);
      return res
        .status(500)
        .json({ error: "Erro ao buscar histórico do aluno" });
    }
  },

  // ========= EXTRA: Alunos de uma graduação (para o select) =========
  async getAlunosPorGraduacao(req, res) {
    try {
      console.log("[controllerHistoricoAluno] getAlunosPorGraduacao");
      const { codigo_graduacao } = req.params;

      if (!codigo_graduacao) {
        return res
          .status(400)
          .json({ error: "codigo_graduacao é obrigatório" });
      }

      const data = await service.getAlunosPorGraduacao(codigo_graduacao);
      return res.status(200).json(data);
    } catch (err) {
      console.error("Erro em getAlunosPorGraduacao:", err);
      return res
        .status(500)
        .json({ error: "Erro ao buscar alunos da graduação" });
    }
  },

  // ========= EXTRA: Professores de uma graduação (se ainda usar) =========
  async getProfessoresPorGraduacao(req, res) {
    try {
      console.log("[controllerHistoricoAluno] getProfessoresPorGraduacao");
      const { codigo_graduacao } = req.params;

      if (!codigo_graduacao) {
        return res
          .status(400)
          .json({ error: "codigo_graduacao é obrigatório" });
      }

      const data = await service.getProfessoresPorGraduacao(codigo_graduacao);
      return res.status(200).json(data);
    } catch (err) {
      console.error("Erro em getProfessoresPorGraduacao:", err);
      return res
        .status(500)
        .json({ error: "Erro ao buscar professores da graduação" });
    }
  },

  // ========= 2.1 - Quantidade de alunos em cada turma =========
  async getQuantidadeAlunosPorTurma(req, res) {
    try {
      console.log("[controllerHistoricoAluno] getQuantidadeAlunosPorTurma");
      const { codigo_graduacao } = req.params;

      if (!codigo_graduacao) {
        return res
          .status(400)
          .json({ error: "codigo_graduacao é obrigatório" });
      }

      const data = await service.getQuantidadeAlunosPorTurmaGraduacao(
        codigo_graduacao
      );
      return res.status(200).json(data);
    } catch (err) {
      console.error("Erro em getQuantidadeAlunosPorTurma:", err);
      return res
        .status(500)
        .json({ error: "Erro ao buscar quantidade de alunos por turma" });
    }
  },

  // ========= 2.2 - Média geral de notas por turma =========
  async getMediaPorTurma(req, res) {
    try {
      console.log("[controllerHistoricoAluno] getMediaPorTurma");
      const { codigo_graduacao } = req.params;

      if (!codigo_graduacao) {
        return res
          .status(400)
          .json({ error: "codigo_graduacao é obrigatório" });
      }

      const data = await service.getMediaPorTurmaGraduacao(codigo_graduacao);
      return res.status(200).json(data);
    } catch (err) {
      console.error("Erro em getMediaPorTurma:", err);
      return res
        .status(500)
        .json({ error: "Erro ao buscar médias por turma" });
    }
  },

  // ========= 2.3 - Alunos com desempenho abaixo da média =========
  async getAlunosAbaixoMedia(req, res) {
    try {
      console.log("[controllerHistoricoAluno] getAlunosAbaixoMedia");
      const { codigo_graduacao } = req.params;

      if (!codigo_graduacao) {
        return res
          .status(400)
          .json({ error: "codigo_graduacao é obrigatório" });
      }

      const data = await service.getAlunosAbaixoMediaGraduacao(
        codigo_graduacao
      );
      return res.status(200).json(data);
    } catch (err) {
      console.error("Erro em getAlunosAbaixoMedia:", err);
      return res
        .status(500)
        .json({ error: "Erro ao buscar alunos abaixo da média" });
    }
  },

  // ========= 2.4 - Turmas ativas de um professor (se ainda usar) =========
  async getTurmasAtivasProfessor(req, res) {
    try {
      console.log("[controllerHistoricoAluno] getTurmasAtivasProfessor");
      const { codigo_graduacao, id_professor } = req.params;

      if (!codigo_graduacao || !id_professor) {
        return res.status(400).json({
          error: "codigo_graduacao e id_professor são obrigatórios",
        });
      }

      const data = await service.getTurmasAtivasProfessorGraduacao(
        codigo_graduacao,
        id_professor
      );
      return res.status(200).json(data);
    } catch (err) {
      console.error("Erro em getTurmasAtivasProfessor:", err);
      return res
        .status(500)
        .json({ error: "Erro ao buscar turmas ativas do professor" });
    }
  },

  // ========= 2.5 - Professor com maior número de turmas ativas =========
  async getProfessorMaisTurmas(req, res) {
    try {
      console.log("[controllerHistoricoAluno] getProfessorMaisTurmas");
      const { codigo_graduacao } = req.params;

      if (!codigo_graduacao) {
        return res
          .status(400)
          .json({ error: "codigo_graduacao é obrigatório" });
      }

      const data = await service.getProfessorMaisTurmasAtivasGraduacao(
        codigo_graduacao
      );
      // Pode vir null se não tiver professor; o front lida com isso
      return res.status(200).json(data);
    } catch (err) {
      console.error("Erro em getProfessorMaisTurmas:", err);
      return res
        .status(500)
        .json({ error: "Erro ao buscar professor com mais turmas" });
    }
  },

  // ========= 2.6 - Top 3 turmas =========
  async getTop3Turmas(req, res) {
    try {
      console.log("[controllerHistoricoAluno] getTop3Turmas");
      const { codigo_graduacao } = req.params;

      if (!codigo_graduacao) {
        return res
          .status(400)
          .json({ error: "codigo_graduacao é obrigatório" });
      }

      const data = await service.getTop3TurmasGraduacao(codigo_graduacao);
      return res.status(200).json(data);
    } catch (err) {
      console.error("Erro em getTop3Turmas:", err);
      return res.status(500).json({ error: "Erro ao buscar top 3 turmas" });
    }
  },
};

module.exports = controllerHistoricoAluno;
