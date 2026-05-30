// src/routes/routeCurso.js

const { Router } = require('express');
const controller = require('../controller/controllerCurso');

const router = Router();

// Listar todos os cursos
router.get('/', controller.getCursos);

// Listar cursos por graduação
router.get('/por-graduacao/:codigo_graduacao', controller.getCursosPorGraduacao);

// Criar novo curso
router.post('/', controller.createCurso);

// Atualizar curso
router.put('/:id', controller.updateCurso);

// Deletar curso
router.delete('/:id', controller.deleteCurso);

module.exports = router;