const service = require('../services/serviceTurma');

async function getTurmas(req, res) {
  try {
    const turmas = await service.listTurmas();
    res.json(turmas);
  } catch (err) {
    console.error('Erro ao buscar turmas:', err);
    res.status(500).json({ error: 'Erro ao buscar turmas' });
  }
}

async function createTurma(req, res) {
  try {
    const {
      nome,
      codigo_turma,
      vagas_regulares,
      vagas_extras,
      ativo,
      status_inscricoes,
      curso_ref,
      periodo_ref,
      professor_ref,
    } = req.body;

    if (!nome || !codigo_turma || !curso_ref || !periodo_ref || !professor_ref) {
      return res.status(400).json({
        error: 'Nome, código da turma, curso, período e professor são obrigatórios',
      });
    }

    // resolver IDs
    const id_curso = await service.findCursoIdByNome(curso_ref);
    if (!id_curso) {
      return res.status(400).json({ error: 'Curso não encontrado pelo nome informado' });
    }

    const id_periodo = await service.findPeriodoIdByCodigoOuNome(periodo_ref);
    if (!id_periodo) {
      return res.status(400).json({ error: 'Período não encontrado pelo código ou nome informado' });
    }

    const id_professor = await service.findProfessorIdByRef(professor_ref);
    if (!id_professor) {
      return res.status(400).json({
        error: 'Professor não encontrado (nome/matrícula ou não possui perfil de professor)',
      });
    }

    const turma = await service.createTurma({
      id_periodo,
      id_curso,
      id_professor,
      nome,
      codigo_turma,
      vagas_regulares,
      vagas_extras,
      ativo,
      status_inscricoes,
    });

    res.status(201).json(turma);
  } catch (err) {
    console.error('Erro ao criar turma:', err);
    res.status(500).json({ error: 'Erro ao criar turma' });
  }
}

async function updateTurma(req, res) {
  try {
    const { id } = req.params;
    const {
      nome,
      codigo_turma,
      vagas_regulares,
      vagas_extras,
      ativo,
      status_inscricoes,
      curso_ref,
      periodo_ref,
      professor_ref,
    } = req.body;

    if (!nome || !codigo_turma || !curso_ref || !periodo_ref || !professor_ref) {
      return res.status(400).json({
        error: 'Nome, código da turma, curso, período e professor são obrigatórios',
      });
    }

    const id_curso = await service.findCursoIdByNome(curso_ref);
    if (!id_curso) {
      return res.status(400).json({ error: 'Curso não encontrado pelo nome informado' });
    }

    const id_periodo = await service.findPeriodoIdByCodigoOuNome(periodo_ref);
    if (!id_periodo) {
      return res.status(400).json({ error: 'Período não encontrado pelo código ou nome informado' });
    }

    const id_professor = await service.findProfessorIdByRef(professor_ref);
    if (!id_professor) {
      return res.status(400).json({
        error: 'Professor não encontrado (nome/matrícula ou não possui perfil de professor)',
      });
    }

    const result = await service.updateTurma(id, {
      id_periodo,
      id_curso,
      id_professor,
      nome,
      codigo_turma,
      vagas_regulares,
      vagas_extras,
      ativo,
      status_inscricoes,
    });

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Turma não encontrada' });
    }

    res.json({ message: 'Turma atualizada com sucesso' });
  } catch (err) {
    console.error('Erro ao atualizar turma:', err);
    res.status(500).json({ error: 'Erro ao atualizar turma' });
  }
}

async function deleteTurma(req, res) {
  try {
    const { id } = req.params;
    const result = await service.deleteTurma(id);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Turma não encontrada' });
    }

    res.json({ message: 'Turma excluída com sucesso' });
  } catch (err) {
    console.error('Erro ao excluir turma:', err);
    res.status(500).json({ error: 'Erro ao excluir turma' });
  }
}

async function fecharInscricoes(req, res) {
  try {
    const { id } = req.params;
    const id_turma = parseInt(id, 10);

    if (Number.isNaN(id_turma)) {
      return res.status(400).json({ error: 'id_turma inválido' });
    }

    await service.fecharInscricoes(id_turma);

    return res.json({
      message: 'Inscrições fechadas e fila processada com sucesso.',
    });
  } catch (err) {
    console.error('Erro ao fechar inscrições da turma:', err);
    return res.status(400).json({ error: err.message });
  }
}

async function listByProfessor(req, res) {
  try {
    const { id_professor } = req.params;
    const turmas = await service.listTurmasByProfessor(id_professor);
    return res.status(200).json(turmas);
  } catch (err) {
    console.error('Erro ao listar turmas do professor:', err);
    return res.status(500).json({ error: 'Erro ao listar turmas do professor' });
  }
}

async function getFilaTurma(req, res) {
  try {
    const { id } = req.params;
    const id_turma = parseInt(id, 10);

    if (Number.isNaN(id_turma)) {
      return res.status(400).json({ error: 'id_turma inválido' });
    }

    const fila = await service.getFilaTurma(id_turma);
    return res.json(fila);
  } catch (err) {
    console.error('Erro ao buscar fila da turma:', err);
    return res.status(500).json({ error: 'Erro ao buscar fila da turma' });
  }
}

async function getProfessoresByGraduacao(req, res) {
  try {
    const { id_graduacao } = req.params;
    
    const professores = await service.getProfessoresByGraduacao(id_graduacao);
    res.json(professores);
  } catch (err) {
    console.error('Erro ao buscar professores:', err);
    res.status(500).json({ error: 'Erro ao buscar professores' });
  }
}

module.exports = {
  getTurmas,
  createTurma,
  updateTurma,
  deleteTurma,
  fecharInscricoes,
  getFilaTurma,
  listByProfessor,
  getProfessoresByGraduacao,
};
