import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProfessorTurmasPage() {
  const { user } = useAuth();
  const [turmas, setTurmas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(
          `http://localhost:3001/turma/professor/${user.id_usuario}`
        );
        const data = await res.json();

        if (!res.ok) {
          setErro(data.error || "Erro ao carregar turmas");
        } else {
          setTurmas(data);
        }
      } catch (e) {
        console.error(e);
        setErro("Erro de comunicação com o servidor.");
      } finally {
        setLoading(false);
      }
    }

    if (user) load();
  }, [user]);

  if (!user) return <p className="p-center">Usuário não carregado.</p>;
  if (loading) return <p className="p-center">Carregando turmas...</p>;

  const ativas = turmas.filter((t) => t.ativo === 1 || t.ativo === true);
  const inativas = turmas.filter((t) => t.ativo === 0 || t.ativo === false);

  const TabelaTurmas = ({ dados }) => (
    <div style={{ overflowX: "auto" }}>
      <table>
        <thead>
          <tr>
            <th>Turma</th>
            <th>Curso</th>
            <th>Período</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {dados.map((t) => (
            <tr key={t.id_turma}>
              <td style={{ fontWeight: 500 }}>{t.nome}</td>
              <td>{t.nome_curso}</td>
              <td>{t.nome_periodo || t.codigo_periodo}</td>
              <td>
                <div className="actions">
                  <Link
                    to={`/professor/turmas/${t.id_turma}/alunos`}
                    state={{ nomeTurma: t.nome }}
                    className="action-link"
                  >
                     Notas
                  </Link>
                  <span className="separator">·</span>
                  <Link
                    to={`/professor/turmas/${t.id_turma}/materiais`}
                    state={{ nomeTurma: t.nome }}
                    className="action-link"
                  >
                     Materiais
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        body { font-family: system-ui, -apple-system, sans-serif; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; padding: 1.5rem; }
        .header { margin-bottom: 1.5rem; }
        .header h1 { margin: 0; font-size: 1.5rem; font-weight: 700; }
        .header p { margin: 0.25rem 0 0 0; color: #666; font-size: 0.95rem; }
        .card { background: white; border-radius: 0.75rem; padding: 1.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.08); margin-bottom: 2rem; }
        .error { background: #fee2e2; color: #991b1b; padding: 0.75rem; border-radius: 0.5rem; margin-bottom: 1rem; }
        .empty { text-align: center; color: #666; padding: 2rem; }
        .section-title { font-size: 1.1rem; font-weight: 600; margin: 0 0 1rem 0; color: #111827; }
        .section-subtitle { font-size: 0.9rem; color: #6b7280; margin: 0 0 1rem 0; }
        table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
        th { background: #f9fafb; border-bottom: 2px solid #e5e7eb; padding: 0.75rem; text-align: left; font-weight: 600; color: #666; font-size: 0.8rem; text-transform: uppercase; }
        td { padding: 0.75rem; border-bottom: 1px solid #e5e7eb; }
        tr:nth-child(even) { background: #f9fafb; }
        tr:hover { background: #f3f4f6; }
        .actions { display: flex; gap: 0.75rem; align-items: center; }
        .action-link { color: #2563eb; text-decoration: none; font-weight: 500; font-size: 0.9rem; }
        .action-link:hover { text-decoration: underline; }
        .separator { color: #ddd; }
        .p-center { text-align: center; color: #666; padding: 2rem; }
      `}</style>

      <div className="container">
        <div className="header">
          <h1> Minhas Turmas</h1>
          <p>Gerencie suas turmas e lançe notas</p>
        </div>

        {erro && <div className="error">{erro}</div>}

        {/* ATIVAS */}
        {ativas.length > 0 && (
          <div className="card">
            <h2 className="section-title">✓ Turmas Ativas</h2>
            <p className="section-subtitle">Turmas em andamento</p>
            <TabelaTurmas dados={ativas} />
          </div>
        )}

        {/* INATIVAS */}
        {inativas.length > 0 && (
          <div className="card">
            <h2 className="section-title">✗ Turmas Inativas</h2>
            <p className="section-subtitle">Turmas encerradas</p>
            <TabelaTurmas dados={inativas} />
          </div>
        )}

        {turmas.length === 0 && (
          <div className="card">
            <p className="empty">Você ainda não está vinculado a nenhuma turma.</p>
          </div>
        )}
      </div>
    </>
  );
}
