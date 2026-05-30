// src/routes/routeMaterialAula.js

const { Router } = require('express');
const controller = require('../controller/controllerMaterialAula');

const router = Router();

// Obter materiais de uma turma
router.get('/turma/:id_turma', controller.getByTurma);

// Criar novo material para uma turma
router.post('/turma/:id_turma', controller.createForTurma);

module.exports = router;