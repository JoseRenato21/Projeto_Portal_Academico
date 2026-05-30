const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'A1z2u1l2*',
    database: 'gestorDeCursos',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});
module.exports = pool;