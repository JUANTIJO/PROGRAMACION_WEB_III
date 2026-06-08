const pool = require("../config/database");

const obtenerPacienteId = async (usuarioId) => {
  const r = await pool.query("SELECT id FROM pacientes WHERE usuario_id = $1", [usuarioId]);
  return r.rows[0]?.id;
};

const listarMedicamentos = async (req, res) => {
  try {
    const pacienteId = await obtenerPacienteId(req.usuario.id);
    if (!pacienteId) return res.status(404).json({ error: "Perfil de paciente no encontrado" });
    const result = await pool.query(
      `SELECT * FROM medicamentos WHERE paciente_id = $1 AND activo = TRUE ORDER BY fecha_inicio DESC`,
      [pacienteId]
    );
    res.json({ medicamentos: result.rows, total: result.rowCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const crearMedicamento = async (req, res) => {
  const { nombre, dosis, frecuencia, horarios, fecha_inicio, fecha_fin, instrucciones, color_pastilla } = req.body;
  try {
    const pacienteId = await obtenerPacienteId(req.usuario.id);
    if (!pacienteId) return res.status(404).json({ error: "Perfil de paciente no encontrado" });
    const r = await pool.query(
      `INSERT INTO medicamentos (paciente_id, nombre, dosis, frecuencia, horarios, fecha_inicio, fecha_fin, instrucciones, color_pastilla)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [pacienteId, nombre, dosis, frecuencia, horarios || [], fecha_inicio, fecha_fin, instrucciones, color_pastilla || '#4A90E2']
    );
    res.status(201).json({ mensaje: "Medicamento creado", medicamento: r.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const actualizarMedicamento = async (req, res) => {
  const { id } = req.params;
  const { nombre, dosis, frecuencia, horarios, fecha_inicio, fecha_fin, instrucciones, color_pastilla } = req.body;
  try {
    const pacienteId = await obtenerPacienteId(req.usuario.id);
    if (!pacienteId) return res.status(404).json({ error: "Perfil de paciente no encontrado" });
    const r = await pool.query(
      `UPDATE medicamentos SET nombre=$1, dosis=$2, frecuencia=$3, horarios=$4, fecha_inicio=$5,
       fecha_fin=$6, instrucciones=$7, color_pastilla=$8
       WHERE id=$9 AND paciente_id=$10 AND activo=TRUE RETURNING *`,
      [nombre, dosis, frecuencia, horarios, fecha_inicio, fecha_fin, instrucciones, color_pastilla, id, pacienteId]
    );
    if (!r.rows.length) return res.status(404).json({ error: "Medicamento no encontrado" });
    res.json({ mensaje: "Medicamento actualizado", medicamento: r.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const eliminarMedicamento = async (req, res) => {
  const { id } = req.params;
  try {
    const pacienteId = await obtenerPacienteId(req.usuario.id);
    if (!pacienteId) return res.status(404).json({ error: "Perfil de paciente no encontrado" });
    const r = await pool.query("UPDATE medicamentos SET activo=FALSE WHERE id=$1 AND paciente_id=$2", [id, pacienteId]);
    if (r.rowCount === 0) return res.status(404).json({ error: "Medicamento no encontrado" });
    res.json({ mensaje: "Medicamento eliminado (baja logica)" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const registrarToma = async (req, res) => {
  const { id } = req.params;
  const { fecha, hora_programada, hora_tomada, notas } = req.body;
  try {
    const pacienteId = await obtenerPacienteId(req.usuario.id);
    if (!pacienteId) return res.status(404).json({ error: "Perfil de paciente no encontrado" });
    
    // Verificar propiedad del medicamento antes de registrar toma
    const medCheck = await pool.query(
      "SELECT id FROM medicamentos WHERE id = $1 AND paciente_id = $2 AND activo = TRUE",
      [id, pacienteId]
    );
    if (medCheck.rows.length === 0) return res.status(404).json({ error: "Medicamento no encontrado" });

    const r = await pool.query(
      `INSERT INTO registro_medicacion (medicamento_id, paciente_id, fecha, hora_programada, hora_tomada, tomado, notas)
       VALUES ($1, $2, $3, $4, $5, TRUE, $6) RETURNING *`,
      [id, pacienteId, fecha, hora_programada, hora_tomada || new Date(), notas]
    );
    res.status(201).json({ mensaje: "Toma registrada", registro: r.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { listarMedicamentos, crearMedicamento, actualizarMedicamento, eliminarMedicamento, registrarToma };
