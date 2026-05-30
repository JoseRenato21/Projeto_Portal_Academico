// src/routes/routeRespostaAtividade.js
const { Router } = require("express");
const controller = require("../controller/controllerRespostaAtividade");

const router = Router();

router.post("/", controller.criarOuAtualizar);
router.get("/atividade/:id_atividade/aluno/:id_aluno", controller.obterRespostaDoAluno);
router.get("/atividade/:id_atividade", controller.listarPorAtividade);

// casa com listarTurmasDoAluno do controllerRespostaAtividade
router.get("/aluno/:idAluno/turmas", controller.listarTurmasDoAluno);

module.exports = router;
