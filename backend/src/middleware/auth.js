const jwt = require("jsonwebtoken");
const pool = require("../config/database");

const verificarToken = async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Token requerido" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const result = await pool.query(
      "SELECT id, nombre, correo, rol, activo FROM usuarios WHERE id = $1",
      [decoded.id]
    );
    if (!result.rows.length || !result.rows[0].activo) {
      return res.status(401).json({ error: "Usuario no autorizado" });
    }
    req.usuario = result.rows[0];
    next();
  } catch (err) {
    res.status(401).json({ error: "Token invalido o expirado" });
  }
};

const soloAdmin = (req, res, next) => {
  if (req.usuario.rol !== "admin") {
    return res.status(403).json({ error: "Acceso denegado. Se requiere rol admin" });
  }
  next();
};

module.exports = { verificarToken, soloAdmin };
