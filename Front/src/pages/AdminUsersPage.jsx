// src/pages/AdminUsersPage.jsx
import { useEffect, useState } from "react";

function hasAluno(tipo) {
  return (tipo & 1) !== 0;
}
function hasProfessor(tipo) {
  return (tipo & 2) !== 0;
}
function hasAdmin(tipo) {
  return (tipo & 4) !== 0;
}

function formatarData(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("pt-BR");
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [filterRoles, setFilterRoles] = useState({
    aluno: false,
    professor: false,
    admin: false,
    alunoProfessor: false,
    mostGraduacoes: false,
  });
  const [graduacoes, setGraduacoes] = useState([]);
  const [graduacoesPorUsuario, setGraduacoesPorUsuario] = useState({});

  // MODAL CRIAR
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    matricula: "",
    nome: "",
    cpf: "",
    senha: "",
    data_entrada: "",
    id_graduacao_ativo: "",
  });
  const [createRoles, setCreateRoles] = useState({
    aluno: false,
    professor: false,
    admin: false,
  });

  const [createGraduacoesDocencia, setCreateGraduacoesDocencia] = useState([]);
  const [createGraduacoesConcluidas, setCreateGraduacoesConcluidas] =
    useState([]);

  const [createStatus, setCreateStatus] = useState(null);
  const [createLoading, setCreateLoading] = useState(false);

  // MODAL EDITAR
  const [editUser, setEditUser] = useState(null);
  const [editGraduacaoAtiva, setEditGraduacaoAtiva] = useState("");
  const [editGraduacoesDocencia, setEditGraduacoesDocencia] = useState([]);
  const [editGraduacoesConcluidas, setEditGraduacoesConcluidas] = useState([]);
  const [editLoading, setEditLoading] = useState(false);
  const [editStatus, setEditStatus] = useState(null);

  // ======================== CARREGAR DADOS ============================
  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true);
        const res = await fetch("http://localhost:3001/user");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Erro ao carregar usuários");
        console.log("[AdminUsers] usuários carregados:", data);
        setUsers(data);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  useEffect(() => {
    async function fetchGraduacoes() {
      try {
        const res = await fetch("http://localhost:3001/graduacao");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Erro ao carregar graduações");
        console.log("[AdminUsers] graduações carregadas:", data);
        setGraduacoes(data);
      } catch (err) {
        console.error("Erro ao carregar graduações:", err);
      }
    }
    fetchGraduacoes();
  }, []);

  useEffect(() => {
    if (filterRoles.mostGraduacoes) {
      async function fetchAllGraduacoes() {
        const cache = {};
        for (const user of users) {
          try {
            const res = await fetch(
              `http://localhost:3001/user/${user.id_usuario}/graduacoes`
            );
            const data = await res.json();
            cache[user.id_usuario] = Array.isArray(data) ? data.length : 0;
          } catch {
            /* ignore */
          }
        }
        setGraduacoesPorUsuario(cache);
      }
      fetchAllGraduacoes();
    }
  }, [filterRoles.mostGraduacoes, users]);

  // ======================== PAPÉIS ============================
  const toggleRole = (id_usuario, role) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id_usuario !== id_usuario) return u;
        let novoTipo = u.tipo;
        const bit = role === "aluno" ? 1 : role === "professor" ? 2 : 4;
        novoTipo = novoTipo & bit ? novoTipo & ~bit : novoTipo | bit;
        return { ...u, tipo: novoTipo };
      })
    );
  };

  const handleSave = async (user) => {
    try {
      setSavingId(user.id_usuario);
      console.log("[AdminUsers] Salvando tipo do usuário:", user);
      const res = await fetch(
        `http://localhost:3001/user/${user.id_usuario}/tipo`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tipo: user.tipo }),
        }
      );
      const data = await res.json().catch(() => ({}));
      console.log("[AdminUsers] Resposta update tipo:", data);
      if (!res.ok) throw new Error(data.error || "Erro ao salvar");
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Excluir "${user.nome}"?`)) return;
    try {
      setSavingId(user.id_usuario);
      console.log("[AdminUsers] Deletando usuário:", user.id_usuario);
      const res = await fetch(
        `http://localhost:3001/user/${user.id_usuario}`,
        { method: "DELETE" }
      );
      const data = await res.json().catch(() => ({}));
      console.log("[AdminUsers] Resposta delete:", data);
      if (!res.ok) {
        throw new Error(
          data.error || "Erro ao excluir (possível FK em turmas, etc.)"
        );
      }
      setUsers((prev) =>
        prev.filter((u) => u.id_usuario !== user.id_usuario)
      );
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setSavingId(null);
    }
  };

  // ======================== MODAL EDITAR GRADUAÇÕES ====================

  const abrirModalEditarGraduacoes = async (user) => {
    try {
      setEditLoading(true);
      setEditStatus(null);
      console.log("[EditarGrad] Abrindo modal para usuário:", user);

      // DOCÊNCIA
      const resDoc = await fetch(
        `http://localhost:3001/user/${user.id_usuario}/graduacoes`
      );
      const dataDoc = await resDoc.json();
      console.log("[EditarGrad] Docência recebida:", dataDoc);

      // CONCLUÍDAS
      const resConc = await fetch(
        `http://localhost:3001/user/${user.id_usuario}/graduacoes-concluidas`
      );
      const dataConc = await resConc.json();
      console.log("[EditarGrad] Concluídas recebidas:", dataConc);

      const docencia = (Array.isArray(dataDoc) ? dataDoc : []).map((g) =>
        String(g.codigo_graduacao ?? g.codigo)
      );
      const concluidas = (Array.isArray(dataConc) ? dataConc : []).map((g) =>
        String(g.codigo_graduacao ?? g.codigo)
      );

      setEditGraduacoesDocencia(docencia);
      setEditGraduacoesConcluidas(concluidas);
      setEditGraduacaoAtiva(
        user.id_graduacao_ativo != null ? String(user.id_graduacao_ativo) : ""
      );
      setEditUser(user);
    } catch (err) {
      console.error(err);
      setEditStatus({ type: "error", message: err.message });
    } finally {
      setEditLoading(false);
    }
  };

  const handleChangeEditAtiva = (valor) => {
    setEditGraduacaoAtiva(valor);

    if (valor !== "") {
      setEditGraduacoesDocencia((prev) => prev.filter((v) => v !== valor));
      setEditGraduacoesConcluidas((prev) => prev.filter((v) => v !== valor));
    }
  };

  const handleToggleEditDocencia = (codigo) => {
    const value = String(codigo);
    const marcada = editGraduacoesDocencia.includes(value);

    if (marcada) {
      setEditGraduacoesDocencia((prev) => prev.filter((v) => v !== value));
    } else {
      setEditGraduacoesDocencia((prev) => [...prev, value]);

      if (editGraduacaoAtiva === value) {
        setEditGraduacaoAtiva("");
      }
    }
  };

  const handleToggleEditConcluida = (codigo) => {
    const value = String(codigo);
    const marcada = editGraduacoesConcluidas.includes(value);

    if (marcada) {
      setEditGraduacoesConcluidas((prev) => prev.filter((v) => v !== value));
    } else {
      setEditGraduacoesConcluidas((prev) => [...prev, value]);

      if (editGraduacaoAtiva === value) {
        setEditGraduacaoAtiva("");
      }
    }
  };

  const handleSubmitEditarGraduacoes = async (e) => {
    e.preventDefault();
    if (!editUser) return;
    setEditLoading(true);
    try {
      const id_usuario = editUser.id_usuario;
      const id_graduacao_ativo =
        editGraduacaoAtiva === "" ? null : Number(editGraduacaoAtiva);

      const graduacoes_docencia = editGraduacoesDocencia.map((v) => Number(v));
      const graduacoes_concluidas = editGraduacoesConcluidas.map((v) =>
        Number(v)
      );

      console.log("[EditarGrad] Enviando ativa:", {
        id_usuario,
        id_graduacao_ativo,
      });
      console.log("[EditarGrad] Enviando docência:", graduacoes_docencia);
      console.log("[EditarGrad] Enviando concluídas:", graduacoes_concluidas);

      // 1) ativa
      await fetch(
        `http://localhost:3001/user/${id_usuario}/graduacao-ativa`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id_graduacao_ativo }),
        }
      );

      // 2) docência
      await fetch(`http://localhost:3001/user/${id_usuario}/graduacoes`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ graduacoes_docencia }),
      });

      // 3) concluídas
      await fetch(
        `http://localhost:3001/user/${id_usuario}/graduacoes-concluidas`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ graduacoes_concluidas }),
        }
      );

      // atualiza lista principal
      setUsers((prev) =>
        prev.map((u) =>
          u.id_usuario === id_usuario ? { ...u, id_graduacao_ativo } : u
        )
      );

      setEditStatus({ type: "success", message: "Graduações atualizadas!" });
      setTimeout(() => setEditUser(null), 1000);
    } catch (err) {
      console.error(err);
      setEditStatus({ type: "error", message: err.message });
    } finally {
      setEditLoading(false);
    }
  };

  // ======================== MODAL CRIAR USUÁRIO ========================

  const handleChangeCreateAtiva = (valor) => {
    setCreateForm((prev) => ({ ...prev, id_graduacao_ativo: valor }));

    if (valor !== "") {
      setCreateGraduacoesDocencia((prev) => prev.filter((v) => v !== valor));
      setCreateGraduacoesConcluidas((prev) => prev.filter((v) => v !== valor));
    }
  };

  const handleToggleCreateDocencia = (codigo) => {
    const value = String(codigo);
    const marcada = createGraduacoesDocencia.includes(value);

    if (marcada) {
      setCreateGraduacoesDocencia((prev) => prev.filter((v) => v !== value));
    } else {
      setCreateGraduacoesDocencia((prev) => [...prev, value]);

      if (createForm.id_graduacao_ativo === value) {
        setCreateForm((prev) => ({ ...prev, id_graduacao_ativo: "" }));
      }
    }
  };

  const handleToggleCreateConcluida = (codigo) => {
    const value = String(codigo);
    const marcada = createGraduacoesConcluidas.includes(value);

    if (marcada) {
      setCreateGraduacoesConcluidas((prev) => prev.filter((v) => v !== value));
    } else {
      setCreateGraduacoesConcluidas((prev) => [...prev, value]);

      if (createForm.id_graduacao_ativo === value) {
        setCreateForm((prev) => ({ ...prev, id_graduacao_ativo: "" }));
      }
    }
  };

  const handleSubmitCreate = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    try {
      let tipo = 0;
      if (createRoles.aluno) tipo += 1;
      if (createRoles.professor) tipo += 2;
      if (createRoles.admin) tipo += 4;

      if (tipo === 0) throw new Error("Selecione um tipo");
      if (tipo === 5) throw new Error("Combinação inválida (Aluno + Admin)");

      const id_graduacao_ativo = createForm.id_graduacao_ativo
        ? Number(createForm.id_graduacao_ativo)
        : null;

      const graduacoes_docencia = createGraduacoesDocencia.map((v) =>
        Number(v)
      );
      const graduacoes_concluidas = createGraduacoesConcluidas.map((v) =>
        Number(v)
      );

      const payload = {
        ...createForm,
        tipo,
        id_graduacao_ativo,
        graduacoes_docencia,
        graduacoes_concluidas,
      };

      console.log("[CreateUser] Enviando payload:", payload);

      const res = await fetch("http://localhost:3001/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log("[CreateUser] Resposta do backend:", data);

      if (!res.ok) throw new Error(data.error || "Erro ao criar usuário");

      setUsers((prev) => [...prev, data]);
      setCreateStatus({ type: "success", message: "Usuário criado!" });

      setTimeout(() => {
        setIsCreateOpen(false);
        setCreateStatus(null);
        setCreateForm({
          matricula: "",
          nome: "",
          cpf: "",
          senha: "",
          data_entrada: "",
          id_graduacao_ativo: "",
        });
        setCreateRoles({ aluno: false, professor: false, admin: false });
        setCreateGraduacoesDocencia([]);
        setCreateGraduacoesConcluidas([]);
      }, 1500);
    } catch (err) {
      console.error(err);
      setCreateStatus({ type: "error", message: err.message });
    } finally {
      setCreateLoading(false);
    }
  };

  // ======================== FILTRO DE USUÁRIOS ========================

  if (loading) return <p className="p-center">Carregando usuários...</p>;

  const filteredUsers = users
    .filter((u) => {
      if (search.trim()) {
        const term = search.toLowerCase();
        if (
          !(u.matricula || "").toLowerCase().includes(term) &&
          !(u.nome || "").toLowerCase().includes(term)
        )
          return false;
      }

      const { aluno, professor, admin, alunoProfessor, mostGraduacoes } =
        filterRoles;
      const someFilterOn =
        aluno || professor || admin || alunoProfessor || mostGraduacoes;

      if (!someFilterOn) return true;

      const isAluno = hasAluno(u.tipo);
      const isProfessor = hasProfessor(u.tipo);
      const isAdmin = hasAdmin(u.tipo);

      const otherFiltersOn = aluno || professor || admin || alunoProfessor;
      if (otherFiltersOn) {
        let matchTipo = false;
        if (alunoProfessor && isAluno && isProfessor) matchTipo = true;
        if (aluno && isAluno) matchTipo = true;
        if (professor && isProfessor) matchTipo = true;
        if (admin && isAdmin) matchTipo = true;

        if (mostGraduacoes) {
          return matchTipo && (graduacoesPorUsuario[u.id_usuario] || 0) > 0;
        }
        return matchTipo;
      }

      if (mostGraduacoes) {
        return (graduacoesPorUsuario[u.id_usuario] || 0) > 0;
      }

      return false;
    })
    .sort((a, b) => {
      if (filterRoles.mostGraduacoes) {
        return (
          (graduacoesPorUsuario[b.id_usuario] || 0) -
          (graduacoesPorUsuario[a.id_usuario] || 0)
        );
      }
      return 0;
    });

  // ======================== JSX ========================

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
        .success { background: #dcfce7; color: #166534; padding: 0.75rem; border-radius: 0.5rem; margin-top: 0.75rem; font-size: 0.9rem; }
        .toolbar { display: flex; flex-wrap: wrap; gap: 0.75rem; margin-bottom: 1.5rem; align-items: center; }
        .search { width: 100%; max-width: 250px; padding: 0.5rem 0.75rem; border: 1px solid #ddd; border-radius: 0.5rem; font-size: 0.9rem; }
        .filters { display: flex; gap: 0.5rem; flex-wrap: wrap; font-size: 0.85rem; align-items: center; }
        .filters span { color: #666; margin-right: 0.25rem; }
        .checkbox-group { display: flex; gap: 0.5rem; align-items: center; }
        .checkbox-group label { display: flex; gap: 0.25rem; align-items: center; cursor: pointer; }
        .btn { padding: 0.5rem 1rem; border: none; border-radius: 0.5rem; cursor: pointer; font-size: 0.85rem; font-weight: 500; }
        .btn-primary { background: #2563eb; color: white; }
        .btn-primary:hover { background: #1d4ed8; }
        .btn-success { background: #10b981; color: white; margin-right: 0.25rem; }
        .btn-danger { background: #dc2626; color: white; }
        .btn-secondary { background: #4b5563; color: white; }
        .btn:disabled { opacity: 0.6; cursor: not-allowed; }
        table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
        th { background: #f9fafb; border-bottom: 2px solid #e5e7eb; padding: 0.75rem; text-align: left; font-weight: 600; color: #666; font-size: 0.8rem; text-transform: uppercase; }
        td { padding: 0.75rem; border-bottom: 1px solid #e5e7eb; }
        tr:nth-child(even) { background: #f9fafb; }
        tr:hover { background: #f3f4f6; }
        .badge { display: inline-block; background: #ecfdf5; color: #166534; padding: 0.25rem 0.5rem; border-radius: 999px; font-size: 0.75rem; font-weight: 600; }
        .modal { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 50; }
        .modal-content { background: white; padding: 1.5rem; border-radius: 0.75rem; max-width: 650px; width: 90%; max-height: 85vh; overflow: auto; box-shadow: 0 20px 25px rgba(0,0,0,0.15); }
        .modal h2 { margin: 0 0 0.5rem 0; font-size: 1.2rem; font-weight: 600; }
        .modal p { margin: 0 0 1rem 0; color: #666; font-size: 0.9rem; }
        .form-group { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 0.75rem; }
        .form-group label { font-weight: 500; font-size: 0.9rem; }
        .form-group input, .form-group select { padding: 0.5rem; border: 1px solid #ddd; border-radius: 0.5rem; font-size: 0.9rem; }
        .checkbox-list { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; max-height: 150px; overflow-y: auto; padding: 0.5rem; border: 1px solid #e5e7eb; border-radius: 0.5rem; font-size: 0.85rem; }
        .checkbox-list label { display: flex; gap: 0.25rem; }
        .p-center { text-align: center; color: #666; }
      `}</style>

      <div className="container">
        <div className="header">
          <h1>Gerenciar Usuários</h1>
          <p>Visualize e gerencie os usuários do sistema</p>
        </div>

        <div className="card">
          {error && <div className="error">{error}</div>}

          <div className="toolbar">
            <input
              type="text"
              className="search"
              placeholder="Buscar matrícula ou nome..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <div className="filters">
              <span>Mostrar:</span>
              <div className="checkbox-group">
                {[
                  "aluno",
                  "professor",
                  "admin",
                  "alunoProfessor",
                  "mostGraduacoes",
                ].map((role) => (
                  <label key={role}>
                    <input
                      type="checkbox"
                      checked={filterRoles[role]}
                      onChange={(e) =>
                        setFilterRoles((prev) => ({
                          ...prev,
                          [role]: e.target.checked,
                        }))
                      }
                    />
                    {role === "aluno"
                      ? "Aluno"
                      : role === "professor"
                      ? "Professor"
                      : role === "admin"
                      ? "Admin"
                      : role === "alunoProfessor"
                      ? "Aluno+Prof"
                      : "+ Graduações"}
                  </label>
                ))}
              </div>
            </div>

            <button
              className="btn btn-primary"
              onClick={() => {
                setIsCreateOpen(true);
                setCreateStatus(null);
              }}
              style={{ marginLeft: "auto" }}
            >
              + Adicionar
            </button>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table>
              <thead>
                <tr>
                  <th>Matrícula</th>
                  <th>Nome</th>
                  <th>CPF</th>
                  <th>Data entrada</th>
                  <th>Graduação</th>
                  <th style={{ textAlign: "center" }}>Papéis</th>
                  <th style={{ textAlign: "center" }}>Marcar</th>
                  <th style={{ textAlign: "center" }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => {
                  const grad = graduacoes.find(
                    (g) => g.codigo_graduacao === u.id_graduacao_ativo
                  );
                  const hasRole =
                    hasAluno(u.tipo) || hasProfessor(u.tipo) || hasAdmin(u.tipo);

                  return (
                    <tr key={u.id_usuario}>
                      <td>{u.matricula || "-"}</td>
                      <td style={{ fontWeight: 500 }}>{u.nome}</td>
                      <td>{u.cpf || "-"}</td>
                      <td>{formatarData(u.data_entrada)}</td>
                      <td>{grad ? `${grad.nome}` : "-"}</td>
                      <td style={{ textAlign: "center" }}>
                        {hasRole ? (
                          <span className="badge">
                            {hasAluno(u.tipo) && "A"}{" "}
                            {hasProfessor(u.tipo) && "P"}{" "}
                            {hasAdmin(u.tipo) && "Adm"}
                          </span>
                        ) : (
                          <span
                            style={{ fontSize: "0.75rem", color: "#999" }}
                          >
                            —
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <label style={{ marginRight: "0.25rem" }}>
                          <input
                            type="checkbox"
                            checked={hasAluno(u.tipo)}
                            onChange={() => toggleRole(u.id_usuario, "aluno")}
                          />
                          A
                        </label>
                        <label style={{ marginRight: "0.25rem" }}>
                          <input
                            type="checkbox"
                            checked={hasProfessor(u.tipo)}
                            onChange={() =>
                              toggleRole(u.id_usuario, "professor")
                            }
                          />
                          P
                        </label>
                        <label>
                          <input
                            type="checkbox"
                            checked={hasAdmin(u.tipo)}
                            onChange={() => toggleRole(u.id_usuario, "admin")}
                          />
                          Ad
                        </label>
                      </td>
                      <td style={{ textAlign: "center", whiteSpace: "nowrap" }}>
                        <button
                          className="btn btn-success"
                          onClick={() => handleSave(u)}
                          disabled={savingId === u.id_usuario}
                        >
                          {savingId === u.id_usuario ? "..." : "Salvar"}
                        </button>
                        <button
                          className="btn btn-secondary"
                          onClick={() => abrirModalEditarGraduacoes(u)}
                        >
                          Editar
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={() => handleDelete(u)}
                          disabled={savingId === u.id_usuario}
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-center">
                      Nenhum usuário encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL CRIAR */}
      {isCreateOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>Criar Usuário</h2>
            <form onSubmit={handleSubmitCreate}>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Matrícula"
                  value={createForm.matricula}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, matricula: e.target.value })
                  }
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "0.75rem",
                  marginBottom: "0.75rem",
                }}
              >
                <input
                  type="date"
                  value={createForm.data_entrada}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      data_entrada: e.target.value,
                    })
                  }
                  required
                />
                <input
                  type="text"
                  placeholder="Nome"
                  value={createForm.nome}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, nome: e.target.value })
                  }
                  required
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "0.75rem",
                  marginBottom: "0.75rem",
                }}
              >
                <input
                  type="text"
                  placeholder="CPF"
                  maxLength={11}
                  value={createForm.cpf}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, cpf: e.target.value })
                  }
                  required
                />
                <input
                  type="password"
                  placeholder="Senha"
                  value={createForm.senha}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, senha: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Tipos</label>
                <div style={{ display: "flex", gap: "1rem" }}>
                  {["aluno", "professor", "admin"].map((role) => (
                    <label key={role}>
                      <input
                        type="checkbox"
                        checked={createRoles[role]}
                        onChange={(e) =>
                          setCreateRoles({
                            ...createRoles,
                            [role]: e.target.checked,
                          })
                        }
                      />
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Graduação ativa</label>
                <select
                  value={createForm.id_graduacao_ativo}
                  onChange={(e) => handleChangeCreateAtiva(e.target.value)}
                >
                  <option value="">(Nenhuma)</option>
                  {graduacoes.map((g) => (
                    <option
                      key={g.codigo_graduacao}
                      value={g.codigo_graduacao}
                    >
                      {g.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Cursos de Docência</label>
                <div className="checkbox-list">
                  {graduacoes.map((g) => {
                    const value = String(g.codigo_graduacao);
                    return (
                      <label key={g.codigo_graduacao}>
                        <input
                          type="checkbox"
                          value={value}
                          checked={createGraduacoesDocencia.includes(value)}
                          onChange={() =>
                            handleToggleCreateDocencia(g.codigo_graduacao)
                          }
                        />
                        {g.nome}
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="form-group">
                <label>Graduações concluídas</label>
                <div className="checkbox-list">
                  {graduacoes.map((g) => {
                    const value = String(g.codigo_graduacao);
                    return (
                      <label key={g.codigo_graduacao}>
                        <input
                          type="checkbox"
                          value={value}
                          checked={createGraduacoesConcluidas.includes(value)}
                          onChange={() =>
                            handleToggleCreateConcluida(g.codigo_graduacao)
                          }
                        />
                        {g.nome}
                      </label>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: "100%", marginTop: "1rem" }}
                disabled={createLoading}
              >
                {createLoading ? "Enviando..." : "Criar Usuário"}
              </button>
            </form>

            {createStatus && (
              <div
                className={
                  createStatus.type === "success" ? "success" : "error"
                }
              >
                {createStatus.message}
              </div>
            )}

            <button
              className="btn"
              style={{
                width: "100%",
                marginTop: "0.75rem",
                background: "#999",
                color: "white",
              }}
              onClick={() => setIsCreateOpen(false)}
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* MODAL EDITAR */}
      {editUser && (
        <div className="modal">
          <div className="modal-content">
            <h2>Editar Graduações</h2>
            <p>
              {editUser.nome} (ID {editUser.id_usuario})
            </p>
            <form onSubmit={handleSubmitEditarGraduacoes}>
              <div className="form-group">
                <label>Graduação ativa</label>
                <select
                  value={editGraduacaoAtiva}
                  onChange={(e) => handleChangeEditAtiva(e.target.value)}
                >
                  <option value="">(Nenhuma)</option>
                  {graduacoes.map((g) => (
                    <option
                      key={g.codigo_graduacao}
                      value={String(g.codigo_graduacao)}
                    >
                      {g.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Cursos de Docência</label>
                <div className="checkbox-list">
                  {graduacoes.map((g) => {
                    const value = String(g.codigo_graduacao);
                    return (
                      <label key={g.codigo_graduacao}>
                        <input
                          type="checkbox"
                          value={value}
                          checked={editGraduacoesDocencia.includes(value)}
                          onChange={() =>
                            handleToggleEditDocencia(g.codigo_graduacao)
                          }
                        />
                        {g.nome}
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="form-group">
                <label>Graduações concluídas</label>
                <div className="checkbox-list">
                  {graduacoes.map((g) => {
                    const value = String(g.codigo_graduacao);
                    return (
                      <label key={g.codigo_graduacao}>
                        <input
                          type="checkbox"
                          value={value}
                          checked={editGraduacoesConcluidas.includes(value)}
                          onChange={() =>
                            handleToggleEditConcluida(g.codigo_graduacao)
                          }
                        />
                        {g.nome}
                      </label>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-success"
                style={{ width: "100%", marginTop: "1rem" }}
                disabled={editLoading}
              >
                {editLoading ? "Salvando..." : "Salvar"}
              </button>
            </form>

            {editStatus && (
              <div
                className={editStatus.type === "success" ? "success" : "error"}
              >
                {editStatus.message}
              </div>
            )}

            <button
              className="btn"
              style={{
                width: "100%",
                marginTop: "0.75rem",
                background: "#999",
                color: "white",
              }}
              onClick={() => setEditUser(null)}
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
