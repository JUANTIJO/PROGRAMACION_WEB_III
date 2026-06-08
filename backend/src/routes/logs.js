const router = require("express").Router();
const pool = require("../config/database");
const { verificarToken, soloAdmin } = require("../middleware/auth");

router.get("/", verificarToken, soloAdmin, async (req, res) => {
  try {
    const { pagina = 1, limite = 50 } = req.query;
    const offset = (pagina - 1) * limite;
    const r = await pool.query(
      `SELECT l.*, u.nombre, u.correo FROM logs_acceso l
       LEFT JOIN usuarios u ON l.usuario_id = u.id
       ORDER BY l.creado_en DESC LIMIT $1 OFFSET $2`,
      [limite, offset]
    );
    res.json({ logs: r.rows, total: r.rowCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
