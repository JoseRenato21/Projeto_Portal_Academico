// src/routes/routeGraduacao.js

const { Router } = require('express');
const controller = require('../controller/controllerGraduacao');

const router = Router();

// Listar todas as graduações
router.get('/', controller.getGraduacoes);

module.exports = router;