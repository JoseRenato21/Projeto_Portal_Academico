-- Dados de demonstração (nomes e CPFs fictícios). Senha de todos: 123456
USE gestorDeCursos;

INSERT INTO graduacao (codigo_graduacao, nome) VALUES
 (1, 'Engenharia de Computação'),
 (2, 'Sistemas de Informação');

-- tipo é uma máscara de bits: 1 = aluno, 2 = professor, 4 = administrador
INSERT INTO usuario (matricula, nome, cpf, senha, tipo, id_graduacao_ativo, data_entrada) VALUES
 ('ADM001', 'Marina Duarte',    '11111111111', '123456', 4, NULL, '2020-02-03'),
 ('PRF001', 'Carlos Menezes',   '22222222222', '123456', 2, NULL, '2018-08-01'),
 ('PRF002', 'Helena Nogueira',  '33333333333', '123456', 2, NULL, '2019-02-11'),
 ('ALU001', 'Lucas Andrade',    '44444444444', '123456', 1, 1,    '2024-02-05'),
 ('ALU002', 'Beatriz Ferraz',   '55555555555', '123456', 1, 1,    '2024-02-05'),
 ('ALU003', 'Rafael Tavares',   '66666666666', '123456', 1, 2,    '2025-02-03'),
 ('ALU004', 'Júlia Campos',     '77777777777', '123456', 3, 1,    '2023-08-07');

INSERT INTO usuario_graduacao (id_usuario, codigo_graduacao, tipo) VALUES
 (2, 1, 'professor'), (3, 1, 'professor'), (3, 2, 'professor');

INSERT INTO curso (nome, descricao, carga_horaria, codigo_graduacao) VALUES
 ('Algoritmos e Estruturas de Dados', 'Listas, pilhas, árvores, grafos e análise de complexidade.', 90, 1),
 ('Banco de Dados',                   'Modelagem relacional, SQL, procedures e triggers.',           60, 1),
 ('Redes de Computadores',            'Modelo OSI, TCP/IP, roteamento e serviços de rede.',          60, 1),
 ('Engenharia de Software',           'Processos, requisitos, arquitetura e testes.',                60, 2);

INSERT INTO periodo (codigo, nome, codigo_graduacao, data_inicio, data_fim) VALUES
 ('2026.1', 'Primeiro período de 2026 - Computação', 1, '2026-02-02', '2026-07-03'),
 ('2026.2', 'Segundo período de 2026 - Computação',  1, '2026-08-03', '2026-12-18'),
 ('2026.S', 'Período de 2026 - Sistemas',            2, '2026-08-03', '2026-12-18');

INSERT INTO turma (id_periodo, id_curso, id_professor, nome, codigo_turma, vagas_regulares, vagas_extras, periodo_letivo, status_inscricoes) VALUES
 (2, 1, 2, 'Algoritmos - Turma A', 'ALG-A', 30, 5, '2026.2', 'aberta'),
 (2, 2, 3, 'Banco de Dados - Turma A', 'BD-A', 30, 5, '2026.2', 'aberta'),
 (2, 3, 2, 'Redes - Turma A', 'RED-A', 25, 5, '2026.2', 'aberta'),
 (3, 4, 3, 'Engenharia de Software - Turma A', 'ES-A', 30, 5, '2026.S', 'aberta');

INSERT INTO inscricao_turma (id_aluno, id_turma, status) VALUES
 (4, 1, 'aprovado'), (4, 2, 'pendente'), (5, 1, 'aprovado'), (5, 3, 'pendente'), (7, 3, 'aprovado');

INSERT INTO aluno_curso (id_aluno, id_curso, id_turma, status) VALUES
 (4, 1, 1, 'cursando'), (5, 1, 1, 'cursando'), (7, 3, 3, 'cursando');
UPDATE aluno_curso SET p1 = 8.5, p2 = 7.0 WHERE id_aluno = 4 AND id_turma = 1;
UPDATE aluno_curso SET p1 = 5.0, p2 = 6.0 WHERE id_aluno = 5 AND id_turma = 1;
UPDATE aluno_curso SET p1 = 9.0, p2 = 9.5 WHERE id_aluno = 7 AND id_turma = 3;

INSERT INTO historico_aluno (id_aluno, id_curso, id_turma, nome_curso, codigo_periodo, nome_turma, media_final, status, data_status) VALUES
 (4, 4, 4, 'Engenharia de Software', '2025.2', 'Engenharia de Software - Turma 2025', 8.20, 'Aprovado', '2025-12-19'),
 (5, 2, 2, 'Banco de Dados', '2025.2', 'Banco de Dados - Turma 2025', 4.80, 'Reprovado', '2025-12-19');

INSERT INTO material_aula (id_turma, titulo, descricao, tipo, caminho_arquivo) VALUES
 (1, 'Apostila 1 - Complexidade', 'Notação assintótica e exemplos resolvidos.', 'apostila', 'https://exemplo.edu/alg/apostila1.pdf'),
 (1, 'Slides - Árvores binárias', 'Aula 5, com exercícios no fim.', 'slide', 'https://exemplo.edu/alg/arvores.pdf'),
 (1, 'Vídeo - Quicksort passo a passo', 'Demonstração animada do particionamento.', 'video', 'https://exemplo.edu/alg/quicksort'),
 (3, 'Roteiro de laboratório - OSPF', 'Topologia e comandos para o laboratório 3.', 'apostila', 'https://exemplo.edu/redes/ospf.pdf');

INSERT INTO atividade_avaliativa (id_turma, titulo, descricao, tipo, data_limite, valor) VALUES
 (1, 'Lista 1 - Análise de complexidade', 'Resolver os exercícios 1 a 8.', 'exercicio', '2026-12-30 23:59:00', 10.00),
 (1, 'Trabalho - Implementação de árvore AVL', 'Entregar o código e um relatório de uma página.', 'trabalho', '2027-01-15 23:59:00', 10.00);
