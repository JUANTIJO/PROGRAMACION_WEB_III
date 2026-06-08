// ============================================================
// config/migrate.js — Script de migración de base de datos
// Crea todas las tablas necesarias para SaludContigo
// ============================================================

const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

// ─── Definición de Tablas SQL ────────────────────────────────
const TABLAS_SQL = `

-- ════════════════════════════════════════════════
-- TABLA: usuarios
-- Almacena credenciales y roles del sistema
-- ════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    correo VARCHAR(255) UNIQUE NOT NULL,
    contrasena_hash TEXT NOT NULL,
    rol VARCHAR(20) DEFAULT 'paciente' CHECK (rol IN ('paciente','familiar','admin')),
    activo BOOLEAN DEFAULT TRUE,
    verificado BOOLEAN DEFAULT FALSE,
    ultimo_acceso TIMESTAMP,
    creado_en TIMESTAMP DEFAULT NOW(),
    actualizado_en TIMESTAMP DEFAULT NOW()
);

-- ════════════════════════════════════════════════
-- TABLA: pacientes
-- Información clínica del paciente
-- ════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS pacientes (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id         UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  fecha_nacimiento   DATE,
  telefono           VARCHAR(20),
    tipo_sangre        VARCHAR(5),
    alergias           TEXT,
    enfermedades_base  TEXT,
    doctor_principal   VARCHAR(150),
    familiar_id        UUID REFERENCES usuarios(id),
  activo             BOOLEAN DEFAULT TRUE,
  creado_en          TIMESTAMP DEFAULT NOW()
);

-- ════════════════════════════════════════════════
-- TABLA: citas
-- Gestión completa de citas médicas
-- ════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS citas (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paciente_id      UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  titulo           VARCHAR(200) NOT NULL,
  doctor           VARCHAR(150),
  especialidad     VARCHAR(100),
  fecha_hora       TIMESTAMP NOT NULL,
  ubicacion        TEXT,
  notas            TEXT,
  estado           VARCHAR(20) CHECK (estado IN ('pendiente','completada','cancelada','perdida')) DEFAULT 'pendiente',
  recordatorio_min INTEGER DEFAULT 60,
  activo           BOOLEAN DEFAULT TRUE,
  creado_en        TIMESTAMP DEFAULT NOW(),
  actualizado_en   TIMESTAMP DEFAULT NOW()
);

-- ════════════════════════════════════════════════
-- TABLA: medicamentos
-- Catálogo de medicamentos del paciente
-- ════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS medicamentos (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paciente_id     UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  nombre          VARCHAR(200) NOT NULL,
  dosis           VARCHAR(100) NOT NULL,
  frecuencia      VARCHAR(100) NOT NULL,
  horarios        JSONB NOT NULL DEFAULT '[]',
  fecha_inicio    DATE NOT NULL,
  fecha_fin       DATE,
  instrucciones   TEXT,
  color_pastilla  VARCHAR(7) DEFAULT '#4A90E2',
  activo          BOOLEAN DEFAULT TRUE,
  creado_en       TIMESTAMP DEFAULT NOW()
);

-- ════════════════════════════════════════════════
-- TABLA: registro_medicacion
-- Historial de toma / omisión de medicamentos
-- ════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS registro_medicacion (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    medicamento_id  UUID NOT NULL REFERENCES medicamentos(id) ON DELETE CASCADE,
    paciente_id     UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    fecha           DATE NOT NULL,
    hora_programada TIME NOT NULL,
    hora_tomada     TIMESTAMP,
  tomado          BOOLEAN DEFAULT FALSE,
    notas           TEXT,
  creado_en       TIMESTAMP DEFAULT NOW()
);

-- ════════════════════════════════════════════════
-- TABLA: versiculos
-- Base de datos de versículos bíblicos categorizados
-- ════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS versiculos (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  texto       TEXT NOT NULL,
  referencia  VARCHAR(100) NOT NULL,
  categoria   VARCHAR(50) CHECK (categoria IN ('tristeza','esperanza','fortaleza','sanidad','paz','general')) NOT NULL,
  activo      BOOLEAN DEFAULT TRUE
);

-- ════════════════════════════════════════════════
-- TABLA: logs_acceso
-- Registro de auditoría de accesos al sistema
-- ════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS logs_acceso (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id        UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  correo_intento    VARCHAR(255),
  ip_address        VARCHAR(45) NOT NULL,
  evento            VARCHAR(30) NOT NULL CHECK (evento IN ('login_exitoso','login_fallido','logout','registro','token_renovado')),
  navegador         TEXT,
  sistema_operativo VARCHAR(100),
  exitoso           BOOLEAN DEFAULT TRUE,
  fecha        DATE DEFAULT CURRENT_DATE,
  hora         TIME DEFAULT CURRENT_TIME,
  creado_en    TIMESTAMP DEFAULT NOW()
);

-- ════════════════════════════════════════════════
-- ÍNDICES para optimizar consultas frecuentes
-- ════════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_citas_paciente   ON citas(paciente_id, activo);
CREATE INDEX IF NOT EXISTS idx_citas_fecha      ON citas(fecha_hora);
CREATE INDEX IF NOT EXISTS idx_med_paciente     ON medicamentos(paciente_id, activo);
CREATE INDEX IF NOT EXISTS idx_registro_fecha   ON registro_medicacion(fecha, paciente_id);
CREATE INDEX IF NOT EXISTS idx_logs_usuario     ON logs_acceso(usuario_id);
CREATE INDEX IF NOT EXISTS idx_versiculos_cat   ON versiculos(categoria, activo);
`;

