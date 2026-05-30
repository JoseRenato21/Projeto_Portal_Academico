import { useEffect, useState } from "react";

export default function AdminPeriodosPage() {
  const [periodos, setPeriodos] = useState([]);
  const [graduacoes, setGraduacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    codigo: "",
    nome: "",
    data_inicio: "",
    data_fim: "",
    ativo: true,
    codigo_graduacao: "",
  });

  useEffect(() => {
    async function load() {
      try {
        const resPeriodos = await fetch("http://localhost:3001/periodo");
        const dataPeriodos = await resPeriodos.json();
        if (!resPeriodos.ok) throw new Error(dataPeriodos.error);
        setPeriodos(dataPeriodos);

        const resGraduacoes = await fetch("http://localhost:3001/graduacao");
        const dataGraduacoes = await resGraduacoes.json();
        if (!resGraduacoes.ok) throw new Error(dataGraduacoes.error);
        setGraduacoes(dataGraduacoes);
      } catch (e) {
        setErro(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
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
    setForm({
      codigo: "",
      nome: "",
      data_inicio: "",
      data_fim: "",
      ativo: true,
      codigo_graduacao: "",
    });
  }

  function startEdit(p) {
    setEditingId(p.id_periodo);
    setForm({
      codigo: p.codigo || "",
      nome: p.nome || "",
      data_inicio: p.data_inicio ? p.data_inicio.slice(0, 10) : "",
      data_fim: p.data_fim ? p.data_fim.slice(0, 10) : "",
      ativo: p.ativo === 1 || p.ativo === true,
      codigo_graduacao: p.codigo_graduacao || "",
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro(null);

    try {
      if (!form.codigo || !form.nome || !form.data_inicio || !form.data_fim || !form.codigo_graduacao) {
        throw new Error("Todos os campos são obrigatórios");
      }

      const payload = {
        codigo: form.codigo,
        nome: form.nome,
        data_inicio: form.data_inicio,
        data_fim: form.data_fim,
        ativo: form.ativo,
        codigo_graduacao: Number(form.codigo_graduacao),
      };

      let res, data;

      if (editingId === null) {
        res = await fetch("http://localhost:3001/periodo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setPeriodos((prev) => [...prev, data]);
      } else {
        res = await fetch(`http://localhost:3001/periodo/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setPeriodos((prev) =>
          prev.map((p) =>
            p.id_periodo === editingId ? { ...p, ...payload } : p
          )
        );
      }

      resetForm();
    } catch (e) {
      setErro(e.message);
    }
  }

  async function handleDelete(id_periodo, nome) {
    if (!window.confirm(`Excluir o período "${nome}"?`)) return;
    try {
      const res = await fetch(`http://localhost:3001/periodo/${id_periodo}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPeriodos((prev) => prev.filter((p) => p.id_periodo !== id_periodo));
      if (editingId === id_periodo) resetForm();
    } catch (e) {
      setErro(e.message);
    }
  }

  if (loading) return <p className="p-center">Carregando períodos...</p>;

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        body { font-family: system-ui, -apple-system, sans-serif; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; padding: 1.5rem; }
        .header { margin-bottom: 1.5rem; }
        .header h1 { margin: 0; font-size: 1.5rem; font-weight: 700; }
        .header p { margin: 0.25rem 0 0 0; color: #666; font-size: 0.95rem; }
        .card { background: white; border-radius: 0.75rem; padding: 1.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
        .error { background: #fee2e2; color: #991b1b; padding: 0.75rem; border-radius: 0.5rem; margin-bottom: 1rem; font-size: 0.9rem; }
        .form-section { margin-bottom: 2rem; }
        .form-section h2 { margin: 0 0 1rem 0; font-size: 1.2rem; font-weight: 600; }
        .form-group { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 0.75rem; }
        .form-group label { font-weight: 500; font-size: 0.9rem; }
        .form-group input, .form-group select { padding: 0.5rem; border: 1px solid #ddd; border-radius: 0.5rem; font-size: 0.9rem; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem; }
        .form-actions { display: flex; gap: 0.5rem; margin-top: 1rem; }
        .btn { padding: 0.6rem 1rem; border: none; border-radius: 0.5rem; cursor: pointer; font-size: 0.9rem; font-weight: 500; }
        .btn-primary { background: #2563eb; color: white; flex: 1; }
        .btn-primary:hover { background: #1d4ed8; }
        .btn-secondary { background: #f9fafb; border: 1px solid #ddd; color: #333; }
        .btn-secondary:hover { background: #f3f4f6; }
        .btn-danger { background: #dc2626; color: white; padding: 0.4rem 0.75rem; font-size: 0.85rem; }
        .btn-edit { background: #10b981; color: white; padding: 0.4rem 0.75rem; font-size: 0.85rem; margin-right: 0.25rem; }
        table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
        th { background: #f9fafb; border-bottom: 2px solid #e5e7eb; padding: 0.75rem; text-align: left; font-weight: 600; color: #666; font-size: 0.8rem; text-transform: uppercase; }
        td { padding: 0.75rem; border-bottom: 1px solid #e5e7eb; }
        tr:nth-child(even) { background: #f9fafb; }
        tr:hover { background: #f3f4f6; }
        .badge { display: inline-block; background: #ecfdf5; color: #166534; padding: 0.25rem 0.5rem; border-radius: 999px; font-size: 0.75rem; font-weight: 600; }
        .badge-inactive { background: #f3f4f6; color: #666; }
        .p-center { text-align: center; color: #666; }
        th:nth-child(4), th:nth-child(5), th:nth-child(6),
        td:nth-child(4), td:nth-child(5), td:nth-child(6) { text-align: center; }
      `}</style>

      <div className="container">
        <div className="header">
          <h1>📅 Gerenciar Períodos</h1>
          <p>Crie, edite e gerencie os períodos acadêmicos</p>
        </div>

        {erro && <div className="error">{erro}</div>}

        {/* FORM */}
        <div className="card form-section">
          <h2>{editingId === null ? "➕ Adicionar Período" : "✏️ Editar Período"}</h2>

          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Código *</label>
                <input
                  name="codigo"
                  value={form.codigo}
                  onChange={handleChange}
                  placeholder="Ex: 2025.1"
                  required
                />
              </div>
              <div className="form-group">
                <label>Nome *</label>
                <input
                  name="nome"
                  value={form.nome}
                  onChange={handleChange}
                  placeholder="Ex: 1º Semestre 2025"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Data Início *</label>
                <input
                  type="date"
                  name="data_inicio"
                  value={form.data_inicio}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Data Fim *</label>
                <input
                  type="date"
                  name="data_fim"
                  value={form.data_fim}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Graduação *</label>
              <select
                name="codigo_graduacao"
                value={form.codigo_graduacao}
                onChange={handleChange}
                required
              >
                <option value="">(Selecione uma graduação)</option>
                {graduacoes.map((g) => (
                  <option key={g.codigo_graduacao} value={g.codigo_graduacao}>
                    {g.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  name="ativo"
                  checked={form.ativo}
                  onChange={handleChange}
                />
                {" "}Período ativo
              </label>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingId === null ? "Criar Período" : "Salvar Alterações"}
              </button>
              {editingId !== null && (
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        {/* TABELA */}
        <div className="card">
          <div style={{ overflowX: "auto" }}>
            <table>
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Nome</th>
                  <th>Graduação</th>
                  <th>Início</th>
                  <th>Fim</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {periodos.map((p) => {
                  const ativo = p.ativo === 1 || p.ativo === true;
                  const grad = graduacoes.find((g) => g.codigo_graduacao === p.codigo_graduacao);
                  return (
                    <tr key={p.id_periodo}>
                      <td style={{ fontWeight: 500 }}>{p.codigo}</td>
                      <td>{p.nome}</td>
                      <td>{grad ? grad.nome : "-"}</td>
                      <td>{p.data_inicio?.slice(0, 10)}</td>
                      <td>{p.data_fim?.slice(0, 10)}</td>
                      <td>
                        <span className={`badge ${ativo ? "" : "badge-inactive"}`}>
                          {ativo ? "✓ Ativo" : "✗ Inativo"}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-edit" onClick={() => startEdit(p)}>
                          Editar
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={() => handleDelete(p.id_periodo, p.nome)}
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {periodos.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-center" style={{ padding: "2rem" }}>
                      Nenhum período cadastrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
