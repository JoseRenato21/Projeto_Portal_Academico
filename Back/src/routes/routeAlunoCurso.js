// src/routes/routeAlunoCurso.js

const { Router } = require('express');
const controller = require('../controller/controllerAlunoCurso');

const router = Router();

// Listar alunos de uma turma
router.get('/turma/:id_turma', controller.getByTurma);

// Atualizar notas de um aluno em um curso
router.put('/:id_aluno_curso/notas', controller.updateNotas);

module.exports = router;