// src/App.jsx
import { Routes, Route, Link, NavLink, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import AlunoPage from "./pages/AlunoPage";
import ProfessorPage from "./pages/ProfessorPage";
import AdminPage from "./pages/AdminPage";
import AdminUsersPage from "./pages/AdminUsersPage";
import AdminCoursesPage from "./pages/AdminCoursesPage";
import AdminPeriodosPage from "./pages/AdminPeriodosPage";
import AdminTurmasPage from "./pages/AdminTurmasPage";
import TurmasDisponiveis from "./pages/TurmasDisponiveis";
import MinhasInscricoes from "./pages/MinhasInscricoes";
import ProfessorGerenciarInscricoes from "./pages/ProfessorGerenciarInscricoes";
import ProfessorTurmaAlunosPage from "./pages/ProfessorTurmaAlunosPage";
import ProfessorTurmaMateriaisPage from "./pages/ProfessorTurmaMateriaisPage";
import ProfessorTurmaPage from "./pages/ProfessorTurmaPage";
import RelatoriosHistoricoPage from "./pages/RelatoriosHistoricoPage";
import AlunoMateriaisPage from "./pages/AlunoMateriaisPage";

function hasAluno(tipo) {
  return (tipo & 1) !== 0;
}
function hasProfessor(tipo) {
  return (tipo & 2) !== 0;
}
function hasAdmin(tipo) {
  return (tipo & 4) !== 0;
}

function AppLayout() {
  const { user, logout } = useAuth();
  const t = user.tipo;

  return (
    <>
      <div>
        <header className="navbar">
          <Link to="/app" className="brand">
            <span className="brand-mark">G</span>
            Gestor de Cursos
          </Link>
          <NavLink to="/app" end className="nav-link">Início</NavLink>
          {hasAluno(t) && <NavLink to="/aluno" className="nav-link">Aluno</NavLink>}
          {hasProfessor(t) && <NavLink to="/professor" className="nav-link">Professor</NavLink>}
          {hasAdmin(t) && <NavLink to="/admin" className="nav-link">Administração</NavLink>}
          {hasAdmin(t) && <NavLink to="/relatorios" className="nav-link">Relatórios</NavLink>}
          <div className="nav-user">
            <span><strong>{user.nome}</strong></span>
            <button onClick={logout} className="btn-logout">Sair</button>
          </div>
        </header>

        <Routes>
          <Route path="/app" element={<HomePage />} />

          {hasAluno(t) && (
            <>
              <Route path="/aluno" element={<AlunoPage />} />
              <Route path="/aluno/turmas" element={<TurmasDisponiveis />} />
              <Route path="/aluno/inscricoes" element={<MinhasInscricoes />} />
              <Route path="/aluno/materiais" element={<AlunoMateriaisPage />} />
            </>
          )}

          {hasProfessor(t) && (
            <>
              <Route path="/professor" element={<ProfessorPage />} />
              <Route path="/professor/turmas" element={<ProfessorTurmaPage />} />
              <Route
                path="/professor/turmas/:idTurma/alunos"
                element={<ProfessorTurmaAlunosPage />}
              />
              <Route
                path="/professor/turmas/:idTurma/materiais"
                element={<ProfessorTurmaMateriaisPage />}
              />
              <Route
                path="/professor/inscricoes"
                element={<ProfessorGerenciarInscricoes />}
              />
            </>
          )}

          {hasAdmin(t) && (
            <>
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/admin/usuarios" element={<AdminUsersPage />} />
              <Route path="/admin/cursos" element={<AdminCoursesPage />} />
              <Route path="/admin/periodos" element={<AdminPeriodosPage />} />
              <Route path="/admin/turmas" element={<AdminTurmasPage />} />
              <Route path="/relatorios" element={<RelatoriosHistoricoPage />} />
            </>
          )}

          {/* Se nenhuma rota casar dentro do AppLayout, volta pro /app */}
          <Route path="*" element={<Navigate to="/app" />} />
        </Routes>
      </div>
    </>
  );
}

function App() {
  const { user } = useAuth();

  if (!user) {
    return (
      <Routes>
        <Route path="/*" element={<LoginPage />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/*" element={<AppLayout />} />
      <Route path="*" element={<Navigate to="/app" />} />
    </Routes>
  );
}

export default App;
