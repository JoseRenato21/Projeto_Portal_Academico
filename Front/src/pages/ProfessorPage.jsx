// src/pages/ProfessorPage.jsx
import { Link } from "react-router-dom";

export default function ProfessorPage() {
  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        body { font-family: system-ui, -apple-system, sans-serif; background: #f5f5f5; }
        .container { max-width: 900px; margin: 0 auto; padding: 1.5rem; }
        .header { margin-bottom: 2rem; }
        .header h1 { margin: 0 0 0.5rem 0; font-size: 1.8rem; font-weight: 700; color: #111827; }
        .header p { margin: 0; color: #6b7280; font-size: 1rem; }
        .cards-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin-top: 2rem; }
        .card-link { display: flex; flex-direction: column; padding: 1.5rem; background: white; border-radius: 0.75rem; box-shadow: 0 2px 8px rgba(0,0,0,0.08); text-decoration: none; color: #111827; transition: all 0.3s; border-left: 4px solid #2563eb; }
        .card-link:hover { transform: translateY(-4px); box-shadow: 0 10px 20px rgba(0,0,0,0.12); border-left-color: #1d4ed8; }
        .card-link.green { border-left-color: #10b981; }
        .card-link.green:hover { border-left-color: #059669; }
        .card-icon { font-size: 2.5rem; margin-bottom: 0.75rem; }
        .card-title { font-size: 1.1rem; font-weight: 600; margin-bottom: 0.5rem; }
        .card-desc { font-size: 0.9rem; color: #6b7280; margin: 0; }
      `}</style>

      <div className="container">
        <div className="header">
          <h1>👨‍🏫 Painel do Professor</h1>
          <p>Gerencie suas turmas, inscrições e lançamento de notas</p>
        </div>

        <div className="cards-grid">
          <Link to="/professor/turmas" className="card-link">
            <div className="card-icon">📚</div>
            <h3 className="card-title">Minhas Turmas</h3>
            <p className="card-desc">Acesse as turmas que você está lecionando e gerencie conteúdos</p>
          </Link>

          <Link to="/professor/inscricoes" className="card-link green">
            <div className="card-icon">📝</div>
            <h3 className="card-title">Gerenciar Inscrições</h3>
            <p className="card-desc">Visualize e gerencie as inscrições dos alunos em suas turmas</p>
          </Link>
        </div>
      </div>
    </>
  );
}
