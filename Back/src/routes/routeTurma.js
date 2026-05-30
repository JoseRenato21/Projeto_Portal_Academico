// src/routes/routeTurma.js

const { Router } = require('express');
const controller = require('../controller/controllerTurma');

const router = Router();

// Listar todas as turmas
router.get('/', controller.getTurmas);

// Listar turmas de um professor específico
router.get('/professor/:id_professor', controller.listByProfessor);

// Buscar fila de inscrição de uma turma
router.get('/:id/fila', controller.getFilaTurma);

// Listar professores de uma graduação
router.get('/graduacao/:id_graduacao/professores', controller.getProfessoresByGraduacao);

// Criar nova turma
router.post('/', controller.createTurma);

// Atualizar turma
router.put('/:id', controller.updateTurma);

// Fechar inscrições de uma turma (processa fila)
router.post('/:id/fechar-inscricoes', controller.fecharInscricoes);

// Deletar turma
router.delete('/:id', controller.deleteTurma);

module.exports = router;