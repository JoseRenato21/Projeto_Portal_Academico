# Referência da API

Base: `http://localhost:3001`. Todas as respostas são JSON. Erros devolvem `{ "error": "mensagem" }` com o código HTTP correspondente.

## Usuários (`/user`)

| Método | Caminho | Descrição |
|--------|---------|-----------|
| POST | `/user/login` | Autentica por `cpf` e `senha`. Devolve `id_usuario`, `nome`, `cpf`, `tipo`, `id_graduacao_ativo` |
| GET | `/user` | Lista os usuários |
| POST | `/user` | Cria um usuário, com graduações de docência e concluídas |
| PUT | `/user/:id` | Atualiza nome e senha |
| PUT | `/user/:id/tipo` | Atualiza a máscara de perfis |
| PUT | `/user/:id/graduacao-ativa` | Define a graduação ativa do aluno |
| PUT | `/user/:id/graduacoes` | Substitui a lista de graduações |
| GET | `/user/:id/graduacoes` | Lista as graduações do usuário |
| GET | `/user/stats/most-graduacoes` | Usuários com mais graduações |
| DELETE | `/user/:id` | Remove o usuário |

## Aluno (`/aluno`)

| Método | Caminho | Descrição |
|--------|---------|-----------|
| GET | `/aluno/:id/turmas-disponiveis` | Turmas abertas em que o aluno pode se inscrever, marcadas como `principal` ou `optativa` |
| GET | `/aluno/:id/inscricoes` | Inscrições com notas e situação |

## Inscrições (`/inscricoes`)

| Método | Caminho | Descrição |
|--------|---------|-----------|
| POST | `/inscricoes` | Cria uma inscrição (`id_aluno`, `id_turma`). As regras são validadas no banco |
| GET | `/inscricoes/aluno/:idAluno` | Inscrições de um aluno |
| GET | `/inscricoes/turma/:idTurma/pendentes` | Pendentes de uma turma |
| POST | `/inscricoes/:idInscricao/aprovar` | Aprova |
| POST | `/inscricoes/:idInscricao/rejeitar` | Rejeita |

## Cursos, períodos e graduações

| Método | Caminho | Descrição |
|--------|---------|-----------|
| GET, POST | `/curso` | Lista e cria cursos |
| PUT, DELETE | `/curso/:id` | Atualiza e remove |
| GET | `/curso/por-graduacao/:codigo_graduacao` | Cursos de uma graduação |
| GET, POST | `/periodo` | Lista e cria períodos |
| PUT, DELETE | `/periodo/:id` | Atualiza e remove |
| GET | `/graduacao` | Lista as graduações |

## Turmas (`/turma`)

| Método | Caminho | Descrição |
|--------|---------|-----------|
| GET, POST | `/turma` | Lista e cria turmas |
| PUT, DELETE | `/turma/:id` | Atualiza e remove |
| GET | `/turma/professor/:id_professor` | Turmas de um professor |
| GET | `/turma/:id/fila` | Fila de inscrições da turma |
| POST | `/turma/:id/fechar-inscricoes` | Fecha as inscrições e processa a fila |
| GET | `/turma/graduacao/:id_graduacao/professores` | Professores habilitados para a graduação |

## Notas (`/aluno_curso`)

| Método | Caminho | Descrição |
|--------|---------|-----------|
| GET | `/aluno_curso/turma/:id_turma` | Alunos da turma com suas notas |
| PUT | `/aluno_curso/:id_aluno_curso/notas` | Lança `p1`, `p2` e `pf`. A média é calculada pelo banco |

## Materiais e atividades

| Método | Caminho | Descrição |
|--------|---------|-----------|
| GET, POST | `/material_aula/turma/:id_turma` | Lista e publica materiais de uma turma |
| POST | `/resposta_atividade` | Cria ou atualiza a resposta de um aluno |
| GET | `/resposta_atividade/atividade/:id_atividade` | Respostas de uma atividade |
| GET | `/resposta_atividade/atividade/:id_atividade/aluno/:id_aluno` | Resposta de um aluno |
| GET | `/resposta_atividade/aluno/:idAluno/turmas` | Turmas com atividades de um aluno |

## Histórico e relatórios (`/historico_aluno`)

| Método | Caminho | Descrição |
|--------|---------|-----------|
| GET | `/historico_aluno/aluno/:id_aluno` | Histórico acadêmico de um aluno |
| GET | `/historico_aluno/:codigo_graduacao/alunos` | Alunos por graduação |

Os demais relatórios (médias por turma, alunos abaixo da média, professores com mais turmas e turmas mais concorridas) estão definidos em `Back/src/routes/routeHistoricoAluno.js`.
