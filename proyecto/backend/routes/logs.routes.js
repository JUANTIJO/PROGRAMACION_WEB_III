// routes/logs.routes.js
const express = require("express");
const r = express.Router();
const pool = require("../config/database");
const { verificarToken, verificarRol } = require("../middleware/auth.middleware");

r.use(verificarToken);

// Logs del propio usuario
r.get("/mis-accesos", async (req, res) => {
  try {
    const resultado = await pool.query(
      `SELECT evento, ip, navegador, sistema_op, fecha, hora
       FROM logs_acceso WHERE usuario_id=$1
       ORDER BY creado_en DESC LIMIT 30`,
      [req.usuario.id]
    );
    return res.json({ logs: resultado.rows });
  } catch (err) {
    return res.status(500).json({ error: "Error al obtener logs" });
  }
});

// Todos los logs (solo familiar/admin)
r.get("/todos", verificarRol("familiar"), async (req, res) => {
  try {
    const resultado = await pool.query(
      `SELECT l.*, u.nombre_completo, u.email
       FROM logs_acceso l
       LEFT JOIN usuarios u ON l.usuario_id = u.id
       ORDER BY l.creado_en DESC LIMIT 100`
    );
    return res.json({ logs: resultado.rows });
  } catch (err) {
    return res.status(500).json({ error: "Error al obtener logs" });
  }
});

module.exports = r;
