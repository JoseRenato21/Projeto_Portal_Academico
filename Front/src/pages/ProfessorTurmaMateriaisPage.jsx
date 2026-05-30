// src/pages/ProfessorTurmaMateriaisPage.jsx
import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";

const API_URL = "http://localhost:3001";

export default function ProfessorTurmaMateriaisPage() {
  const { idTurma } = useParams();
  const location = useLocation();
  const nomeTurma = location.state?.nomeTurma || `Turma ${idTurma}`;

  const [materiais, setMateriais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [link, setLink] = useState("");

  // 🔹 mapa: id_material -> array de respostas
  const [respostasPorMaterial, setRespostasPorMaterial] = useState({});
  const [loadingRespostas, setLoadingRespostas] = useState(false);

  // ============================
  // Carregar materiais da turma
  // ============================
  const load = async () => {
    try {
      setLoading(true);
      setErro("");

      const url = `${API_URL}/material_aula/turma/${idTurma}`;
      console.log("[ProfessorMateriais] GET materiais:", url);

      const res = await fetch(url);
      const contentType = res.headers.get("content-type") || "";
      let data;

      if (contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const texto = await res.text();
        console.error(
          "[ProfessorMateriais] Resposta não JSON ao carregar materiais:",
          texto
        );
        throw new Error("Resposta inesperada ao carregar materiais.");
      }

      if (!res.ok) {
        console.error(
          "[ProfessorMateriais] Erro HTTP ao carregar materiais:",
          res.status,
          res.statusText,
          data
        );
        setErro(data.error || "Erro ao carregar materiais");
        setMateriais([]);
      } else {
        console.log("[ProfessorMateriais] Materiais carregados:", data);
        setMateriais(Array.isArray(data) ? data : []);

        // Assim que carregar os materiais, busca as respostas de cada um
        await carregarRespostasParaMateriais(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error("[ProfessorMateriais] Erro geral no load():", e);
      setErro("Erro de comunicação com o servidor.");
      setMateriais([]);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // Carregar respostas de todos os materiais
  // ==========================================
  const carregarRespostasParaMateriais = async (listaMateriais) => {
    try {
      setLoadingRespostas(true);
      console.log(
        "[ProfessorMateriais] carregarRespostasParaMateriais lista:",
        listaMateriais
      );

      const mapa = {};

      for (const mat of listaMateriais) {
        const idAtividade = mat.id_material;
        if (!idAtividade) {
          console.warn(
            "[ProfessorMateriais] Material sem id_material, ignorando:",
            mat
          );
          continue;
        }

        const url = `${API_URL}/resposta_atividade/atividade/${idAtividade}`;
        console.log(
          "[ProfessorMateriais] GET respostas para material:",
          idAtividade,
          "->",
          url
        );

        try {
          const res = await fetch(url);
          const contentType = res.headers.get("content-type") || "";

          if (!res.ok) {
            const texto = await res.text();
            console.error(
              "[ProfessorMateriais] Erro HTTP ao carregar respostas de material",
              idAtividade,
              res.status,
              res.statusText,
              "body:",
              texto
            );
            mapa[idAtividade] = [];
            continue;
          }

          if (contentType.includes("application/json")) {
            const respostas = await res.json();
            console.log(
              `[ProfessorMateriais] Respostas do material ${idAtividade}:`,
              respostas
            );
            mapa[idAtividade] = Array.isArray(respostas) ? respostas : [];
          } else {
            const texto = await res.text();
            console.error(
              "[ProfessorMateriais] Respostas não vieram em JSON. Body:",
              texto
            );
            mapa[idAtividade] = [];
          }
        } catch (err) {
          console.error(
            "[ProfessorMateriais] Erro ao buscar respostas do material",
            idAtividade,
            err
          );
          mapa[idAtividade] = [];
        }
      }

      console.log(
        "[ProfessorMateriais] mapa respostasPorMaterial final:",
        mapa
      );
      setRespostasPorMaterial(mapa);
    } finally {
      setLoadingRespostas(false);
    }
  };

  useEffect(() => {
    load();
  }, [idTurma]);

  // ============================
  // Criar novo material
  // ============================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");

    try {
      const url = `${API_URL}/material_aula/turma/${idTurma}`;
      console.log("[ProfessorMateriais] POST criar material:", url, {
        titulo,
        descricao,
        link,
      });

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titulo, descricao, link }),
      });

      const contentType = res.headers.get("content-type") || "";
      let data;

      if (contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const texto = await res.text();
        console.error(
          "[ProfessorMateriais] Resposta não JSON ao criar material:",
          texto
        );
        throw new Error("Resposta inesperada ao criar material.");
      }

      if (!res.ok) {
        console.error(
          "[ProfessorMateriais] Erro HTTP ao criar material:",
          res.status,
          res.statusText,
          data
        );
        setErro(data.error || "Erro ao criar material da turma");
      } else {
        console.log("[ProfessorMateriais] Material criado com sucesso:", data);
        setTitulo("");
        setDescricao("");
        setLink("");
        // Recarrega materiais + respostas
        load();
      }
    } catch (e) {
      console.error("[ProfessorMateriais] Erro geral no handleSubmit():", e);
      setErro("Erro de comunicação com o servidor.");
    }
  };

  const formatarDataHora = (data) => {
    if (!data) return "";
    return new Date(data).toLocaleString("pt-BR");
  };

  if (loading) return <p>Carregando materiais...</p>;

  return (
    <div
      style={{
        padding: "2rem",
        maxWidth: "900px",
        margin: "0 auto",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <h1 style={{ marginBottom: "1.5rem", fontSize: "2rem" }}>
        Materiais – {nomeTurma}
      </h1>

      {erro && (
        <p style={{ color: "red", marginBottom: "1rem" }}>
          <strong>Erro:</strong> {erro}
        </p>
      )}

      {/* Formulário de criação de material */}
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
          marginBottom: "2rem",
          padding: "1rem",
          borderRadius: "0.75rem",
          border: "1px solid #e5e7eb",
          background: "#f9fafb",
        }}
      >
        <h2 style={{ margin: 0, marginBottom: "0.75rem" }}>
          Adicionar novo material
        </h2>

        <div>
          <label
            style={{
              display: "block",
              marginBottom: "0.25rem",
              fontWeight: "500",
            }}
          >
            Título
          </label>
          <input
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            style={{
              width: "100%",
              padding: "0.5rem 0.75rem",
              borderRadius: "0.5rem",
              border: "1px solid #d1d5db",
            }}
          />
        </div>

        <div>
          <label
            style={{
              display: "block",
              marginBottom: "0.25rem",
              fontWeight: "500",
            }}
          >
            Descrição
          </label>
          <textarea
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            rows={3}
            style={{
              width: "100%",
              padding: "0.5rem 0.75rem",
              borderRadius: "0.5rem",
              border: "1px solid #d1d5db",
            }}
          />
        </div>

        <div>
          <label
            style={{
              display: "block",
              marginBottom: "0.25rem",
              fontWeight: "500",
            }}
          >
            Link (Drive, PDF, etc.)
          </label>
          <input
            value={link}
            onChange={(e) => setLink(e.target.value)}
            style={{
              width: "100%",
              padding: "0.5rem 0.75rem",
              borderRadius: "0.5rem",
              border: "1px solid #d1d5db",
            }}
          />
        </div>

        <button
          type="submit"
          style={{
            marginTop: "0.5rem",
            padding: "0.75rem",
            borderRadius: "0.75rem",
            border: "none",
            background: "#1e40af",
            color: "white",
            fontWeight: "600",
            cursor: "pointer",
          }}
          onMouseOver={(e) => (e.target.style.background = "#1d4ed8")}
          onMouseOut={(e) => (e.target.style.background = "#1e40af")}
        >
          Adicionar material
        </button>
      </form>

      {/* Lista de materiais + respostas */}
      <h2 style={{ marginBottom: "0.75rem", fontSize: "1.4rem" }}>
        Materiais cadastrados
      </h2>

      {materiais.length === 0 && <p>Nenhum material cadastrado ainda.</p>}

      {materiais.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {materiais.map((m) => {
            const respostas = respostasPorMaterial[m.id_material] || [];

            return (
              <div
                key={m.id_material}
                style={{
                  padding: "1rem",
                  borderRadius: "0.75rem",
                  border: "1px solid #e5e7eb",
                  background: "white",
                }}
              >
                <div style={{ marginBottom: "0.5rem" }}>
                  <strong>{m.titulo || "Material sem título"}</strong>
                  {m.descricao && (
                    <span style={{ color: "#4b5563" }}> – {m.descricao}</span>
                  )}
                </div>

                {m.link && (
                  <div style={{ marginBottom: "0.5rem" }}>
                    <a
                      href={m.link}
                      target="_blank"
                      rel="noreferrer"
                      style={{ fontSize: "0.9rem", color: "#2563eb" }}
                    >
                      Abrir link/arquivo
                    </a>
                  </div>
                )}

                <div
                  style={{
                    marginTop: "0.5rem",
                    paddingTop: "0.5rem",
                    borderTop: "1px solid #e5e7eb",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "0.25rem",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.9rem",
                        fontWeight: 600,
                        color: "#111827",
                      }}
                    >
                      Respostas dos alunos
                    </span>
                    {loadingRespostas && (
                      <span
                        style={{
                          fontSize: "0.8rem",
                          color: "#6b7280",
                          fontStyle: "italic",
                        }}
                      >
                        Carregando respostas...
                      </span>
                    )}
                  </div>

                  {respostas.length === 0 ? (
                    <p
                      style={{
                        margin: 0,
                        fontSize: "0.85rem",
                        color: "#6b7280",
                      }}
                    >
                      Nenhum aluno enviou resposta para este material ainda.
                    </p>
                  ) : (
                    <ul
                      style={{
                        margin: 0,
                        marginTop: "0.25rem",
                        paddingLeft: "1.1rem",
                        fontSize: "0.85rem",
                        color: "#374151",
                      }}
                    >
                      {respostas.map((r) => (
                        <li key={r.id_resposta} style={{ marginBottom: "0.35rem" }}>
                          <div>
                            <strong>
                              {r.nome_aluno || "Aluno sem nome"}{" "}
                              {r.matricula_aluno
                                ? `(${r.matricula_aluno})`
                                : ""}
                            </strong>
                            {r.data_envio && (
                              <span style={{ color: "#6b7280" }}>
                                {" "}
                                – {formatarDataHora(r.data_envio)}
                              </span>
                            )}
                            {r.atrasada ? (
                              <span
                                style={{
                                  marginLeft: "0.5rem",
                                  color: "#b91c1c",
                                  fontWeight: 600,
                                  fontSize: "0.8rem",
                                }}
                              >
                                (ATRASADA)
                              </span>
                            ) : null}
                          </div>
                          {r.conteudo_resposta && (
                            <div style={{ marginTop: "0.1rem" }}>
                              {r.conteudo_resposta}
                            </div>
                          )}
                          {r.caminho_arquivo && (
                            <div style={{ marginTop: "0.1rem" }}>
                              <a
                                href={r.caminho_arquivo}
                                target="_blank"
                                rel="noreferrer"
                                style={{ color: "#2563eb" }}
                              >
                                Ver arquivo enviado
                              </a>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
