// src/routes/routeHistoricoAluno.js

const { Router } = require("express");
const controller = require("../controller/controllerHistoricoAluno");

const router = Router();

/**
 * Histórico de um aluno específico
 * GET /historico_aluno/aluno/:id_aluno
 */
router.get("/aluno/:id_aluno", controller.getHistoricoAlunoPorAluno);

/**
 * Alunos e Professores por Graduação
 * GET /historico_aluno/:codigo_graduacao/alunos
 * GET /historico_aluno/:codigo_graduacao/professores
 */
router.get("/:codigo_graduacao/alunos", controller.getAlunosPorGraduacao);
router.get(
  "/:codigo_graduacao/professores",
  controller.getProfessoresPorGraduacao
);

/**
 * 2.1 - Quantidade de alunos por turma de uma graduação
 * GET /historico_aluno/quantidade-por-turma/graduacao/:codigo_graduacao
 */
router.get(
  "/quantidade-por-turma/graduacao/:codigo_graduacao",
  controller.getQuantidadeAlunosPorTurma
);

/**
 * 2.2 - Média geral de notas por turma de uma graduação
 * GET /historico_aluno/media-por-turma/graduacao/:codigo_graduacao
 */
router.get(
  "/media-por-turma/graduacao/:codigo_graduacao",
  controller.getMediaPorTurma
);

/**
 * 2.3 - Alunos com desempenho abaixo da média (< 5)
 * GET /historico_aluno/abaixo-media/graduacao/:codigo_graduacao
 */
router.get(
  "/abaixo-media/graduacao/:codigo_graduacao",
  controller.getAlunosAbaixoMedia
);

/**
 * 2.4 - Turmas ativas de um professor 
 * GET /historico_aluno/turmas-ativas-professor/:codigo_graduacao/:id_professor
 */
router.get(
  "/turmas-ativas-professor/:codigo_graduacao/:id_professor",
  controller.getTurmasAtivasProfessor
);

/**
 * 2.5 - Professor com maior número de turmas ativas
 * GET /historico_aluno/professor-mais-turmas/graduacao/:codigo_graduacao
 */
router.get(
  "/professor-mais-turmas/graduacao/:codigo_graduacao",
  controller.getProfessorMaisTurmas
);

/**
 * 2.6 - Top 3 turmas com melhor desempenho médio
 * GET /historico_aluno/top3-turmas/graduacao/:codigo_graduacao
 */
router.get(
  "/top3-turmas/graduacao/:codigo_graduacao",
  controller.getTop3Turmas
);

module.exports = router;
