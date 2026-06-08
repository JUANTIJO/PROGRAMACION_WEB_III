const router = require("express").Router();
const pool = require("../config/database");
const { verificarToken } = require("../middleware/auth");

const obtenerPacienteId = async (usuarioId) => {
  const r = await pool.query("SELECT id FROM pacientes WHERE usuario_id = $1", [usuarioId]);
  return r.rows[0]?.id;
};

router.get("/", verificarToken, async (req, res) => {
  try {
    const pacienteId = await obtenerPacienteId(req.usuario.id);
    const citas = await pool.query(
      "SELECT * FROM citas WHERE paciente_id = $1 AND activo = TRUE ORDER BY fecha_hora DESC",
      [pacienteId]
    );
    const medicamentos = await pool.query(
      "SELECT * FROM medicamentos WHERE paciente_id = $1 AND activo = TRUE",
      [pacienteId]
    );
    const registros = await pool.query(
      `SELECT rm.*, m.nombre FROM registro_medicacion rm
       JOIN medicamentos m ON rm.medicamento_id = m.id
       WHERE rm.paciente_id = $1 ORDER BY rm.fecha DESC LIMIT 100`,
      [pacienteId]
    );
    res.json({
      generado_en: new Date().toISOString(),
      paciente_id: pacienteId,
      citas: citas.rows,
      medicamentos: medicamentos.rows,
      registros_medicacion: registros.rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
