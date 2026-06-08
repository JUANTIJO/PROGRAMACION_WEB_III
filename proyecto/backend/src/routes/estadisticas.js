const router = require("express").Router();
const { obtenerEstadisticas } = require("../controllers/estadisticasController");
const { verificarToken } = require("../middleware/auth");

router.get("/", verificarToken, obtenerEstadisticas);
module.exports = router;
