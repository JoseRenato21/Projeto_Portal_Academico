// src/controller/controllerUser.js
const service = require("../services/serviceUser");

const controller = {
  // ================= LISTAR USUÁRIOS =================
  getUsers: async (req, res) => {
    try {
      const users = await service.Getusers();
      res.status(200).json(users);
    } catch (err) {
      console.error("Erro ao buscar usuários:", err);
      res.status(500).json({ error: "Erro ao buscar usuários" });
    }
  },

  // ================= CRIAR USUÁRIO =================
  createUser: async (req, res) => {
    try {
      console.log("[createUser] body recebido:", req.body);

      const {
        matricula,
        nome,
        cpf,
        senha,
        tipo,
        data_entrada,
        id_graduacao_ativo,
        graduacoes_docencia,
        graduacoes_concluidas,
      } = req.body;

      if (!nome || !cpf || !senha || !tipo || !data_entrada) {
        return res
          .status(400)
          .json({ error: "Campos obrigatórios faltando" });
      }

      const newUser = await service.createUser({
        matricula,
        nome,
        cpf,
        senha,
        tipo,
        data_entrada,
        id_graduacao_ativo: id_graduacao_ativo ?? null,
        graduacoes_docencia: Array.isArray(graduacoes_docencia)
          ? graduacoes_docencia
          : [],
        graduacoes_concluidas: Array.isArray(graduacoes_concluidas)
          ? graduacoes_concluidas
          : [],
      });

      console.log("[createUser] usuário criado:", newUser);

      res.status(201).json(newUser);
    } catch (err) {
      console.error("Erro ao criar usuário:", err);
      res.status(500).json({ error: "Erro ao criar usuário" });
    }
  },

  // ================= LOGIN =================
  login: async (req, res) => {
    try {
      const { cpf, senha } = req.body;

      if (!cpf || !senha) {
        return res
          .status(400)
          .json({ error: "CPF e senha são obrigatórios" });
      }

      const user = await service.Getuser(cpf, senha);

      if (!user) {
        return res.status(401).json({ error: "CPF ou senha inválidos" });
      }

      return res.status(200).json({
        id_usuario: user.id_usuario,
        nome: user.nome,
        cpf: user.cpf,
        tipo: user.tipo,
        id_graduacao_ativo: user.id_graduacao_ativo ?? null,
      });
    } catch (err) {
      console.error("Erro no login:", err);
      return res.status(500).json({ error: "Erro ao realizar login" });
    }
  },

  // ================= ATUALIZAR TIPO (BITMASK) =================
  updateTipo: async (req, res) => {
    try {
      const { id } = req.params;
      const { tipo } = req.body;

      if (typeof tipo !== "number") {
        return res.status(400).json({
          error: 'Campo "tipo" é obrigatório e deve ser numérico',
        });
      }

      const result = await service.updateUserTipo(id, tipo);

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }

      return res.status(200).json({ message: "Tipo atualizado com sucesso" });
    } catch (err) {
      console.error("Erro ao atualizar tipo do usuário:", err);
      return res
        .status(500)
        .json({ error: "Erro ao atualizar tipo do usuário" });
    }
  },

  // ================= EXCLUIR USUÁRIO =================
  deleteUser: async (req, res) => {
    try {
      const { id } = req.params;
      const result = await service.deleteUser(id);

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }

      return res.status(200).json({ message: "Usuário excluído com sucesso" });
    } catch (err) {
      console.error("Erro ao excluir usuário:", err);
      return res.status(500).json({ error: "Erro ao excluir usuário" });
    }
  },

  // ================= ATUALIZAR DADOS BÁSICOS =================
  updateDados: async (req, res) => {
    try {
      const { id } = req.params;
      const { nome, senha } = req.body;

      if (!nome && !senha) {
        return res.status(400).json({
          error: "Informe ao menos nome ou senha para atualizar.",
        });
      }

      const result = await service.updateUserDados(id, {
        nome: nome ?? undefined,
        senha: senha ?? undefined,
      });

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }

      return res.status(200).json({ message: "Dados atualizados com sucesso" });
    } catch (err) {
      console.error("Erro ao atualizar dados do usuário:", err);
      return res
        .status(500)
        .json({ error: "Erro ao atualizar dados do usuário" });
    }
  },

  // ================= GRADUAÇÃO ATIVA =================
  updateGraduacaoAtiva: async (req, res) => {
    try {
      const { id } = req.params;
      const { id_graduacao_ativo } = req.body;

      console.log("[updateGraduacaoAtiva] body:", req.body);

      if (
        id_graduacao_ativo !== null &&
        id_graduacao_ativo !== undefined &&
        typeof id_graduacao_ativo !== "number"
      ) {
        return res.status(400).json({
          error:
            'Campo "id_graduacao_ativo" deve ser numérico ou null.',
        });
      }

      const result = await service.updateUserGraduacaoAtiva(
        id,
        id_graduacao_ativo ?? null
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }

      return res
        .status(200)
        .json({ message: "Graduação ativa atualizada com sucesso" });
    } catch (err) {
      console.error("Erro ao atualizar graduação ativa do usuário:", err);
      return res.status(500).json({
        error: "Erro ao atualizar graduação ativa do usuário",
      });
    }
  },

  // ================= DOCÊNCIA (tipo = 'professor') =================
  updateGraduacoesLista: async (req, res) => {
    try {
      const { id } = req.params;

      let graduacoes =
        req.body.graduacoes_docencia ??
        req.body.graduacoes ??
        req.body.cursosDocencia ??
        req.body.cursos;

      console.log("[updateGraduacoesLista] body:", req.body);

      if (!Array.isArray(graduacoes)) {
        return res.status(400).json({
          error:
            'Campo "graduacoes_docencia" deve ser um array de códigos de graduação',
        });
      }

      graduacoes = graduacoes
        .map((g) => Number(g))
        .filter((g) => !Number.isNaN(g));

      graduacoes = [...new Set(graduacoes)];

      await service.updateUserGraduacoesLista(id, graduacoes);

      return res.status(200).json({
        message: "Cursos de docência atualizados com sucesso",
      });
    } catch (err) {
      console.error("Erro ao atualizar lista de graduações (docência):", err);
      return res.status(500).json({
        error: "Erro ao atualizar lista de graduações (docência)",
      });
    }
  },

  // ================= CONCLUÍDAS (tipo = 'aluno') =================
  updateGraduacoesConcluidasLista: async (req, res) => {
    try {
      const { id } = req.params;

      let graduacoes =
        req.body.graduacoes_concluidas ??
        req.body.graduacoes ??
        req.body.cursosConcluidosAluno ??
        req.body.cursos;

      console.log(
        "[updateGraduacoesConcluidasLista] body:",
        req.body
      );

      if (!Array.isArray(graduacoes)) {
        return res.status(400).json({
          error:
            'Campo "graduacoes_concluidas" deve ser um array de códigos de graduação',
        });
      }

      graduacoes = graduacoes
        .map((g) => Number(g))
        .filter((g) => !Number.isNaN(g));

      graduacoes = [...new Set(graduacoes)];

      await service.updateUserGraduacoesConcluidasLista(id, graduacoes);

      return res.status(200).json({
        message: "Graduações concluídas atualizadas com sucesso",
      });
    } catch (err) {
      console.error("Erro ao atualizar graduações concluídas:", err);
      return res.status(500).json({
        error: "Erro ao atualizar graduações concluídas",
      });
    }
  },

  // ================= GET DOCÊNCIA =================
  getUserGraduacoes: async (req, res) => {
    try {
      const { id } = req.params;
      const graduacoes = await service.getUserGraduacoes(id);
      return res.status(200).json(graduacoes);
    } catch (err) {
      console.error("Erro ao buscar graduações do usuário:", err);
      return res.status(500).json({
        error: "Erro ao buscar graduações do usuário",
      });
    }
  },

  // ================= GET CONCLUÍDAS =================
  getUserGraduacoesConcluidas: async (req, res) => {
    try {
      const { id } = req.params;
      const graduacoes = await service.getUserGraduacoesConcluidas(id);
      return res.status(200).json(graduacoes);
    } catch (err) {
      console.error("Erro ao buscar graduações concluídas:", err);
      return res.status(500).json({
        error: "Erro ao buscar graduações concluídas",
      });
    }
  },

  // ================= ESTATÍSTICA =================
  getUsersWithMostGraduacoes: async (req, res) => {
    try {
      const users = await service.getUsersWithMostGraduacoes();
      res.status(200).json(users);
    } catch (err) {
      console.error("Erro ao buscar usuários com mais graduações:", err);
      res.status(500).json({
        error: "Erro ao buscar usuários com mais graduações",
      });
    }
  },
};

module.exports = controller;
