const pool = require("../config/database");

const obtenerPacienteId = async (usuarioId) => {
  const r = await pool.query("SELECT id FROM pacientes WHERE usuario_id = $1", [usuarioId]);
  return r.rows[0]?.id;
};

const listarCitas = async (req, res) => {
  try {
    const pacienteId = await obtenerPacienteId(req.usuario.id);
    if (!pacienteId) return res.status(404).json({ error: "Perfil de paciente no encontrado" });
    const result = await pool.query(
      `SELECT * FROM citas WHERE paciente_id = $1 AND activo = TRUE ORDER BY fecha_hora ASC`,
      [pacienteId]
    );
    res.json({ citas: result.rows, total: result.rowCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const crearCita = async (req, res) => {
  const { titulo, doctor, especialidad, fecha_hora, ubicacion, notas, recordatorio_min } = req.body;
  try {
    const pacienteId = await obtenerPacienteId(req.usuario.id);
    if (!pacienteId) return res.status(404).json({ error: "Perfil de paciente no encontrado" });
    const r = await pool.query(
      `INSERT INTO citas (paciente_id, titulo, doctor, especialidad, fecha_hora, ubicacion, notas, recordatorio_min)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [pacienteId, titulo, doctor, especialidad, fecha_hora, ubicacion, notas, recordatorio_min || 60]
    );
    res.status(201).json({ mensaje: "Cita creada", cita: r.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const actualizarCita = async (req, res) => {
  const { id } = req.params;
  const { titulo, doctor, especialidad, fecha_hora, ubicacion, notas, estado } = req.body;
  try {
    const pacienteId = await obtenerPacienteId(req.usuario.id);
    if (!pacienteId) return res.status(404).json({ error: "Perfil de paciente no encontrado" });
    const r = await pool.query(
      `UPDATE citas SET titulo=$1, doctor=$2, especialidad=$3, fecha_hora=$4,
       ubicacion=$5, notas=$6, estado=$7, actualizado_en=NOW()
       WHERE id=$8 AND paciente_id=$9 AND activo=TRUE RETURNING *`,
      [titulo, doctor, especialidad, fecha_hora, ubicacion, notas, estado, id, pacienteId]
    );
    if (!r.rows.length) return res.status(404).json({ error: "Cita no encontrada" });
    res.json({ mensaje: "Cita actualizada", cita: r.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const eliminarCita = async (req, res) => {
  const { id } = req.params;
  try {
    const pacienteId = await obtenerPacienteId(req.usuario.id);
    if (!pacienteId) return res.status(404).json({ error: "Perfil de paciente no encontrado" });
    // Eliminacion logica: activo = false
    await pool.query("UPDATE citas SET activo=FALSE, actualizado_en=NOW() WHERE id=$1 AND paciente_id=$2", [id, pacienteId]);
    res.json({ mensaje: "Cita eliminada (baja logica)" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { listarCitas, crearCita, actualizarCita, eliminarCita };
