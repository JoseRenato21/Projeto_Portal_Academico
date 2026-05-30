// src/services/serviceHistoricoAluno.js

const DB = require("../config/database");

/**
 * 2.1 – Retorna a quantidade de alunos em cada turma de uma graduação.
 * Conta de forma diferente se a turma está aberta (aluno_curso) ou fechada (historico_aluno).
 */
async function getQuantidadeAlunosPorTurmaGraduacao(codigo_graduacao) {
  console.log(
    "[serviceHistoricoAluno] getQuantidadeAlunosPorTurmaGraduacao codigo_graduacao=",
    codigo_graduacao
  );

  const [rows] = await DB.execute(
    `
    SELECT
      t.id_turma,
      t.nome AS nome_turma,
      t.codigo_turma,
      t.status_inscricoes,
      COUNT(
        DISTINCT CASE
          WHEN t.status_inscricoes = 'aberta'  THEN ac.id_aluno
          WHEN t.status_inscricoes = 'fechada' THEN h.id_aluno
          ELSE NULL
        END
      ) AS total_alunos
    FROM turma t
    JOIN curso c
      ON c.id_curso = t.id_curso
    LEFT JOIN aluno_curso ac
      ON ac.id_turma = t.id_turma
    LEFT JOIN historico_aluno h
      ON h.id_turma = t.id_turma
    WHERE c.codigo_graduacao = ?
    GROUP BY
      t.id_turma,
      t.nome,
      t.codigo_turma,
      t.status_inscricoes
    ORDER BY
      t.nome ASC;
    `,
    [codigo_graduacao]
  );

  console.log(
    "[serviceHistoricoAluno] getQuantidadeAlunosPorTurmaGraduacao -> rows.length=",
    rows.length
  );
  return rows;
}

/**
 * 2.2 – Retorna, por turma de uma graduação:
 *       quantidade de alunos, média geral, mínima e máxima das notas.
 */
async function getMediaPorTurmaGraduacao(codigo_graduacao) {
  console.log(
    "[serviceHistoricoAluno] getMediaPorTurmaGraduacao codigo_graduacao=",
    codigo_graduacao
  );

  const [rows] = await DB.execute(
    `
    SELECT
      t.id_turma,
      t.nome AS nome_turma,
      t.codigo_turma,
      t.status_inscricoes,
      COUNT(
        DISTINCT CASE
          WHEN t.status_inscricoes = 'aberta'  THEN ac.id_aluno
          WHEN t.status_inscricoes = 'fechada' THEN h.id_aluno
          ELSE NULL
        END
      ) AS qtd_alunos,
      AVG(
        CASE
          WHEN t.status_inscricoes = 'aberta'  THEN ac.media_final
          WHEN t.status_inscricoes = 'fechada' THEN h.media_final
          ELSE NULL
        END
      ) AS media_geral,
      MIN(
        CASE
          WHEN t.status_inscricoes = 'aberta'  THEN ac.media_final
          WHEN t.status_inscricoes = 'fechada' THEN h.media_final
          ELSE NULL
        END
      ) AS media_minima,
      MAX(
        CASE
          WHEN t.status_inscricoes = 'aberta'  THEN ac.media_final
          WHEN t.status_inscricoes = 'fechada' THEN h.media_final
          ELSE NULL
        END
      ) AS media_maxima
    FROM turma t
    JOIN curso c
      ON c.id_curso = t.id_curso
    LEFT JOIN aluno_curso ac
      ON ac.id_turma = t.id_turma
    LEFT JOIN historico_aluno h
      ON h.id_turma = t.id_turma
    WHERE c.codigo_graduacao = ?
    GROUP BY
      t.id_turma,
      t.nome,
      t.codigo_turma,
      t.status_inscricoes
    ORDER BY
      media_geral DESC;
    `,
    [codigo_graduacao]
  );

  console.log(
    "[serviceHistoricoAluno] getMediaPorTurmaGraduacao -> rows.length=",
    rows.length
  );
  return rows;
}

/**
 * 2.3 – Lista alunos de uma graduação com média final < 5,
 *       considerando turma aberta (aluno_curso) ou fechada (historico_aluno).
 */
