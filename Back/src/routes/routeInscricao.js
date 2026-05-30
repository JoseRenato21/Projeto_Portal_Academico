// src/routes/routeInscricao.js
const { Router } = require('express');
const controller = require('../controller/controllerInscricao');

const router = Router();

// Fluxo do aluno: criar inscrição
// POST http://localhost:3001/inscricoes
router.post('/', controller.createInscricao);

// Listar inscrições de um aluno
// GET http://localhost:3001/inscricoes/aluno/123
router.get('/aluno/:idAluno', controller.listarInscricoesAluno);

// Listar pendentes de uma turma (para professor)
// GET http://localhost:3001/inscricoes/turma/14/pendentes
router.get('/turma/:idTurma/pendentes', controller.listarPendentesDaTurma);

// Professor aprova inscrição
// POST http://localhost:3001/inscricoes/10/aprovar
router.post('/:idInscricao/aprovar', controller.aprovarInscricao);

// Professor rejeita inscrição
// POST http://localhost:3001/inscricoes/10/rejeitar
router.post('/:idInscricao/rejeitar', controller.rejeitarInscricao);

module.exports = router;
