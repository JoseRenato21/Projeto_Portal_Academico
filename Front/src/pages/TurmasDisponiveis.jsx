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
    <li
      key={t.id_turma}
      style={{
        border: "1px solid #ccc",
        borderRadius: 8,
        padding: 12,
        marginBottom: 10,
        background: "white",
      }}
    >
      <strong>{t.nome_curso}</strong>{" "}
      — {(t.nome || t.nome_turma) ?? "(sem nome de turma)"} (
      {t.codigo_turma})
      <br />
      Período: {t.nome_periodo}
      {t.codigo_periodo ? ` (${t.codigo_periodo})` : ""}
      <br />
      {t.nome_professor && (
        <>
          Professor: {t.nome_professor}
          {t.matricula_professor ? ` (${t.matricula_professor})` : ""}
          <br />
        </>
      )}
      Vagas: {t.vagas_regulares} regulares
      <br />
      <button
        style={{ marginTop: 8 }}
        onClick={() => abrirModal(t)}
      >
        Inscrever-se
      </button>
    </li>
  );

  return (
    <div
      style={{
        padding: "2rem",
        maxWidth: "900px",
        margin: "0 auto",
      }}
    >
      <h1 style={{ marginBottom: "1.5rem", fontSize: "2rem" }}>
        Turmas disponíveis para inscrição
      </h1>

      {loading && <p>Carregando turmas disponíveis...</p>}

      {erro && <p style={{ color: "red" }}>{erro}</p>}

      {!loading && !erro && turmas.length === 0 && (
        <p>Nenhuma turma disponível para inscrição no momento.</p>
      )}

      {!loading && !erro && turmas.length > 0 && (
        <>
          {turmasCurso.length > 0 && (
            <section style={{ marginBottom: "2rem" }}>
              <h2 style={{ fontSize: "1.4rem", marginBottom: "0.75rem" }}>
                Disciplinas do meu curso
              </h2>
              <ul style={{ listStyle: "none", padding: 0 }}>
                {turmasCurso.map(renderTurmaItem)}
              </ul>
            </section>
          )}

          {turmasOptativas.length > 0 && (
            <section>
              <h2 style={{ fontSize: "1.4rem", marginBottom: "0.75rem" }}>
                Disciplinas optativas
              </h2>
              <ul style={{ listStyle: "none", padding: 0 }}>
                {turmasOptativas.map(renderTurmaItem)}
              </ul>
            </section>
          )}
        </>
      )}

      {/* Modal de confirmação */}
      {turmaSelecionada && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: 20,
              borderRadius: 8,
              maxWidth: 400,
              width: "100%",
            }}
          >
            <h3>Confirmar inscrição</h3>
            <p>
              Confirmar inscrição na turma{" "}
              <strong>
                {(turmaSelecionada.nome ||
                  turmaSelecionada.nome_turma) ?? ""}
              </strong>{" "}
              do curso{" "}
              <strong>{turmaSelecionada.nome_curso}</strong>?
            </p>

            {mensagemModal && (
              <p style={{ marginTop: 10 }}>{mensagemModal}</p>
            )}

            <div style={{ marginTop: 16 }}>
              <button
                onClick={handleInscricao}
                disabled={inscrevendo}
              >
                {inscrevendo ? "Enviando..." : "Confirmar"}
              </button>
              <button
                onClick={fecharModal}
                style={{ marginLeft: 8 }}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TurmasDisponiveis;
