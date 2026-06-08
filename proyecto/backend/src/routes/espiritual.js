const router = require("express").Router();
const { obtenerVersiculo, listarCategorias } = require("../controllers/espiritualController");
const { verificarToken } = require("../middleware/auth");

router.use(verificarToken);
router.get("/versiculo", obtenerVersiculo);
router.get("/categorias", listarCategorias);

module.exports = router;
