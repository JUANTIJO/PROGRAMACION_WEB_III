const router = require("express").Router();
const { registrar, login, logout, verificarContrasena } = require("../controllers/authController");
const { verificarToken } = require("../middleware/auth");

router.post("/registro", registrar);
router.post("/login", login);
router.post("/logout", verificarToken, logout);
router.post("/verificar-contrasena", verificarContrasena);
router.get("/perfil", verificarToken, (req, res) => res.json({ usuario: req.usuario }));

module.exports = router;
