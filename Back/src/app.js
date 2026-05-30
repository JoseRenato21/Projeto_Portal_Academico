// src/app.js
const express = require("express");
const app = express();
const cors = require("cors");

app.use(cors());
app.use(express.json());
app.set("view engine", "ejs");

// Rotas
const userRouter = require("./routes/routeUser");
const cursoRouter = require("./routes/routeCurso");
const periodoRouter = require("./routes/routePeriodo");
const turmaRouter = require("./routes/routeTurma");
const alunoCursoRouter = require("./routes/routeAlunoCurso");
const historicoAlunoRouter = require("./routes/routeHistoricoAluno");
const materialAulaRouter = require("./routes/routeMaterialAula");
const respostaAtividadeRouter = require("./routes/routeRespostaAtividade");
const alunoRouter = require("./routes/routeAluno");
const inscricaoRouter = require("./routes/routeInscricao");
const graduacaoRouter = require("./routes/routeGraduacao");

// Rota raiz só pra teste
app.get("/", (req, res) => res.send("eusouget"));

// Prefixos principais
app.use("/user", userRouter);
app.use("/curso", cursoRouter);
app.use("/periodo", periodoRouter);
app.use("/turma", turmaRouter);
app.use("/aluno_curso", alunoCursoRouter);
app.use("/historico_aluno", historicoAlunoRouter);
app.use("/material_aula", materialAulaRouter);
app.use("/resposta_atividade", respostaAtividadeRouter);
app.use("/aluno", alunoRouter);
app.use("/graduacao", graduacaoRouter);
app.use("/inscricoes", inscricaoRouter);
app.use("/inscricao", inscricaoRouter);

app.listen(3001, () =>
  console.log("servidor rodando na porta 3001")
);
