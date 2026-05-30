// src/routes/routeUser.js
const { Router } = require("express");
const controller = require("../controller/controllerUser");

const router = Router();

// Usuários
router.get("/", controller.getUsers);
router.get("/stats/most-graduacoes", controller.getUsersWithMostGraduacoes);
router.post("/", controller.createUser);
router.post("/login", controller.login);

// Atualizações gerais
router.put("/:id/tipo", controller.updateTipo);
router.put("/:id", controller.updateDados);
router.delete("/:id", controller.deleteUser);

// Graduação ativa
router.put("/:id/graduacao-ativa", controller.updateGraduacaoAtiva);

// Graduações por tipo
// Cursos de docência (tipo = 'professor')
router.put("/:id/graduacoes", controller.updateGraduacoesLista);
// Graduações concluídas (tipo = 'aluno')
router.put(
  "/:id/graduacoes-concluidas",
  controller.updateGraduacoesConcluidasLista
);

// Listagens por tipo
router.get("/:id/graduacoes", controller.getUserGraduacoes); // professor
router.get(
  "/:id/graduacoes-concluidas",
  controller.getUserGraduacoesConcluidas
); // aluno

module.exports = router;
