// src/routes/routePeriodo.js

const { Router } = require('express');
const controller = require('../controller/controllerPeriodo');

const router = Router();

// Listar todos os períodos
router.get('/', controller.getPeriodos);

// Criar novo período
router.post('/', controller.createPeriodo);

// Atualizar período
router.put('/:id', controller.updatePeriodo);

// Deletar período
router.delete('/:id', controller.deletePeriodo);

module.exports = router;