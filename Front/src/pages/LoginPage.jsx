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
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#111827"
    }}>
      <div style={{
        background: "#fff",
        padding: "2rem",
        borderRadius: "0.75rem",
        width: "100%",
        maxWidth: "400px"
      }}>

        <h2 style={{ textAlign: "center", marginBottom: "1.5rem" }}>Login</h2>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

          <input
            type="text"
            placeholder="CPF"
            maxLength={11}
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
            required
            style={{ padding: "0.5rem", borderRadius: "0.5rem", border: "1px solid #d1d5db" }}
          />

          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            style={{ padding: "0.5rem", borderRadius: "0.5rem", border: "1px solid #d1d5db" }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "0.75rem",
              borderRadius: "0.5rem",
              border: "none",
              background: loading ? "#9ca3af" : "#2563eb",
              color: "#fff",
              cursor: loading ? "not-allowed" : "pointer"
            }}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>

        </form>

        {status && (
          <p style={{ marginTop: "1rem", color: "red" }}>{status}</p>
        )}

      </div>
    </div>
  );
}
