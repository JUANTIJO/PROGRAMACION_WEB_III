const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || "salud_app",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD,
});

const fs = require("fs");
const path = require("path");

const schema = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");

const run = async () => {
  try {
    await pool.query(schema);
    console.log("Esquema ejecutado correctamente");
    process.exit(0);
  } catch (err) {
    console.error("Error al ejecutar migracion:", err.message);
    process.exit(1);
  }
};

run();