// ─── Datos semilla para versículos ──────────────────────────
const VERSICULOS_SEMILLA = [
  // Fortaleza
  { texto: "Todo lo puedo en Cristo que me fortalece.", referencia: "Filipenses 4:13", categoria: "fortaleza" },
  { texto: "El Señor es mi fortaleza y mi escudo; en él confió mi corazón.", referencia: "Salmos 28:7", categoria: "fortaleza" },
  { texto: "Porque yo soy el Señor tu Dios, que sostiene tu mano derecha.", referencia: "Isaías 41:13", categoria: "fortaleza" },
  // Esperanza
  { texto: "Porque yo sé los planes que tengo para vosotros, planes de bienestar y no de calamidad.", referencia: "Jeremías 29:11", categoria: "esperanza" },
  { texto: "Espera en el Señor; esfuérzate y aliéntese tu corazón.", referencia: "Salmos 27:14", categoria: "esperanza" },
  { texto: "Y esta esperanza no nos defrauda.", referencia: "Romanos 5:5", categoria: "esperanza" },
  // Tristeza
  { texto: "Venid a mí todos los que estáis cansados y cargados, y yo os haré descansar.", referencia: "Mateo 11:28", categoria: "tristeza" },
  { texto: "El Señor está cerca de los quebrantados de corazón.", referencia: "Salmos 34:18", categoria: "tristeza" },
  { texto: "Echando toda vuestra ansiedad sobre él, porque él tiene cuidado de vosotros.", referencia: "1 Pedro 5:7", categoria: "tristeza" },
  // Sanidad
  { texto: "Mas él herido fue por nuestras rebeliones... y por su llaga fuimos nosotros curados.", referencia: "Isaías 53:5", categoria: "sanidad" },
  // Paz
  { texto: "La paz os dejo, mi paz os doy; no os la doy como el mundo la da.", referencia: "Juan 14:27", categoria: "paz" },
  { texto: "Y la paz de Dios, que sobrepasa todo entendimiento, guardará vuestros corazones.", referencia: "Filipenses 4:7", categoria: "paz" },
  // General
  { texto: "Todo tiene su tiempo, y todo lo que se quiere debajo del cielo tiene su hora.", referencia: "Eclesiastés 3:1", categoria: "general" },
];

// ─── Usuario de Prueba ───────────────────────────────────────
const USUARIO_TEST = {
  nombre: "Usuario",
  apellido: "Prueba",
  correo: "test@saludapp.com",
  contrasena_hash: "$2a$12$R9h/lIPzHZluv601fNVC6u36zPaVf.yE0yY0f7qZ8k9lY8pXN5W6y" // bcrypt para "password123"
};

// ─── Ejecutar migración ──────────────────────────────────────
async function migrar() {
  const cliente = await pool.connect();
  try {
    console.log("🔄 Iniciando migración de base de datos...");
    await cliente.query(TABLAS_SQL);
    console.log("✅ Tablas creadas exitosamente");

    // Insertar versículos si no existen
    for (const v of VERSICULOS_SEMILLA) {
      await cliente.query(
        `INSERT INTO versiculos (texto, referencia, categoria)
         VALUES ($1, $2, $3)
         ON CONFLICT DO NOTHING`,
        [v.texto, v.referencia, v.categoria]
      );
    }
    console.log(`✅ ${VERSICULOS_SEMILLA.length} versículos cargados`);

    // Insertar usuario de prueba
    await cliente.query(
      `INSERT INTO usuarios (nombre, apellido, correo, contrasena_hash, rol)
       VALUES ($1, $2, $3, $4, 'paciente') ON CONFLICT DO NOTHING`,
      [USUARIO_TEST.nombre, USUARIO_TEST.apellido, USUARIO_TEST.correo, USUARIO_TEST.contrasena_hash]
    );
    console.log("👤 Usuario de prueba creado: test@saludapp.com / password123");

    console.log("🎉 Migración completada exitosamente");
  } catch (err) {
    console.error("❌ Error en migración:", err.message);
    throw err;
  } finally {
    cliente.release();
    await pool.end();
  }
}

migrar();
