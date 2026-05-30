const service = require('../services/servicePeriodo');

async function getPeriodos(req, res) {
  try {
    const periodos = await service.listPeriodos();
    res.json(periodos);
  } catch (err) {
    console.error('Erro ao buscar períodos:', err);
    res.status(500).json({ error: 'Erro ao buscar períodos' });
  }
}

async function createPeriodo(req, res) {
  try {
    const { codigo, nome, data_inicio, data_fim, ativo, codigo_graduacao } = req.body;

    if (!codigo || !nome || !data_inicio || !data_fim || !codigo_graduacao) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    const periodo = await service.createPeriodo({
      codigo,
      nome,
      data_inicio,
      data_fim,
      ativo,
      codigo_graduacao,
    });

    res.status(201).json(periodo);
  } catch (err) {
    console.error('Erro ao criar período:', err);
    res.status(500).json({ error: 'Erro ao criar período' });
  }
}

async function updatePeriodo(req, res) {
  try {
    const { id } = req.params;
    const { codigo, nome, data_inicio, data_fim, ativo, codigo_graduacao } = req.body;

    if (!codigo || !nome || !data_inicio || !data_fim || !codigo_graduacao) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    const result = await service.updatePeriodo(id, {
      codigo,
      nome,
      data_inicio,
      data_fim,
      ativo,
      codigo_graduacao,
    });

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Período não encontrado' });
    }

    res.json({ message: 'Período atualizado com sucesso' });
  } catch (err) {
    console.error('Erro ao atualizar período:', err);
    res.status(500).json({ error: 'Erro ao atualizar período' });
  }
}

async function deletePeriodo(req, res) {
  try {
    const { id } = req.params;

    const result = await service.deletePeriodo(id);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Período não encontrado' });
    }

    res.json({ message: 'Período excluído com sucesso' });
  } catch (err) {
    console.error('Erro ao excluir período:', err);
    res.status(500).json({ error: 'Erro ao excluir período' });
  }
}

module.exports = {
  getPeriodos,
  createPeriodo,
  updatePeriodo,
  deletePeriodo,
};