async function getAlunosAbaixoMediaGraduacao(codigo_graduacao) {
  console.log(
    "[serviceHistoricoAluno] getAlunosAbaixoMediaGraduacao codigo_graduacao=",
    codigo_graduacao
  );

  const [rows] = await DB.execute(
    `
    SELECT
      COALESCE(ac.id_aluno, h.id_aluno) AS id_aluno,
      u.nome       AS nome_aluno,
      u.matricula,
      t.id_turma,
      t.nome       AS nome_turma,
      t.codigo_turma,
      t.status_inscricoes,
      CASE
        WHEN t.status_inscricoes = 'aberta'  THEN ac.media_final
        WHEN t.status_inscricoes = 'fechada' THEN h.media_final
        ELSE NULL
      END AS media_final,
      CASE
        WHEN t.status_inscricoes = 'aberta'  THEN ac.status
        WHEN t.status_inscricoes = 'fechada' THEN h.status
        ELSE NULL
      END AS status
    FROM turma t
    JOIN curso c
      ON c.id_curso = t.id_curso
    LEFT JOIN aluno_curso ac
      ON ac.id_turma = t.id_turma
     AND t.status_inscricoes = 'aberta'
    LEFT JOIN historico_aluno h
      ON h.id_turma = t.id_turma
     AND t.status_inscricoes = 'fechada'
    JOIN usuario u
      ON u.id_usuario = COALESCE(ac.id_aluno, h.id_aluno)
    WHERE c.codigo_graduacao = ?
      AND (
        (t.status_inscricoes = 'aberta'  AND ac.media_final < 5)
        OR
        (t.status_inscricoes = 'fechada' AND h.media_final < 5)
      )
    ORDER BY media_final ASC, nome_aluno ASC;
    `,
    [codigo_graduacao]
  );

  console.log(
    "[serviceHistoricoAluno] getAlunosAbaixoMediaGraduacao -> rows.length=",
    rows.length
  );
  return rows;
}

/**
 * 2.4 – Lista as turmas ativas (abertas) de um professor,
 *       com quantidade de alunos e média de notas da turma.
 */
async function getTurmasAtivasProfessorGraduacao(codigo_graduacao, id_professor) {
  console.log(
    "[serviceHistoricoAluno] getTurmasAtivasProfessorGraduacao codigo_graduacao=",
    codigo_graduacao,
    "id_professor=",
    id_professor
  );

  const [rows] = await DB.execute(
    `
    SELECT
      t.id_turma,
      t.nome AS nome_turma,
      t.codigo_turma,
      t.vagas_regulares,
      t.vagas_extras,
      t.status_inscricoes,
      COUNT(DISTINCT ac.id_aluno) AS total_alunos,
      AVG(ac.media_final)         AS media_geral
    FROM turma t
    JOIN curso c
      ON c.id_curso = t.id_curso
    LEFT JOIN aluno_curso ac
      ON ac.id_turma = t.id_turma
    WHERE c.codigo_graduacao = ?
      AND t.id_professor = ?
      AND t.status_inscricoes = 'aberta'
    GROUP BY
      t.id_turma,
      t.nome,
      t.codigo_turma,
      t.vagas_regulares,
      t.vagas_extras,
      t.status_inscricoes
    ORDER BY t.nome ASC;
    `,
    [codigo_graduacao, id_professor]
  );

  console.log(
    "[serviceHistoricoAluno] getTurmasAtivasProfessorGraduacao -> rows.length=",
    rows.length
  );
  return rows;
}

/**
 * 2.5 – Devolve o professor da graduação com maior número de turmas ativas.
 */
async function getProfessorMaisTurmasAtivasGraduacao(codigo_graduacao) {
  console.log(
    "[serviceHistoricoAluno] getProfessorMaisTurmasAtivasGraduacao codigo_graduacao=",
    codigo_graduacao
  );

  const [rows] = await DB.execute(
    `
    SELECT
      u.id_usuario AS id_professor,
      u.nome       AS nome_professor,
      u.matricula,
      COUNT(*) AS qtd_turmas_ativas
    FROM turma t
    JOIN curso c
      ON c.id_curso = t.id_curso
    JOIN usuario u
      ON u.id_usuario = t.id_professor
    WHERE c.codigo_graduacao = ?
      AND t.status_inscricoes = 'aberta'
    GROUP BY
      u.id_usuario,
      u.nome,
      u.matricula
    ORDER BY qtd_turmas_ativas DESC
    LIMIT 1;
    `,
    [codigo_graduacao]
  );

  console.log(
    "[serviceHistoricoAluno] getProfessorMaisTurmasAtivasGraduacao -> rows.length=",
    rows.length
  );
  return rows[0] || null;
}

/**
 * 2.6 – Retorna o TOP 3 de turmas de uma graduação por média geral,
 *       desempate pela quantidade de alunos.
 */
