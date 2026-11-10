create database if not exists gestorDeCursos character set utf8mb4;
use gestorDeCursos;

CREATE TABLE graduacao (
    codigo_graduacao INT PRIMARY KEY,
    nome             VARCHAR(100) NOT NULL,
    ativo            BOOLEAN DEFAULT TRUE
);


CREATE TABLE usuario(
    id_usuario          INT AUTO_INCREMENT PRIMARY KEY,
    matricula           VARCHAR(10) NOT NULL UNIQUE,
    nome                VARCHAR(100) NOT NULL,
    cpf                 CHAR(11) NOT NULL UNIQUE,
    senha               VARCHAR(100) NOT NULL,
    tipo                INT NOT NULL,
    id_graduacao_ativo  INT NULL,  -- graduacao em que o aluno está ativo
    data_entrada        DATE NOT NULL,
    CONSTRAINT fk_usuario_graduacao_ativo
        FOREIGN KEY (id_graduacao_ativo)
        REFERENCES graduacao(codigo_graduacao)
        ON DELETE SET NULL
);



CREATE TABLE usuario_graduacao (
    id_usuario       INT NOT NULL,
    codigo_graduacao INT NOT NULL,
    tipo             ENUM('professor','aluno') NOT NULL,
    PRIMARY KEY (id_usuario, codigo_graduacao),

    CONSTRAINT fk_usuario_grad_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuario(id_usuario)
        ON DELETE CASCADE,

    CONSTRAINT fk_usuario_grad_graduacao
        FOREIGN KEY (codigo_graduacao)
        REFERENCES graduacao(codigo_graduacao)
        ON DELETE RESTRICT
);


CREATE TABLE curso(
  id_curso INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(50) NOT NULL,
  descricao TEXT,
  carga_horaria INT NOT NULL,
  codigo_graduacao INT NULL,
  ativo BOOLEAN DEFAULT TRUE,
  CONSTRAINT chk_carga_horaria CHECK (carga_horaria > 0),
  CONSTRAINT fk_curso_graduacao FOREIGN KEY (codigo_graduacao) REFERENCES graduacao(codigo_graduacao) ON DELETE RESTRICT
);

CREATE TABLE periodo(
    id_periodo       INT AUTO_INCREMENT PRIMARY KEY,
    codigo           VARCHAR(10) NOT NULL UNIQUE,
    nome             VARCHAR(50) NOT NULL UNIQUE,
    codigo_graduacao INT NOT NULL,
    data_inicio      DATE NOT NULL,
    data_fim         DATE NOT NULL,
    ativo            BOOLEAN DEFAULT TRUE,
    
    CONSTRAINT chk_periodo_data
        CHECK (data_fim > data_inicio),

    CONSTRAINT fk_periodo_graduacao
        FOREIGN KEY (codigo_graduacao)
        REFERENCES graduacao(codigo_graduacao)
        ON DELETE RESTRICT
);

create table turma(
	id_turma int auto_increment primary key,
    id_periodo int not null,
	id_curso int not null,
    id_professor int not null,
    nome varchar(50) not null unique,
    codigo_turma varchar(10) not null unique,
    vagas_regulares int not null default 30,
    vagas_extras int not null default 10,
    periodo_letivo varchar(20),
    ativo boolean default true,
	status_inscricoes enum('aberta','fechada') not null default 'aberta',
    constraint fk_turma_periodo foreign key (id_periodo) references periodo(id_periodo) ON DELETE RESTRICT,   
	constraint fk_turma_curso foreign key (id_curso) references curso(id_curso) ON DELETE RESTRICT,			
	constraint fk_turma_professor foreign key (id_professor) references usuario(id_usuario) ON DELETE RESTRICT
);



create table aluno_curso(
	id_aluno_curso int auto_increment primary key,
    id_aluno int not null,
    id_curso int not null,
    id_turma int not null,
    tentativas int not null default 0,
    p1 decimal(4,2) default NULL,
    p2 decimal(4,2) default NULL,
    pf decimal(4,2) default NULL,
    media_final decimal(4,2) default null,
    status enum('cursando', 'concluido', 'incompleto') DEFAULT 'incompleto',
    constraint fk_aluno_curso foreign key (id_aluno) references usuario(id_usuario) on delete cascade,
    constraint fk_curso foreign key (id_curso) references curso(id_curso) on delete cascade,
    constraint fk_hist_turma FOREIGN KEY (id_turma) REFERENCES turma(id_turma) ON DELETE CASCADE

);

