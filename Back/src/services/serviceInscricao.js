// src/services/serviceInscricao.js
const DB = require("../config/database");

/* ============================================================
   LISTAR INSCRIÇÕES DO ALUNO COM GRADUAÇÃO DO PERÍODO
   ============================================================ */
const listarInscricoesAluno = async (idAluno) => {
  try {
    const [inscricoes] = await DB.execute(
      `
      SELECT 
        ac.id_aluno_curso,
        ac.id_turma,
        ac.id_aluno,
        ac.id_curso,
        ac.status,
        ac.tentativas,
        ac.p1,
        ac.p2,
        ac.pf,
        ac.media_final,
        c.nome AS nome_curso,
        c.carga_horaria,
        t.nome AS nome_turma,
        t.codigo_turma,
        t.status_inscricoes AS status_inscricoes,
        p.nome AS nome_periodo,
        p.codigo AS codigo_periodo,
        u.nome AS nome_professor,
        u.matricula AS matricula_professor,
        g.nome AS nome_graduacao,
        g.codigo_graduacao
      FROM aluno_curso ac
      JOIN turma t   ON ac.id_turma  = t.id_turma
      JOIN curso c   ON ac.id_curso  = c.id_curso
      JOIN periodo p ON t.id_periodo = p.id_periodo
      JOIN usuario u ON t.id_professor = u.id_usuario
      JOIN graduacao g ON g.codigo_graduacao = p.codigo_graduacao
      WHERE ac.id_aluno = ?
      ORDER BY p.nome DESC, c.nome
      `,
      [idAluno]
    );

    return inscricoes.map((item) => ({
      ...item,
      status_curso: item.status,
      tentativas_matricula: item.tentativas,
    }));
  } catch (err) {
    console.error("Erro ao listar inscrições do aluno:", err);
    throw new Error("Erro ao buscar inscrições do aluno.");
  }
};

/* ============================================================
   CRIAR INSCRIÇÃO (fluxo do aluno)
   Regra extra: não pode se inscrever em turma cuja graduação
   o aluno já marcou em usuario_graduacao (professor ou aluno)
   ============================================================ */
const createInscricao = async (idAluno, idTurma) => {
  try {
    console.log("[serviceInscricao] createInscricao", { idAluno, idTurma });

    // 1) Descobrir a graduação da turma e se ela está bloqueada para o aluno
    const [[info]] = await DB.execute(
      `
      SELECT
        g.codigo_graduacao,
        u.id_graduacao_ativo,
        ug.codigo_graduacao AS codigo_bloqueado
      FROM turma t
      JOIN curso c       ON c.id_curso = t.id_curso
      JOIN graduacao g   ON g.codigo_graduacao = c.codigo_graduacao
      JOIN usuario u     ON u.id_usuario = ?
      LEFT JOIN usuario_graduacao ug
             ON ug.id_usuario       = u.id_usuario
            AND ug.codigo_graduacao = g.codigo_graduacao
      WHERE t.id_turma = ?
      LIMIT 1;
      `,
      [idAluno, idTurma]
    );

    if (!info) {
      throw new Error("Turma não encontrada.");
    }

    // Se existe qualquer linha em usuario_graduacao com essa graduação,
    // significa que ele já concluiu OU dá aula nessa graduação.
    if (info.codigo_bloqueado != null) {
      throw new Error(
        "Você não pode se inscrever em turmas dessa graduação (já concluída ou de docência)."
      );
    }

    // 2) Verificar se já existe inscrição para essa turma
    const [[jaTemInscricao]] = await DB.execute(
      `
      SELECT id_inscricao, status
      FROM inscricao_turma
      WHERE id_aluno = ? AND id_turma = ?
      LIMIT 1;
      `,
      [idAluno, idTurma]
    );

    if (jaTemInscricao) {
      // 🔁 Torna a operação idempotente:
      // em vez de lançar erro, devolve a inscrição existente.
      console.log(
        "[serviceInscricao] inscrição já existia:",
        jaTemInscricao
      );
      return {
        id_inscricao: jaTemInscricao.id_inscricao,
        jaExistia: true,
        status: jaTemInscricao.status,
      };
    }

    // 3) Agora sim insere uma nova inscrição
    const [result] = await DB.execute(
      `
      INSERT INTO inscricao_turma (id_aluno, id_turma)
      VALUES (?, ?);
      `,
      [idAluno, idTurma]
    );

    return {
      id_inscricao: result.insertId,
      jaExistia: false,
      status: "pendente",
    };
  } catch (err) {
    // Se vier de um SIGNAL SQLSTATE '45000' de trigger
    if (err && err.sqlState === "45000") {
      throw new Error(err.message || "Regra de negócio violada.");
    }

    // Se deu erro de UNIQUE KEY (duplicado), também trata como "já existia"
    if (err && err.code === "ER_DUP_ENTRY") {
      console.warn(
        "[serviceInscricao] ER_DUP_ENTRY - tratando como jaExistia"
      );
      return {
        id_inscricao: null,
        jaExistia: true,
      };
    }

    console.error("Erro em createInscricao:", err);
    throw new Error(err.message || "Erro ao criar inscrição.");
  }
};