async function getTop3TurmasGraduacao(codigo_graduacao) {
  console.log(
    "[serviceHistoricoAluno] getTop3TurmasGraduacao codigo_graduacao=",
    codigo_graduacao
  );

  const [rows] = await DB.execute(
    `
    SELECT
      t.id_turma,
      t.nome        AS nome_turma,
      t.codigo_turma,
      c.nome        AS nome_curso,
      t.status_inscricoes,
      COUNT(
        DISTINCT CASE
          WHEN t.status_inscricoes = 'aberta'  THEN ac.id_aluno
          WHEN t.status_inscricoes = 'fechada' THEN h.id_aluno
          ELSE NULL
        END
      ) AS total_alunos,
      AVG(
        CASE
          WHEN t.status_inscricoes = 'aberta'  THEN ac.media_final
          WHEN t.status_inscricoes = 'fechada' THEN h.media_final
          ELSE NULL
        END
      ) AS media_geral
    FROM turma t
    JOIN curso c
      ON c.id_curso = t.id_curso
    LEFT JOIN aluno_curso ac
      ON ac.id_turma = t.id_turma
    LEFT JOIN historico_aluno h
      ON h.id_turma = t.id_turma
    WHERE c.codigo_graduacao = ?
    GROUP BY
      t.id_turma,
      t.nome,
      t.codigo_turma,
      c.nome,
      t.status_inscricoes
    ORDER BY
      media_geral DESC,
      total_alunos DESC
    LIMIT 3;
    `,
    [codigo_graduacao]
  );

  console.log(
    "[serviceHistoricoAluno] getTop3TurmasGraduacao -> rows.length=",
    rows.length
  );
  return rows;
}

/**
 * Auxiliar – Lista alunos que já possuem histórico em uma determinada graduação.
 * Usado para popular o select de alunos no front.
 */
async function getAlunosPorGraduacao(codigo_graduacao) {
  console.log(
    "[serviceHistoricoAluno] getAlunosPorGraduacao codigo_graduacao=",
    codigo_graduacao
  );

  const [rows] = await DB.execute(
    `
    SELECT DISTINCT
      u.id_usuario,
      u.nome,
      u.matricula,
      u.email
    FROM usuario u
    JOIN historico_aluno h
      ON h.id_aluno = u.id_usuario
    WHERE h.id_graduacao = ?
    ORDER BY u.nome ASC;
    `,
    [codigo_graduacao]
  );

  console.log(
    "[serviceHistoricoAluno] getAlunosPorGraduacao -> rows.length=",
    rows.length
  );
  return rows;
}

/**
 * Auxiliar – Lista professores que lecionam turmas de uma graduação.
 * Usa bitmask em u.tipo para garantir que o usuário é professor.
 */
async function getProfessoresPorGraduacao(codigo_graduacao) {
  console.log(
    "[serviceHistoricoAluno] getProfessoresPorGraduacao codigo_graduacao=",
    codigo_graduacao
  );

  const [rows] = await DB.execute(
    `
    SELECT DISTINCT
      u.id_usuario,
      u.nome,
      u.matricula,
      u.email
    FROM usuario u
    JOIN turma t
      ON t.id_professor = u.id_usuario
    JOIN curso c
      ON c.id_curso = t.id_curso
    WHERE c.codigo_graduacao = ?
      AND (u.tipo & 2) != 0
    ORDER BY u.nome ASC;
    `,
    [codigo_graduacao]
  );

  console.log(
    "[serviceHistoricoAluno] getProfessoresPorGraduacao -> rows.length=",
    rows.length
  );
  return rows;
}

/**
 * Auxiliar – Retorna todo o histórico (todas as turmas) de um aluno.
 * Usado na tela de “Histórico de um Aluno”.
 */
async function getHistoricoAlunoPorAluno(id_aluno) {
  console.log(
    "[serviceHistoricoAluno] getHistoricoAlunoPorAluno id_aluno=",
    id_aluno
  );

  const [rows] = await DB.execute(
    `
    SELECT
      h.id_historico,
      u.nome       AS nome_aluno,
      u.matricula,
      c.nome       AS nome_curso,
      t.nome       AS nome_turma,
      h.media_final,
      h.status
    FROM historico_aluno h
    JOIN usuario u
      ON u.id_usuario = h.id_aluno
    JOIN curso c
      ON c.id_curso = h.id_curso
    JOIN turma t
      ON t.id_turma = h.id_turma
    WHERE h.id_aluno = ?
    ORDER BY h.data_conclusao DESC, h.id_historico DESC;
    `,
    [id_aluno]
  );

  console.log(
    "[serviceHistoricoAluno] getHistoricoAlunoPorAluno -> rows.length=",
    rows.length
  );
  return rows;
}

module.exports = {
  getQuantidadeAlunosPorTurmaGraduacao,
  getMediaPorTurmaGraduacao,
  getAlunosAbaixoMediaGraduacao,
  getTurmasAtivasProfessorGraduacao,
  getProfessorMaisTurmasAtivasGraduacao,
  getTop3TurmasGraduacao,
  getAlunosPorGraduacao,
  getProfessoresPorGraduacao,
  getHistoricoAlunoPorAluno,
};
