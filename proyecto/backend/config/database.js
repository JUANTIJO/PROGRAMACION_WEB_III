// ============================================================
// config/database.js — Configuración del pool de PostgreSQL
// ============================================================

const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  max: 20,              // máximo de conexiones en el pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on("connect", () => console.log("🗄️  Conexión establecida con PostgreSQL"));
pool.on("error", (err) => console.error("❌ Error inesperado en pool:", err));

module.exports = pool;
