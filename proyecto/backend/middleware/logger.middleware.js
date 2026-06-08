// ============================================================
// middleware/logger.middleware.js — Log de accesos al sistema
// Registra: usuario, IP, evento, navegador, fecha y hora
// ============================================================

const pool = require("../config/database");

/**
 * Registra un evento de acceso en la tabla logs_acceso
 *
 * @param {object} datos - Datos del evento a registrar
 * @param {number|null} datos.usuarioId  - ID del usuario (null si login fallido)
 * @param {string|null} datos.email      - Email del usuario
 * @param {string}      datos.ip         - Dirección IP del cliente
 * @param {string}      datos.evento     - Tipo de evento: login|logout|login_fallido|registro
 * @param {string}      datos.navegador  - User-Agent del navegador
 */
const registrarAcceso = async (req, usuarioId, email, evento, exitoso = true) => {
  try {
    const { ip, navegador } = req.metadatos || { ip: '0.0.0.0', navegador: 'Desconocido' };
    // Extraer sistema operativo del user-agent de forma básica
    let sistemaOp = "Desconocido";
    if (navegador) {
      if (navegador.includes("Windows")) sistemaOp = "Windows";
      else if (navegador.includes("Mac")) sistemaOp = "macOS";
      else if (navegador.includes("Linux")) sistemaOp = "Linux";
      else if (navegador.includes("Android")) sistemaOp = "Android";
      else if (navegador.includes("iOS") || navegador.includes("iPhone")) sistemaOp = "iOS";
    }

    await pool.query(
      `INSERT INTO logs_acceso
         (usuario_id, correo_intento, ip_address, evento, navegador, sistema_operativo, exitoso)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [usuarioId || null, email || null, ip, evento, navegador || null, sistemaOp, exitoso]
    );
  } catch (err) {
    // El log nunca debe detener el flujo principal
    console.error("[LOGGER] Error al registrar log de acceso:", err.message);
  }
};

/**
 * Middleware express para capturar IP y User-Agent automáticamente
 */
const capturarMetadatos = (req, res, next) => {
  req.metadatos = {
    ip: req.ip || req.connection.remoteAddress || "0.0.0.0",
    navegador: req.headers["user-agent"] || "Desconocido",
  };
  next();
};

module.exports = { registrarAcceso, capturarMetadatos };
