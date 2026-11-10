import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";

export default function ProfessorTurmaAlunosPage() {
  const { idTurma } = useParams();
  const location = useLocation();
  const nomeTurma = location.state?.nomeTurma || `Turma ${idTurma}`;

  const [alunos, setAlunos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [savingId, setSavingId] = useState(null);
  const [mediaTurma, setMediaTurma] = useState(null);

  // ---- função auxiliar para calcular média geral da turma ----
  function calcularMediaTurma(lista) {
    const comMedia = lista.filter(
      (a) => a.media_final !== null && a.media_final !== undefined
    );
    if (comMedia.length === 0) return null;

    const soma = comMedia.reduce(
      (acc, a) => acc + Number(a.media_final || 0),
      0
    );
    return soma / comMedia.length;
  }

  // ---- carregar alunos da turma ----
  async function carregarAlunos() {
    try {
      setLoading(true);
      setErro("");

      const res = await fetch(
        `http://localhost:3001/aluno_curso/turma/${idTurma}`
      );
      const data = await res.json();

      if (!res.ok) {
        setErro(data.error || "Erro ao buscar alunos da turma");
        setAlunos([]);
        setMediaTurma(null);
        return;
      }

      const lista = (data || []).map((a) => ({
        ...a,
        p1_edit: a.p1 ?? "",
        p2_edit: a.p2 ?? "",
        pf_edit: a.pf ?? "",
      }));

      setAlunos(lista);
      setMediaTurma(calcularMediaTurma(lista));
    } catch (e) {
      console.error(e);
      setErro("Erro de comunicação com o servidor.");
      setAlunos([]);
      setMediaTurma(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarAlunos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idTurma]);

  const handleChange = (id_aluno_curso, campo, valor) => {
    setAlunos((prev) =>
      prev.map((a) =>
        a.id_aluno_curso === id_aluno_curso ? { ...a, [campo]: valor } : a
      )
    );
  };

  const salvarNotas = async (aluno) => {
    setSavingId(aluno.id_aluno_curso);
    setErro("");

    try {
      const res = await fetch(
        `http://localhost:3001/aluno_curso/${aluno.id_aluno_curso}/notas`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            p1: aluno.p1_edit === "" ? null : Number(aluno.p1_edit),
            p2: aluno.p2_edit === "" ? null : Number(aluno.p2_edit),
            pf: aluno.pf_edit === "" ? null : Number(aluno.pf_edit),
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setErro(data.error || "Erro ao salvar notas");
      } else {
        // Recarrega do servidor pra pegar media_final + status atualizados
        await carregarAlunos();
      }
    } catch (e) {
      console.error(e);
      setErro("Erro de comunicação com o servidor.");
    } finally {
      setSavingId(null);
    }
  };

  if (loading) return <p className="p-center">Carregando alunos...</p>;

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
        table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
        th { background: #f9fafb; border-bottom: 2px solid #e5e7eb; padding: 0.75rem; text-align: left; font-weight: 600; color: #666; font-size: 0.8rem; text-transform: uppercase; }
        td { padding: 0.75rem; border-bottom: 1px solid #e5e7eb; }
        tr:nth-child(even) { background: #f9fafb; }
        tr:hover { background: #f3f4f6; }
        input { padding: 0.4rem 0.6rem; border: 1px solid #ddd; border-radius: 0.4rem; font-size: 0.9rem; width: 5rem; }
        input:focus { outline: none; border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); }
        .btn { padding: 0.5rem 1rem; border: none; border-radius: 0.4rem; cursor: pointer; font-size: 0.85rem; font-weight: 500; background: #2563eb; color: white; }
        .btn:hover { background: #1d4ed8; }
        .btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .p-center { text-align: center; color: #666; padding: 2rem; }
        .overflow-x { overflow-x: auto; }
        th:nth-child(2), th:nth-child(3), th:nth-child(4), th:nth-child(5), th:nth-child(6), th:nth-child(7),
        td:nth-child(2), td:nth-child(3), td:nth-child(4), td:nth-child(5), td:nth-child(6), td:nth-child(7) { text-align: center; }
      `}</style>

      <div className="container">
        <div className="header">
          <h1> Lançar Notas</h1>
          <p>{nomeTurma}</p>
        </div>

        {/* BIG NUMBER - Média geral da turma */}
        <div className="card" style={{ marginBottom: "1rem", textAlign: "center" }}>
          <p
            style={{
              margin: 0,
              fontSize: "0.9rem",
              color: "#6b7280",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            Média geral da turma
          </p>
          <div
            style={{
              marginTop: "0.25rem",
              fontSize: "3rem",
              fontWeight: 700,
            }}
          >
            {mediaTurma != null ? mediaTurma.toFixed(1) : "-"}
          </div>
        </div>

        {erro && <div className="error">{erro}</div>}

        <div className="card">
          <div className="overflow-x">
            <table>
              <thead>
                <tr>
                  <th>Aluno</th>
                  <th>P1</th>
                  <th>P2</th>
                  <th>PF</th>
                  <th>Média</th>
                  <th>Situação</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {alunos.map((a) => (
                  <tr key={a.id_aluno_curso}>
                    <td style={{ fontWeight: 500, textAlign: "left" }}>
                      {a.nome_aluno}
                    </td>
                    <td>
                      <input
                        type="number"
                        step="0.1"
                        value={a.p1_edit}
                        onChange={(e) =>
                          handleChange(
                            a.id_aluno_curso,
                            "p1_edit",
                            e.target.value
                          )
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        step="0.1"
                        value={a.p2_edit}
                        onChange={(e) =>
                          handleChange(
                            a.id_aluno_curso,
                            "p2_edit",
                            e.target.value
                          )
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        step="0.1"
                        value={a.pf_edit}
                        onChange={(e) =>
                          handleChange(
                            a.id_aluno_curso,
                            "pf_edit",
                            e.target.value
                          )
                        }
                      />
                    </td>

                    {/* Média final atual do aluno */}
                    <td>
                      {a.media_final != null
                        ? Number(a.media_final).toFixed(1)
                        : "-"}
                    </td>

                    {/* Situação vinda do banco */}
                    <td>{a.situacao ?? "-"}</td>

                    <td>
                      <button
                        onClick={() => salvarNotas(a)}
                        disabled={savingId === a.id_aluno_curso}
                        className="btn"
                      >
                        {savingId === a.id_aluno_curso ? "..." : "Salvar"}
                      </button>
                    </td>
                  </tr>
                ))}
                {alunos.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-center">
                      Nenhum aluno matriculado nessa turma.
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
