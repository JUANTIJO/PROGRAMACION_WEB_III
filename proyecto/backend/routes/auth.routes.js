// ============================================================
// routes/auth.routes.js
// ============================================================
const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/auth.controller");
const { verificarToken } = require("../middleware/auth.middleware");
const { validarFortalezaContrasena } = require("../middleware/password.middleware");
const { capturarMetadatos } = require("../middleware/logger.middleware");

router.post("/registro",  capturarMetadatos, validarFortalezaContrasena, ctrl.registrar);
router.post("/login",     capturarMetadatos, ctrl.login);
router.post("/logout",    capturarMetadatos, verificarToken, ctrl.logout);
router.post("/verificar-contrasena", ctrl.verificarContrasena);

module.exports = router;
