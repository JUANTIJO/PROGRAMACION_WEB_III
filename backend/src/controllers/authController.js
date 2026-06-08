const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/database");
const { registrarAcceso } = require("../middleware/logger");

// Validacion de fortaleza de contrasena
const evaluarContrasena = (password) => {
  const reglas = {
    longitud: password.length >= 8,
    mayuscula: /[A-Z]/.test(password),
    numero: /[0-9]/.test(password),
    simbolo: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };
  const puntos = Object.values(reglas).filter(Boolean).length;
  let nivel = puntos <= 1 ? "debil" : puntos <= 3 ? "media" : "fuerte";
  return { nivel, reglas };
};

const registrar = async (req, res) => {
  const { nombre, apellido, correo, contrasena } = req.body;
  const rol = "paciente";
  try {
    const existe = await pool.query("SELECT id FROM usuarios WHERE correo = $1", [correo]);
    if (existe.rows.length) {
      return res.status(400).json({ error: "El correo ya esta registrado" });
    }
    const evaluacion = evaluarContrasena(contrasena);
    if (evaluacion.nivel === "debil") {
      return res.status(400).json({ error: "Contrasena muy debil", evaluacion });
    }
    const hash = await bcrypt.hash(contrasena, 12);
    const result = await pool.query(
      `INSERT INTO usuarios (nombre, apellido, correo, contrasena_hash, rol)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, nombre, correo, rol`,
      [nombre, apellido, correo, hash, rol]
    );
    const usuario = result.rows[0];
    // Crear perfil de paciente
    await pool.query("INSERT INTO pacientes (usuario_id) VALUES ($1)", [usuario.id]);
    await registrarAcceso(req, usuario.id, correo, "registro", true);
    const token = jwt.sign({ id: usuario.id, rol: usuario.rol }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.status(201).json({ mensaje: "Usuario registrado exitosamente", token, usuario, evaluacionContrasena: evaluacion });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al registrar usuario" });
  }
};

const login = async (req, res) => {
  const { correo, contrasena } = req.body;
  try {
    const result = await pool.query("SELECT * FROM usuarios WHERE correo = $1", [correo]);
    if (!result.rows.length) {
      await registrarAcceso(req, null, correo, "login_fallido", false);
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }
    const usuario = result.rows[0];
    if (!usuario.activo) {
      return res.status(401).json({ error: "Cuenta desactivada" });
    }
    const valido = await bcrypt.compare(contrasena, usuario.contrasena_hash);
    if (!valido) {
      await registrarAcceso(req, usuario.id, correo, "login_fallido", false);
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }
    await pool.query("UPDATE usuarios SET ultimo_acceso = NOW() WHERE id = $1", [usuario.id]);
    await registrarAcceso(req, usuario.id, correo, "login_exitoso", true);
    const token = jwt.sign({ id: usuario.id, rol: usuario.rol }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({
      mensaje: "Login exitoso",
      token,
      usuario: { id: usuario.id, nombre: usuario.nombre, apellido: usuario.apellido, correo: usuario.correo, rol: usuario.rol }
    });
  } catch (err) {
    res.status(500).json({ error: "Error en el servidor" });
  }
};

const logout = async (req, res) => {
  await registrarAcceso(req, req.usuario.id, req.usuario.correo, "logout", true);
  res.json({ mensaje: "Sesion cerrada exitosamente" });
};

const verificarContrasena = (req, res) => {
  const { contrasena } = req.body;
  res.json(evaluarContrasena(contrasena));
};

module.exports = { registrar, login, logout, verificarContrasena };