create table historico_aluno (
	id_historico int auto_increment primary key,
    id_aluno int not null,
    id_curso int not null,
    id_turma int not null,
    nome_curso varchar(50) not null,
    codigo_periodo varchar(10),
    nome_turma varchar(50) not null,
    media_final DECIMAL(4,2) not null,
    status ENUM('Aprovado', 'Reprovado') not null,
    data_status DATE not null,
    CONSTRAINT fk_hist_aluno FOREIGN KEY (id_aluno)
        REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    CONSTRAINT fk_hist_curso FOREIGN KEY (id_curso)
        REFERENCES curso(id_curso) ON DELETE CASCADE
);

CREATE TABLE inscricao_turma (
    id_inscricao INT AUTO_INCREMENT PRIMARY KEY,
    id_aluno INT NOT NULL,
    id_turma INT NOT NULL,
    tentativas_anteriores INT NOT NULL DEFAULT 0,
    data_inscricao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pendente', 'aprovado', 'rejeitado') NOT NULL DEFAULT 'pendente',
	CONSTRAINT uq_inscricao UNIQUE (id_aluno, id_turma),
    CONSTRAINT fk_insc_aluno FOREIGN KEY (id_aluno)
        REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    CONSTRAINT fk_insc_turma FOREIGN KEY (id_turma)
        REFERENCES turma(id_turma) ON DELETE CASCADE
);


CREATE TABLE material_aula (
    id_material INT AUTO_INCREMENT PRIMARY KEY,
    id_turma INT NOT NULL,
    titulo VARCHAR(100) NOT NULL,
    descricao TEXT,
    tipo ENUM('apostila', 'slide', 'video', 'link', 'outro') NOT NULL DEFAULT 'outro',
    caminho_arquivo VARCHAR(255),
    data_publicacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_material_turma
        FOREIGN KEY (id_turma) REFERENCES turma(id_turma)
        ON DELETE CASCADE
);

CREATE TABLE atividade_avaliativa (
    id_atividade INT AUTO_INCREMENT PRIMARY KEY,
    id_turma INT NOT NULL,
    titulo VARCHAR(100) NOT NULL,
    descricao TEXT,
    tipo ENUM('trabalho', 'prova', 'exercicio') NOT NULL,
    data_publicacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_limite DATETIME NOT NULL,
    valor DECIMAL(4,2) NOT NULL DEFAULT 10.00,
    permite_atraso BOOLEAN NOT NULL DEFAULT FALSE,

    CONSTRAINT fk_atividade_turma
        FOREIGN KEY (id_turma) REFERENCES turma(id_turma)
        ON DELETE CASCADE
);

CREATE TABLE resposta_atividade (
    id_resposta INT AUTO_INCREMENT PRIMARY KEY,
    id_atividade INT NOT NULL,
    id_aluno INT NOT NULL,
    data_envio DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    conteudo_resposta TEXT,
    caminho_arquivo VARCHAR(255),
    atrasada BOOLEAN NOT NULL DEFAULT FALSE,

    CONSTRAINT uq_resposta_atividade UNIQUE (id_atividade, id_aluno),

    CONSTRAINT fk_resp_atividade
        FOREIGN KEY (id_atividade) REFERENCES atividade_avaliativa(id_atividade)
        ON DELETE CASCADE,

    CONSTRAINT fk_resp_aluno
        FOREIGN KEY (id_aluno) REFERENCES usuario(id_usuario)
        ON DELETE CASCADE
);







DELIMITER $$

