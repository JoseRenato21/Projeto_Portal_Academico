const DB = require("../config/database");

// LISTAR materiais da turma
async function getByTurma(id_turma) {
  const [rows] = await DB.execute(
    `
    SELECT
      *
    FROM material_aula
    WHERE id_turma = ?
    ORDER BY id_material DESC;
    `,
    [id_turma]
  );
  return rows;
}

// CRIAR material para turma
async function createForTurma(id_turma, { titulo, descricao /*, link*/ }) {
  const [result] = await DB.execute(
    `
    INSERT INTO material_aula (id_turma, titulo, descricao)
    VALUES (?, ?, ?);
    `,
    [id_turma, titulo, descricao]
  );
  return result;
}

module.exports = {
  // se já tinha outros exports, mantém e só adiciona estes:
  getByTurma,
  createForTurma,
};
