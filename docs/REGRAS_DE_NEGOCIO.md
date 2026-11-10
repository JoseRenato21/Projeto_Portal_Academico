# Regras de negócio no banco

As regras abaixo estão implementadas como triggers em `database/schema.sql`. Elas valem para qualquer cliente que escreva no banco, não apenas para esta aplicação.

## Inscrição em turma (`chk_inscricao_turma`)

Executa antes de cada `INSERT` em `inscricao_turma` e recusa a inscrição quando:

1. O usuário não é aluno (`tipo` deve incluir o bit 1).
2. A turma não existe.
3. O usuário é o professor da própria turma.
4. As inscrições da turma estão fechadas.
5. A graduação do aluno não é a graduação do período da turma.
6. O aluno já está matriculado em outra turma do mesmo curso no mesmo período.
7. O aluno já tem uma inscrição ativa no mesmo curso e período.

Quando passa nas validações, o trigger também:

- preenche a data da inscrição;
- calcula `tentativas_anteriores`: o maior número de tentativas do aluno naquele curso em matrículas que ficaram incompletas;
- calcula a posição na fila, que prioriza quem tem mais tentativas anteriores e, em caso de empate, quem se inscreveu primeiro;
- define o status inicial pela posição: `aprovado` dentro das vagas regulares, `pendente` dentro das vagas extras e `rejeitado` depois disso.

## Processamento das inscrições (`trg_processa_inscricoes_turma`)

Dispara quando `status_inscricoes` da turma passa de `aberta` para `fechada`. Reordena todas as inscrições da turma pelo mesmo critério da fila (mais tentativas anteriores primeiro, depois data de inscrição), reaplica o status por posição (`aprovado`, `pendente` ou `rejeitado`) e cria em `aluno_curso` a matrícula, com status `cursando`, de cada aluno aprovado.

## Média final (`trg_ac_calcula_media`)

Executa antes de cada `UPDATE` em `aluno_curso`:

| Situação | Média final |
|----------|-------------|
| Sem P1 ou sem P2 | Nula |
| (P1 + P2) / 2 maior ou igual a 7 | A própria média de P1 e P2 |
| Média abaixo de 7 e com prova final | (média de P1 e P2 + PF) / 2 |
| Média abaixo de 7 e sem prova final | Nula, aguardando a PF |

## Encerramento da turma (`trg_turma_encerrar`)

Dispara quando uma turma passa de ativa para inativa. Para cada aluno da turma:

- calcula a situação final (aprovado ou reprovado) a partir das notas;
- grava a linha correspondente em `historico_aluno`, com curso, período, turma, média e data;
- atualiza `aluno_curso` para `concluido` ou `incompleto`.

## Períodos (`trg_periodo_desativa`)

Ao desativar um período, todas as turmas dele são desativadas, o que aciona `trg_turma_encerrar` para cada uma, e os cursos dessas turmas também são marcados como inativos.

## Respostas de atividades (`chk_resposta_atividade`)

Antes de salvar uma resposta, confirma que a atividade existe e que o aluno está matriculado na turma dela. Respostas enviadas depois do prazo ficam marcadas como atrasadas.
