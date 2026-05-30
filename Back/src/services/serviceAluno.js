// src/services/serviceAluno.js
const DB = require('../config/database');

/**
 * Lista turmas disponíveis para o aluno se inscrever.
 *
 * Regras:
 * - Turma ativa
 * - Inscrições abertas
 * - Aluno NÃO tem essa graduação em usuario_graduacao
 *   (nem como docência, nem como concluída)
 * - Aluno NÃO tem inscrição pendente/aprovada nessa turma
 * - Adiciona campo `categoria`:
 *     - 'principal' se graduação da turma == id_graduacao_ativo do aluno
 *     - 'optativa' caso contrário
 */
const getTurmasDisponiveis = async (idAluno) => {
  const [rows] = await DB.execute(
    `
    SELECT 
      t.id_turma,
      t.nome            AS nome_turma,
      t.codigo_turma,
      t.vagas_regulares,
      t.vagas_extras,
      t.status_inscricoes,

      c.id_curso,
      c.nome            AS nome_curso,

      p.id_periodo,
      p.nome            AS nome_periodo,
      p.codigo          AS codigo_periodo,

      g.codigo_graduacao,
      g.nome            AS nome_graduacao,

      prof.nome         AS nome_professor,
      prof.matricula    AS matricula_professor,

      u.id_graduacao_ativo,

      CASE
        WHEN g.codigo_graduacao = u.id_graduacao_ativo
          THEN 'principal'
        ELSE 'optativa'
      END AS categoria

    FROM turma t
    JOIN curso     c    ON c.id_curso         = t.id_curso
    JOIN periodo   p    ON p.id_periodo       = t.id_periodo
    JOIN graduacao g    ON g.codigo_graduacao = c.codigo_graduacao
    JOIN usuario   prof ON prof.id_usuario    = t.id_professor

    -- aluno logado
    JOIN usuario   u    ON u.id_usuario       = ?

    -- graduacoes que o aluno já marcou (docência ou concluída)
    LEFT JOIN usuario_graduacao ug
           ON ug.id_usuario       = u.id_usuario
          AND ug.codigo_graduacao = g.codigo_graduacao

    WHERE 
      t.ativo = 1
      AND t.status_inscricoes = 'aberta'

      -- NÃO mostrar turmas cuja graduação o aluno já marcou
      AND ug.codigo_graduacao IS NULL

      -- NÃO mostrar turmas onde ele já tem inscrição pendente ou aprovada
      AND NOT EXISTS (
        SELECT 1 
        FROM inscricao_turma it
        WHERE it.id_turma = t.id_turma
          AND it.id_aluno = u.id_usuario
          AND it.status IN ('pendente', 'aprovado')
      )

    ORDER BY 
      categoria ASC,    -- primeiro as do curso ativo
      c.nome ASC,
      t.nome ASC;
    `,
    [idAluno]
  );

  return rows;
};

const getInscricoesAluno = async (idAluno) => {
  const [rows] = await DB.execute(
    `
    SELECT 
        it.id_inscricao,
        it.data_inscricao,
        it.status,                 -- pendente / aprovado / rejeitado
        it.tentativas_anteriores,

        t.id_turma,
        t.nome           AS nome_turma,
        t.codigo_turma,
        t.status_inscricoes,       -- aberta / fechada

        c.id_curso,
        c.nome           AS nome_curso,

        p.nome           AS nome_periodo,

        -- Notas (podem ser NULL)
        ac.p1,
        ac.p2,
        ac.media_final,
        ac.pf,
        ac.status        AS status_curso,      -- cursando / concluido / incompleto
        ac.tentativas    AS tentativas_matricula

    FROM inscricao_turma it
    JOIN turma   t ON t.id_turma   = it.id_turma
    JOIN curso   c ON c.id_curso   = t.id_curso
    JOIN periodo p ON p.id_periodo = t.id_periodo

    LEFT JOIN aluno_curso ac
           ON ac.id_aluno = it.id_aluno
          AND ac.id_turma = it.id_turma

    WHERE it.id_aluno = ?
    ORDER BY it.data_inscricao DESC;
    `,
    [idAluno]
  );

  return rows;
};

module.exports = {
  getTurmasDisponiveis,
  getInscricoesAluno,
};