DROP TRIGGER IF EXISTS trg_turma_encerrar $$
CREATE TRIGGER trg_turma_encerrar
AFTER UPDATE ON turma
FOR EACH ROW
BEGIN
    -- Variáveis gerais
    DECLARE done           INT DEFAULT 0;
    DECLARE v_id_aluno     INT;
    DECLARE v_id_curso     INT;
    DECLARE v_p1           DECIMAL(4,2);
    DECLARE v_p2           DECIMAL(4,2);
    DECLARE v_pf           DECIMAL(4,2);
    DECLARE v_media_p12    DECIMAL(4,2);
    DECLARE v_media_final  DECIMAL(4,2);
    DECLARE v_status_hist  ENUM('Aprovado','Reprovado');
    DECLARE v_id_graduacao INT;

    -- Cursor com todos os alunos dessa turma
    DECLARE cur_alunos CURSOR FOR
        SELECT id_aluno, id_curso, p1, p2, pf
        FROM aluno_curso
        WHERE id_turma = NEW.id_turma;

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

    -- Só dispara quando a turma é desativada (1 -> 0)
    IF OLD.ativo = 1 AND NEW.ativo = 0 THEN

        -- Descobre a graduação da turma
        SELECT p.codigo_graduacao
          INTO v_id_graduacao
        FROM turma   t
        JOIN periodo p ON p.id_periodo = t.id_periodo
        WHERE t.id_turma = NEW.id_turma;

        OPEN cur_alunos;

        read_loop: LOOP
            FETCH cur_alunos INTO v_id_aluno, v_id_curso, v_p1, v_p2, v_pf;
            IF done = 1 THEN
                LEAVE read_loop;
            END IF;

            SET v_media_final = NULL;
            SET v_status_hist = 'Reprovado'; -- default

            -- Tem P1 e P2?
            IF v_p1 IS NOT NULL AND v_p2 IS NOT NULL THEN
                SET v_media_p12 = (v_p1 + v_p2) / 2;

                IF v_media_p12 >= 7 THEN
                    SET v_media_final = v_media_p12;
                    SET v_status_hist = 'Aprovado';

                ELSEIF v_pf IS NOT NULL THEN
                    SET v_media_final = (v_media_p12 + v_pf) / 2;

                    IF v_media_final >= 5 THEN
                        SET v_status_hist = 'Aprovado';
                    ELSE
                        SET v_status_hist = 'Reprovado';
                    END IF;

                ELSE
                    -- Não passou direto e não fez PF: reprova
                    SET v_media_final = v_media_p12;
                    SET v_status_hist = 'Reprovado';
                END IF;

            ELSE
                -- Sem P1 ou P2: reprovação/incompleto
                SET v_media_final = NULL;
                SET v_status_hist = 'Reprovado';
            END IF;

            -- Grava no histórico
            INSERT INTO historico_aluno (
                id_aluno,
                id_graduacao,
                id_curso,
                id_turma,
                media_final,
                status,
                data_conclusao
            ) VALUES (
                v_id_aluno,
                v_id_graduacao,
                v_id_curso,
                NEW.id_turma,
                v_media_final,
                v_status_hist,
                CURDATE()
            );

            -- Atualiza aluno_curso conforme situação
            IF v_status_hist = 'Aprovado' THEN
                UPDATE aluno_curso
                   SET media_final = v_media_final,
                       status      = 'concluido'
                 WHERE id_aluno = v_id_aluno
                   AND id_turma = NEW.id_turma;
            ELSE
                UPDATE aluno_curso
                   SET tentativas  = tentativas + 1,
                       p1          = NULL,
                       p2          = NULL,
                       pf          = NULL,
                       media_final = NULL,
                       status      = 'incompleto'
                 WHERE id_aluno = v_id_aluno
                   AND id_turma = NEW.id_turma;
            END IF;

        END LOOP;

        CLOSE cur_alunos;
    END IF;
END$$

DELIMITER ;



DELIMITER $$

DROP TRIGGER IF EXISTS trg_ac_calcula_media $$
CREATE TRIGGER trg_ac_calcula_media
BEFORE UPDATE ON aluno_curso
FOR EACH ROW
BEGIN
    DECLARE v_media_p12   DECIMAL(4,2);
    DECLARE v_media_final DECIMAL(4,2);

    -- Sem P1 ou P2 ainda: não tem como ter média
    IF NEW.p1 IS NULL OR NEW.p2 IS NULL THEN
        SET NEW.media_final = NULL;
    ELSE
        SET v_media_p12 = (NEW.p1 + NEW.p2) / 2;

        -- Passou direto
        IF v_media_p12 >= 7 THEN
            SET v_media_final = v_media_p12;

        -- Não passou direto, mas já tem PF
        ELSEIF NEW.pf IS NOT NULL THEN
            SET v_media_final = (v_media_p12 + NEW.pf) / 2;

        -- Não passou direto e ainda não tem PF
        ELSE
            SET v_media_final = NULL;
        END IF;

        SET NEW.media_final = v_media_final;
    END IF;
END$$

DELIMITER ;

DELIMITER //

