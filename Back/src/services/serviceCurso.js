// src/services/serviceCurso.js

const DB = require('../config/database');

async function listCursos() {
  const [rows] = await DB.execute(`
    SELECT 
      c.id_curso,
      c.nome,
      c.descricao,
      c.carga_horaria,
      c.codigo_graduacao,
      g.nome AS nome_graduacao,
      c.ativo
    FROM curso c
    LEFT JOIN graduacao g ON c.codigo_graduacao = g.codigo_graduacao
    ORDER BY c.nome
  `);
  return rows;
}

async function listCursosPorGraduacao(codigo_graduacao) {
  const [rows] = await DB.execute(`
    SELECT 
      c.id_curso,
      c.nome,
      c.descricao,
      c.carga_horaria,
      c.codigo_graduacao,
      g.nome AS nome_graduacao,
      c.ativo
    FROM curso c
    LEFT JOIN graduacao g ON c.codigo_graduacao = g.codigo_graduacao
    WHERE c.codigo_graduacao = ?
    ORDER BY c.nome
  `, [codigo_graduacao]);
  return rows;
}

async function createCurso({ nome, descricao, carga_horaria, codigo_graduacao, ativo }) {
  if (!codigo_graduacao) {
    throw new Error('Graduação é obrigatória');
  }

  const [result] = await DB.execute(`
    INSERT INTO curso (nome, descricao, carga_horaria, codigo_graduacao, ativo)
    VALUES (?, ?, ?, ?, ?)
  `, [nome, descricao || null, carga_horaria, codigo_graduacao, ativo ?? true]);

  return {
    id_curso: result.insertId,
    nome,
    descricao,
    carga_horaria,
    codigo_graduacao,
    ativo: ativo ?? true,
  };
}

async function updateCurso(id_curso, { nome, descricao, carga_horaria, codigo_graduacao, ativo }) {
  if (!codigo_graduacao) {
    throw new Error('Graduação é obrigatória');
  }

  const [result] = await DB.execute(`
    UPDATE curso
    SET nome = ?, descricao = ?, carga_horaria = ?, codigo_graduacao = ?, ativo = ?
    WHERE id_curso = ?
  `, [nome, descricao || null, carga_horaria, codigo_graduacao, ativo, id_curso]);

  return result;
}

async function deleteCurso(id_curso) {
  const [result] = await DB.execute(
    'DELETE FROM curso WHERE id_curso = ?',
    [id_curso]
  );
  return result;
}

module.exports = {
  listCursos,
  listCursosPorGraduacao,
  createCurso,
  updateCurso,
  deleteCurso,
};
