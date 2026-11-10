// src/pages/TurmasDisponiveis.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

const API_URL = "http://localhost:3001";

const TurmasDisponiveis = () => {
  const { user } = useAuth();
  const idAluno = user?.id_usuario;

  const [turmas, setTurmas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  const [turmaSelecionada, setTurmaSelecionada] = useState(null);
  const [inscrevendo, setInscrevendo] = useState(false);
  const [mensagemModal, setMensagemModal] = useState(null);

  // Carregar turmas disponíveis para o aluno logado
  useEffect(() => {
    if (!idAluno) return;

    async function carregar() {
      try {
        setLoading(true);
        setErro(null);

        const res = await fetch(
          `${API_URL}/aluno/${idAluno}/turmas-disponiveis`
        );
        const data = await res.json();

        if (!res.ok) {
          throw new Error(
            data.error || "Erro ao carregar turmas disponíveis."
          );
        }

        setTurmas(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setErro(err.message || "Erro ao carregar turmas disponíveis.");
      } finally {
        setLoading(false);
      }
    }

    carregar();
  }, [idAluno]);

  const abrirModal = (turma) => {
    setTurmaSelecionada(turma);
    setMensagemModal(null);
  };

  const fecharModal = () => {
    setTurmaSelecionada(null);
    setMensagemModal(null);
  };

  const handleInscricao = async () => {
    if (!turmaSelecionada || !idAluno) return;

    try {
      setInscrevendo(true);
      setMensagemModal(null);

      const res = await fetch(`${API_URL}/inscricoes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idAluno,
          idTurma: turmaSelecionada.id_turma,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg =
          data.error ||
          data.mensagem ||
          "Erro ao realizar inscrição.";
        setMensagemModal(msg);
      } else {
        const msg =
          data.message ||
          data.mensagem ||
          "Inscrição realizada com sucesso!";
        setMensagemModal(msg);

        // Remove a turma da lista (já se inscreveu nela)
        setTurmas((prev) =>
          prev.filter((t) => t.id_turma !== turmaSelecionada.id_turma)
        );
      }
    } catch (err) {
      console.error(err);
      setMensagemModal("Erro ao realizar inscrição.");
    } finally {
      setInscrevendo(false);
    }
  };

  // Separar entre turmas do curso ativo e optativas
  const turmasCurso = turmas.filter((t) => t.categoria === "principal");
  const turmasOptativas = turmas.filter((t) => t.categoria === "optativa");

  const renderTurmaItem = (t) => (
    <article key={t.id_turma} className="turma-card">
      <div className="turma-card-head">
        <div>
          <h3>{t.nome_curso}</h3>
          <p className="turma-card-sub">
            {(t.nome || t.nome_turma) ?? "(sem nome de turma)"} · {t.codigo_turma}
          </p>
        </div>
        <span className="badge badge-info">{t.vagas_regulares} vagas</span>
      </div>
      <dl className="turma-card-info">
        <div>
          <dt>Período</dt>
          <dd>
            {t.nome_periodo}
            {t.codigo_periodo ? ` (${t.codigo_periodo})` : ""}
          </dd>
        </div>
        {t.nome_professor && (
          <div>
            <dt>Professor</dt>
            <dd>
              {t.nome_professor}
              {t.matricula_professor ? ` (${t.matricula_professor})` : ""}
            </dd>
          </div>
        )}
      </dl>
      <button className="btn btn-primary" onClick={() => abrirModal(t)}>
        Inscrever-se
      </button>
    </article>
  );

  return (
    <div className="container">
      <div className="header">
        <h1>Turmas disponíveis para inscrição</h1>
        <p>Escolha as turmas em que deseja se matricular neste período.</p>
      </div>

      {loading && <p className="p-center">Carregando turmas disponíveis...</p>}

      {erro && <div className="error">{erro}</div>}

      {!loading && !erro && turmas.length === 0 && (
        <div className="card">
          <p className="empty">Nenhuma turma disponível para inscrição no momento.</p>
        </div>
      )}

      {!loading && !erro && turmas.length > 0 && (
        <>
          {turmasCurso.length > 0 && (
            <section className="turma-section">
              <h2 className="section-title">Disciplinas do meu curso</h2>
              <div className="turma-grid">{turmasCurso.map(renderTurmaItem)}</div>
            </section>
          )}

          {turmasOptativas.length > 0 && (
            <section className="turma-section">
              <h2 className="section-title">Disciplinas optativas</h2>
              <div className="turma-grid">{turmasOptativas.map(renderTurmaItem)}</div>
            </section>
          )}
        </>
      )}

      {turmaSelecionada && (
        <div className="modal" onClick={fecharModal}>
          <div className="modal-content" style={{ maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Confirmar inscrição</h2>
            </div>
            <p>
              Confirmar inscrição na turma{" "}
              <strong>{(turmaSelecionada.nome || turmaSelecionada.nome_turma) ?? ""}</strong>{" "}
              do curso <strong>{turmaSelecionada.nome_curso}</strong>?
            </p>

            {mensagemModal && <div className="success">{mensagemModal}</div>}

            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={fecharModal}>
                Fechar
              </button>
              <button className="btn btn-primary" onClick={handleInscricao} disabled={inscrevendo}>
                {inscrevendo ? "Enviando..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TurmasDisponiveis;
