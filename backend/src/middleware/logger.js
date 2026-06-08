const pool = require("../config/database");

const registrarAcceso = async (req, usuarioId, correoIntento, evento, exitoso) => {
  try {
    const ip = req.ip || req.connection.remoteAddress || "0.0.0.0";
    const ua = req.get("user-agent") || "";
    const browser = ua.substring(0, 200);
    await pool.query(
      `INSERT INTO logs_acceso 
        (usuario_id, correo_intento, ip_address, evento, navegador, exitoso, fecha, hora)
       VALUES ($1, $2, $3, $4, $5, $6, CURRENT_DATE, CURRENT_TIME)`,
      [usuarioId || null, correoIntento, ip, evento, browser, exitoso]
    );
  } catch (err) {
    console.error("Error al registrar log:", err.message);
  }
};

module.exports = { registrarAcceso };
