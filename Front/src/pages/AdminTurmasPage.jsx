import { useEffect, useState } from "react";

export default function AdminTurmasPage() {
  const [turmas, setTurmas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [editingId, setEditingId] = useState(null);
  
  // Dados dos dropdowns
  const [cursos, setCursos] = useState([]);
  const [periodos, setPeriodos] = useState([]);
  const [professores, setProfessores] = useState([]);
  
  // Dados filtrados
  const [cursosDisponiveis, setCursosDisponiveis] = useState([]);
  const [periodosDisponiveis, setPeriodosDisponiveis] = useState([]);
  const [professoresDisponiveis, setProfessoresDisponiveis] = useState([]);
  
  const [form, setForm] = useState({
    nome: "",
    codigo_turma: "",
    curso_ref: "",
    periodo_ref: "",
    professor_ref: "",
    vagas_regulares: 30,
    vagas_extras: 10,
    ativo: true,
    status_inscricoes: "aberta",
  });

  // Carregar dados iniciais
  useEffect(() => {
    async function loadInitialData() {
      try {
        setLoading(true);
        
        // Buscar turmas
        const resTurmas = await fetch("http://localhost:3001/turma");
        const dataTurmas = await resTurmas.json();
        if (!resTurmas.ok) throw new Error(dataTurmas.error || "Erro ao buscar turmas");
        setTurmas(dataTurmas);
        
        // Buscar cursos com graduações
        const resCursos = await fetch("http://localhost:3001/curso");
        const dataCursos = await resCursos.json();
        if (!resCursos.ok) throw new Error(dataCursos.error || "Erro ao buscar cursos");
        setCursos(dataCursos);
        setCursosDisponiveis(dataCursos);
        
        // Buscar períodos
        const resPeriodos = await fetch("http://localhost:3001/periodo");
        const dataPeriodos = await resPeriodos.json();
        if (!resPeriodos.ok) throw new Error(dataPeriodos.error || "Erro ao buscar períodos");
        setPeriodos(dataPeriodos);
        
        // Buscar usuários com papel de professor
        const resProf = await fetch("http://localhost:3001/user");
        const dataProf = await resProf.json();
        if (!resProf.ok) throw new Error(dataProf.error || "Erro ao buscar usuários");
        
        // Filtrar apenas professores (tipo & 2)
        let professorsList = dataProf.filter(u => (u.tipo & 2) !== 0);
        
        // Buscar graduações de cada professor
        professorsList = await Promise.all(
          professorsList.map(async (prof) => {
            try {
              const resGrad = await fetch(`http://localhost:3001/user/${prof.id_usuario}/graduacoes`);
              const dataGrad = await resGrad.json();
              return {
                ...prof,
                graduacoes: Array.isArray(dataGrad) ? dataGrad : []
              };
            } catch (e) {
              return {
                ...prof,
                graduacoes: []
              };
            }
          })
        );
        
        setProfessores(professorsList);
      } catch (e) {
        setErro(e.message);
      } finally {
        setLoading(false);
      }
    }
    
    loadInitialData();
  }, []);

  // Quando o curso muda, filtrar períodos e professores
  useEffect(() => {
    if (!form.curso_ref) {
      setPeriodosDisponiveis([]);
      setProfessoresDisponiveis([]);
      setForm(prev => ({
        ...prev,
        periodo_ref: "",
        professor_ref: ""
      }));
      return;
    }
    
    const cursoSelecionado = cursos.find(c => String(c.id_curso) === String(form.curso_ref));
    
    if (!cursoSelecionado) {
      setPeriodosDisponiveis([]);
      setProfessoresDisponiveis([]);
      setForm(prev => ({
        ...prev,
        periodo_ref: "",
        professor_ref: ""
      }));
      return;
    }
    
    const id_graduacao = cursoSelecionado.codigo_graduacao;
    
    // Professor leciona nas graduações do array 'graduacoes'
    const profsFiltered = professores.filter(prof => {
      if (Array.isArray(prof.graduacoes)) {
        return prof.graduacoes.some(g => 
          Number(g.codigo_graduacao || g.codigo) === Number(id_graduacao)
        );
      }
      return false;
    });
    
    // Períodos são globais
    setPeriodosDisponiveis(periodos);
    setProfessoresDisponiveis(profsFiltered);
    
    // Limpar período e professor quando curso muda
    setForm(prev => ({
      ...prev,
      periodo_ref: "",
      professor_ref: ""
    }));
  }, [form.curso_ref, cursos, periodos, professores]);

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
      nome: "",
      codigo_turma: "",
      curso_ref: "",
      periodo_ref: "",
      professor_ref: "",
      vagas_regulares: 30,
      vagas_extras: 10,
      ativo: true,
      status_inscricoes: "aberta",
    });
    setPeriodosDisponiveis([]);
    setProfessoresDisponiveis([]);
  }

  function startEdit(t) {
    setEditingId(t.id_turma);
    
    const cursoObj = cursos.find(c => c.nome === t.nome_curso);
    const periodoObj = periodos.find(p => p.codigo === t.codigo_periodo || p.nome === t.nome_periodo);
    const professorObj = professores.find(p => p.nome === t.nome_professor);
    
    const cursoId = cursoObj?.id_curso || t.nome_curso;
    const periodoId = periodoObj?.id_periodo || t.codigo_periodo;
    const professorId = professorObj?.id_usuario || t.nome_professor;
    
    setForm({
      nome: t.nome || "",
      codigo_turma: t.codigo_turma || "",
      curso_ref: String(cursoId),
      periodo_ref: String(periodoId),
      professor_ref: String(professorId),
      vagas_regulares: t.vagas_regulares ?? 30,
      vagas_extras: t.vagas_extras ?? 10,
      ativo: t.ativo === 1 || t.ativo === true,
      status_inscricoes: t.status_inscricoes || "aberta",
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro(null);

    try {
      if (
        !form.nome ||
        !form.codigo_turma ||
        !form.curso_ref ||
        !form.periodo_ref ||
        !form.professor_ref
      ) {
        throw new Error("Todos os campos obrigatórios devem ser preenchidos");
      }

      const cursoObj = cursos.find(c => String(c.id_curso) === String(form.curso_ref));
      const periodoObj = periodosDisponiveis.find(p => String(p.id_periodo) === String(form.periodo_ref));
      const professorObj = professoresDisponiveis.find(p => String(p.id_usuario) === String(form.professor_ref));

      const payload = {
        nome: form.nome,
        codigo_turma: form.codigo_turma,
        curso_ref: cursoObj?.nome || form.curso_ref,
        periodo_ref: periodoObj?.codigo || periodoObj?.nome || form.periodo_ref,
        professor_ref: professorObj?.matricula || professorObj?.nome || form.professor_ref,
        vagas_regulares: Number(form.vagas_regulares),
        vagas_extras: Number(form.vagas_extras),
        ativo: form.ativo,
        status_inscricoes: form.status_inscricoes,
      };

      let res;

      if (editingId === null) {
        res = await fetch("http://localhost:3001/turma", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`http://localhost:3001/turma/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao salvar turma");

      const resTurmas = await fetch("http://localhost:3001/turma");
      const dataTurmas = await resTurmas.json();
      setTurmas(dataTurmas);
      
      resetForm();
    } catch (e) {
      setErro(e.message);
    }
  }

  async function handleDelete(id_turma, nome) {
    if (!window.confirm(`Excluir a turma "${nome}"?`)) return;
    try {
      const res = await fetch(`http://localhost:3001/turma/${id_turma}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao excluir turma");
      
      const resTurmas = await fetch("http://localhost:3001/turma");
      const dataTurmas = await resTurmas.json();
      setTurmas(dataTurmas);
      
      if (editingId === id_turma) resetForm();
    } catch (e) {
      setErro(e.message);
    }
  }

  if (loading) return <p className="p-center">Carregando turmas...</p>;

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        body { font-family: system-ui, -apple-system, sans-serif; background: #f5f5f5; }
        .container { max-width: 1400px; margin: 0 auto; padding: 1.5rem; }
        .header { margin-bottom: 1.5rem; }
        .header h1 { margin: 0; font-size: 1.5rem; font-weight: 700; }
        .header p { margin: 0.25rem 0 0 0; color: #666; font-size: 0.95rem; }
        .card { background: white; border-radius: 0.75rem; padding: 1.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
        .error { background: #fee2e2; color: #991b1b; padding: 0.75rem; border-radius: 0.5rem; margin-bottom: 1rem; font-size: 0.9rem; }
        .form-section { margin-bottom: 2rem; }
        .form-section h2 { margin: 0 0 1rem 0; font-size: 1.2rem; font-weight: 600; }
        .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin-bottom: 1rem; }
        .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
        .form-group label { font-weight: 500; font-size: 0.9rem; }
        .form-group input, .form-group select { padding: 0.5rem; border: 1px solid #ddd; border-radius: 0.5rem; font-size: 0.9rem; font-family: inherit; }
        .form-row { display: grid; grid-template-columns: 2fr 1fr; gap: 1rem; margin-bottom: 1rem; }
        .form-actions { display: flex; gap: 0.5rem; margin-top: 1rem; }
        .btn { padding: 0.6rem 1rem; border: none; border-radius: 0.5rem; cursor: pointer; font-size: 0.9rem; font-weight: 500; }
        .btn-primary { background: #2563eb; color: white; flex: 1; }
        .btn-primary:hover { background: #1d4ed8; }
        .btn-secondary { background: #f9fafb; border: 1px solid #ddd; color: #333; }
        .btn-secondary:hover { background: #f3f4f6; }
        .btn-danger { background: #dc2626; color: white; padding: 0.4rem 0.75rem; font-size: 0.85rem; }
        .btn-edit { background: #10b981; color: white; padding: 0.4rem 0.75rem; font-size: 0.85rem; margin-right: 0.25rem; }
        .btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .checkbox-group { display: flex; gap: 1.5rem; align-items: center; }
        .checkbox-group label { display: flex; gap: 0.5rem; align-items: center; }
        table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
        th { background: #f9fafb; border-bottom: 2px solid #e5e7eb; padding: 0.75rem; text-align: left; font-weight: 600; color: #666; font-size: 0.75rem; text-transform: uppercase; }
        td { padding: 0.75rem; border-bottom: 1px solid #e5e7eb; }
        tr:nth-child(even) { background: #f9fafb; }
        tr:hover { background: #f3f4f6; }
        .badge { display: inline-block; padding: 0.25rem 0.5rem; border-radius: 999px; font-size: 0.75rem; font-weight: 600; }
        .badge-open { background: #dcfce7; color: #166534; }
        .badge-closed { background: #fee2e2; color: #991b1b; }
        .badge-active { background: #ecfdf5; color: #166534; }
        .badge-inactive { background: #f3f4f6; color: #666; }
        .p-center { text-align: center; color: #666; }
        .overflow-x { overflow-x: auto; }
        .form-group select:disabled { background-color: #f0f0f0; color: #999; cursor: not-allowed; }
      `}</style>

      <div className="container">
        <div className="header">
          <h1> Gerenciar Turmas</h1>
          <p>Crie, edite e gerencie as turmas do sistema</p>
        </div>

        {erro && <div className="error">{erro}</div>}

        {/* FORM */}
        <div className="card form-section">
          <h2>{editingId === null ? " Adicionar Turma" : " Editar Turma"}</h2>

          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Nome da Turma *</label>
                <input
                  name="nome"
                  value={form.nome}
                  onChange={handleChange}
                  placeholder="Ex: Turma A"
                  required
                />
              </div>
              <div className="form-group">
                <label>Código *</label>
                <input
                  name="codigo_turma"
                  value={form.codigo_turma}
                  onChange={handleChange}
                  placeholder="Ex: T001"
                  required
                />
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Curso *</label>
                <select
                  name="curso_ref"
                  value={form.curso_ref}
                  onChange={handleChange}
                  required
                >
                  <option value="">-- Selecione um curso --</option>
                  {cursosDisponiveis.map((c) => (
                    <option key={c.id_curso} value={c.id_curso}>
                      {c.nome}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Período *</label>
                <select
                  name="periodo_ref"
                  value={form.periodo_ref}
                  onChange={handleChange}
                  required
                  disabled={!form.curso_ref || periodosDisponiveis.length === 0}
                >
                  <option value="">-- Selecione um período --</option>
                  {periodosDisponiveis.map((p) => (
                    <option key={p.id_periodo} value={p.id_periodo}>
                      {p.codigo} - {p.nome}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Professor *</label>
                <select
                  name="professor_ref"
                  value={form.professor_ref}
                  onChange={handleChange}
                  required
                  disabled={!form.curso_ref || professoresDisponiveis.length === 0}
                >
                  <option value="">-- Selecione um professor --</option>
                  {professoresDisponiveis.map((p) => (
                    <option key={p.id_usuario} value={p.id_usuario}>
                      {p.nome} ({p.matricula})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Vagas Regulares</label>
                <input
                  type="number"
                  name="vagas_regulares"
                  min={0}
                  value={form.vagas_regulares}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Vagas Extras</label>
                <input
                  type="number"
                  name="vagas_extras"
                  min={0}
                  value={form.vagas_extras}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="checkbox-group" style={{ marginBottom: "1rem" }}>
              <label>
                <input
                  type="checkbox"
                  name="ativo"
                  checked={form.ativo}
                  onChange={handleChange}
                />
                Turma Ativa
              </label>

              <div>
                <label style={{ marginRight: "0.5rem" }}>Inscrições:</label>
                <select
                  name="status_inscricoes"
                  value={form.status_inscricoes}
                  onChange={handleChange}
                  style={{
                    padding: "0.4rem 0.6rem",
                    borderRadius: "0.5rem",
                    border: "1px solid #ddd",
                    fontSize: "0.85rem",
                  }}
                >
                  <option value="aberta">Aberta</option>
                  <option value="fechada">Fechada</option>
                </select>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingId === null ? "Criar Turma" : "Salvar Alterações"}
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
          <div className="overflow-x">
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Código</th>
                  <th>Curso</th>
                  <th>Período</th>
                  <th>Professor</th>
                  <th>Vagas</th>
                  <th>Inscrições</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {turmas.map((t) => {
                  const ativa = t.ativo === 1 || t.ativo === true;
                  const inscAberta = t.status_inscricoes === "aberta";
                  const totalVagas = (t.vagas_regulares || 0) + (t.vagas_extras || 0);
                  return (
                    <tr key={t.id_turma}>
                      <td style={{ fontWeight: 500 }}>{t.nome}</td>
                      <td>{t.codigo_turma}</td>
                      <td>{t.nome_curso}</td>
                      <td>{t.codigo_periodo || t.nome_periodo}</td>
                      <td>{t.nome_professor}</td>
                      <td>{totalVagas}</td>
                      <td>
                        <span className={`badge ${inscAberta ? "badge-open" : "badge-closed"}`}>
                          {inscAberta ? "✓ Aberta" : "✗ Fechada"}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${ativa ? "badge-active" : "badge-inactive"}`}>
                          {ativa ? "✓ Ativa" : "✗ Inativa"}
                        </span>
                      </td>
                      <td style={{ whiteSpace: "nowrap" }}>
                        <button className="btn btn-edit" onClick={() => startEdit(t)}>
                          Editar
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={() => handleDelete(t.id_turma, t.nome)}
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {turmas.length === 0 && (
                  <tr>
                    <td colSpan={9} className="p-center" style={{ padding: "2rem" }}>
                      Nenhuma turma cadastrada.
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
