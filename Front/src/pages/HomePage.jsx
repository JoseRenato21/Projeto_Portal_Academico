// src/pages/HomePage.jsx
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

const API_URL = "http://localhost:3001";

export default function HomePage() {
  const { user, logout, setUser } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [nome, setNome] = useState(user?.nome || "");
  const [senha, setSenha] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [loading, setLoading] = useState(false);

  async function salvarPerfil() {
    try {
      setLoading(true);
      setMensagem("");

      const res = await fetch(`${API_URL}/user/${user.id_usuario}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome,
          senha: senha || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao atualizar perfil.");

      setMensagem("Perfil atualizado com sucesso!");
      if (setUser) {
        setUser({ ...user, nome });
      }
      setSenha("");
    } catch (err) {
      setMensagem(err.message);
    } finally {
      setLoading(false);
    }
  }

  function abrirModal() {
    setNome(user?.nome || "");
    setSenha("");
    setMensagem("");
    setShowModal(true);
  }

  function fecharModal() {
    setShowModal(false);
  }

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        body { font-family: system-ui, -apple-system, sans-serif; background: #f5f5f5; }
        .container { max-width: 900px; margin: 0 auto; padding: 1.5rem; }
        .header { margin-bottom: 2rem; }
        .header h1 { margin: 0 0 0.5rem 0; font-size: 1.8rem; font-weight: 700; color: #111827; }
        .header p { margin: 0; color: #6b7280; font-size: 1rem; }
        .card { background: white; border-radius: 0.75rem; padding: 2rem; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
        .welcome-box { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 2rem; border-radius: 0.75rem; margin-bottom: 2rem; }
        .welcome-box h2 { margin: 0 0 0.5rem 0; font-size: 1.5rem; font-weight: 700; }
        .welcome-box p { margin: 0; opacity: 0.9; }
        .btn { padding: 0.75rem 1.5rem; border: none; border-radius: 0.5rem; cursor: pointer; font-size: 1rem; font-weight: 500; transition: 0.2s; }
        .btn-primary { background: #2563eb; color: white; }
        .btn-primary:hover { background: #1d4ed8; }
        .form-group { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1rem; }
        .form-group label { font-weight: 500; }
        .form-group input { padding: 0.6rem; border: 1px solid #ddd; border-radius: 0.5rem; font-size: 0.95rem; }
        .success { background: #dcfce7; color: #166534; padding: 0.75rem; border-radius: 0.5rem; margin-bottom: 1rem; }
        .error { background: #fee2e2; color: #991b1b; padding: 0.75rem; border-radius: 0.5rem; margin-bottom: 1rem; }
        .modal { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 999; }
        .modal-content { background: white; padding: 1.5rem; border-radius: 0.75rem; width: 100%; max-width: 450px; box-shadow: 0 20px 25px rgba(0,0,0,0.15); }
        .modal-header { margin-bottom: 1.5rem; }
        .modal-header h2 { margin: 0; font-size: 1.3rem; font-weight: 600; }
        .modal-actions { display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 1.5rem; }
        .btn-secondary { background: #f9fafb; border: 1px solid #ddd; color: #333; }
        .btn-secondary:hover { background: #f3f4f6; }
      `}</style>

      <div className="container">
        <div className="header">
          <h1>🎓 Bem-vindo ao Gestor de Cursos</h1>
          <p>Escolha uma área no menu acima para continuar</p>
        </div>

        <div className="welcome-box">
          <h2>Olá, {user?.nome}!</h2>
          <p>Sua jornada acadêmica começa aqui. Acesse suas turmas, inscrições e muito mais.</p>
        </div>

        <div className="card">
          <button onClick={abrirModal} className="btn btn-primary">
            ⚙️ Editar Perfil
          </button>
        </div>
      </div>

      {showModal && (
        <div className="modal" onClick={fecharModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Editar Perfil</h2>
            </div>

            <div className="form-group">
              <label>Nome</label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Nova Senha</label>
              <input
                type="password"
                placeholder="Deixe em branco para não alterar"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
              />
            </div>

            {mensagem && (
              <div className={mensagem.includes("sucesso") ? "success" : "error"}>
                {mensagem}
              </div>
            )}

            <div className="modal-actions">
              <button onClick={fecharModal} className="btn btn-secondary">
                Cancelar
              </button>
              <button
                onClick={salvarPerfil}
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
