// src/pages/AdminPage.jsx
import { Link } from "react-router-dom";

export default function AdminPage() {
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
        .card-link { display: flex; flex-direction: column; padding: 1.5rem; background: white; border-radius: 0.75rem; box-shadow: 0 2px 8px rgba(0,0,0,0.08); text-decoration: none; color: #111827; transition: all 0.3s; border-left: 4px solid #6b21a8; }
        .card-link:hover { transform: translateY(-4px); box-shadow: 0 10px 20px rgba(0,0,0,0.12); border-left-color: #7c3aed; }
        .card-icon { font-size: 2.5rem; margin-bottom: 0.75rem; }
        .card-title { font-size: 1.1rem; font-weight: 600; margin-bottom: 0.5rem; }
        .card-desc { font-size: 0.9rem; color: #6b7280; margin: 0; }
      `}</style>

      <div className="container">
        <div className="header">
          <h1> Painel do Administrador</h1>
          <p>Gerencie todos os recursos do sistema</p>
        </div>

        <div className="cards-grid">
          <Link to="/admin/usuarios" className="card-link">
            <div className="card-icon"></div>
            <h3 className="card-title">Gerenciar Usuários</h3>
            <p className="card-desc">Crie, edite e gerencie todos os usuários do sistema</p>
          </Link>

          <Link to="/admin/cursos" className="card-link">
            <div className="card-icon"></div>
            <h3 className="card-title">Gerenciar Cursos</h3>
            <p className="card-desc">Administre os cursos disponíveis no sistema</p>
          </Link>

          <Link to="/admin/turmas" className="card-link">
            <div className="card-icon"></div>
            <h3 className="card-title">Gerenciar Turmas</h3>
            <p className="card-desc">Crie e gerencie as turmas de cada curso</p>
          </Link>

          <Link to="/admin/periodos" className="card-link">
            <div className="card-icon"></div>
            <h3 className="card-title">Gerenciar Períodos</h3>
            <p className="card-desc">Configure os períodos acadêmicos do sistema</p>
          </Link>

          <Link to="/relatorios" className="card-link">
            <div className="card-icon"></div>
            <h3 className="card-title">Relatórios e Históricos</h3>
            <p className="card-desc">Visualize históricos de alunos e estatísticas de turmas</p>
          </Link>
        </div>
      </div>
    </>
  );
}
