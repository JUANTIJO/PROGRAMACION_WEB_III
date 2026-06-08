const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const citasRoutes = require("./routes/citas");
const medicamentosRoutes = require("./routes/medicamentos");
const asistentRoutes = require("./routes/asistente");
const espiritualRoutes = require("./routes/espiritual");
const estadisticasRoutes = require("./routes/estadisticas");
const reportesRoutes = require("./routes/reportes");
const logsRoutes = require("./routes/logs");

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy (necesario para IP real detrás de Render/Reverse Proxy)
app.set("trust proxy", 1);

// Middlewares de seguridad
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || true }));
app.use(express.json({ limit: "10mb" }));
app.use(morgan("combined"));

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/citas", citasRoutes);
app.use("/api/medicamentos", medicamentosRoutes);
app.use("/api/asistente", asistentRoutes);
app.use("/api/espiritual", espiritualRoutes);
app.use("/api/estadisticas", estadisticasRoutes);
app.use("/api/reportes", reportesRoutes);
app.use("/api/logs", logsRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ estado: "activo", version: "1.0.0", timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  const detalle = process.env.NODE_ENV === "production" ? undefined : err.message;
  res.status(500).json({ error: "Error interno del servidor", detalle });
});

app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
module.exports = app;
