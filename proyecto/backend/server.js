// ============================================================
// server.js — Punto de entrada principal del backend
// Aplicación: SaludContigo
// ============================================================

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const app = express();
const PUERTO = process.env.PORT || 3000;

// ─── Middlewares Globales ────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || "*" }));
app.use(express.json());
app.use(morgan("combined"));

// Límite de peticiones (previene ataques de fuerza bruta)
const limitadorGlobal = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100,
  message: { error: "Demasiadas solicitudes. Intenta en 15 minutos." },
});
app.use(limitadorGlobal);

// ─── Importar Rutas ──────────────────────────────────────────
const rutasAuth        = require("./routes/auth.routes");
const rutasCitas       = require("./routes/citas.routes");
const rutasMedicacion  = require("./routes/medicacion.routes");
const rutasAsistente   = require("./routes/asistente.routes");
const rutasEspiritual  = require("./routes/espiritual.routes");
const rutasEstadisticas = require("./routes/estadisticas.routes");
const rutasReportes    = require("./routes/reportes.routes");
const rutasLogs        = require("./routes/logs.routes");

// ─── Montar Rutas ────────────────────────────────────────────
app.use("/api/auth",          rutasAuth);
app.use("/api/citas",         rutasCitas);
app.use("/api/medicacion",    rutasMedicacion);
app.use("/api/asistente",     rutasAsistente);
app.use("/api/espiritual",    rutasEspiritual);
app.use("/api/estadisticas",  rutasEstadisticas);
app.use("/api/reportes",      rutasReportes);
app.use("/api/logs",          rutasLogs);

// ─── Ruta de Salud ───────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({
    estado: "activo",
    version: "1.0.0",
    aplicacion: "SaludContigo",
    timestamp: new Date().toISOString(),
  });
});

// ─── Manejo de Errores Global ────────────────────────────────
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${err.stack}`);
  res.status(err.status || 500).json({
    error: "Error interno del servidor",
    mensaje: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// ─── Iniciar Servidor ────────────────────────────────────────
app.listen(PUERTO, () => {
  console.log(`✅ Servidor SaludContigo corriendo en puerto ${PUERTO}`);
  console.log(`📡 Entorno: ${process.env.NODE_ENV || "development"}`);
});

module.exports = app;
