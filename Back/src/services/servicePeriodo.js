const DB = require('../config/database');

async function listPeriodos() {
  await DB.execute(
    `UPDATE periodo SET ativo = 0 WHERE data_fim < CURDATE() AND ativo = 1`
  );
  const [rows] = await DB.execute('SELECT * FROM periodo');
  return rows;
}

async function createPeriodo({ codigo, nome, data_inicio, data_fim, ativo, codigo_graduacao }) {
  const [result] = await DB.execute(
    `INSERT INTO periodo (codigo, nome, data_inicio, data_fim, ativo, codigo_graduacao)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [codigo, nome, data_inicio, data_fim, ativo ?? true, codigo_graduacao]
  );

  return {
    id_periodo: result.insertId,
    codigo,
    nome,
    data_inicio,
    data_fim,
    ativo: ativo ?? true,
    codigo_graduacao,
  };
}

async function updatePeriodo(id_periodo, { codigo, nome, data_inicio, data_fim, ativo, codigo_graduacao }) {
  const [result] = await DB.execute(
    `UPDATE periodo
        SET codigo = ?, nome = ?, data_inicio = ?, data_fim = ?, ativo = ?, codigo_graduacao = ?
      WHERE id_periodo = ?`,
    [codigo, nome, data_inicio, data_fim, ativo, codigo_graduacao, id_periodo]
  );
  return result;
}

async function deletePeriodo(id_periodo) {
  const [result] = await DB.execute(
    'DELETE FROM periodo WHERE id_periodo = ?',
    [id_periodo]
  );
  return result;
}

module.exports = {
  listPeriodos,
  createPeriodo,
  updatePeriodo,
  deletePeriodo,
};
