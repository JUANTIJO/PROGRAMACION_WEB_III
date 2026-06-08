// routes/espiritual.routes.js
const express = require("express");
const r = express.Router();
const ctrl = require("../controllers/espiritual.controller");
const { verificarToken } = require("../middleware/auth.middleware");

r.use(verificarToken);
r.get("/",                     ctrl.versiculoAleatorio);
r.get("/categorias",           ctrl.obtenerCategorias);
r.get("/categoria/:categoria", ctrl.versiculosPorCategoria);

module.exports = r;
