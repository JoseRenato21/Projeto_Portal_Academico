// src/pages/AlunoMateriaisPage.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

const API_URL = "http://localhost:3001";

export default function AlunoMateriaisPage() {
  const { user } = useAuth();
  const idAluno = user?.id_usuario;

  const [turmas, setTurmas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  // ---- estado do modal de resposta ----
  const [modalAberto, setModalAberto] = useState(false);
  const [turmaSelecionada, setTurmaSelecionada] = useState(null);
  const [materialSelecionado, setMaterialSelecionado] = useState(null);
  const [respostaTexto, setRespostaTexto] = useState("");
  const [salvandoResposta, setSalvandoResposta] = useState(false);
  const [erroResposta, setErroResposta] = useState(null);
  const [msgResposta, setMsgResposta] = useState(null);

  // ============================
  // CARREGAR TURMAS + MATERIAIS
  // ============================
  useEffect(() => {
    if (!idAluno) {
      console.log("[AlunoMateriais] idAluno não definido, abortando fetch.");
      return;
    }

    async function carregar() {
      try {
        setLoading(true);
        setErro(null);

        console.log("[AlunoMateriais] idAluno atual:", idAluno);

        // AGORA via resposta_atividade (listar turmas do aluno)
        const urlTurmas = `${API_URL}/resposta_atividade/aluno/${idAluno}/turmas`;
        console.log("[AlunoMateriais] GET turmas do aluno:", urlTurmas);

        const resTurmas = await fetch(urlTurmas);

        console.log(
          "[AlunoMateriais] Res turmas -> status:",
          resTurmas.status,
          resTurmas.statusText
        );

        const contentTypeTurmas = resTurmas.headers.get("content-type") || "";
        console.log(
          "[AlunoMateriais] content-type turmas:",
          contentTypeTurmas
        );

        if (!resTurmas.ok) {
          const texto = await resTurmas.text();
          console.error(
            "[AlunoMateriais] Erro HTTP turmas",
            resTurmas.status,
            resTurmas.statusText,
            "body:",
            texto
          );
          throw new Error("Erro ao carregar suas turmas.");
        }

        if (!contentTypeTurmas.includes("application/json")) {
          const texto = await resTurmas.text();
          console.error(
            "[AlunoMateriais] Turmas não vieram em JSON. Body:",
            texto
          );
          throw new Error("Resposta inesperada ao carregar turmas.");
        }

        const turmasAluno = await resTurmas.json();
        console.log("[AlunoMateriais] turmas do aluno (JSON):", turmasAluno);

        if (!Array.isArray(turmasAluno) || turmasAluno.length === 0) {
          console.log(
            "[AlunoMateriais] Nenhuma turma encontrada para esse aluno."
          );
          setTurmas([]);
          setLoading(false);
          return;
        }

        const turmasComMateriais = [];

        for (const turma of turmasAluno) {
          const id_turma = turma.id_turma;

          if (!id_turma) {
            console.warn(
              "[AlunoMateriais] Turma sem id_turma, ignorando:",
              turma
            );
            continue;
          }

          const urlMateriais = `${API_URL}/material_aula/turma/${id_turma}`;
          console.log(
            "[AlunoMateriais] GET materiais da turma:",
            urlMateriais
          );

          try {
            const resMat = await fetch(urlMateriais);
            const contentTypeMat =
              resMat.headers.get("content-type") || "";

            console.log(
              "[AlunoMateriais] Res materiais -> status:",
              resMat.status,
              resMat.statusText,
              "content-type:",
              contentTypeMat
            );

            if (!resMat.ok) {
              const texto = await resMat.text();
              console.error(
                "[AlunoMateriais] Erro HTTP materiais",
                resMat.status,
                resMat.statusText,
                "body:",
                texto
              );
              continue;
            }

            let materiais = [];
            if (contentTypeMat.includes("application/json")) {
              materiais = await resMat.json();
              console.log(
                `[AlunoMateriais] Materiais da turma ${id_turma}:`,
                materiais
              );
            } else {
              const texto = await resMat.text();
              console.error(
                "[AlunoMateriais] Materiais não vieram em JSON. Body:",
                texto
              );
            }

            if (Array.isArray(materiais) && materiais.length > 0) {
              turmasComMateriais.push({
                ...turma,
                materiais,
              });
            }
          } catch (err) {
            console.error(
              "[AlunoMateriais] Erro ao buscar materiais da turma",
              id_turma,
              err
            );
          }
        }

        console.log(
          "[AlunoMateriais] turmasComMateriais final:",
          turmasComMateriais
        );
        setTurmas(turmasComMateriais);
      } catch (err) {
        console.error("[AlunoMateriais] Erro geral no carregar():", err);
        setErro(err.message || "Erro ao carregar materiais.");
      } finally {
        setLoading(false);
      }
    }

    carregar();
  }, [idAluno]);

  const formatarData = (data) => {
    if (!data) return "";
    return new Date(data).toLocaleString("pt-BR");
  };

  // ============================
  // MODAL DE RESPOSTA
  // ============================

  async function abrirModalResponder(turma, material) {
    try {
      console.log(
        "[AlunoMateriais] abrirModalResponder turma=",
        turma,
        "material=",
        material
      );
      setTurmaSelecionada(turma);
      setMaterialSelecionado(material);
      setErroResposta(null);
      setMsgResposta(null);
      setRespostaTexto("");
      setModalAberto(true);

      // usamos id_atividade = id_material (nome feio, mas funciona)
      const idAtividade = material.id_material;
      const urlGetResposta = `${API_URL}/resposta_atividade/atividade/${idAtividade}/aluno/${idAluno}`;
      console.log(
        "[AlunoMateriais] GET resposta existente:",
        urlGetResposta
      );

      const res = await fetch(urlGetResposta);
      const contentType = res.headers.get("content-type") || "";

      console.log(
        "[AlunoMateriais] Res GET resposta -> status:",
        res.status,
        res.statusText,
        "content-type:",
        contentType
      );

      if (!res.ok) {
        const texto = await res.text();
        console.error(
          "[AlunoMateriais] Erro HTTP ao buscar resposta:",
          res.status,
          res.statusText,
          "body:",
          texto
        );
        // não travamos o modal, só mostra vazio
        return;
      }

      if (contentType.includes("application/json")) {
        const resposta = await res.json();
        console.log("[AlunoMateriais] Resposta existente:", resposta);
        if (resposta && resposta.conteudo_resposta) {
          setRespostaTexto(resposta.conteudo_resposta);
        }
      } else {
        const texto = await res.text();
        console.error(
          "[AlunoMateriais] Resposta não veio em JSON. Body:",
          texto
        );
      }
    } catch (err) {
      console.error(
        "[AlunoMateriais] Erro ao abrir modal/buscar resposta:",
        err
      );
    }
  }

  function fecharModalResponder() {
    setModalAberto(false);
    setTurmaSelecionada(null);
    setMaterialSelecionado(null);
    setRespostaTexto("");
    setErroResposta(null);
    setMsgResposta(null);
  }

  async function enviarResposta(e) {
    e.preventDefault();
    if (!materialSelecionado || !idAluno) return;

    try {
      setSalvandoResposta(true);
      setErroResposta(null);
      setMsgResposta(null);

      const idAtividade = materialSelecionado.id_material;
      const urlPost = `${API_URL}/resposta_atividade`;
      console.log("[AlunoMateriais] POST resposta:", urlPost, {
        id_atividade: idAtividade,
        id_aluno: idAluno,
        conteudo_resposta: respostaTexto,
      });

      const res = await fetch(urlPost, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_atividade: idAtividade,
          id_aluno: idAluno,
          conteudo_resposta: respostaTexto,
          caminho_arquivo: null,
        }),
      });

      const contentType = res.headers.get("content-type") || "";
      console.log(
        "[AlunoMateriais] Res POST resposta -> status:",
        res.status,
        res.statusText,
        "content-type:",
        contentType
      );

      let body;
      if (contentType.includes("application/json")) {
        body = await res.json();
      } else {
        body = await res.text();
      }
      console.log("[AlunoMateriais] Body POST resposta:", body);

      if (!res.ok) {
        const msg =
          (body && body.error) ||
          (typeof body === "string" ? body : "Erro ao enviar resposta.");
        throw new Error(msg);
      }

      const msg =
        (body && body.message) ||
        "Resposta enviada/atualizada com sucesso.";
      setMsgResposta(msg);
    } catch (err) {
      console.error("[AlunoMateriais] Erro ao enviar resposta:", err);
      setErroResposta(err.message || "Erro ao enviar resposta.");
    } finally {
      setSalvandoResposta(false);
    }
  }

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        body { font-family: system-ui, -apple-system, sans-serif; background: #f5f5f5; }
        .container { max-width: 1000px; margin: 0 auto; padding: 1.5rem; }
        .header { margin-bottom: 2rem; }
        .header h1 { margin: 0 0 0.5rem 0; font-size: 1.8rem; font-weight: 700; color: #111827; }
        .header p { margin: 0; color: #6b7280; font-size: 1rem; }
        .card { background: white; border-radius: 0.75rem; padding: 1.25rem 1.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.08); margin-bottom: 1.5rem; }
        .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
        .card-title { font-size: 1.1rem; font-weight: 600; color: #111827; margin: 0; }
        .card-sub { font-size: 0.85rem; color: #6b7280; margin: 0.15rem 0 0 0; }
        .badge { display: inline-block; padding: 0.25rem 0.6rem; border-radius: 999px; font-size: 0.75rem; font-weight: 600; background: #dbeafe; color: #1e40af; }
        .materiais-list { margin-top: 0.75rem; border-top: 1px solid #e5e7eb; padding-top: 0.75rem; }
        .material-item { padding: 0.6rem 0; border-bottom: 1px solid #f3f4f6; }
        .material-item:last-child { border-bottom: none; }
        .material-title { font-size: 0.95rem; font-weight: 600; color: #111827; margin: 0 0 0.25rem 0; }
        .material-meta { font-size: 0.8rem; color: #6b7280; margin: 0 0 0.25rem 0; }
        .material-desc { font-size: 0.85rem; color: #374151; margin: 0; }
        .material-actions { margin-top: 0.4rem; display: flex; gap: 0.5rem; flex-wrap: wrap; }
        .btn { padding: 0.4rem 0.8rem; border-radius: 0.5rem; border: none; cursor: pointer; font-size: 0.8rem; font-weight: 500; }
        .btn-link { background: #f3f4f6; color: #111827; }
        .btn-link:hover { background: #e5e7eb; }
        .btn-primary { background: #2563eb; color: white; }
        .btn-primary:hover { background: #1d4ed8; }
        .empty { background: white; border-radius: 0.75rem; padding: 1.5rem; text-align: center; color: #6b7280; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
        .error { background: #fee2e2; color: #991b1b; padding: 0.75rem; border-radius: 0.5rem; margin-bottom: 1rem; font-size: 0.9rem; }
        .p-center { text-align: center; color: #666; }

        /* MODAL */
        .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 999; }
        .modal-content { background: white; padding: 1.5rem; border-radius: 0.75rem; width: 100%; max-width: 600px; box-shadow: 0 20px 25px rgba(0,0,0,0.15); max-height: 90vh; overflow-y: auto; }
        .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
        .modal-title { font-size: 1.2rem; font-weight: 600; margin: 0; }
        .modal-close { background: none; border: none; font-size: 1.4rem; cursor: pointer; color: #9ca3af; }
        .modal-close:hover { color: #4b5563; }
        .modal-body { font-size: 0.9rem; color: #374151; }
        .modal-footer { margin-top: 1rem; display: flex; justify-content: flex-end; gap: 0.5rem; }
        .textarea-resposta { width: 100%; min-height: 120px; padding: 0.75rem; border-radius: 0.5rem; border: 1px solid #d1d5db; font-family: inherit; font-size: 0.9rem; resize: vertical; }
        .textarea-resposta:focus { outline: none; border-color: #2563eb; box-shadow: 0 0 0 1px #2563eb33; }
        .msg-ok { background: #ecfdf5; color: #166534; padding: 0.5rem 0.75rem; border-radius: 0.5rem; font-size: 0.85rem; margin-top: 0.5rem; }
        .msg-erro { background: #fee2e2; color: #991b1b; padding: 0.5rem 0.75rem; border-radius: 0.5rem; font-size: 0.85rem; margin-top: 0.5rem; }
      `}</style>

      <div className="container">
        <div className="header">
          <h1> Materiais e Atividades</h1>
          <p>Veja os materiais publicados nas turmas em que você está matriculado</p>
        </div>

        {loading && <p className="p-center">Carregando turmas e materiais...</p>}

        {erro && <div className="error">{erro}</div>}

        {!loading && !erro && turmas.length === 0 && (
          <div className="empty">
            <p>
              Nenhuma das suas turmas possui materiais publicados até o momento.
            </p>
          </div>
        )}

        {!loading &&
          !erro &&
          turmas.map((turma) => (
            <div className="card" key={turma.id_aluno_curso}>
              <div className="card-header">
                <div>
                  <h3 className="card-title">
                    {turma.nome_curso || "Curso sem nome"} —{" "}
                    {turma.nome_turma || "Turma sem nome"}
                  </h3>
                  <p className="card-sub">
                    {turma.nome_periodo
                      ? `Período: ${turma.nome_periodo}`
                      : null}
                    {turma.codigo_turma
                      ? ` • Código: ${turma.codigo_turma}`
                      : null}
                  </p>
                </div>
                <span className="badge">
                  {turma.materiais?.length || 0} material
                  {turma.materiais?.length === 1 ? "" : "is"}
                </span>
              </div>

              <div className="materiais-list">
                {turma.materiais.map((mat) => (
                  <div className="material-item" key={mat.id_material}>
                    <p className="material-title">
                      {mat.titulo || "Material sem título"}
                    </p>
                    <p className="material-meta">
                      {mat.tipo ? `Tipo: ${mat.tipo}` : "Tipo: não informado"}
                      {mat.data_publicacao && " • Publicado em "}
                      {mat.data_publicacao && formatarData(mat.data_publicacao)}
                    </p>
                    {mat.descricao && (
                      <p className="material-desc">{mat.descricao}</p>
                    )}

                    <div className="material-actions">
                      {mat.caminho_arquivo && (
                        <a
                          href={mat.caminho_arquivo}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <button className="btn btn-link">
                            Abrir arquivo / link
                          </button>
                        </a>
                      )}
                      <button
                        className="btn btn-primary"
                        onClick={() => abrirModalResponder(turma, mat)}
                      >
                        Responder atividade
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
      </div>

      {/* MODAL DE RESPOSTA */}
      {modalAberto && materialSelecionado && (
        <div
          className="modal-backdrop"
          onClick={fecharModalResponder}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2 className="modal-title">Responder atividade</h2>
              <button
                className="modal-close"
                onClick={fecharModalResponder}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <p style={{ marginBottom: "0.5rem", fontWeight: 600 }}>
                {materialSelecionado.titulo || "Material sem título"}
              </p>
              {turmaSelecionada && (
                <p style={{ marginTop: 0, marginBottom: "0.75rem", fontSize: "0.85rem", color: "#6b7280" }}>
                  Turma: {turmaSelecionada.nome_turma} (
                  {turmaSelecionada.codigo_turma}) —{" "}
                  {turmaSelecionada.nome_curso}
                </p>
              )}
              {materialSelecionado.descricao && (
                <p
                  style={{
                    marginTop: 0,
                    marginBottom: "0.75rem",
                    fontSize: "0.85rem",
                    color: "#4b5563",
                  }}
                >
                  {materialSelecionado.descricao}
                </p>
              )}

              <form onSubmit={enviarResposta}>
                <label
                  htmlFor="resposta"
                  style={{
                    display: "block",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    marginBottom: "0.35rem",
                  }}
                >
                  Sua resposta:
                </label>
                <textarea
                  id="resposta"
                  className="textarea-resposta"
                  value={respostaTexto}
                  onChange={(e) => setRespostaTexto(e.target.value)}
                  placeholder="Digite aqui sua resposta para esta atividade..."
                />

                {erroResposta && (
                  <div className="msg-erro">{erroResposta}</div>
                )}
                {msgResposta && (
                  <div className="msg-ok">{msgResposta}</div>
                )}

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-link"
                    onClick={fecharModalResponder}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={salvandoResposta}
                  >
                    {salvandoResposta ? "Enviando..." : "Enviar resposta"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
