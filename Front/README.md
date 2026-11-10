# Front-end do Portal Acadêmico

Interface em React 18 com Vite. Consome a API em `http://localhost:3001`.

```bash
npm install
npm run dev      # servidor de desenvolvimento em http://localhost:5173
npm run build    # gera a versão de produção em dist/
npm run preview  # serve a versão de produção
```

## Estrutura

| Caminho | Função |
|---------|--------|
| `src/App.jsx` | Layout com barra de navegação e rotas liberadas conforme o perfil do usuário |
| `src/context/AuthContext.jsx` | Login e estado do usuário logado |
| `src/pages/` | Uma página por tela, agrupadas por perfil: `Aluno*`, `Professor*`, `Admin*` |
| `src/index.css` | Sistema de design: cores, tipografia, botões, formulários, tabelas, badges e modais |

## Perfis e rotas

O campo `tipo` do usuário é uma máscara de bits (1 aluno, 2 professor, 4 administrador). A navegação mostra apenas as áreas do perfil, e as rotas das outras áreas não são registradas.

| Perfil | Rotas |
|--------|-------|
| Aluno | `/aluno`, `/aluno/turmas`, `/aluno/inscricoes`, `/aluno/materiais` |
| Professor | `/professor`, `/professor/turmas`, `/professor/inscricoes` e as telas de alunos e materiais de cada turma |
| Administrador | `/admin`, `/admin/usuarios`, `/admin/cursos`, `/admin/periodos`, `/admin/turmas`, `/relatorios` |

## Design

As cores, o raio dos cantos e as sombras ficam em variáveis CSS no topo de `src/index.css`. Como cada página traz um bloco `<style>` próprio, os estilos compartilhados usam o prefixo `#root` para prevalecer sobre eles. Para mudar o tema, altere as variáveis `--accent`, `--ink` e `--bg`.
