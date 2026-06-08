// routes/reportes.routes.js
const express = require("express");
const r = express.Router();
const pool = require("../config/database");
const { verificarToken } = require("../middleware/auth.middleware");

r.use(verificarToken);

// Genera datos JSON para el PDF (el frontend usa expo-print)
r.get("/generar", async (req, res) => {
  const usuarioId = req.usuario.id;
  const { tipo = "completo", desde, hasta } = req.query;

  try {
    const [citas, medicamentos, registros] = await Promise.all([
      pool.query(
        `SELECT titulo, doctor, especialidad, fecha_hora, estado, lugar, notas
         FROM citas WHERE usuario_id=$1 AND activo=TRUE ORDER BY fecha_hora DESC LIMIT 50`,
        [usuarioId]
      ),
      pool.query(
        "SELECT nombre, dosis, frecuencia, instrucciones FROM medicamentos WHERE usuario_id=$1 AND activo=TRUE",
        [usuarioId]
      ),
      pool.query(
        `SELECT rm.fecha_hora_prog, rm.tomado, m.nombre AS medicamento
         FROM registro_medicacion rm
         JOIN medicamentos m ON rm.medicamento_id = m.id
         WHERE rm.usuario_id=$1 ORDER BY rm.fecha_hora_prog DESC LIMIT 100`,
        [usuarioId]
      ),
    ]);

    return res.json({
      usuario: req.usuario.nombre_completo,
      generado_en: new Date().toISOString(),
      citas: citas.rows,
      medicamentos: medicamentos.rows,
      historial_medicacion: registros.rows,
    });
  } catch (err) {
    return res.status(500).json({ error: "Error al generar reporte" });
  }
});

module.exports = r;


// ─── routes/logs.routes.js ───────────────────────────────────
// (Acceso solo para admins o consulta propia)
