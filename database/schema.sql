-- =====================================================
-- SISTEMA INTELIGENTE DE GESTIÓN DE TUTORÍAS Y ASESORÍAS UNIVERSITARIAS
-- Schema PostgreSQL / Supabase - Arquitectura Profesional
-- =====================================================

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- TABLA: usuarios (Base para autenticación)
-- =====================================================
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nombre_completo VARCHAR(255) NOT NULL,
    telefono VARCHAR(50),
    rol VARCHAR(50) NOT NULL CHECK (rol IN ('ESTUDIANTE', 'TUTOR', 'ADMIN', 'COORDINADOR')),
    estado VARCHAR(50) DEFAULT 'ACTIVO' CHECK (estado IN ('ACTIVO', 'INACTIVO', 'SUSPENDIDO')),
    email_verificado BOOLEAN DEFAULT FALSE,
    foto_url TEXT,                 -- Compartido por estudiante y tutor
    biografia TEXT,                -- Compartido por estudiante y tutor
    ultimo_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL -- Soft delete
);

-- Índices
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_rol ON usuarios(rol);
CREATE INDEX idx_usuarios_estado ON usuarios(estado);

-- =====================================================
-- TABLA: perfiles_estudiante
-- =====================================================
CREATE TABLE perfiles_estudiante (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID UNIQUE NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    matricula VARCHAR(50) UNIQUE NOT NULL,
    carrera VARCHAR(255) NOT NULL,
    semestre INTEGER NOT NULL CHECK (semestre >= 1 AND semestre <= 12),
    promedio_general DECIMAL(3,2) DEFAULT 0.00,
    creditos_aprobados INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLA: perfiles_tutor
-- =====================================================
CREATE TABLE perfiles_tutor (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID UNIQUE NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    especialidad VARCHAR(255) NOT NULL,
    titulo_academico VARCHAR(255),
    anos_experiencia INTEGER DEFAULT 0,
    tarifa_hora DECIMAL(10,2) DEFAULT 0.00,
    calificacion_promedio DECIMAL(3,2) DEFAULT 5.00,
    total_sesiones INTEGER DEFAULT 0,
    verificado BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLA: certificaciones (1:N con perfiles_tutor)
-- =====================================================
CREATE TABLE certificaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    perfil_tutor_id UUID NOT NULL REFERENCES perfiles_tutor(id) ON DELETE CASCADE,
    nombre VARCHAR(255) NOT NULL,
    institucion VARCHAR(255),
    anio INTEGER,
    url_credencial TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_certificaciones_tutor ON certificaciones(perfil_tutor_id);

-- =====================================================
-- TABLA: disponibilidades (1:N con perfiles_tutor)
-- =====================================================
CREATE TABLE disponibilidades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    perfil_tutor_id UUID NOT NULL REFERENCES perfiles_tutor(id) ON DELETE CASCADE,
    dia_semana VARCHAR(10) NOT NULL CHECK (dia_semana IN ('LUNES','MARTES','MIERCOLES','JUEVES','VIERNES','SABADO','DOMINGO')),
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL
);

CREATE INDEX idx_disponibilidades_tutor ON disponibilidades(perfil_tutor_id);

-- =====================================================
-- TABLA: materias
-- =====================================================
CREATE TABLE materias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    creditos INTEGER DEFAULT 3,
    departamento VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLA: tutorias_materia (Relación muchos a muchos)
-- =====================================================
CREATE TABLE tutorias_materia (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tutor_id UUID NOT NULL REFERENCES perfiles_tutor(id) ON DELETE CASCADE,
    materia_id UUID NOT NULL REFERENCES materias(id) ON DELETE CASCADE,
    UNIQUE(tutor_id, materia_id)
);

-- =====================================================
-- TABLA: sesiones_tutoria
-- =====================================================
CREATE TABLE sesiones_tutoria (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    estudiante_id UUID NOT NULL REFERENCES perfiles_estudiante(id) ON DELETE CASCADE,
    tutor_id UUID NOT NULL REFERENCES perfiles_tutor(id) ON DELETE CASCADE,
    materia_id UUID NOT NULL REFERENCES materias(id),
    fecha_hora_inicio TIMESTAMP NOT NULL,
    fecha_hora_fin TIMESTAMP NOT NULL,
    estado VARCHAR(50) DEFAULT 'PENDIENTE' CHECK (estado IN ('PENDIENTE', 'CONFIRMADA', 'EN_PROGRESO', 'COMPLETADA', 'CANCELADA', 'NO_ASISTIO')),
    modalidad VARCHAR(50) DEFAULT 'VIRTUAL' CHECK (modalidad IN ('VIRTUAL', 'PRESENCIAL', 'HIBRIDA')),
    enlace_reunion TEXT, -- Zoom, Meet, etc.
    ubicacion TEXT,
    precio DECIMAL(10,2) DEFAULT 0.00,
    notas_estudiante TEXT,
    notas_tutor TEXT,
    calificacion_estudiante INTEGER CHECK (calificacion_estudiante >= 1 AND calificacion_estudiante <= 5), -- Nota del estudiante al servicio (1-5)
    resena_estudiante TEXT,                                                                                -- Reseña del estudiante sobre la tutoría
    nota_academica DECIMAL(4,2) CHECK (nota_academica >= 0 AND nota_academica <= 20),                      -- Nota académica que el tutor pone al estudiante (0-20)
    resena_tutor TEXT,                                                                                     -- Reseña del tutor sobre el estudiante
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

-- Índices para rendimiento
CREATE INDEX idx_sesiones_fecha ON sesiones_tutoria(fecha_hora_inicio);
CREATE INDEX idx_sesiones_estudiante ON sesiones_tutoria(estudiante_id);
CREATE INDEX idx_sesiones_tutor ON sesiones_tutoria(tutor_id);
CREATE INDEX idx_sesiones_estado ON sesiones_tutoria(estado);

-- =====================================================
-- TABLA: historial_academico
-- =====================================================
CREATE TABLE historial_academico (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    estudiante_id UUID NOT NULL REFERENCES perfiles_estudiante(id) ON DELETE CASCADE,
    materia_id UUID NOT NULL REFERENCES materias(id),
    calificacion DECIMAL(4,2),
    periodo VARCHAR(20), -- e.g., "2025-1"
    estado VARCHAR(50) CHECK (estado IN ('APROBADA', 'REPROBADA', 'EN_CURSO', 'RETIRADA')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLA: mensajes (Chat interno)
-- =====================================================
CREATE TABLE mensajes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sesion_id UUID REFERENCES sesiones_tutoria(id) ON DELETE CASCADE,
    remitente_id UUID NOT NULL REFERENCES usuarios(id),
    destinatario_id UUID NOT NULL REFERENCES usuarios(id),
    contenido TEXT NOT NULL,
    leido BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_mensajes_sesion ON mensajes(sesion_id);
CREATE INDEX idx_mensajes_remitente ON mensajes(remitente_id);

-- =====================================================
-- TABLA: notificaciones
-- =====================================================
CREATE TABLE notificaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    titulo VARCHAR(255) NOT NULL,
    mensaje TEXT NOT NULL,
    tipo VARCHAR(50) CHECK (tipo IN ('SESION', 'PAGO', 'RECORDATORIO', 'SISTEMA', 'CALIFICACION')),
    leida BOOLEAN DEFAULT FALSE,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLA: pagos (Integración futura con Stripe/PayPal)
-- =====================================================
CREATE TABLE pagos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sesion_id UUID REFERENCES sesiones_tutoria(id), -- Estudiante y tutor se derivan de la sesión
    monto DECIMAL(10,2) NOT NULL,
    moneda VARCHAR(10) DEFAULT 'USD',
    estado VARCHAR(50) DEFAULT 'PENDIENTE' CHECK (estado IN ('PENDIENTE', 'COMPLETADO', 'FALLIDO', 'REEMBOLSADO')),
    metodo_pago VARCHAR(50),
    transaccion_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLA: auditoria (Para compliance)
-- =====================================================
CREATE TABLE auditoria (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID REFERENCES usuarios(id),
    accion VARCHAR(100) NOT NULL,
    tabla_afectada VARCHAR(100),
    registro_id UUID,
    datos_anteriores JSONB,
    datos_nuevos JSONB,
    ip_address INET,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- FUNCIONES Y TRIGGERS
-- =====================================================

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_perfiles_estudiante_updated_at BEFORE UPDATE ON perfiles_estudiante FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_perfiles_tutor_updated_at BEFORE UPDATE ON perfiles_tutor FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sesiones_updated_at BEFORE UPDATE ON sesiones_tutoria FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_materias_updated_at BEFORE UPDATE ON materias FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para soft delete
CREATE OR REPLACE FUNCTION soft_delete() RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        UPDATE sesiones_tutoria SET deleted_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
        RETURN NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- VISTAS ÚTILES
-- =====================================================
CREATE OR REPLACE VIEW vista_sesiones_completas AS
SELECT 
    s.id,
    s.fecha_hora_inicio,
    s.fecha_hora_fin,
    s.estado,
    s.modalidad,
    e.usuario_id as estudiante_usuario_id,
    ue.nombre_completo as estudiante_nombre,
    t.usuario_id as tutor_usuario_id,
    ut.nombre_completo as tutor_nombre,
    m.nombre as materia_nombre,
    s.precio
FROM sesiones_tutoria s
JOIN perfiles_estudiante e ON s.estudiante_id = e.id
JOIN usuarios ue ON e.usuario_id = ue.id
JOIN perfiles_tutor t ON s.tutor_id = t.id
JOIN usuarios ut ON t.usuario_id = ut.id
JOIN materias m ON s.materia_id = m.id
WHERE s.deleted_at IS NULL;

-- =====================================================
-- DATOS INICIALES (solo referencia schema + materias; usuarios en database/seeds.sql)
-- =====================================================
-- Materias de ejemplo
INSERT INTO materias (codigo, nombre, descripcion, creditos, departamento) VALUES
('MAT101', 'Cálculo I', 'Fundamentos de cálculo diferencial', 4, 'Matemáticas'),
('PROG201', 'Programación Orientada a Objetos', 'Java y principios SOLID', 4, 'Ingeniería de Software'),
('BD301', 'Bases de Datos Avanzadas', 'PostgreSQL, Supabase y optimización', 3, 'Bases de Datos'),
('IA401', 'Inteligencia Artificial', 'Machine Learning y Deep Learning', 4, 'Inteligencia Artificial');

COMMENT ON TABLE usuarios IS 'Tabla principal de usuarios con autenticación JWT';
COMMENT ON TABLE sesiones_tutoria IS 'Gestión completa de reservas y sesiones de tutoría';
COMMENT ON DATABASE tutorias_universitarias IS 'Base de datos del Sistema de Tutorías Universitarias - Versión 1.0 Premium';