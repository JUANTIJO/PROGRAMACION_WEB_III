-- ============================================================
-- ESQUEMA DE BASE DE DATOS - SALUD APP v1.0.0
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

CREATE TABLE IF NOT EXISTS pacientes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    fecha_nacimiento DATE,
    telefono VARCHAR(20),
    tipo_sangre VARCHAR(5),
    alergias TEXT,
    enfermedades_base TEXT,
    doctor_principal VARCHAR(150),
    familiar_id UUID REFERENCES usuarios(id),
    creado_en TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS citas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    titulo VARCHAR(200) NOT NULL,
    doctor VARCHAR(150),
    especialidad VARCHAR(100),
    fecha_hora TIMESTAMP NOT NULL,
    ubicacion TEXT,
    notas TEXT,
    estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente','completada','perdida','cancelada')),
    recordatorio_min INTEGER DEFAULT 60,
    activo BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMP DEFAULT NOW(),
    actualizado_en TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS medicamentos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    nombre VARCHAR(200) NOT NULL,
    dosis VARCHAR(100) NOT NULL,
    frecuencia VARCHAR(100) NOT NULL,
    horarios JSONB NOT NULL DEFAULT '[]',
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE,
    instrucciones TEXT,
    color_pastilla VARCHAR(7) DEFAULT '#4A90E2',
    activo BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS registro_medicacion (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    medicamento_id UUID NOT NULL REFERENCES medicamentos(id) ON DELETE CASCADE,
    paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    fecha DATE NOT NULL,
    hora_programada TIME NOT NULL,
    hora_tomada TIMESTAMP,
    tomado BOOLEAN DEFAULT FALSE,
    notas TEXT,
    creado_en TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS versiculos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    texto TEXT NOT NULL,
    referencia VARCHAR(100) NOT NULL UNIQUE,
    categoria VARCHAR(50) NOT NULL CHECK (categoria IN ('tristeza','esperanza','fortaleza','sanidad','paz','general')),
    activo BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS logs_acceso (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    correo_intento VARCHAR(255),
    ip_address VARCHAR(45) NOT NULL,
    evento VARCHAR(30) NOT NULL CHECK (evento IN ('login_exitoso','login_fallido','logout','registro','token_renovado')),
    navegador TEXT,
    sistema_operativo VARCHAR(100),
    exitoso BOOLEAN DEFAULT TRUE,
    fecha DATE DEFAULT CURRENT_DATE,
    hora TIME DEFAULT CURRENT_TIME,
    creado_en TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mensajes_ia (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    mensaje_usuario TEXT NOT NULL,
    respuesta_ia TEXT NOT NULL,
    categoria VARCHAR(50),
    creado_en TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_citas_paciente ON citas(paciente_id, activo);
CREATE INDEX IF NOT EXISTS idx_medicamentos_pac ON medicamentos(paciente_id, activo);
CREATE INDEX IF NOT EXISTS idx_registro_fecha ON registro_medicacion(fecha, paciente_id);
CREATE INDEX IF NOT EXISTS idx_logs_usuario ON logs_acceso(usuario_id, creado_en);
CREATE INDEX IF NOT EXISTS idx_versiculos_cat ON versiculos(categoria, activo);

INSERT INTO versiculos (texto, referencia, categoria) VALUES
('Todo lo puedo en Cristo que me fortalece.','Filipenses 4:13','fortaleza'),
('El Senor es mi fuerza y mi escudo; mi corazon en el confia.','Salmos 28:7','fortaleza'),
('Esfuerzate y se valiente. No temas ni desmayes.','Josue 1:9','fortaleza'),
('Porque yo se los pensamientos que tengo acerca de vosotros, pensamientos de paz.','Jeremias 29:11','esperanza'),
('Mas los que esperan a Jehova tendran nuevas fuerzas; levantaran alas como las aguilas.','Isaias 40:31','esperanza'),
('La esperanza no nos defrauda, porque el amor de Dios ha sido derramado en nuestros corazones.','Romanos 5:5','esperanza'),
('El sana a los quebrantados de corazon, y venda sus heridas.','Salmos 147:3','tristeza'),
('Venid a mi todos los que estais trabajados y cargados, y yo os hare descansar.','Mateo 11:28','tristeza'),
('Echando toda vuestra ansiedad sobre el, porque el tiene cuidado de vosotros.','1 Pedro 5:7','tristeza'),
('La paz os dejo, mi paz os doy.','Juan 14:27','paz'),
('Y la paz de Dios, que sobrepasa todo entendimiento, guardara vuestros corazones.','Filipenses 4:7','paz'),
('Mas el herido fue por nuestras rebeliones, y por su llaga fuimos nosotros curados.','Isaias 53:5','sanidad')
ON CONFLICT (referencia) DO NOTHING;
