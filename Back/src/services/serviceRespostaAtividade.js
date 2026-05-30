// src/services/serviceRespostaAtividade.js
const DB = require("../config/database");

/**
 * 🔹 Obter resposta de um aluno em uma atividade
 * Aqui estamos usando id_atividade = id do material (material_aula.id_material)
 */
async function obterRespostaDoAluno(id_atividade, id_aluno) {
  console.log(
    "[serviceRespostaAtividade] obterRespostaDoAluno",
    "id_atividade=",
    id_atividade,
    "id_aluno=",
    id_aluno
  );

  const [rows] = await DB.execute(
    `
    SELECT
      id_resposta,
      id_atividade,
      id_aluno,
      data_envio,
      conteudo_resposta,
      caminho_arquivo,
      atrasada
    FROM resposta_atividade
    WHERE id_atividade = ? AND id_aluno = ?
    LIMIT 1;
    `,
    [id_atividade, id_aluno]
  );

  console.log(
    "[serviceRespostaAtividade] obterRespostaDoAluno -> encontrou?",
    rows.length > 0
  );

  return rows[0] || null;
}

/**
 * 🔹 Criar ou atualizar resposta
 * Regra: 1 resposta por aluno por atividade (id_atividade + id_aluno únicos)
 */
async function criarOuAtualizarResposta({
  id_atividade,
  id_aluno,
  conteudo_resposta,
  caminho_arquivo,
}) {
  console.log(
    "[serviceRespostaAtividade] criarOuAtualizarResposta",
    "id_atividade=",
    id_atividade,
    "id_aluno=",
    id_aluno,
    "conteudo_resposta=",
    conteudo_resposta,
    "caminho_arquivo=",
    caminho_arquivo
  );

  const atrasada = 0; // se quiser, depois calculamos comparando com data_limite da atividade
  const agora = new Date();

  // Verifica se já existe resposta desse aluno pra essa atividade
  const existente = await obterRespostaDoAluno(id_atividade, id_aluno);

  if (existente) {
    console.log(
      "[serviceRespostaAtividade] já existe resposta, id_resposta=",
      existente.id_resposta,
      "-> atualizando"
    );

    await DB.execute(
      `
      UPDATE resposta_atividade
         SET conteudo_resposta = ?,
             caminho_arquivo = ?,
             data_envio = ?,
             atrasada = ?
       WHERE id_resposta = ?;
      `,
      [
        conteudo_resposta || null,
        caminho_arquivo || null,
        agora,
        atrasada,
        existente.id_resposta,
      ]
    );

    return {
      id_resposta: existente.id_resposta,
      atualizado: true,
    };
  }

  console.log(
    "[serviceRespostaAtividade] não havia resposta, inserindo nova"
  );

  const [result] = await DB.execute(
    `
    INSERT INTO resposta_atividade
      (id_atividade, id_aluno, data_envio, conteudo_resposta, caminho_arquivo, atrasada)
    VALUES (?, ?, ?, ?, ?, ?);
    `,
    [
      id_atividade,
      id_aluno,
      agora,
      conteudo_resposta || null,
      caminho_arquivo || null,
      atrasada,
    ]
  );

  console.log(
    "[serviceRespostaAtividade] nova resposta inserida, id_resposta=",
    result.insertId
  );

  return {
    id_resposta: result.insertId,
    atualizado: false,
  };
}

/**
 * 🔹 Listar respostas de todos os alunos em uma atividade
 * (para o professor ver quem respondeu)
 */
async function listarRespostasPorAtividade(id_atividade) {
  console.log(
    "[serviceRespostaAtividade] listarRespostasPorAtividade id_atividade=",
    id_atividade
  );

  const [rows] = await DB.execute(
    `
    SELECT
      r.id_resposta,
      r.id_atividade,
      r.id_aluno,
      r.data_envio,
      r.conteudo_resposta,
      r.caminho_arquivo,
      r.atrasada,
      u.nome      AS nome_aluno,
      u.matricula AS matricula_aluno
    FROM resposta_atividade r
    JOIN usuario u ON u.id_usuario = r.id_aluno
    WHERE r.id_atividade = ?
    ORDER BY r.data_envio DESC;
    `,
    [id_atividade]
  );

  console.log(
    "[serviceRespostaAtividade] listarRespostasPorAtividade -> rows.length=",
    rows.length
  );

  return rows;
}

/**
 * 🔹 Listar turmas em que o aluno está matriculado (para montar a tela de materiais)
 */
async function listarTurmasDoAluno(idAluno) {
  console.log(
    "[serviceRespostaAtividade] listarTurmasDoAluno idAluno=",
    idAluno
  );

  const [rows] = await DB.execute(
    `
    SELECT
      ac.id_aluno_curso,
      ac.id_aluno,
      ac.id_curso,
      ac.id_turma,
      ac.status AS status_matricula,

      t.nome          AS nome_turma,
      t.codigo_turma,
      t.status_inscricoes,

      c.nome          AS nome_curso,
      c.carga_horaria,

      p.id_periodo,
      p.nome          AS nome_periodo,
      p.codigo        AS codigo_periodo
    FROM aluno_curso ac
    JOIN turma   t ON ac.id_turma  = t.id_turma
    JOIN curso   c ON ac.id_curso  = c.id_curso
    JOIN periodo p ON t.id_periodo = p.id_periodo
    WHERE ac.id_aluno = ?
    ORDER BY p.nome DESC, c.nome, t.nome;
    `,
    [idAluno]
  );

  console.log(
    "[serviceRespostaAtividade] listarTurmasDoAluno -> rows.length=",
    rows.length
  );

  return rows;
}

module.exports = {
  listarTurmasDoAluno,
  obterRespostaDoAluno,
  criarOuAtualizarResposta,
  listarRespostasPorAtividade,
};
