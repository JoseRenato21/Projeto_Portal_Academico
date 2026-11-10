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
- calcula `tentativas_anteriores`, contando reprovações anteriores no curso;
- define a posição na fila e o status inicial conforme as vagas regulares e extras.

## Processamento das inscrições (`trg_processa_inscricoes_turma`)

Ao fechar as inscrições de uma turma, decide quais inscrições pendentes são aprovadas e quais são rejeitadas, de acordo com as vagas disponíveis e a ordem da fila. Alunos aprovados passam a ter um registro em `aluno_curso`.

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

Ao desativar um período, as turmas dele são encerradas, o que aciona `trg_turma_encerrar` para cada uma.

## Respostas de atividades (`chk_resposta_atividade`)

Antes de salvar uma resposta, confirma que a atividade existe e que o aluno está matriculado na turma dela. Respostas enviadas depois do prazo ficam marcadas como atrasadas.
