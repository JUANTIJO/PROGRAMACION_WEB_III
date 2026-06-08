// routes/asistente.routes.js
const express = require("express");
const r = express.Router();
const ctrl = require("../controllers/asistente.controller");
const { verificarToken } = require("../middleware/auth.middleware");

r.use(verificarToken);
r.post("/chat",        ctrl.chatear);
r.get("/sugerencias",  ctrl.obtenerSugerencias);

module.exports = r;
