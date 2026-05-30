import { useEffect, useState } from "react";

export default function AdminCoursesPage() {
  const [cursos, setCursos] = useState([]);
  const [graduacoes, setGraduacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [sucesso, setSucesso] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    descricao: "",
    carga_horaria: "",
    codigo_graduacao: "",
    ativo: true,
  });

  // Carregar graduações e cursos
  useEffect(() => {
    async function loadData() {
      try {
        setErro(null);

        // Buscar graduações
        const resGrad = await fetch("http://localhost:3001/graduacao");
        const dataGrad = await resGrad.json();
        if (!resGrad.ok) throw new Error(dataGrad.error || "Erro ao buscar graduações");
        setGraduacoes(dataGrad);

        // Buscar cursos
        const resCursos = await fetch("http://localhost:3001/curso");
        const dataCursos = await resCursos.json();
        if (!resCursos.ok) throw new Error(dataCursos.error || "Erro ao buscar cursos");
        setCursos(dataCursos);
      } catch (e) {
        setErro(e.message);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function resetForm() {
    setEditingId(null);
    setShowForm(false);
    setForm({
      nome: "",
      descricao: "",
      carga_horaria: "",
      codigo_graduacao: "",
      ativo: true,
    });
  }

  function startEdit(curso) {
    setEditingId(curso.id_curso);
    setShowForm(true);
    setForm({
      nome: curso.nome || "",
      descricao: curso.descricao || "",
      carga_horaria: curso.carga_horaria || "",
      codigo_graduacao: curso.codigo_graduacao || "",
      ativo: curso.ativo === 1 || curso.ativo === true,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro(null);

    try {
      if (!form.nome || !form.carga_horaria || !form.codigo_graduacao) {
        throw new Error(
          "Nome, carga horária e graduação são obrigatórios"
        );
      }

      const payload = {
        nome: form.nome,
        descricao: form.descricao,
        carga_horaria: Number(form.carga_horaria),
        codigo_graduacao: Number(form.codigo_graduacao),
        ativo: form.ativo,
      };

      let res, data;

      if (editingId === null) {
        // Criar novo curso
        res = await fetch("http://localhost:3001/curso", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        data = await res.json();

        if (!res.ok) throw new Error(data.error || "Erro ao criar curso");

        // Enriquecer o objeto retornado com nome_graduacao
        const nomeGrad = graduacoes.find(
          (g) => g.codigo_graduacao === Number(form.codigo_graduacao)
        )?.nome;
        data.nome_graduacao = nomeGrad;

        setCursos((prev) => [...prev, data]);
      } else {
        // Atualizar curso existente
        res = await fetch(`http://localhost:3001/curso/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        data = await res.json();

        if (!res.ok) throw new Error(data.error || "Erro ao atualizar curso");

        setCursos((prev) =>
          prev.map((c) => {
            if (c.id_curso === editingId) {
              const nomeGrad = graduacoes.find(
                (g) => g.codigo_graduacao === Number(form.codigo_graduacao)
              )?.nome;
              return {
                ...c,
                ...payload,
                nome_graduacao: nomeGrad,
              };
            }
            return c;
          })
        );
      }

      setSucesso(editingId === null ? "Curso criado com sucesso!" : "Curso atualizado com sucesso!");
      setShowForm(false);
      resetForm();
      setTimeout(() => setSucesso(null), 3000);
    } catch (e) {
      setErro(e.message);
      setTimeout(() => setErro(null), 5000);
    }
  }

  async function handleDelete(id_curso, nome) {
    if (!window.confirm(`Excluir o curso "${nome}"?`)) return;

    try {
      const res = await fetch(`http://localhost:3001/curso/${id_curso}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Erro ao excluir curso");

      setCursos((prev) => prev.filter((c) => c.id_curso !== id_curso));

      if (editingId === id_curso) resetForm();
      setSucesso("Curso excluído com sucesso!");
      setTimeout(() => setSucesso(null), 3000);
    } catch (e) {
      setErro(e.message);
      setTimeout(() => setErro(null), 5000);
    }
  }

  if (loading) return (
    <div style={styles.container}>
      <div style={styles.loadingCenter}>Carregando cursos...</div>
    </div>
  );

  return (
    <div style={styles.container}>
      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.h1}>Gerenciar Cursos</h1>
          <p style={styles.subtitle}>Crie, edite e gerencie os cursos de cada graduação</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          style={{...styles.btnPrimary, ...styles.btnLarge}}
        >
          {showForm ? "✕ Fechar" : "+ Novo Curso"}
        </button>
      </div>

      {/* ALERTS */}
      {erro && <div style={styles.alert.error}>{erro}</div>}
      {sucesso && <div style={styles.alert.success}>{sucesso}</div>}

      {/* FORMULÁRIO */}
      {showForm && (
        <div style={styles.formCard}>
          <h2 style={styles.formTitle}>
            {editingId === null ? "Criar Novo Curso" : "Editar Curso"}
          </h2>

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.row}>
              <div style={styles.col}>
                <label style={styles.label}>Nome do Curso *</label>
                <input
                  type="text"
                  name="nome"
                  value={form.nome}
                  onChange={handleChange}
                  placeholder="Ex: Cálculo I"
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.col}>
                <label style={styles.label}>Graduação *</label>
                <select
                  name="codigo_graduacao"
                  value={form.codigo_graduacao}
                  onChange={handleChange}
                  style={styles.input}
                  required
                >
                  <option value="">-- Selecione uma graduação --</option>
                  {graduacoes.map((grad) => (
                    <option key={grad.codigo_graduacao} value={grad.codigo_graduacao}>
                      {grad.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={styles.row}>
              <div style={styles.col}>
                <label style={styles.label}>Carga Horária (horas) *</label>
                <input
                  type="number"
                  name="carga_horaria"
                  value={form.carga_horaria}
                  onChange={handleChange}
                  placeholder="Ex: 60"
                  style={styles.input}
                  required
                  min="1"
                />
              </div>

              <div style={styles.col}>
                <label style={styles.label}>Status</label>
                <label style={styles.checkbox}>
                  <input
                    type="checkbox"
                    name="ativo"
                    checked={form.ativo}
                    onChange={handleChange}
                  />
                  <span style={styles.checkboxText}>Ativo</span>
                </label>
              </div>
            </div>

            <div style={styles.fullWidth}>
              <label style={styles.label}>Descrição</label>
              <textarea
                name="descricao"
                value={form.descricao}
                onChange={handleChange}
                placeholder="Descrição do curso (opcional)"
                style={{...styles.input, ...styles.textarea}}
              />
            </div>

            <div style={styles.formActions}>
              <button type="submit" style={{...styles.btnPrimary, ...styles.btnSubmit}}>
                {editingId === null ? "Criar Curso" : "Atualizar Curso"}
              </button>
              {editingId !== null && (
                <button type="button" onClick={resetForm} style={styles.btnSecondary}>
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* TABELA */}
      <div style={styles.tableCard}>
        <h2 style={styles.tableTitle}>Cursos Cadastrados ({cursos.length})</h2>
        
        {cursos.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={styles.emptyText}>Nenhum curso cadastrado.</p>
            <p style={styles.emptySubtext}>Clique em "+ Novo Curso" para começar.</p>
          </div>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHead}>
                  <th style={{...styles.th, width: "25%"}}>Nome</th>
                  <th style={{...styles.th, width: "25%"}}>Graduação</th>
                  <th style={{...styles.th, width: "15%"}}>Carga Horária</th>
                  <th style={{...styles.th, width: "15%"}}>Status</th>
                  <th style={{...styles.th, width: "20%"}}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {cursos.map((c, idx) => {
                  const ativa = c.ativo === 1 || c.ativo === true;
                  return (
                    <tr key={c.id_curso} style={{...styles.tableRow, backgroundColor: idx % 2 === 0 ? "#fff" : "#f8f9fa"}}>
                      <td style={styles.td}><strong>{c.nome}</strong></td>
                      <td style={styles.td}>{c.nome_graduacao || "—"}</td>
                      <td style={styles.td}>{c.carga_horaria}h</td>
                      <td style={styles.td}>
                        <span style={{...styles.badge, ...(ativa ? styles.badgeSuccess : styles.badgeGray)}}>
                          {ativa ? "✓ Ativo" : "✗ Inativo"}
                        </span>
                      </td>
                      <td style={{...styles.td, ...styles.tdActions}}>
                        <button onClick={() => startEdit(c)} style={styles.btnAction.edit}>
                          ✏️ Editar
                        </button>
                        <button 
                          onClick={() => handleDelete(c.id_curso, c.nome)} 
                          style={styles.btnAction.delete}
                        >
                          🗑️ Excluir
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ✨ ESTILOS
const styles = {
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "20px",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    backgroundColor: "#f5f7fa",
    minHeight: "100vh",
  },
  h1: {
    margin: "0 0 8px 0",
    fontSize: "28px",
    color: "#222",
    fontWeight: "700",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },
  subtitle: {
    color: "#666",
    fontSize: "14px",
    margin: "0",
  },
  loadingCenter: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "400px",
    fontSize: "18px",
    color: "#666",
  },
  alert: {
    error: {
      backgroundColor: "#fee",
      border: "1px solid #fcc",
      color: "#c33",
      padding: "12px 16px",
      borderRadius: "8px",
      marginBottom: "20px",
      fontSize: "14px",
      fontWeight: "500",
    },
    success: {
      backgroundColor: "#efe",
      border: "1px solid #cfc",
      color: "#3c3",
      padding: "12px 16px",
      borderRadius: "8px",
      marginBottom: "20px",
      fontSize: "14px",
      fontWeight: "500",
    },
  },
  formCard: {
    backgroundColor: "#fff",
    padding: "24px",
    borderRadius: "12px",
    marginBottom: "30px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    borderLeft: "4px solid #007bff",
  },
  formTitle: {
    fontSize: "20px",
    fontWeight: "600",
    marginBottom: "20px",
    color: "#222",
    margin: "0 0 20px 0",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  row: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
  },
  col: {
    display: "flex",
    flexDirection: "column",
  },
  fullWidth: {
    display: "flex",
    flexDirection: "column",
  },
  label: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#444",
    marginBottom: "6px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  input: {
    padding: "10px 12px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    fontSize: "14px",
    fontFamily: "inherit",
    transition: "all 0.2s",
  },
  textarea: {
    minHeight: "100px",
    resize: "vertical",
    fontFamily: "inherit",
  },
  checkbox: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
    marginTop: "6px",
  },
  checkboxText: {
    fontSize: "14px",
    color: "#444",
    userSelect: "none",
  },
  formActions: {
    display: "flex",
    gap: "10px",
    marginTop: "10px",
  },
  btnPrimary: {
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    padding: "10px 16px",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  btnLarge: {
    padding: "12px 24px",
    fontSize: "15px",
  },
  btnSubmit: {
    padding: "12px 24px",
    flex: 1,
  },
  btnSecondary: {
    backgroundColor: "#6c757d",
    color: "#fff",
    border: "none",
    padding: "10px 16px",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
    flex: 1,
  },
  tableCard: {
    backgroundColor: "#fff",
    padding: "24px",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },
  tableTitle: {
    fontSize: "18px",
    fontWeight: "600",
    marginBottom: "20px",
    color: "#222",
    margin: "0 0 20px 0",
  },
  tableWrapper: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  tableHead: {
    backgroundColor: "#f8f9fa",
    borderBottom: "2px solid #dee2e6",
  },
  th: {
    padding: "12px",
    textAlign: "left",
    fontSize: "13px",
    fontWeight: "600",
    color: "#444",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  tableRow: {
    borderBottom: "1px solid #dee2e6",
    transition: "background-color 0.2s",
  },
  td: {
    padding: "14px 12px",
    fontSize: "14px",
    color: "#333",
  },
  tdActions: {
    display: "flex",
    gap: "8px",
  },
  btnAction: {
    edit: {
      backgroundColor: "#28a745",
      color: "#fff",
      border: "none",
      padding: "6px 12px",
      borderRadius: "4px",
      fontSize: "12px",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.2s",
      whiteSpace: "nowrap",
    },
    delete: {
      backgroundColor: "#dc3545",
      color: "#fff",
      border: "none",
      padding: "6px 12px",
      borderRadius: "4px",
      fontSize: "12px",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.2s",
      whiteSpace: "nowrap",
    },
  },
  badge: {
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "12px",
    fontWeight: "600",
    display: "inline-block",
  },
  badgeSuccess: {
    backgroundColor: "#d4edda",
    color: "#155724",
  },
  badgeGray: {
    backgroundColor: "#e2e3e5",
    color: "#383d41",
  },
  emptyState: {
    textAlign: "center",
    padding: "60px 20px",
  },
  emptyText: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#666",
    marginBottom: "8px",
    margin: "0 0 8px 0",
  },
  emptySubtext: {
    fontSize: "14px",
    color: "#999",
    margin: "0",
  },
};
