// src/controller/controllerCurso.js

const service = require('../services/serviceCurso');

async function getCursos(req, res) {
  try {
    const cursos = await service.listCursos();
    res.json(cursos);
  } catch (err) {
    console.error('Erro ao buscar cursos:', err);
    res.status(500).json({ error: 'Erro ao buscar cursos' });
  }
}

async function getCursosPorGraduacao(req, res) {
  try {
    const { codigo_graduacao } = req.params;
    const cursos = await service.listCursosPorGraduacao(codigo_graduacao);
    res.json(cursos);
  } catch (err) {
    console.error('Erro ao buscar cursos por graduação:', err);
    res.status(500).json({ error: 'Erro ao buscar cursos por graduação' });
  }
}

async function createCurso(req, res) {
  try {
    const { nome, descricao, carga_horaria, codigo_graduacao, ativo } = req.body;

    if (!nome || !carga_horaria || !codigo_graduacao) {
      return res.status(400).json({ 
        error: 'Nome, carga horária e graduação são obrigatórios' 
      });
    }

    const curso = await service.createCurso({
      nome,
      descricao,
      carga_horaria,
      codigo_graduacao,
      ativo,
    });

    res.status(201).json(curso);
  } catch (err) {
    console.error('Erro ao criar curso:', err);
    res.status(500).json({ error: err.message || 'Erro ao criar curso' });
  }
}

async function updateCurso(req, res) {
  try {
    const { id } = req.params;
    const { nome, descricao, carga_horaria, codigo_graduacao, ativo } = req.body;

    if (!nome || !carga_horaria || !codigo_graduacao) {
      return res.status(400).json({ 
        error: 'Nome, carga horária e graduação são obrigatórios' 
      });
    }

    const result = await service.updateCurso(id, {
      nome,
      descricao,
      carga_horaria,
      codigo_graduacao,
      ativo,
    });

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Curso não encontrado' });
    }

    res.json({ message: 'Curso atualizado com sucesso' });
  } catch (err) {
    console.error('Erro ao atualizar curso:', err);
    res.status(500).json({ error: err.message || 'Erro ao atualizar curso' });
  }
}

async function deleteCurso(req, res) {
  try {
    const { id } = req.params;
    const result = await service.deleteCurso(id);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Curso não encontrado' });
    }

    res.json({ message: 'Curso excluído com sucesso' });
  } catch (err) {
    console.error('Erro ao excluir curso:', err);
    res.status(500).json({ error: 'Erro ao excluir curso' });
  }
}

module.exports = {
  getCursos,
  getCursosPorGraduacao,
  createCurso,
  updateCurso,
  deleteCurso,
};
