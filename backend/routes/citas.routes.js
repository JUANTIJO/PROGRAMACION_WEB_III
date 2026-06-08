// ============================================================
// routes/citas.routes.js
// ============================================================
const express = require("express");
const r1 = express.Router();
const citasCtrl = require("../controllers/citas.controller");
const { verificarToken } = require("../middleware/auth.middleware");

r1.use(verificarToken);
r1.get("/proximas",     citasCtrl.proximasCitas);
r1.get("/",            citasCtrl.obtenerCitas);
r1.get("/:id",         citasCtrl.obtenerCitaPorId);
r1.post("/",           citasCtrl.crearCita);
r1.put("/:id",         citasCtrl.actualizarCita);
r1.delete("/:id",      citasCtrl.eliminarCita);

module.exports = r1;

// ============================================================
// routes/medicacion.routes.js
// ============================================================
// NOTE: In production, split each routes file. Combined here for brevity.