/* ============================================================
   (Opcional) Listar pendentes
   ============================================================ */
const listarPendentesDaTurma = async (idTurma) => {
  try {
    const [rows] = await DB.execute(
      `
      SELECT 
        it.id_inscricao,
        it.id_aluno,
        u.nome AS nome_aluno,
        it.data_inscricao,
        it.tentativas_anteriores,
        t.nome AS nome_turma,
        t.status_inscricoes,
        it.status
      FROM inscricao_turma it
      JOIN usuario u ON u.id_usuario = it.id_aluno
      JOIN turma   t ON t.id_turma   = it.id_turma
      WHERE it.id_turma = ?
      ORDER BY it.tentativas_anteriores DESC, it.data_inscricao ASC;
      `,
      [idTurma]
    );

    return rows;
  } catch (err) {
    console.error("Erro ao listar pendentes:", err);
    throw new Error("Erro ao buscar alunos pendentes.");
  }
};

/* ============================================================
   APROVAR INSCRIÇÃO (professor aceita pendente)
   ============================================================ */
const aprovarInscricao = async (idInscricao) => {
  try {
    const [[row]] = await DB.execute(
      `
      SELECT 
        it.id_inscricao,
        it.id_aluno,
        it.id_turma,
        it.status,
        t.id_curso
      FROM inscricao_turma it
      JOIN turma t ON t.id_turma = it.id_turma
      WHERE it.id_inscricao = ?;
      `,
      [idInscricao]
    );

    if (!row) {
      throw new Error("Inscrição não encontrada.");
    }

    const { id_aluno, id_turma, id_curso } = row;

    await DB.execute(
      `
      UPDATE inscricao_turma
         SET status = 'aprovado'
       WHERE id_inscricao = ?;
      `,
      [idInscricao]
    );

    const [[jaExiste]] = await DB.execute(
      `
      SELECT 
        id_aluno_curso,
        tentativas,
        status
      FROM aluno_curso
      WHERE id_aluno = ?
        AND id_curso = ?
      LIMIT 1;
      `,
      [id_aluno, id_curso]
    );

    if (!jaExiste) {
      await DB.execute(
        `
        INSERT INTO aluno_curso (id_aluno, id_curso, id_turma, status)
        VALUES (?, ?, ?, 'cursando');
        `,
        [id_aluno, id_curso, id_turma]
      );
    } else {
      await DB.execute(
        `
        UPDATE aluno_curso
           SET id_turma = ?,
               status = 'cursando'
         WHERE id_aluno_curso = ?;
        `,
        [id_turma, jaExiste.id_aluno_curso]
      );
    }

    return { sucesso: true };
  } catch (err) {
    console.error("Erro ao aprovar inscrição:", err);
    throw new Error("Erro ao aprovar inscrição.");
  }
};

/* ============================================================
   REJEITAR INSCRIÇÃO (professor nega pendente)
   ============================================================ */
const rejeitarInscricao = async (idInscricao) => {
  try {
    await DB.execute(
      `
      UPDATE inscricao_turma
         SET status = 'rejeitado'
       WHERE id_inscricao = ?;
      `,
      [idInscricao]
    );

    return { sucesso: true };
  } catch (err) {
    console.error("Erro ao rejeitar inscrição:", err);
    throw new Error("Erro ao rejeitar inscrição.");
  }
};

module.exports = {
  createInscricao,
  listarInscricoesAluno,
  listarPendentesDaTurma,
  aprovarInscricao,
  rejeitarInscricao,
};
