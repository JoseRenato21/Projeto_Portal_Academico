// src/pages/MinhasInscricoes.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

const API_URL = "http://localhost:3001";

const MinhasInscricoes = () => {
  const { user } = useAuth();
  const idAluno = user?.id_usuario;

  const [inscricoes, setInscricoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [selecionada, setSelecionada] = useState(null);

  useEffect(() => {
    if (!idAluno) return;

    async function carregar() {
      try {
        setLoading(true);
        setErro(null);

        const url = `${API_URL}/inscricoes/aluno/${idAluno}`;
        console.log("[MinhasInscricoes] GET:", url);

        const res = await fetch(url);
        const contentType = res.headers.get("content-type") || "";

        console.log(
          "[MinhasInscricoes] status:",
          res.status,
          res.statusText,
          "content-type:",
          contentType
        );

        if (!res.ok) {
          const texto = await res.text();
          console.error(
            "[MinhasInscricoes] Erro HTTP:",
            res.status,
            res.statusText,
            "body:",
            texto
          );
          throw new Error("Erro ao carregar inscrições.");
        }

        if (!contentType.includes("application/json")) {
          const texto = await res.text();
          console.error(
            "[MinhasInscricoes] Resposta não é JSON. Body:",
            texto
          );
          throw new Error("Resposta inesperada do servidor.");
        }

        const data = await res.json();
        console.log("[MinhasInscricoes] data JSON:", data);

        setInscricoes(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("[MinhasInscricoes] Erro geral:", err);
        setErro(err.message || "Erro ao carregar inscrições.");
      } finally {
        setLoading(false);
      }
    }

    carregar();
  }, [idAluno]);

  function abrirModal(inscricao) {
    setSelecionada(inscricao);
  }

  function fecharModal() {
    setSelecionada(null);
  }

  function calcularEstado(i) {
    if (!i || !i.status_curso) return "-";
    if (i.status_curso === "cursando") return "Cursando";
    if (i.status_curso === "concluido") return "Aprovado";
    if (i.status_curso === "incompleto") {
      if (i.tentativas_matricula && i.tentativas_matricula > 0) {
        return "Reprovado";
      }
      return "Incompleto";
    }
    return "-";
  }

  // esse texto é mais "cosmético", usando status_inscricoes da turma
  function getStatusInscricaoTexto(i) {
    if (!i) return "-";
    if (i.status_inscricoes === "aberta") {
      return "Pendente";
    }
    if (i.status_inscricoes === "fechada") {
      return "Inscrito";
    }
    return i.status_inscricoes || "-";
  }

  function formatarNota(nota) {
    if (nota == null) return "-";
    const valor = parseFloat(nota);
    if (isNaN(valor)) return "-";
    return valor.toFixed(2);
  }

  const cursando = inscricoes.filter((i) => i.status_curso === "cursando");
  const historico = inscricoes.filter(
    (i) => i.status_curso === "concluido" || i.status_curso === "incompleto"
  );

  const formatarData = (data) => {
    if (!data) return "";
    return new Date(data).toLocaleDateString("pt-BR");
  };

  const Tabela = ({ dados, mostraNota }) => (
    <div style={{ overflowX: "auto" }}>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: "0.9rem",
          marginTop: "1rem",
        }}
      >
        <thead>
          <tr
            style={{
              backgroundColor: "#f9fafb",
              borderBottom: "2px solid #e5e7eb",
            }}
          >
            <th style={{ padding: "0.75rem", textAlign: "left", fontWeight: 600 }}>
              Curso
            </th>
            <th style={{ padding: "0.75rem", textAlign: "left", fontWeight: 600 }}>
              Turma
            </th>
            <th style={{ padding: "0.75rem", textAlign: "left", fontWeight: 600 }}>
              Período
            </th>
            <th style={{ padding: "0.75rem", textAlign: "left", fontWeight: 600 }}>
              Professor
            </th>
            <th style={{ padding: "0.75rem", textAlign: "center", fontWeight: 600 }}>
              Data inscrição
            </th>
            <th style={{ padding: "0.75rem", textAlign: "center", fontWeight: 600 }}>
              Status
            </th>
            {mostraNota && (
              <th
                style={{
                  padding: "0.75rem",
                  textAlign: "center",
                  fontWeight: 600,
                }}
              >
                Nota
              </th>
            )}
            <th style={{ padding: "0.75rem", textAlign: "center", fontWeight: 600 }}>
              Ações
            </th>
          </tr>
        </thead>
        <tbody>
          {dados.map((i, idx) => (
            <tr
              key={i.id_aluno_curso}
              style={{
                borderBottom: "1px solid #e5e7eb",
                backgroundColor: idx % 2 === 0 ? "#fff" : "#f9fafb",
              }}
            >
              <td style={{ padding: "0.75rem", fontWeight: 500 }}>{i.nome_curso}</td>
              <td style={{ padding: "0.75rem" }}>
                {i.nome_turma} ({i.codigo_turma})
              </td>
              <td style={{ padding: "0.75rem" }}>{i.nome_periodo}</td>
              <td style={{ padding: "0.75rem" }}>{i.nome_professor}</td>
              <td style={{ padding: "0.75rem", textAlign: "center" }}>
                {formatarData(i.data_inscricao)}
              </td>
              <td style={{ padding: "0.75rem", textAlign: "center" }}>
                <span
                  style={{
                    display: "inline-block",
                    background:
                      calcularEstado(i) === "Aprovado"
                        ? "#ecfdf5"
                        : calcularEstado(i) === "Reprovado"
                        ? "#fee2e2"
                        : calcularEstado(i) === "Cursando"
                        ? "#dbeafe"
                        : "#fef3c7",
                    color:
                      calcularEstado(i) === "Aprovado"
                        ? "#166534"
                        : calcularEstado(i) === "Reprovado"
                        ? "#991b1b"
                        : calcularEstado(i) === "Cursando"
                        ? "#1e40af"
                        : "#92400e",
                    padding: "0.25rem 0.5rem",
                    borderRadius: "999px",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                  }}
                >
                  {calcularEstado(i)}
                </span>
              </td>
              {mostraNota && (
                <td
                  style={{
                    padding: "0.75rem",
                    textAlign: "center",
                    fontWeight: 500,
                  }}
                >
                  {formatarNota(i.media_final)}
                </td>
              )}
              <td style={{ padding: "0.75rem", textAlign: "center" }}>
                <button
                  onClick={() => abrirModal(i)}
                  style={{
                    padding: "0.4rem 0.8rem",
                    background: "#2563eb",
                    color: "white",
                    border: "none",
                    borderRadius: "0.5rem",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                    fontWeight: 500,
                  }}
                >
                  Detalhes
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        body { font-family: system-ui, -apple-system, sans-serif; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; padding: 1.5rem; }
        .header { margin-bottom: 2rem; }
        .header h1 { margin: 0; font-size: 1.5rem; font-weight: 700; }
        .header p { margin: 0.25rem 0 0 0; color: #666; font-size: 0.95rem; }
        .card { background: white; border-radius: 0.75rem; padding: 1.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.08); margin-bottom: 2rem; }
        .error { background: #fee2e2; color: #991b1b; padding: 0.75rem; border-radius: 0.5rem; margin-bottom: 1rem; font-size: 0.9rem; }
        .empty { text-align: center; color: #666; padding: 2rem; font-size: 1rem; }
        .section-title { font-size: 1.2rem; font-weight: 600; margin: 0 0 1rem 0; color: #111827; }
        .section-subtitle { font-size: 0.9rem; color: #6b7280; margin: 0 0 0.5rem 0; }
        .modal { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 999; }
        .modal-content { background: white; padding: 1.5rem; border-radius: 0.75rem; width: 100%; max-width: 600px; box-shadow: 0 20px 25px rgba(0,0,0,0.15); max-height: 90vh; overflow-y: auto; }
        .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
        .modal h2 { margin: 0; font-size: 1.3rem; font-weight: 600; }
        .modal-close { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #999; }
        .modal-section { margin: 1.5rem 0; padding: 1rem; background: #f9fafb; border-radius: 0.5rem; border-left: 4px solid #2563eb; }
        .modal-section h3 { margin: 0 0 0.75rem 0; font-size: 1rem; font-weight: 600; color: #111827; }
        .modal-section p { margin: 0.5rem 0; font-size: 0.9rem; color: #333; }
        .modal-actions { display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #e5e7eb; }
        .btn { padding: 0.6rem 1rem; border: none; border-radius: 0.5rem; cursor: pointer; font-size: 0.9rem; font-weight: 500; }
        .btn-secondary { background: #f9fafb; border: 1px solid #ddd; color: #333; }
        .btn-secondary:hover { background: #f3f4f6; }
        .badge { display: inline-block; padding: 0.3rem 0.6rem; border-radius: 0.375rem; font-size: 0.8rem; font-weight: 600; }
        .badge-approved { background: #ecfdf5; color: #166534; }
        .badge-reproved { background: #fee2e2; color: #991b1b; }
        .badge-incomplete { background: #fef3c7; color: #92400e; }
        .badge-cursando { background: #dbeafe; color: #1e40af; }
        .p-center { text-align: center; color: #666; }
        .info-label { font-weight: 600; color: #111827; margin-right: 0.5rem; }
        .nota-container { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 0.5rem; }
        .nota-item { background: white; padding: 0.75rem; border-radius: 0.375rem; border: 1px solid #e5e7eb; }
        .nota-valor { font-size: 1.2rem; font-weight: 700; color: #2563eb; }
      `}</style>

      <div className="container">
        <div className="header">
          <h1>📚 Minhas Inscrições</h1>
          <p>Acompanhe seu desempenho nas turmas</p>
        </div>

        {loading && <p className="p-center">Carregando inscrições...</p>}

        {erro && <div className="error">{erro}</div>}

        {!loading && !erro && inscricoes.length === 0 && (
          <div className="card">
            <p className="empty">Você ainda não possui nenhuma inscrição.</p>
          </div>
        )}

        {!loading && !erro && cursando.length > 0 && (
          <div className="card">
            <h2 className="section-title">🎓 Cursando</h2>
            <p className="section-subtitle">Turmas em andamento</p>
            <Tabela dados={cursando} mostraNota={false} />
          </div>
        )}

        {!loading && !erro && historico.length > 0 && (
          <div className="card">
            <h2 className="section-title">📖 Histórico</h2>
            <p className="section-subtitle">
              Turmas concluídas ou com resultado
            </p>
            <Tabela dados={historico} mostraNota={true} />
          </div>
        )}
      </div>

      {selecionada && (
        <div className="modal" onClick={fecharModal}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Detalhes da Turma</h2>
              <button className="modal-close" onClick={fecharModal}>
                ✕
              </button>
            </div>

            <div className="modal-section">
              <h3>📋 Informações da Turma</h3>
              <p>
                <span className="info-label">Curso:</span>{" "}
                {selecionada.nome_curso}
              </p>
              <p>
                <span className="info-label">Turma:</span>{" "}
                {selecionada.nome_turma} ({selecionada.codigo_turma})
              </p>
              <p>
                <span className="info-label">Período:</span>{" "}
                {selecionada.nome_periodo}
              </p>
              <p>
                <span className="info-label">Professor:</span>{" "}
                {selecionada.nome_professor}
              </p>
              <p>
                <span className="info-label">Carga Horária:</span>{" "}
                {selecionada.carga_horaria
                  ? `${selecionada.carga_horaria}h`
                  : "-"}
              </p>
            </div>

            <div className="modal-section">
              <h3>🎓 Graduação</h3>
              <p>
                <span className="info-label">Programa:</span>{" "}
                {selecionada.nome_graduacao || "-"}
              </p>
            </div>

            <div className="modal-section">
              <h3>🔄 Status</h3>
              <p>
                <span className="info-label">Inscrição:</span>{" "}
                {getStatusInscricaoTexto(selecionada)}
              </p>
              <p>
                <span className="info-label">Turma:</span>{" "}
                {selecionada.status_inscricoes}
              </p>
              <p>
                <span className="info-label">Estado:</span>{" "}
                <span
                  className={`badge ${
                    calcularEstado(selecionada) === "Aprovado"
                      ? "badge-approved"
                      : calcularEstado(selecionada) === "Reprovado"
                      ? "badge-reproved"
                      : calcularEstado(selecionada) === "Cursando"
                      ? "badge-cursando"
                      : "badge-incomplete"
                  }`}
                >
                  {calcularEstado(selecionada)}
                </span>
              </p>
            </div>

            <div className="modal-section">
              <h3>📊 Notas do Aluno</h3>
              <div className="nota-container">
                <div className="nota-item">
                  <div className="info-label">P1</div>
                  <div className="nota-valor">
                    {formatarNota(selecionada.p1)}
                  </div>
                </div>
                <div className="nota-item">
                  <div className="info-label">P2</div>
                  <div className="nota-valor">
                    {formatarNota(selecionada.p2)}
                  </div>
                </div>
                <div className="nota-item">
                  <div className="info-label">PF</div>
                  <div className="nota-valor">
                    {formatarNota(selecionada.pf)}
                  </div>
                </div>
                <div className="nota-item">
                  <div className="info-label">Média Final</div>
                  <div className="nota-valor">
                    {formatarNota(selecionada.media_final)}
                  </div>
                </div>
              </div>
              <p
                style={{
                  marginTop: "1rem",
                  fontSize: "0.85rem",
                  color: "#666",
                }}
              >
                <span className="info-label">Tentativas:</span>{" "}
                {selecionada.tentativas_matricula ?? "-"}
              </p>
            </div>

            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={fecharModal}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MinhasInscricoes;
