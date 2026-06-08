const router = require("express").Router();
const { listarMedicamentos, crearMedicamento, actualizarMedicamento, eliminarMedicamento, registrarToma } = require("../controllers/medicamentosController");
const { verificarToken } = require("../middleware/auth");

router.use(verificarToken);
router.get("/", listarMedicamentos);
router.post("/", crearMedicamento);
router.put("/:id", actualizarMedicamento);
router.delete("/:id", eliminarMedicamento);
router.post("/:id/toma", registrarToma);

module.exports = router;
