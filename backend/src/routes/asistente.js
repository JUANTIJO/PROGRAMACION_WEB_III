const router = require("express").Router();
const { responder } = require("../controllers/asistenteController");
const { verificarToken } = require("../middleware/auth");

router.post("/", verificarToken, responder);
module.exports = router;
