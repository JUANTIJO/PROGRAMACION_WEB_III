// routes/estadisticas.routes.js
const express = require("express");
const r = express.Router();
const ctrl = require("../controllers/espiritual.controller");
const { verificarToken } = require("../middleware/auth.middleware");

r.use(verificarToken);
r.get("/dashboard",   ctrl.resumenDashboard);
r.get("/medicacion",  ctrl.estadisticasMedicacion);
r.get("/citas",       ctrl.estadisticasCitas);

module.exports = r;
