// routes/medicacion.routes.js
const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/medicacion.controller");
const { verificarToken } = require("../middleware/auth.middleware");

router.use(verificarToken);
router.get("/historial",  ctrl.historialTomas);
router.get("/",           ctrl.obtenerMedicamentos);
router.post("/",          ctrl.crearMedicamento);
router.post("/confirmar", ctrl.confirmarToma);
router.put("/:id",        ctrl.actualizarMedicamento);
router.delete("/:id",     ctrl.eliminarMedicamento);

module.exports = router;
