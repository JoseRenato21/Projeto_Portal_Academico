// src/services/serviceUser.js (ou equivalente)

const DB = require('../config/database');

//
// Função auxiliar: atualiza as graduações associadas a um usuário
// para um determinado tipo ("professor" = docência, "aluno" = concluídas).
// Primeiro apaga tudo daquele tipo, depois insere a nova lista.
//
async function updateUserGraduacoesByTipo(idUsuario, tipo, listaCodigos) {
  await DB.execute(
    "DELETE FROM usuario_graduacao WHERE id_usuario = ? AND tipo = ?",
    [idUsuario, tipo]
  );

  if (!listaCodigos || listaCodigos.length === 0) return;

  for (const codigo of listaCodigos) {
    await DB.execute(
      "INSERT INTO usuario_graduacao (id_usuario, codigo_graduacao, tipo) VALUES (?, ?, ?)",
      [idUsuario, codigo, tipo]
    );
  }
}

//
// Lista todos os usuários cadastrados, ordenados por nome.
//
async function Getusers() {
  const [rows] = await DB.execute(
    `SELECT id_usuario, matricula, nome, cpf, tipo,
            data_entrada, id_graduacao_ativo
       FROM usuario
      ORDER BY nome`
  );
  return rows;
}

//
// Cria um novo usuário e já registra:
// - graduações de docência (como professor);
// - graduações concluídas (como aluno).
//
async function createUser({
  matricula,
  nome,
  cpf,
  senha,
  tipo,
  data_entrada,
  id_graduacao_ativo,
  graduacoes_docencia = [],
  graduacoes_concluidas = [],
}) {
  const [result] = await DB.execute(
    `INSERT INTO usuario
       (matricula, nome, cpf, senha, tipo, data_entrada, id_graduacao_ativo)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      matricula || null,
      nome,
      cpf,
      senha,
      tipo,
      data_entrada,
      id_graduacao_ativo,
    ]
  );

  const id_usuario = result.insertId;

  // Vincula cursos em que o usuário atua como professor
  await updateUserGraduacoesByTipo(
    id_usuario,
    "professor",
    graduacoes_docencia
  );

  // Vincula graduações que o usuário concluiu como aluno
  await updateUserGraduacoesByTipo(
    id_usuario,
    "aluno",
    graduacoes_concluidas
  );

  const [rows] = await DB.execute(
    `SELECT id_usuario, matricula, nome, cpf, tipo,
            data_entrada, id_graduacao_ativo
       FROM usuario
      WHERE id_usuario = ?`,
    [id_usuario]
  );

  return rows[0];
}

//
// Autentica usuário por CPF e senha.
// Retorna o registro completo ou null se não encontrar.
//
async function Getuser(cpf, senha) {
  const [rows] = await DB.execute(
    `SELECT *
       FROM usuario
      WHERE cpf = ? AND senha = ?
      LIMIT 1`,
    [cpf, senha]
  );
  return rows[0] || null;
}

//
// Atualiza apenas o campo "tipo" do usuário (bitmask de perfis).
//
async function updateUserTipo(id, tipo) {
  const [result] = await DB.execute(
    `UPDATE usuario
        SET tipo = ?
      WHERE id_usuario = ?`,
    [tipo, id]
  );
  return result;
}

//
// Remove o usuário da tabela "usuario".
//
async function deleteUser(id) {
  const [result] = await DB.execute(
    `DELETE FROM usuario WHERE id_usuario = ?`,
    [id]
  );
  return result;
}

//
// Atualiza dados básicos do usuário (nome e/ou senha),
// montando dinamicamente apenas os campos enviados.
//
async function updateUserDados(id, { nome, senha }) {
  const campos = [];
  const params = [];

  if (nome !== undefined) {
    campos.push("nome = ?");
    params.push(nome);
  }
  if (senha !== undefined) {
    campos.push("senha = ?");
    params.push(senha);
  }

  if (campos.length === 0) {
    return { affectedRows: 0 };
  }

  params.push(id);

  const [result] = await DB.execute(
    `UPDATE usuario
        SET ${campos.join(", ")}
      WHERE id_usuario = ?`,
    params
  );
  return result;
}

//
// Define qual é a graduação ativa do usuário no momento.
//
async function updateUserGraduacaoAtiva(id, id_graduacao_ativo) {
  const [result] = await DB.execute(
    `UPDATE usuario
        SET id_graduacao_ativo = ?
      WHERE id_usuario = ?`,
    [id_graduacao_ativo, id]
  );
  return result;
}

//
// Atualiza a lista de graduações em que o usuário é professor.
//
async function updateUserGraduacoesLista(id, graduacoesDocencia) {
  await updateUserGraduacoesByTipo(id, "professor", graduacoesDocencia);
}

//
// Atualiza a lista de graduações que o usuário concluiu como aluno.
//
async function updateUserGraduacoesConcluidasLista(id, graduacoesConcluidas) {
  await updateUserGraduacoesByTipo(id, "aluno", graduacoesConcluidas);
}

//
// Retorna as graduações em que o usuário é professor (docência).
//
async function getUserGraduacoes(id) {
  const [rows] = await DB.execute(
    `SELECT g.codigo_graduacao, g.nome
       FROM usuario_graduacao ug
       JOIN graduacao g
         ON g.codigo_graduacao = ug.codigo_graduacao
      WHERE ug.id_usuario = ?
        AND ug.tipo = 'professor'
      ORDER BY g.nome`,
    [id]
  );
  return rows;
}

//
// Retorna as graduações que o usuário concluiu como aluno.
//
async function getUserGraduacoesConcluidas(id) {
  const [rows] = await DB.execute(
    `SELECT g.codigo_graduacao, g.nome
       FROM usuario_graduacao ug
       JOIN graduacao g
         ON g.codigo_graduacao = ug.codigo_graduacao
      WHERE ug.id_usuario = ?
        AND ug.tipo = 'aluno'
      ORDER BY g.nome`,
    [id]
  );
  return rows;
}

//
// Lista usuários ordenados por quem possui mais graduações
// (somando docência + concluídas na tabela de ligação).
//
async function getUsersWithMostGraduacoes() {
  const [rows] = await DB.execute(
    `SELECT u.id_usuario,
            u.matricula,
            u.nome,
            u.cpf,
            u.tipo,
            u.data_entrada,
            u.id_graduacao_ativo,
            COUNT(ug.codigo_graduacao) AS total_graduacoes
       FROM usuario u
  LEFT JOIN usuario_graduacao ug
         ON ug.id_usuario = u.id_usuario
   GROUP BY u.id_usuario
   ORDER BY total_graduacoes DESC, u.nome ASC`
  );
  return rows;
}

module.exports = {
  Getusers,
  createUser,
  Getuser,
  updateUserTipo,
  deleteUser,
  updateUserDados,
  updateUserGraduacaoAtiva,
  updateUserGraduacoesLista,
  updateUserGraduacoesConcluidasLista,
  getUserGraduacoes,
  getUserGraduacoesConcluidas,
  getUsersWithMostGraduacoes,
};
