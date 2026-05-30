const service = require("../services/serviceAlunoCurso");

const controller = {
  getByTurma: async (req, res) => {
    try {
      const { id_turma } = req.params;
      const alunos = await service.getByTurma(id_turma);
      return res.status(200).json(alunos);
    } catch (err) {
      console.error("Erro ao buscar alunos da turma:", err);
      return res
        .status(500)
        .json({ error: "Erro ao buscar alunos da turma" });
    }
  },

  updateNotas: async (req, res) => {
    try {
      const { id_aluno_curso } = req.params;
      const { p1, p2, pf } = req.body;

      const result = await service.updateNotas(id_aluno_curso, {
        p1,
        p2,
        pf,
      });

      if (result.affectedRows === 0) {
        return res
          .status(404)
          .json({ error: "Registro aluno_curso não encontrado" });
      }

      return res.status(200).json({ message: "Notas atualizadas com sucesso" });
    } catch (err) {
      console.error("Erro ao atualizar notas:", err);
      return res.status(500).json({ error: "Erro ao atualizar notas" });
    }
  },
};

module.exports = controller;
