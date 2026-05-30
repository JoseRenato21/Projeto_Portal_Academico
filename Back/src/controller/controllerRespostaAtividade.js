// src/controller/controllerRespostaAtividade.js
const service = require("../services/serviceRespostaAtividade");

const controllerRespostaAtividade = {
  // POST /resposta_atividade
  // body: { id_atividade, id_aluno, conteudo_resposta, caminho_arquivo? }
  async criarOuAtualizar(req, res) {
    try {
      console.log(
        "[controllerRespostaAtividade] criarOuAtualizar body:",
        req.body
      );

      const {
        id_atividade,
        id_aluno,
        conteudo_resposta,
        caminho_arquivo,
      } = req.body;

      const idAtividadeNum = parseInt(id_atividade, 10);
      const idAlunoNum = parseInt(id_aluno, 10);

      if (Number.isNaN(idAtividadeNum) || Number.isNaN(idAlunoNum)) {
        console.error(
          "[controllerRespostaAtividade] IDs inválidos em criarOuAtualizar:",
          { id_atividade, id_aluno }
        );
        return res
          .status(400)
          .json({ error: "id_atividade e id_aluno devem ser números válidos." });
      }

      const result = await service.criarOuAtualizarResposta({
        id_atividade: idAtividadeNum,
        id_aluno: idAlunoNum,
        conteudo_resposta,
        caminho_arquivo,
      });

      if (result.atualizado) {
        console.log(
          "[controllerRespostaAtividade] resposta atualizada id_resposta=",
          result.id_resposta
        );
        return res.status(200).json({
          message: "Resposta atualizada com sucesso.",
          ...result,
        });
      }

      console.log(
        "[controllerRespostaAtividade] resposta criada id_resposta=",
        result.id_resposta
      );

      return res.status(201).json({
        message: "Resposta enviada com sucesso.",
        ...result,
      });
    } catch (err) {
      console.error("Erro em criarOuAtualizar resposta:", err);
      return res.status(500).json({
        error: err.message || "Erro ao salvar resposta da atividade.",
      });
    }
  },

  // GET /resposta_atividade/atividade/:id_atividade/aluno/:id_aluno
  async obterRespostaDoAluno(req, res) {
    try {
      console.log(
        "[controllerRespostaAtividade] obterRespostaDoAluno params:",
        req.params
      );

      const { id_atividade, id_aluno } = req.params;

      const idAtividadeNum = parseInt(id_atividade, 10);
      const idAlunoNum = parseInt(id_aluno, 10);

      if (Number.isNaN(idAtividadeNum) || Number.isNaN(idAlunoNum)) {
        console.error(
          "[controllerRespostaAtividade] IDs inválidos em obterRespostaDoAluno:",
          { id_atividade, id_aluno }
        );
        return res
          .status(400)
          .json({ error: "IDs inválidos (atividade/aluno)." });
      }

      const resposta = await service.obterRespostaDoAluno(
        idAtividadeNum,
        idAlunoNum
      );

      if (!resposta) {
        console.log(
          "[controllerRespostaAtividade] obterRespostaDoAluno -> sem resposta ainda"
        );
        return res.status(200).json(null); // sem resposta ainda
      }

      console.log(
        "[controllerRespostaAtividade] obterRespostaDoAluno -> encontrou id_resposta=",
        resposta.id_resposta
      );

      return res.status(200).json(resposta);
    } catch (err) {
      console.error("Erro em obterRespostaDoAluno:", err);
      return res.status(500).json({
        error: "Erro ao buscar resposta do aluno para a atividade.",
      });
    }
  },

  // GET /resposta_atividade/atividade/:id_atividade
  async listarPorAtividade(req, res) {
    try {
      console.log(
        "[controllerRespostaAtividade] listarPorAtividade params:",
        req.params
      );

      const { id_atividade } = req.params;
      const idAtividadeNum = parseInt(id_atividade, 10);

      if (Number.isNaN(idAtividadeNum)) {
        console.error(
          "[controllerRespostaAtividade] ID da atividade inválido em listarPorAtividade:",
          id_atividade
        );
        return res.status(400).json({ error: "ID da atividade inválido." });
      }

      const lista = await service.listarRespostasPorAtividade(idAtividadeNum);
      console.log(
        "[controllerRespostaAtividade] listarPorAtividade -> lista.length=",
        lista.length
      );
      return res.status(200).json(lista);
    } catch (err) {
      console.error("Erro em listarPorAtividade:", err);
      return res.status(500).json({
        error: "Erro ao buscar respostas da atividade.",
      });
    }
  },

  // GET /resposta_atividade/aluno/:idAluno/turmas   (se você quiser usar esse caminho)
  async listarTurmasDoAluno(req, res) {
    try {
      console.log(
        "[controllerRespostaAtividade] listarTurmasDoAluno params:",
        req.params
      );

      const { idAluno } = req.params;
      const idAlunoNum = parseInt(idAluno, 10);

      if (Number.isNaN(idAlunoNum)) {
        console.error(
          "[controllerRespostaAtividade] ID do aluno inválido em listarTurmasDoAluno:",
          idAluno
        );
        return res
          .status(400)
          .json({ error: "ID do aluno inválido." });
      }

      const turmas = await service.listarTurmasDoAluno(idAlunoNum);
      console.log(
        "[controllerRespostaAtividade] listarTurmasDoAluno -> turmas.length=",
        turmas.length
      );

      return res.status(200).json(turmas);
    } catch (err) {
      console.error("Erro em listarTurmasDoAluno:", err);
      return res
        .status(500)
        .json({ error: "Erro ao buscar turmas do aluno." });
    }
  },
};

module.exports = controllerRespostaAtividade;
