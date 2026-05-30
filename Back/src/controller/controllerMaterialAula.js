const service = require("../services/serviceMaterialAula");

const controller = {
  getByTurma: async (req, res) => {
    try {
      const { id_turma } = req.params;
      const materiais = await service.getByTurma(id_turma);
      return res.status(200).json(materiais);
    } catch (err) {
      console.error("Erro ao buscar materiais da turma:", err);
      return res
        .status(500)
        .json({ error: "Erro ao buscar materiais da turma" });
    }
  },

  createForTurma: async (req, res) => {
    try {
      const { id_turma } = req.params;
      const { titulo, descricao, link } = req.body; // pode continuar vindo, só não usamos link no BD

      const result = await service.createForTurma(id_turma, {
        titulo,
        descricao,
        link,
      });

      return res.status(201).json({
        message: "Material criado com sucesso",
        id_material: result.insertId,
      });
    } catch (err) {
      console.error("Erro ao criar material da turma:", err);
      return res
        .status(500)
        .json({ error: "Erro ao criar material da turma" });
    }
  },
};

module.exports = controller;
