const pool = require("../config/database");

const obtenerPacienteId = async (usuarioId) => {
  const r = await pool.query("SELECT id FROM pacientes WHERE usuario_id = $1", [usuarioId]);
  return r.rows[0]?.id;
};

const obtenerEstadisticas = async (req, res) => {
  try {
    const pacienteId = await obtenerPacienteId(req.usuario.id);
    if (!pacienteId) return res.status(404).json({ error: "Perfil de paciente no encontrado" });
    
    // Estadisticas de citas
    const citas = await pool.query(
      `SELECT estado, COUNT(*) as total FROM citas 
       WHERE paciente_id = $1 AND activo = TRUE GROUP BY estado`,
      [pacienteId]
    );
    
    // Estadisticas de medicacion (ultimo mes)
    const medicacion = await pool.query(
      `SELECT tomado, COUNT(*) as total FROM registro_medicacion 
       WHERE paciente_id = $1 AND fecha >= NOW() - INTERVAL '30 days' GROUP BY tomado`,
      [pacienteId]
    );
    
    // Cumplimiento semanal medicacion
    const semanal = await pool.query(
      `SELECT DATE_TRUNC('week', fecha) as semana,
              COUNT(CASE WHEN tomado THEN 1 END) as tomados,
              COUNT(*) as total
       FROM registro_medicacion WHERE paciente_id = $1
       AND fecha >= NOW() - INTERVAL '8 weeks'
       GROUP BY semana ORDER BY semana`,
      [pacienteId]
    );
    
    res.json({
      citas: citas.rows,
      medicacion: medicacion.rows,
      cumplimientoSemanal: semanal.rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { obtenerEstadisticas };
