// ============================================================
// middleware/auth.middleware.js — Verificación de JWT
// ============================================================

const jwt = require("jsonwebtoken");
const pool = require("../config/database");

/**
 * Middleware de autenticación
 * Verifica el token JWT en el header Authorization
 */
const verificarToken = async (req, res, next) => {
  try {
    const encabezado = req.headers.authorization;

    if (!encabezado || !encabezado.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Token de autenticación requerido" });
    }

    const token = encabezado.split(" ")[1];
    const decodificado = jwt.verify(token, process.env.JWT_SECRET);

    if (!decodificado.id) {
      return res.status(401).json({ error: "Token inválido: falta ID de usuario" });
    }

    // Verificar que el usuario aún existe y está activo
    const resultado = await pool.query(
      "SELECT id, nombre, apellido, correo, rol FROM usuarios WHERE id = $1 AND activo = TRUE",
      [decodificado.id]
    );

    if (resultado.rows.length === 0) {
      return res.status(401).json({ error: "Usuario no encontrado o desactivado" });
    }

    req.usuario = resultado.rows[0];
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Sesión expirada. Inicia sesión nuevamente." });
    }
    return res.status(401).json({ error: "Token inválido" });
  }
};

/**
 * Middleware de rol
 * Verifica que el usuario tenga el rol requerido
 * @param {...string} roles - Roles permitidos
 */
const verificarRol = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.usuario.rol)) {
      return res.status(403).json({
        error: "Acceso denegado. No tienes permisos para esta acción.",
      });
    }
    next();
  };
};

module.exports = { verificarToken, verificarRol };
