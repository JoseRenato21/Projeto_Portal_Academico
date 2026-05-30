// src/pages/ProfessorGerenciarInscricoes.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

const API_URL = "http://localhost:3001";

export default function ProfessorGerenciarInscricoes() {
  const { user } = useAuth();
  const idProfessor = user.id_usuario;

  const [turmas, setTurmas] = useState([]);
  const [turmaSelecionada, setTurmaSelecionada] = useState(null);
  const [inscricoesTurma, setInscricoesTurma] = useState([]);
  const [loadingTurmas, setLoadingTurmas] = useState(true);
  const [loadingInscricoes, setLoadingInscricoes] = useState(false);

  // =====================================
  // 1) Carrega TODAS as turmas e filtra por professor
  // =====================================
  async function carregarTurmas() {
    try {
      setLoadingTurmas(true);

      // ROTA QUE JÁ EXISTE NO TEU BACK:
      // GET /turma  -> controllerTurma.getTurmas
      const res = await fetch(`${API_URL}/turma`);
      const data = await res.json();
      const lista = Array.isArray(data) ? data : [];

      // filtra apenas as turmas deste professor
      const minhasTurmas = lista.filter(
        (t) => t.id_professor === idProfessor
      );

      setTurmas(minhasTurmas);

      if (minhasTurmas.length > 0) {
        setTurmaSelecionada(minhasTurmas[0]);
      } else {
        setTurmaSelecionada(null);
      }
    } catch (err) {
      console.error("Erro ao carregar turmas do professor:", err);
      setTurmas([]);
      setTurmaSelecionada(null);
    } finally {
      setLoadingTurmas(false);
    }
  }

  // =====================================
  // 2) Carrega fila de inscrições da turma selecionada
  // =====================================
  async function carregarInscricoes(idTurma) {
    try {
      setLoadingInscricoes(true);

      // ROTA QUE JÁ EXISTE NO TEU BACK:
      // GET /turma/:id/inscricoes  -> controllerTurma.getFilaTurma
      const res = await fetch(`${API_URL}/turma/${idTurma}/inscricoes`);
      const data = await res.json();
      const lista = Array.isArray(data) ? data : [];

      setInscricoesTurma(lista);
    } catch (err) {
      console.error("Erro ao carregar inscrições da turma:", err);
      setInscricoesTurma([]);
    } finally {
      setLoadingInscricoes(false);
    }
  }

  // Primeira carga: turmas
  useEffect(() => {
    carregarTurmas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sempre que trocar turma, recarrega fila daquela turma
  useEffect(() => {
    if (turmaSelecionada) {
      carregarInscricoes(turmaSelecionada.id_turma);
    } else {
      setInscricoesTurma([]);
    }
  }, [turmaSelecionada]);

  // =====================================
  // 3) Ações de aprovar / rejeitar inscrição
  // (vai usar as rotas que vou te dar no back)
  // =====================================
  async function aprovar(idInscricao) {
    try {
      await fetch(`${API_URL}/inscricoes/${idInscricao}/aprovar`, {
        method: "POST",
      });
      if (turmaSelecionada) {
        await carregarInscricoes(turmaSelecionada.id_turma);
      }
    } catch (err) {
      console.error("Erro ao aprovar inscrição:", err);
    }
  }

  async function rejeitar(idInscricao) {
    try {
      await fetch(`${API_URL}/inscricoes/${idInscricao}/rejeitar`, {
        method: "POST",
      });
      if (turmaSelecionada) {
        await carregarInscricoes(turmaSelecionada.id_turma);
      }
    } catch (err) {
      console.error("Erro ao rejeitar inscrição:", err);
    }
  }

  // =====================================
  // 4) Derivados para exibição
  // =====================================

  // só pendentes (vagas extras ainda esperando decisão)
  const pendentes = inscricoesTurma.filter(
    (insc) => insc.status === "pendente"
  );

  // nome da turma para título
  const nomeTurmaHeader =
    (turmaSelecionada &&
      (turmaSelecionada.nome_turma || turmaSelecionada.nome)) ||
    "Turma";

  return (
    <div style={{ padding: "2rem", maxWidth: "900px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "1.5rem", fontSize: "2rem" }}>
        Gerenciar Inscrições
      </h1>

      {/* Carregando turmas */}
      {loadingTurmas && <p>Carregando turmas...</p>}

      {/* Professor sem nenhuma turma */}
      {!loadingTurmas && turmas.length === 0 && (
        <div
          style={{
            marginTop: "2rem",
            padding: "2rem",
            background: "#fff",
            borderRadius: "1rem",
            boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: "1.1rem", color: "#444" }}>
            Você ainda não está vinculado a nenhuma turma.
          </p>
        </div>
      )}

      {/* Abas com TODAS as turmas que o professor dá aula */}
      {turmas.length > 0 && (
        <div
          style={{
            display: "flex",
            gap: "1rem",
            marginBottom: "1.5rem",
            flexWrap: "wrap",
          }}
        >
          {turmas.map((t) => {
            const label = t.nome_turma || t.nome || "Turma";
            const isActive = turmaSelecionada?.id_turma === t.id_turma;

            return (
              <button
                key={t.id_turma}
                onClick={() => setTurmaSelecionada(t)}
                style={{
                  padding: "0.7rem 1.2rem",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  background: isActive ? "#111827" : "#e5e7eb",
                  color: isActive ? "white" : "black",
                  cursor: "pointer",
                  transition: "0.2s",
                  fontSize: "1rem",
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}

      {/* Card da turma selecionada */}
      {turmaSelecionada && (
        <div
          style={{
            background: "white",
            padding: "1.5rem",
            borderRadius: "1rem",
            boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
          }}
        >
          {/* Inscrições Abertas */}
          {turmaSelecionada.status_inscricoes === "aberta" && (
            <p style={{ color: "#1d4ed8", fontSize: "1.05rem" }}>
              As inscrições desta turma ainda estão{" "}
              <strong>abertas</strong>.
              <br />
              Os alunos pendentes para vagas extras só aparecem aqui quando a
              turma estiver <strong>fechada</strong>.
            </p>
          )}

          {/* Inscrições Fechadas → mostra pendentes */}
          {turmaSelecionada.status_inscricoes === "fechada" && (
            <>
              <h2
                style={{
                  marginTop: "0.5rem",
                  marginBottom: "0.75rem",
                  fontSize: "1.3rem",
                }}
              >
                Alunos Pendentes – {nomeTurmaHeader}
              </h2>

              {loadingInscricoes && <p>Carregando inscrições...</p>}

              {!loadingInscricoes && pendentes.length === 0 && (
                <p style={{ color: "#555", marginTop: "0.75rem" }}>
                  Nenhum aluno pendente nesta turma.
                </p>
              )}

              {!loadingInscricoes && pendentes.length > 0 && (
                <table
                  border="1"
                  style={{
                    borderCollapse: "collapse",
                    width: "100%",
                    marginTop: "1rem",
                    background: "white",
                  }}
                >
                  <thead>
                    <tr style={{ background: "#f3f4f6" }}>
                      <th style={{ padding: "8px" }}>Aluno</th>
                      <th>Data inscrição</th>
                      <th>Tentativas</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendentes.map((p) => (
                      <tr key={p.id_inscricao}>
                        <td style={{ padding: "6px" }}>{p.nome_aluno}</td>
                        <td>
                          {p.data_inscricao
                            ? new Date(p.data_inscricao).toLocaleString()
                            : "-"}
                        </td>
                        <td>{p.tentativas_anteriores}</td>
                        <td>
                          <button
                            onClick={() => aprovar(p.id_inscricao)}
                            style={{
                              background: "green",
                              color: "white",
                              border: "none",
                              padding: "5px 10px",
                              borderRadius: "6px",
                              marginRight: "8px",
                              cursor: "pointer",
                            }}
                          >
                            Aprovar
                          </button>

                          <button
                            onClick={() => rejeitar(p.id_inscricao)}
                            style={{
                              background: "red",
                              color: "white",
                              border: "none",
                              padding: "5px 10px",
                              borderRadius: "6px",
                              cursor: "pointer",
                            }}
                          >
                            Rejeitar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
