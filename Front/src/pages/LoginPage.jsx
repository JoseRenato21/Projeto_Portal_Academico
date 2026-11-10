import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [cpf, setCpf] = useState("");
  const [senha, setSenha] = useState("");
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus(null);
    setLoading(true);

    try {
      await login(cpf, senha);
      navigate("/app");
    } catch (err) {
      setStatus(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-shell">
      <aside className="login-side">
        <div className="brand">
          <span className="brand-mark">G</span>
          Gestor de Cursos
        </div>
        <div>
          <h1>Turmas, notas e materiais em um só lugar.</h1>
          <p>
            Inscrição em turmas, acompanhamento de notas, publicação de materiais e
            relatórios de histórico para alunos, professores e coordenação.
          </p>
        </div>
        <small>Portal acadêmico · CEFET/RJ</small>
      </aside>

      <main className="login-main">
        <div className="login-card" id="root-login">
          <h2>Entrar</h2>
          <p className="sub">Use seu CPF e a senha cadastrada.</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="cpf">CPF</label>
              <input
                id="cpf"
                type="text"
                inputMode="numeric"
                placeholder="Somente números"
                maxLength={11}
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="senha">Senha</label>
              <input
                id="senha"
                type="password"
                placeholder="Sua senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
              />
            </div>

            {status && <div className="error">{status}</div>}

            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
