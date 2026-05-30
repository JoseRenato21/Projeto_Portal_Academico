const DB = require("../config/database");

async function getByTurma(id_turma) {
  const [rows] = await DB.execute(
    `
    SELECT
      ac.id_aluno_curso,
      ac.id_aluno,
      ac.id_turma,
      u.nome        AS nome_aluno,
      ac.p1,
      ac.p2,
      ac.pf,
      ac.media_final,
      ac.status     AS situacao   -- <<< AQUI o alias
    FROM aluno_curso ac
    JOIN usuario u ON u.id_usuario = ac.id_aluno
    WHERE ac.id_turma = ?;
    `,
    [id_turma]
  );
  return rows;
}



// ATUALIZAR notas de um aluno em uma turma
async function updateNotas(id_aluno_curso, { p1, p2, pf }) {
  const [result] = await DB.execute(
    `
    UPDATE aluno_curso
       SET p1 = ?, 
           p2 = ?, 
           pf = ?
     WHERE id_aluno_curso = ?;
    `,
    [p1, p2, pf, id_aluno_curso]
  );
  return result;
}

module.exports = {
  getByTurma,
  updateNotas,
  // se tiver mais funções antigas, mantém aqui também
};
