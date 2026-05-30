// src/routes/routeAluno.js
const { Router } = require('express');
const controller = require('../controller/controllerAluno');

const router = Router();

/**
 * Rotas relacionadas ao aluno
 *
 * - GET /aluno/:id/turmas-disponiveis
 *   Lista turmas em que o aluno PODE se inscrever
 *   (já vem filtrado por:
 *    - não estar em usuario_graduacao,
 *    - não ter inscrição pendente/aprovada,
 *    - com campo categoria = 'principal' | 'optativa')
 *
 * - GET /aluno/:id/inscricoes
 *   Lista inscrições do aluno (pendentes / aprovadas / rejeitadas)
 */

// Obter turmas disponíveis para um aluno
router.get('/:id/turmas-disponiveis', controller.getTurmasDisponiveis);

// Obter inscrições de um aluno
router.get('/:id/inscricoes', controller.getInscricoesAluno);

module.exports = router;
