// ============================================================
// middleware/password.middleware.js — Validación de contraseñas
// Evalúa fortaleza: débil / media / fuerte
// ============================================================

/**
 * Evalúa la fortaleza de una contraseña
 * @param {string} contrasena - Contraseña a evaluar
 * @returns {{ nivel: string, puntaje: number, errores: string[] }}
 */
const evaluarContrasena = (contrasena) => {
  const errores = [];
  let puntaje = 0;

  // Regla 1: Longitud mínima
  if (contrasena.length >= 8) {
    puntaje += 20;
  } else {
    errores.push("Debe tener al menos 8 caracteres");
  }

  // Regla 2: Letras mayúsculas
  if (/[A-Z]/.test(contrasena)) {
    puntaje += 20;
  } else {
    errores.push("Debe contener al menos una letra mayúscula");
  }

  // Regla 3: Letras minúsculas
  if (/[a-z]/.test(contrasena)) {
    puntaje += 20;
  } else {
    errores.push("Debe contener al menos una letra minúscula");
  }

  // Regla 4: Números
  if (/\d/.test(contrasena)) {
    puntaje += 20;
  } else {
    errores.push("Debe contener al menos un número");
  }

  // Regla 5: Símbolos especiales
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(contrasena)) {
    puntaje += 20;
  } else {
    errores.push("Debe contener al menos un símbolo especial (!@#$%...)");
  }

  // Determinar nivel
  let nivel;
  if (puntaje <= 40) nivel = "débil";
  else if (puntaje <= 80) nivel = "media";
  else nivel = "fuerte";

  return { nivel, puntaje, errores };
};

/**
 * Middleware que valida que la contraseña sea al menos de nivel medio
 */
const validarFortalezaContrasena = (req, res, next) => {
  const { contrasena } = req.body;

  if (!contrasena) {
    return res.status(400).json({ error: "La contraseña es requerida" });
  }

  const resultado = evaluarContrasena(contrasena);

  if (resultado.nivel === "débil") {
    return res.status(400).json({
      error: "Contraseña demasiado débil",
      nivel: resultado.nivel,
      puntaje: resultado.puntaje,
      requisitos_faltantes: resultado.errores,
    });
  }

  req.fortalezaContrasena = resultado;
  next();
};

module.exports = { evaluarContrasena, validarFortalezaContrasena };
