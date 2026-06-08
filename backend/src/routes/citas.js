const router = require("express").Router();
const { listarCitas, crearCita, actualizarCita, eliminarCita } = require("../controllers/citasController");
const { verificarToken } = require("../middleware/auth");

router.use(verificarToken);
router.get("/", listarCitas);
router.post("/", crearCita);
router.put("/:id", actualizarCita);
router.delete("/:id", eliminarCita);

module.exports = router;
