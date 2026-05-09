-- =====================================================
-- SEEDS - DATOS DE PRUEBA PROFESIONALES
-- Sistema de Tutorías Universitarias
-- =====================================================

-- Usuarios de prueba
INSERT INTO usuarios (id, email, password_hash, nombre_completo, telefono, rol, estado, email_verificado) VALUES
-- Estudiantes
('550e8400-e29b-41d4-a716-446655440001', 'juan.perez@universidad.edu', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Juan Pérez García', '+52 55 1234 5678', 'ESTUDIANTE', 'ACTIVO', true),
('550e8400-e29b-41d4-a716-446655440002', 'maria.lopez@universidad.edu', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'María López Sánchez', '+52 55 2345 6789', 'ESTUDIANTE', 'ACTIVO', true),
('550e8400-e29b-41d4-a716-446655440003', 'carlos.ruiz@universidad.edu', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Carlos Ruiz Martínez', '+52 55 3456 7890', 'ESTUDIANTE', 'ACTIVO', true),

-- Tutores
('550e8400-e29b-41d4-a716-446655440011', 'ana.garcia@tutorias.edu', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Dra. Ana García Hernández', '+52 55 9876 5432', 'TUTOR', 'ACTIVO', true),
('550e8400-e29b-41d4-a716-446655440012', 'roberto.mendez@tutorias.edu', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Mtro. Roberto Méndez López', '+52 55 8765 4321', 'TUTOR', 'ACTIVO', true),
('550e8400-e29b-41d4-a716-446655440013', 'laura.vasquez@tutorias.edu', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Ing. Laura Vásquez Torres', '+52 55 7654 3210', 'TUTOR', 'ACTIVO', true),

-- Admin y Coordinador
('550e8400-e29b-41d4-a716-446655440021', 'coordinador@tutorias.edu', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Coordinador Académico', '+52 55 1111 2222', 'COORDINADOR', 'ACTIVO', true);

-- Perfiles de estudiantes
INSERT INTO perfiles_estudiante (usuario_id, matricula, carrera, semestre, promedio_general, creditos_aprobados) VALUES
('550e8400-e29b-41d4-a716-446655440001', '202312345', 'Ingeniería en Sistemas Computacionales', 5, 8.75, 120),
('550e8400-e29b-41d4-a716-446655440002', '202312346', 'Licenciatura en Administración', 4, 9.20, 95),
('550e8400-e29b-41d4-a716-446655440003', '202312347', 'Ingeniería en Software', 6, 8.50, 145);

-- Perfiles de tutores
INSERT INTO perfiles_tutor (usuario_id, especialidad, titulo_academico, anos_experiencia, tarifa_hora, calificacion_promedio, total_sesiones, verificado) VALUES
('550e8400-e29b-41d4-a716-446655440011', 'Matemáticas Avanzadas y Cálculo', 'Doctora en Matemáticas Aplicadas', 12, 45.00, 4.85, 342, true),
('550e8400-e29b-41d4-a716-446655440012', 'Programación y Desarrollo de Software', 'Maestro en Ingeniería de Software', 8, 38.00, 4.92, 287, true),
('550e8400-e29b-41d4-a716-446655440013', 'Inteligencia Artificial y Bases de Datos', 'Ingeniera en Sistemas con Maestría en IA', 6, 42.00, 4.78, 156, true);

-- Asignar materias a tutores
INSERT INTO tutorias_materia (tutor_id, materia_id) 
SELECT pt.id, m.id FROM perfiles_tutor pt, materias m 
WHERE pt.usuario_id = '550e8400-e29b-41d4-a716-446655440011' AND m.codigo IN ('MAT101', 'PROG201');

INSERT INTO tutorias_materia (tutor_id, materia_id) 
SELECT pt.id, m.id FROM perfiles_tutor pt, materias m 
WHERE pt.usuario_id = '550e8400-e29b-41d4-a716-446655440012' AND m.codigo IN ('PROG201', 'BD301');

INSERT INTO tutorias_materia (tutor_id, materia_id) 
SELECT pt.id, m.id FROM perfiles_tutor pt, materias m 
WHERE pt.usuario_id = '550e8400-e29b-41d4-a716-446655440013' AND m.codigo IN ('BD301', 'IA401');

-- Sesiones de ejemplo
INSERT INTO sesiones_tutoria (estudiante_id, tutor_id, materia_id, fecha_hora_inicio, fecha_hora_fin, estado, modalidad, precio) 
SELECT 
    (SELECT id FROM perfiles_estudiante WHERE usuario_id = '550e8400-e29b-41d4-a716-446655440001'),
    (SELECT id FROM perfiles_tutor WHERE usuario_id = '550e8400-e29b-41d4-a716-446655440011'),
    (SELECT id FROM materias WHERE codigo = 'MAT101'),
    CURRENT_TIMESTAMP + INTERVAL '2 days',
    CURRENT_TIMESTAMP + INTERVAL '2 days' + INTERVAL '1 hour',
    'CONFIRMADA',
    'VIRTUAL',
    45.00;

-- Historial académico
INSERT INTO historial_academico (estudiante_id, materia_id, calificacion, periodo, creditos, estado)
SELECT 
    (SELECT id FROM perfiles_estudiante WHERE usuario_id = '550e8400-e29b-41d4-a716-446655440001'),
    (SELECT id FROM materias WHERE codigo = 'MAT101'),
    9.5, '2024-2', 4, 'APROBADA';

-- Notificaciones de ejemplo
INSERT INTO notificaciones (usuario_id, titulo, mensaje, tipo) 
SELECT id, 'Bienvenido al Sistema', 'Tu cuenta ha sido activada exitosamente. ¡Comienza a reservar tutorías!', 'SISTEMA'
FROM usuarios WHERE rol = 'ESTUDIANTE' LIMIT 1;