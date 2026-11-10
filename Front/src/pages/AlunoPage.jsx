// src/pages/AlunoPage.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function AlunoPage() {
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
        .card-icon { font-size: 2.5rem; margin-bottom: 0.75rem; }
        .card-title { font-size: 1.1rem; font-weight: 600; margin-bottom: 0.5rem; }
        .card-desc { font-size: 0.9rem; color: #6b7280; margin: 0; }
      `}</style>

      <div className="container">
        <div className="header">
          <h1> Área do Aluno</h1>
          <p>Gerencie suas inscrições, turmas e materiais</p>
        </div>

        <div className="cards-grid">
          <Link to="/aluno/turmas" className="card-link">
            <div className="card-icon"></div>
            <h3 className="card-title">Turmas Disponíveis</h3>
            <p className="card-desc">
              Conheça as turmas abertas para inscrição e escolha as que deseja fazer
            </p>
          </Link>

          <Link to="/aluno/inscricoes" className="card-link">
            <div className="card-icon"></div>
            <h3 className="card-title">Minhas Inscrições</h3>
            <p className="card-desc">
              Acompanhe suas inscrições, notas e histórico acadêmico
            </p>
          </Link>

          <Link to="/aluno/materiais" className="card-link">
            <div className="card-icon"></div>
            <h3 className="card-title">Materiais e Atividades</h3>
            <p className="card-desc">
              Veja os materiais publicados nas turmas em que você está matriculado e responda atividades
            </p>
          </Link>
        </div>
      </div>
    </>
  );
}