CREATE TRIGGER chk_resposta_atividade
BEFORE INSERT ON resposta_atividade
FOR EACH ROW
BEGIN
    DECLARE v_id_turma INT;
    DECLARE v_data_limite DATETIME;
    DECLARE v_matricula INT;

    IF NEW.data_envio IS NULL THEN
        SET NEW.data_envio = NOW();
    END IF;

    SELECT id_turma, data_limite
    INTO v_id_turma, v_data_limite
    FROM atividade_avaliativa
    WHERE id_atividade = NEW.id_atividade;

    IF v_id_turma IS NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Atividade inexistente.';
    END IF;

    SELECT COUNT(*)
    INTO v_matricula
    FROM aluno_curso
    WHERE id_aluno = NEW.id_aluno
      AND id_turma = v_id_turma;

    IF v_matricula = 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Aluno nao esta matriculado na turma desta atividade.';
    END IF;

    IF NEW.data_envio > v_data_limite THEN
        SET NEW.atrasada = TRUE;
    ELSE
        SET NEW.atrasada = FALSE;
    END IF;

END//

DELIMITER ;

DROP TRIGGER IF EXISTS chk_inscricao_turma;
DELIMITER //

CREATE TRIGGER chk_inscricao_turma
BEFORE INSERT ON inscricao_turma
FOR EACH ROW
BEGIN
    DECLARE v_tipo INT;
    DECLARE v_professor_id INT;
    DECLARE v_curso_id INT;
    DECLARE v_id_periodo INT;
    DECLARE v_tentativas INT DEFAULT 0;
    DECLARE v_status_inscricoes ENUM('aberta','fechada');
    DECLARE v_vagas_regulares INT;
    DECLARE v_vagas_extras INT;
    DECLARE v_posicao INT;
    DECLARE v_count INT;
    DECLARE v_grad_aluno INT;
    DECLARE v_grad_periodo INT;

    -- -------------------------------------------------------------------
    -- 1) Garantir data_inscricao
    -- -------------------------------------------------------------------
    IF NEW.data_inscricao IS NULL THEN
        SET NEW.data_inscricao = NOW();
    END IF;

    -- -------------------------------------------------------------------
    -- 2) Verificar se é aluno (tipo 1,3,7)
    -- -------------------------------------------------------------------
    SELECT tipo INTO v_tipo
    FROM usuario
    WHERE id_usuario = NEW.id_aluno;

    IF v_tipo IS NULL OR v_tipo NOT IN (1,3,7) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Usuário não pode se inscrever (não é aluno).';
    END IF;

    -- -------------------------------------------------------------------
    -- 3) Pegar dados da turma
    -- -------------------------------------------------------------------
    SELECT 
        id_professor,
        id_curso,
        id_periodo,
        status_inscricoes,
        vagas_regulares,
        vagas_extras
    INTO
        v_professor_id,
        v_curso_id,
        v_id_periodo,
        v_status_inscricoes,
        v_vagas_regulares,
        v_vagas_extras
    FROM turma
    WHERE id_turma = NEW.id_turma;

    IF v_professor_id IS NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Turma inexistente.';
    END IF;

    -- -------------------------------------------------------------------
    -- 4) Professor não pode se inscrever
    -- -------------------------------------------------------------------
    IF v_professor_id = NEW.id_aluno THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Professor não pode se inscrever em sua própria turma.';
    END IF;

    -- -------------------------------------------------------------------
    -- 5) Inscrições precisam estar abertas
    -- -------------------------------------------------------------------
    IF v_status_inscricoes <> 'aberta' THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Inscrições fechadas para esta turma.';
    END IF;

    -- -------------------------------------------------------------------
    -- 6) Verificar graduação do aluno vs graduação do período
    -- -------------------------------------------------------------------
    SELECT id_graduacao_ativo
    INTO v_grad_aluno
    FROM usuario
    WHERE id_usuario = NEW.id_aluno;

    SELECT p.codigo_graduacao
    INTO v_grad_periodo
    FROM turma t
    JOIN periodo p ON p.id_periodo = t.id_periodo
    WHERE t.id_turma = NEW.id_turma;

    IF v_grad_aluno IS NULL OR v_grad_aluno <> v_grad_periodo THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Aluno não pertence à graduação desta turma.';
    END IF;

    -- -------------------------------------------------------------------
    -- 7) Já está matriculado em outra turma do mesmo curso/período?
    -- -------------------------------------------------------------------
    SELECT COUNT(*)
    INTO v_count
    FROM aluno_curso ac
    JOIN turma t2 ON t2.id_turma = ac.id_turma
    WHERE ac.id_aluno = NEW.id_aluno
      AND t2.id_curso = v_curso_id
      AND t2.id_periodo = v_id_periodo;

    IF v_count > 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Aluno já está matriculado em outra turma desse curso neste período.';
    END IF;

    -- -------------------------------------------------------------------
    -- 8) Já possui outra inscrição ativa no mesmo curso/período?
    -- -------------------------------------------------------------------
    SELECT COUNT(*)
    INTO v_count
    FROM inscricao_turma it
    JOIN turma t3 ON t3.id_turma = it.id_turma
    WHERE it.id_aluno = NEW.id_aluno
      AND it.id_turma <> NEW.id_turma
      AND it.status IN ('pendente','aprovado')
      AND t3.id_curso = v_curso_id
      AND t3.id_periodo = v_id_periodo;

    IF v_count > 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Aluno já possui inscrição ativa neste curso e período.';
    END IF;

    -- -------------------------------------------------------------------
    -- 9) Calcular tentativas_anteriores
    -- -------------------------------------------------------------------
    SELECT IFNULL(MAX(tentativas),0)
    INTO v_tentativas
    FROM aluno_curso
    WHERE id_aluno = NEW.id_aluno
      AND id_curso = v_curso_id
      AND status = 'incompleto';

    SET NEW.tentativas_anteriores = v_tentativas;

    -- -------------------------------------------------------------------
    -- 10) Calcular posição na fila
    -- -------------------------------------------------------------------
    SELECT COUNT(*)
    INTO v_posicao
    FROM inscricao_turma i
    WHERE i.id_turma = NEW.id_turma
      AND (
           i.tentativas_anteriores > NEW.tentativas_anteriores
        OR (i.tentativas_anteriores = NEW.tentativas_anteriores
            AND i.data_inscricao <= NEW.data_inscricao)
      );

    SET v_posicao = v_posicao + 1;

    -- -------------------------------------------------------------------
    -- 11) Definir status conforme vaga
    -- -------------------------------------------------------------------
    IF v_posicao <= v_vagas_regulares THEN
        SET NEW.status = 'aprovado';
    ELSEIF v_posicao <= v_vagas_regulares + v_vagas_extras THEN
        SET NEW.status = 'pendente';
    ELSE
        SET NEW.status = 'rejeitado';
    END IF;

