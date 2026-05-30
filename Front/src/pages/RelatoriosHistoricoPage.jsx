// src/pages/RelatoriosHistoricoPage.jsx
import { useEffect, useState } from "react";

const API_BASE = "http://localhost:3001";

export default function RelatoriosHistoricoPage() {
  const [aba, setAba] = useState("historico");

  const [graduacoes, setGraduacoes] = useState([]);
  const [codigoGraduacao, setCodigoGraduacao] = useState("");

  const [idAluno, setIdAluno] = useState(""); // agora é o campo de busca (id ou matrícula)

  const [historicoAluno, setHistoricoAluno] = useState([]);
  const [alunosPorTurma, setAlunosPorTurma] = useState([]);
  const [mediasPorTurma, setMediasPorTurma] = useState([]);
  const [alunosAbaixoMedia, setAlunosAbaixoMedia] = useState([]);
  const [professorMaisTurmas, setProfessorMaisTurmas] = useState(null);
  const [top3Turmas, setTop3Turmas] = useState([]);

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  // ================= CARREGAR GRADUAÇÕES =================
  useEffect(() => {
    carregarGraduacoes();
  }, []);

  const carregarGraduacoes = async () => {
    try {
      console.log("[RelatoriosHistoricoPage] Carregando graduações...");
      const response = await fetch(`${API_BASE}/graduacao`);
      const data = await response.json();

      if (data.error) {
        console.error(
          "[RelatoriosHistoricoPage] Erro ao carregar graduações:",
          data.error
        );
        setErro(data.error);
        return;
      }

      console.log(
        "[RelatoriosHistoricoPage] Graduações carregadas:",
        data.length
      );
      setGraduacoes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(
        "[RelatoriosHistoricoPage] Erro fetch graduações:",
        error
      );
      setErro("Erro ao carregar graduações");
    }
  };

  // ================= BUSCAS =================

  // 1) Histórico de um aluno (pega pelo que o usuário digitar: id ou matrícula)
  const buscarHistoricoAluno = async () => {
    if (!idAluno.trim()) {
      setErro("Digite o ID ou a matrícula do aluno");
      return;
    }

    setLoading(true);
    setErro("");

    try {
      console.log(
        "[RelatoriosHistoricoPage] Buscando histórico do aluno (identificador):",
        idAluno
      );
      const response = await fetch(
        `${API_BASE}/historico_aluno/aluno/${encodeURIComponent(idAluno.trim())}`
      );
      const data = await response.json();

      if (data.error) {
        setErro(data.error);
        setHistoricoAluno([]);
        return;
      }

      console.log(
        "[RelatoriosHistoricoPage] Histórico encontrado:",
        Array.isArray(data) ? data.length : 0,
        "registros"
      );
      setHistoricoAluno(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(
        "[RelatoriosHistoricoPage] Erro fetch histórico:",
        error
      );
      setErro("Erro ao buscar histórico do aluno");
    } finally {
      setLoading(false);
    }
  };

  // 2.1 - Quantidade de alunos por turma
  const buscarAlunosPorTurma = async () => {
    if (!codigoGraduacao) {
      setErro("Selecione uma graduação");
      return;
    }

    setLoading(true);
    setErro("");

    try {
      console.log(
        "[RelatoriosHistoricoPage] Buscando quantidade por turma, graduação:",
        codigoGraduacao
      );
      const response = await fetch(
        `${API_BASE}/historico_aluno/quantidade-por-turma/graduacao/${codigoGraduacao}`
      );
      const data = await response.json();

      if (data.error) {
        setErro(data.error);
        setAlunosPorTurma([]);
        return;
      }

      console.log("[RelatoriosHistoricoPage] Turmas encontradas:", data.length);
      setAlunosPorTurma(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(
        "[RelatoriosHistoricoPage] Erro fetch quantidade:",
        error
      );
      setErro("Erro ao buscar quantidade de alunos por turma");
    } finally {
      setLoading(false);
    }
  };

  // 2.2 - Média geral por turma
  const buscarMediasPorTurma = async () => {
    if (!codigoGraduacao) {
      setErro("Selecione uma graduação");
      return;
    }

    setLoading(true);
    setErro("");

    try {
      console.log(
        "[RelatoriosHistoricoPage] Buscando médias por turma, graduação:",
        codigoGraduacao
      );
      const response = await fetch(
        `${API_BASE}/historico_aluno/media-por-turma/graduacao/${codigoGraduacao}`
      );
      const data = await response.json();

      if (data.error) {
        setErro(data.error);
        setMediasPorTurma([]);
        return;
      }

      console.log("[RelatoriosHistoricoPage] Médias encontradas:", data.length);
      setMediasPorTurma(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("[RelatoriosHistoricoPage] Erro fetch médias:", error);
      setErro("Erro ao buscar médias por turma");
    } finally {
      setLoading(false);
    }
  };

  // 2.3 - Alunos abaixo da média
  const buscarAlunosAbaixoMedia = async () => {
    if (!codigoGraduacao) {
      setErro("Selecione uma graduação");
      return;
    }

    setLoading(true);
    setErro("");

    try {
      console.log(
        "[RelatoriosHistoricoPage] Buscando alunos abaixo da média, graduação:",
        codigoGraduacao
      );
      const response = await fetch(
        `${API_BASE}/historico_aluno/abaixo-media/graduacao/${codigoGraduacao}`
      );
      const data = await response.json();

      if (data.error) {
        setErro(data.error);
        setAlunosAbaixoMedia([]);
        return;
      }

      console.log(
        "[RelatoriosHistoricoPage] Alunos abaixo da média:",
        data.length
      );
      setAlunosAbaixoMedia(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(
        "[RelatoriosHistoricoPage] Erro fetch abaixo média:",
        error
      );
      setErro("Erro ao buscar alunos abaixo da média");
    } finally {
      setLoading(false);
    }
  };

  // 2.5 - Professor com mais turmas
  const buscarProfessorMaisTurmas = async () => {
    if (!codigoGraduacao) {
      setErro("Selecione uma graduação");
      return;
    }

    setLoading(true);
    setErro("");

    try {
      console.log(
        "[RelatoriosHistoricoPage] Buscando professor com mais turmas, graduação:",
        codigoGraduacao
      );
      const response = await fetch(
        `${API_BASE}/historico_aluno/professor-mais-turmas/graduacao/${codigoGraduacao}`
      );
      const data = await response.json();

      if (data.error) {
        setErro(data.error);
        setProfessorMaisTurmas(null);
        return;
      }

      console.log("[RelatoriosHistoricoPage] Professor encontrado:", data);
      setProfessorMaisTurmas(data);
    } catch (error) {
      console.error(
        "[RelatoriosHistoricoPage] Erro fetch professor mais turmas:",
        error
      );
      setErro("Erro ao buscar professor com mais turmas");
    } finally {
      setLoading(false);
    }
  };

  // 2.6 - Top 3 turmas
  const buscarTop3Turmas = async () => {
    if (!codigoGraduacao) {
      setErro("Selecione uma graduação");
      return;
    }

    setLoading(true);
    setErro("");

    try {
      console.log(
        "[RelatoriosHistoricoPage] Buscando top 3 turmas, graduação:",
        codigoGraduacao
      );
      const response = await fetch(
        `${API_BASE}/historico_aluno/top3-turmas/graduacao/${codigoGraduacao}`
      );
      const data = await response.json();

      if (data.error) {
        setErro(data.error);
        setTop3Turmas([]);
        return;
      }

      console.log("[RelatoriosHistoricoPage] Top 3 turmas:", data.length);
      setTop3Turmas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("[RelatoriosHistoricoPage] Erro fetch top 3:", error);
      setErro("Erro ao buscar top 3 turmas");
    } finally {
      setLoading(false);
    }
  };

  // ================= TROCAR ABA =================
  const trocarAba = (novaAba) => {
    setAba(novaAba);
    setErro("");
    setHistoricoAluno([]);
    setAlunosPorTurma([]);
    setMediasPorTurma([]);
    setAlunosAbaixoMedia([]);
    setProfessorMaisTurmas(null);
    setTop3Turmas([]);
  };

  const abas = [
    { id: "historico", label: "Histórico Aluno" },
    { id: "alunosPorTurma", label: "Alunos por Turma" },
    { id: "mediasPorTurma", label: "Médias por Turma" },
    { id: "abaixoMedia", label: "Abaixo da Média" },
    { id: "professorMaisTurmas", label: "Prof. Mais Turmas" },
    { id: "top3", label: "Top 3 Turmas" },
  ];

  return (
    <div
      className="relatorios-container"
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "24px",
        fontFamily:
          "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif",
        background: "#f8fafc",
        minHeight: "100vh",
      }}
    >
      <style>{`
        * { box-sizing: border-box; }
        body { font-family: system-ui, -apple-system, sans-serif; background: #f5f5f5; }
        .header { margin-bottom: 1.5rem; }
        .header h1 { margin: 0; font-size: 1.5rem; font-weight: 700; }
        .header p { margin: 0.25rem 0 0 0; color: #666; font-size: 0.95rem; }
        .card { background: white; border-radius: 0.75rem; padding: 1.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
        .error { background: #fee2e2; color: #991b1b; padding: 0.75rem; border-radius: 0.5rem; margin-bottom: 1rem; font-size: 0.9rem; }
        .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin-bottom: 1rem; }
        .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
        .form-group label { font-weight: 500; font-size: 0.9rem; }
        .form-group input, .form-group select { padding: 0.5rem; border: 1px solid #ddd; border-radius: 0.5rem; font-size: 0.9rem; font-family: inherit; }
        .btn { padding: 0.6rem 1rem; border: none; border-radius: 0.5rem; cursor: pointer; font-size: 0.9rem; font-weight: 500; }
        .btn-primary { background: #2563eb; color: white; flex: 1; }
        .btn-primary:hover { background: #1d4ed8; }
        .btn:disabled { opacity: 0.6; cursor: not-allowed; }
        table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
        th { background: #f9fafb; border-bottom: 2px solid #e5e7eb; padding: 0.75rem; text-align: left; font-weight: 600; color: #666; font-size: 0.75rem; text-transform: uppercase; }
        td { padding: 0.75rem; border-bottom: 1px solid #e5e7eb; }
        tr:nth-child(even) { background: #f9fafb; }
        tr:hover { background: #f3f4f6; }
        .badge { display: inline-block; padding: 0.25rem 0.5rem; border-radius: 999px; font-size: 0.75rem; font-weight: 600; }
        .badge-active { background: #dcfce7; color: #166534; }
        .badge-inactive { background: #f3f4f6; color: #666; }
        .overflow-x { overflow-x: auto; }
        .media-baixa { color: #dc2626; font-weight: 700; }
        .media-alta { color: #166534; font-weight: 700; }
        .loading-msg { text-align: center; color: #666; padding: 32px; }
        .sem-dados { text-align: center; color: #999; padding: 48px; }
      `}</style>

      <div className="header">
        <h1>📊 Relatórios e Histórico Acadêmico</h1>
        <p>Consulte informações detalhadas sobre alunos, turmas e desempenho acadêmico</p>
      </div>

      {/* Abas */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "24px",
          flexWrap: "wrap",
        }}
      >
        {abas.map((item) => (
          <button
            key={item.id}
            style={{
              padding: "10px 16px",
              border: aba === item.id ? "2px solid #2563eb" : "2px solid #ddd",
              background: aba === item.id ? "#2563eb" : "white",
              color: aba === item.id ? "white" : "#333",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: 500,
            }}
            onClick={() => trocarAba(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="card">
        {erro && <div className="error">{erro}</div>}

        {/* ================= ABA: HISTÓRICO ALUNO ================= */}
        {aba === "historico" && (
          <div>
            <h2>Histórico de um Aluno</h2>
            <div className="form-grid">
              <div className="form-group" style={{ maxWidth: "400px" }}>
                <label>ID ou Matrícula do Aluno *</label>
                <input
                  type="text"
                  value={idAluno}
                  onChange={(e) => setIdAluno(e.target.value)}
                  placeholder="Digite o ID ou a matrícula do aluno"
                />
              </div>
            </div>

            <button
              className="btn btn-primary"
              onClick={buscarHistoricoAluno}
              disabled={loading || !idAluno.trim()}
            >
              {loading ? "Buscando..." : "Buscar Histórico"}
            </button>

            {loading && (
              <div className="loading-msg">Carregando histórico...</div>
            )}
            {!loading && historicoAluno.length === 0 && (
              <div className="sem-dados">
                Digite o identificador do aluno (ID ou matrícula) e clique em{" "}
                <strong>Buscar Histórico</strong>.
              </div>
            )}
            {!loading && historicoAluno.length > 0 && (
              <div className="overflow-x" style={{ marginTop: "20px" }}>
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Aluno</th>
                      <th>Matrícula</th>
                      <th>Curso</th>
                      <th>Turma</th>
                      <th>Média Final</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historicoAluno.map((h) => (
                      <tr key={h.id_historico}>
                        <td>{h.id_historico}</td>
                        <td>{h.nome_aluno}</td>
                        <td>{h.matricula}</td>
                        <td>{h.nome_curso}</td>
                        <td>{h.nome_turma}</td>
                        <td
                          className={
                            h.media_final < 5 ? "media-baixa" : "media-alta"
                          }
                        >
                          {h.media_final !== null &&
                          h.media_final !== undefined
                            ? Number(h.media_final).toFixed(2)
                            : "-"}
                        </td>
                        <td>{h.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ================= ABA: ALUNOS POR TURMA ================= */}
        {aba === "alunosPorTurma" && (
          <div>
            <h2>Quantidade de Alunos por Turma</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Graduação *</label>
                <select
                  value={codigoGraduacao}
                  onChange={(e) => setCodigoGraduacao(e.target.value)}
                >
                  <option value="">-- Selecione a Graduação --</option>
                  {graduacoes.map((g) => (
                    <option
                      key={g.codigo_graduacao}
                      value={g.codigo_graduacao}
                    >
                      {g.nome_graduacao || g.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              className="btn btn-primary"
              onClick={buscarAlunosPorTurma}
              disabled={loading || !codigoGraduacao}
            >
              {loading ? "Buscando..." : "Buscar"}
            </button>

            {loading && (
              <div className="loading-msg">Carregando dados...</div>
            )}
            {!loading && alunosPorTurma.length === 0 && (
              <div className="sem-dados">
                Selecione uma graduação para visualizar a quantidade de alunos por turma.
              </div>
            )}
            {!loading && alunosPorTurma.length > 0 && (
              <div className="overflow-x" style={{ marginTop: "20px" }}>
                <table>
                  <thead>
                    <tr>
                      <th>ID Turma</th>
                      <th>Nome da Turma</th>
                      <th>Código da Turma</th>
                      <th>Status Inscrições</th>
                      <th>Total de Alunos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {alunosPorTurma.map((t) => (
                      <tr key={t.id_turma}>
                        <td>{t.id_turma}</td>
                        <td>{t.nome_turma}</td>
                        <td>{t.codigo_turma}</td>
                        <td>
                          <span
                            className={`badge badge-${
                              t.status_inscricoes === "aberta"
                                ? "active"
                                : "inactive"
                            }`}
                          >
                            {t.status_inscricoes}
                          </span>
                        </td>
                        <td>
                          <strong>{t.total_alunos || 0}</strong>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ================= ABA: MÉDIAS POR TURMA ================= */}
        {aba === "mediasPorTurma" && (
          <div>
            <h2>Médias por Turma</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Graduação *</label>
                <select
                  value={codigoGraduacao}
                  onChange={(e) => setCodigoGraduacao(e.target.value)}
                >
                  <option value="">-- Selecione a Graduação --</option>
                  {graduacoes.map((g) => (
                    <option
                      key={g.codigo_graduacao}
                      value={g.codigo_graduacao}
                    >
                      {g.nome_graduacao || g.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              className="btn btn-primary"
              onClick={buscarMediasPorTurma}
              disabled={loading || !codigoGraduacao}
            >
              {loading ? "Buscando..." : "Buscar"}
            </button>

            {loading && (
              <div className="loading-msg">Carregando dados...</div>
            )}
            {!loading && mediasPorTurma.length === 0 && (
              <div className="sem-dados">
                Selecione uma graduação para visualizar as médias por turma.
              </div>
            )}
            {!loading && mediasPorTurma.length > 0 && (
              <div className="overflow-x" style={{ marginTop: "20px" }}>
                <table>
                  <thead>
                    <tr>
                      <th>ID Turma</th>
                      <th>Nome da Turma</th>
                      <th>Código da Turma</th>
                      <th>Status Inscrições</th>
                      <th>Qtd Alunos</th>
                      <th>Média Geral</th>
                      <th>Mínima</th>
                      <th>Máxima</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mediasPorTurma.map((t) => (
                      <tr key={t.id_turma}>
                        <td>{t.id_turma}</td>
                        <td>{t.nome_turma}</td>
                        <td>{t.codigo_turma}</td>
                        <td>
                          <span
                            className={`badge badge-${
                              t.status_inscricoes === "aberta"
                                ? "active"
                                : "inactive"
                            }`}
                          >
                            {t.status_inscricoes}
                          </span>
                        </td>
                        <td>{t.qtd_alunos || 0}</td>
                        <td
                          className={
                            t.media_geral > 7
                              ? "media-alta"
                              : t.media_geral < 5
                              ? "media-baixa"
                              : ""
                          }
                        >
                          {t.media_geral !== null &&
                          t.media_geral !== undefined
                            ? Number(t.media_geral).toFixed(2)
                            : "-"}
                        </td>
                        <td>
                          {t.media_minima !== null &&
                          t.media_minima !== undefined
                            ? Number(t.media_minima).toFixed(2)
                            : "-"}
                        </td>
                        <td>
                          {t.media_maxima !== null &&
                          t.media_maxima !== undefined
                            ? Number(t.media_maxima).toFixed(2)
                            : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ================= ABA: ABAIXO DA MÉDIA ================= */}
        {aba === "abaixoMedia" && (
          <div>
            <h2>Alunos Abaixo da Média</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Graduação *</label>
                <select
                  value={codigoGraduacao}
                  onChange={(e) => setCodigoGraduacao(e.target.value)}
                >
                  <option value="">-- Selecione a Graduação --</option>
                  {graduacoes.map((g) => (
                    <option
                      key={g.codigo_graduacao}
                      value={g.codigo_graduacao}
                    >
                      {g.nome_graduacao || g.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              className="btn btn-primary"
              onClick={buscarAlunosAbaixoMedia}
              disabled={loading || !codigoGraduacao}
            >
              {loading ? "Buscando..." : "Buscar"}
            </button>

            {loading && (
              <div className="loading-msg">Carregando dados...</div>
            )}
            {!loading && alunosAbaixoMedia.length === 0 && (
              <div className="sem-dados">
                Selecione uma graduação para visualizar os alunos com média abaixo
                de 5.
              </div>
            )}
            {!loading && alunosAbaixoMedia.length > 0 && (
              <div className="overflow-x" style={{ marginTop: "20px" }}>
                <table>
                  <thead>
                    <tr>
                      <th>ID Aluno</th>
                      <th>Nome do Aluno</th>
                      <th>Matrícula</th>
                      <th>Turma</th>
                      <th>Código Turma</th>
                      <th>Status Inscrições</th>
                      <th>Média Final</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {alunosAbaixoMedia.map((a) => (
                      <tr key={`${a.id_aluno}-${a.id_turma}`}>
                        <td>{a.id_aluno}</td>
                        <td>{a.nome_aluno}</td>
                        <td>{a.matricula}</td>
                        <td>{a.nome_turma}</td>
                        <td>{a.codigo_turma}</td>
                        <td>{a.status_inscricoes}</td>
                        <td className="media-baixa">
                          {a.media_final !== null &&
                          a.media_final !== undefined
                            ? Number(a.media_final).toFixed(2)
                            : "-"}
                        </td>
                        <td>{a.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ================= ABA: PROFESSOR MAIS TURMAS ================= */}
        {aba === "professorMaisTurmas" && (
          <div>
            <h2>Professor com Maior Número de Turmas Ativas</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Graduação *</label>
                <select
                  value={codigoGraduacao}
                  onChange={(e) => setCodigoGraduacao(e.target.value)}
                >
                  <option value="">-- Selecione a Graduação --</option>
                  {graduacoes.map((g) => (
                    <option
                      key={g.codigo_graduacao}
                      value={g.codigo_graduacao}
                    >
                      {g.nome_graduacao || g.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              className="btn btn-primary"
              onClick={buscarProfessorMaisTurmas}
              disabled={loading || !codigoGraduacao}
            >
              {loading ? "Buscando..." : "Buscar"}
            </button>

            {loading && (
              <div className="loading-msg">Carregando dados...</div>
            )}
            {!loading && !professorMaisTurmas && (
              <div className="sem-dados">
                Selecione uma graduação para descobrir o professor com mais turmas
                ativas.
              </div>
            )}
            {!loading && professorMaisTurmas && (
              <div style={{ padding: "24px", textAlign: "center" }}>
                <div
                  style={{
                    background:
                      "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
                    borderRadius: "12px",
                    padding: "24px",
                    color: "white",
                    maxWidth: "400px",
                    margin: "0 auto",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                >
                  <h3
                    style={{
                      margin: "0 0 12px 0",
                      fontSize: "14px",
                      textTransform: "uppercase",
                    }}
                  >
                    🏆 Professor Destaque
                  </h3>
                  <div
                    style={{
                      fontSize: "24px",
                      fontWeight: 700,
                      marginBottom: "8px",
                    }}
                  >
                    {professorMaisTurmas.nome_professor}
                  </div>
                  <div style={{ fontSize: "14px", marginBottom: "16px" }}>
                    Matrícula: {professorMaisTurmas.matricula}
                  </div>
                  <div
                    style={{
                      fontSize: "48px",
                      fontWeight: 800,
                      color: "#f59e0b",
                      marginBottom: "8px",
                    }}
                  >
                    {professorMaisTurmas.qtd_turmas_ativas || 0}
                  </div>
                  <div style={{ fontSize: "14px" }}>turmas ativas</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= ABA: TOP 3 TURMAS ================= */}
        {aba === "top3" && (
          <div>
            <h2>Top 3 Turmas com Melhor Desempenho</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Graduação *</label>
                <select
                  value={codigoGraduacao}
                  onChange={(e) => setCodigoGraduacao(e.target.value)}
                >
                  <option value="">-- Selecione a Graduação --</option>
                  {graduacoes.map((g) => (
                    <option
                      key={g.codigo_graduacao}
                      value={g.codigo_graduacao}
                    >
                      {g.nome_graduacao || g.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              className="btn btn-primary"
              onClick={buscarTop3Turmas}
              disabled={loading || !codigoGraduacao}
            >
              {loading ? "Buscando..." : "Buscar"}
            </button>

            {loading && (
              <div className="loading-msg">Carregando dados...</div>
            )}
            {!loading && top3Turmas.length === 0 && (
              <div className="sem-dados">
                Selecione uma graduação para visualizar as 3 turmas com melhor
                desempenho.
              </div>
            )}
            {!loading && top3Turmas.length > 0 && (
              <div className="overflow-x" style={{ marginTop: "20px" }}>
                <table>
                  <thead>
                    <tr>
                      <th>Ranking</th>
                      <th>Nome da Turma</th>
                      <th>Código da Turma</th>
                      <th>Curso</th>
                      <th>Status Inscrições</th>
                      <th>Qtd Alunos</th>
                      <th>Média Geral</th>
                    </tr>
                  </thead>
                  <tbody>
                    {top3Turmas.map((t, idx) => (
                      <tr key={t.id_turma}>
                        <td>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              width: "32px",
                              height: "32px",
                              borderRadius: "50%",
                              fontWeight: "700",
                              fontSize: "14px",
                              background:
                                idx === 0
                                  ? "gold"
                                  : idx === 1
                                  ? "silver"
                                  : "#cd7f32",
                              color: "white",
                            }}
                          >
                            {idx + 1}
                          </span>
                        </td>
                        <td>{t.nome_turma}</td>
                        <td>{t.codigo_turma}</td>
                        <td>{t.nome_curso}</td>
                        <td>{t.status_inscricoes}</td>
                        <td>{t.total_alunos || 0}</td>
                        <td className="media-alta">
                          {t.media_geral !== null &&
                          t.media_geral !== undefined
                            ? Number(t.media_geral).toFixed(2)
                            : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
