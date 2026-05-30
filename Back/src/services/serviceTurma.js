const DB = require('../config/database');

// Lista turmas com JOINs pra mostrar nomes bonitos no front
async function listTurmas() {
  const [rows] = await DB.execute(
    `
    SELECT
      t.id_turma,
      t.nome,
      t.codigo_turma,
      t.vagas_regulares,
      t.vagas_extras,
      t.ativo,
      t.status_inscricoes,
      t.id_curso,
      c.nome  AS nome_curso,
      t.id_periodo,
      p.codigo AS codigo_periodo,
      p.nome   AS nome_periodo,
      t.id_professor,
      u.nome  AS nome_professor,
      u.matricula AS matricula_professor
    FROM turma t
    JOIN curso   c ON c.id_curso   = t.id_curso
    JOIN periodo p ON p.id_periodo = t.id_periodo
    JOIN usuario u ON u.id_usuario = t.id_professor
    ORDER BY t.nome;
    `
  );
  return rows;
}

// Helpers pra resolver IDs a partir de nome/código/matrícula
async function findCursoIdByNome(nomeCurso) {
  const [rows] = await DB.execute(
    `SELECT id_curso FROM curso WHERE nome = ? LIMIT 1`,
    [nomeCurso]
  );
  return rows[0]?.id_curso || null;
}

async function findPeriodoIdByCodigoOuNome(ref) {
  const [rows] = await DB.execute(
    `SELECT id_periodo
       FROM periodo
      WHERE codigo = ? OR nome = ?
      LIMIT 1`,
    [ref, ref]
  );
  return rows[0]?.id_periodo || null;
}

async function findProfessorIdByRef(ref) {
  // se for só dígitos -> matrícula
  if (/^\d+$/.test(ref)) {
    const [rows] = await DB.execute(
      `SELECT id_usuario
         FROM usuario
        WHERE matricula = ?
          AND (tipo & 2) != 0
        LIMIT 1`,
      [ref]
    );
    return rows[0]?.id_usuario || null;
  }

  // senão, trata como nome exato
  const [rows] = await DB.execute(
    `SELECT id_usuario
       FROM usuario
      WHERE nome = ?
        AND (tipo & 2) != 0
      LIMIT 1`,
    [ref]
  );
  return rows[0]?.id_usuario || null;
}

async function createTurma({
  id_periodo,
  id_curso,
  id_professor,
  nome,
  codigo_turma,
  vagas_regulares,
  vagas_extras,
  ativo,
  status_inscricoes,
}) {
  const [result] = await DB.execute(
    `
    INSERT INTO turma (
      id_periodo,
      id_curso,
      id_professor,
      nome,
      codigo_turma,
      vagas_regulares,
      vagas_extras,
      ativo,
      status_inscricoes
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      id_periodo,
      id_curso,
      id_professor,
      nome,
      codigo_turma,
      vagas_regulares ?? 30,
      vagas_extras ?? 10,
      ativo ?? true,
      status_inscricoes || 'aberta',
    ]
  );

  return {
    id_turma: result.insertId,
    id_periodo,
    id_curso,
    id_professor,
    nome,
    codigo_turma,
    vagas_regulares: vagas_regulares ?? 30,
    vagas_extras: vagas_extras ?? 10,
    ativo: ativo ?? true,
    status_inscricoes: status_inscricoes || 'aberta',
  };
}

async function updateTurma(
  id_turma,
  {
    id_periodo,
    id_curso,
    id_professor,
    nome,
    codigo_turma,
    vagas_regulares,
    vagas_extras,
    ativo,
    status_inscricoes,
  }
) {
  const [result] = await DB.execute(
    `
    UPDATE turma
       SET id_periodo       = ?,
           id_curso         = ?,
           id_professor     = ?,
           nome             = ?,
           codigo_turma     = ?,
           vagas_regulares  = ?,
           vagas_extras     = ?,
           ativo            = ?,
           status_inscricoes= ?
     WHERE id_turma         = ?
    `,
    [
      id_periodo,
      id_curso,
      id_professor,
      nome,
      codigo_turma,
      vagas_regulares,
      vagas_extras,
      ativo,
      status_inscricoes,
      id_turma,
    ]
  );
  return result;
}

async function deleteTurma(id_turma) {
  const [result] = await DB.execute(
    `DELETE FROM turma WHERE id_turma = ?`,
    [id_turma]
  );
  return result;
}

async function fecharInscricoes(id_turma) {
  const [result] = await DB.execute(
    `
    UPDATE turma
       SET status_inscricoes = 'fechada'
     WHERE id_turma = ?
       AND status_inscricoes = 'aberta'
    `, 
    [id_turma]
  );

  if (result.affectedRows === 0) {
    throw new Error('Turma inexistente ou já está com inscrições fechadas.');
  }

  return result;
}

async function getFilaTurma(id_turma) {
  const [rows] = await DB.execute(
    `
    SELECT
        it.id_inscricao,
        it.id_aluno,
        u.nome                AS nome_aluno,
        it.tentativas_anteriores,
        it.data_inscricao,
        it.status,
        ROW_NUMBER() OVER (
            PARTITION BY it.id_turma
            ORDER BY it.tentativas_anteriores DESC,
                     it.data_inscricao ASC
        ) AS posicao
    FROM inscricao_turma it
    JOIN usuario u ON u.id_usuario = it.id_aluno
    WHERE it.id_turma = ?
    ORDER BY posicao;
    `,
    [id_turma]
  );

  return rows;
}

async function listTurmasByProfessor(id_professor) {
  const [rows] = await DB.execute(
    `
    SELECT
      t.id_turma,
      t.nome,
      t.codigo_turma,
      t.vagas_regulares,
      t.vagas_extras,
      t.ativo,
      t.status_inscricoes,
      t.id_curso,
      c.nome  AS nome_curso,
      t.id_periodo,
      p.codigo AS codigo_periodo,
      p.nome   AS nome_periodo,
      t.id_professor,
      u.nome  AS nome_professor,
      u.matricula AS matricula_professor
    FROM turma t
    JOIN curso   c ON c.id_curso   = t.id_curso
    JOIN periodo p ON p.id_periodo = t.id_periodo
    JOIN usuario u ON u.id_usuario = t.id_professor
    WHERE t.id_professor = ?
    ORDER BY t.nome;
    `,
    [id_professor]
  );
  return rows;
}

async function getProfessoresByGraduacao(id_graduacao) {
  const [rows] = await DB.execute(
    `
    SELECT DISTINCT
      u.id_usuario,
      u.nome,
      u.matricula
    FROM usuario u
    WHERE (u.tipo & 2) != 0
      AND u.id_usuario IN (
        SELECT DISTINCT id_usuario 
        FROM usuario_graduacao 
        WHERE codigo_graduacao = ?
      )
    ORDER BY u.nome
    `,
    [id_graduacao]
  );
  
  return rows;
}

module.exports = {
  listTurmas,
  listTurmasByProfessor,    
  findCursoIdByNome,
  findPeriodoIdByCodigoOuNome,
  findProfessorIdByRef,
  createTurma,
  updateTurma,
  deleteTurma,
  fecharInscricoes,
  getFilaTurma,
  getProfessoresByGraduacao,
};