END//
DELIMITER ;



DELIMITER //

CREATE TRIGGER trg_periodo_desativa
AFTER UPDATE ON periodo
FOR EACH ROW
BEGIN
    IF OLD.ativo = TRUE AND NEW.ativo = FALSE THEN
        
        UPDATE turma
        SET ativo = FALSE
        WHERE id_periodo = NEW.id_periodo;

        UPDATE curso
        SET ativo = FALSE
        WHERE id_curso IN (
            SELECT id_curso
            FROM turma
            WHERE id_periodo = NEW.id_periodo
        );

    END IF;
END//

DELIMITER ;

DELIMITER //

DROP TRIGGER IF EXISTS trg_processa_inscricoes_turma;
//
CREATE TRIGGER trg_processa_inscricoes_turma
AFTER UPDATE ON turma
FOR EACH ROW
BEGIN
    DECLARE v_vagas_regulares INT;
    DECLARE v_vagas_extras   INT;

    IF OLD.status_inscricoes = 'aberta'
       AND NEW.status_inscricoes = 'fechada' THEN

        SET v_vagas_regulares = NEW.vagas_regulares;
        SET v_vagas_extras    = NEW.vagas_extras;

        UPDATE inscricao_turma it
        JOIN (
            SELECT 
                id_inscricao,
                ROW_NUMBER() OVER (
                    PARTITION BY id_turma
                    ORDER BY tentativas_anteriores DESC,
                             data_inscricao ASC
                ) AS pos
            FROM inscricao_turma
            WHERE id_turma = NEW.id_turma
        ) x ON x.id_inscricao = it.id_inscricao
        SET it.status = CASE
            WHEN x.pos <= v_vagas_regulares THEN 'aprovado'
            WHEN x.pos <= v_vagas_regulares + v_vagas_extras THEN 'pendente'
            ELSE 'rejeitado'
        END;

        INSERT INTO aluno_curso (id_aluno, id_curso, id_turma, status)
        SELECT 
            it.id_aluno,
            NEW.id_curso,
            NEW.id_turma,
            'cursando'
        FROM inscricao_turma it
        LEFT JOIN aluno_curso ac
          ON ac.id_aluno = it.id_aluno
         AND ac.id_turma = NEW.id_turma
        WHERE it.id_turma = NEW.id_turma
          AND it.status = 'aprovado'
          AND ac.id_aluno IS NULL;

    END IF;
END//
DELIMITER ;
