-- =====================================================
-- SEEDS - DATOS DE PRUEBA PROFESIONALES
-- Sistema de Tutorías Universitarias
-- =====================================================

-- Usuarios de prueba (contraseñas alineadas con README: Student123!, Tutor123!, Admin123!, Coordinador123!)
INSERT INTO usuarios (id, email, password_hash, nombre_completo, telefono, rol, estado, email_verificado) VALUES
-- Estudiantes (password: Student123!)
('550e8400-e29b-41d4-a716-446655440001', 'juan.perez@unitru.edu.pe', '$2b$10$lMMZKTBiTuTlqf4ABfHJQ.EKSC8p6mwUwGsLaZhmtXi5EQFLchyIG', 'Juan Pérez García', '+51 999 123 456', 'ESTUDIANTE', 'ACTIVO', true),
('550e8400-e29b-41d4-a716-446655440002', 'maria.lopez@unitru.edu.pe', '$2b$10$lMMZKTBiTuTlqf4ABfHJQ.EKSC8p6mwUwGsLaZhmtXi5EQFLchyIG', 'María López Sánchez', '+51 999 234 567', 'ESTUDIANTE', 'ACTIVO', true),
('550e8400-e29b-41d4-a716-446655440003', 'carlos.ruiz@unitru.edu.pe', '$2b$10$lMMZKTBiTuTlqf4ABfHJQ.EKSC8p6mwUwGsLaZhmtXi5EQFLchyIG', 'Carlos Ruiz Martínez', '+51 999 345 678', 'ESTUDIANTE', 'ACTIVO', true),

-- Tutores (password: Tutor123!)
('550e8400-e29b-41d4-a716-446655440011', 'ana.garcia@unitru.edu.pe', '$2b$10$ySPTvx.oP2zMazC2k6idmeXCPtwgEqOrXr31vN5pXAXPz.vbOvKbO', 'Dra. Ana García Hernández', '+51 999 987 654', 'TUTOR', 'ACTIVO', true),
('550e8400-e29b-41d4-a716-446655440012', 'roberto.mendez@unitru.edu.pe', '$2b$10$ySPTvx.oP2zMazC2k6idmeXCPtwgEqOrXr31vN5pXAXPz.vbOvKbO', 'Mtro. Roberto Méndez López', '+51 999 876 543', 'TUTOR', 'ACTIVO', true),
('550e8400-e29b-41d4-a716-446655440013', 'laura.vasquez@unitru.edu.pe', '$2b$10$ySPTvx.oP2zMazC2k6idmeXCPtwgEqOrXr31vN5pXAXPz.vbOvKbO', 'Ing. Laura Vásquez Torres', '+51 999 765 432', 'TUTOR', 'ACTIVO', true),

-- Admin (password: Admin123!)
('550e8400-e29b-41d4-a716-446655440020', 'admin@unitru.edu.pe', '$2b$10$ilLUl8ogGb96IqFg.5u2JOKjCmwb/uFXWOOLmmK5FmaEaeXbkQriy', 'Administrador del Sistema', '+51 999 000 111', 'ADMIN', 'ACTIVO', true),

-- Coordinador (password: Coordinador123!)
('550e8400-e29b-41d4-a716-446655440021', 'coordinador@unitru.edu.pe', '$2b$10$EyKbIiJYCaG6bikbWeik8O8lQ0xxOC7yevZAum3lHNU.CLY0Cr.a6', 'Coordinador Académico', '+51 999 111 222', 'COORDINADOR', 'ACTIVO', true);

-- Perfiles de estudiantes
INSERT INTO perfiles_estudiante (usuario_id, matricula, carrera, semestre, promedio_general, creditos_aprobados) VALUES
('550e8400-e29b-41d4-a716-446655440001', '202312345', 'Ingeniería en Sistemas Computacionales', 5, 8.75, 120),
('550e8400-e29b-41d4-a716-446655440002', '202312346', 'Licenciatura en Administración', 4, 9.20, 95),
('550e8400-e29b-41d4-a716-446655440003', '202312347', 'Ingeniería en Software', 6, 8.50, 145);

-- Perfiles de tutores
INSERT INTO perfiles_tutor (usuario_id, especialidad, titulo_academico, anos_experiencia, tarifa_hora, calificacion_promedio, total_sesiones, verificado) VALUES
('550e8400-e29b-41d4-a716-446655440011', 'Matemáticas Avanzadas y Cálculo', 'Doctora en Matemáticas Aplicadas - UNMSM', 12, 55.00, 4.85, 342, true),
('550e8400-e29b-41d4-a716-446655440012', 'Programación y Desarrollo de Software', 'Maestro en Ingeniería de Software - PUCP', 8, 48.00, 4.92, 287, true),
('550e8400-e29b-41d4-a716-446655440013', 'Inteligencia Artificial y Bases de Datos', 'Ingeniera en Sistemas con Maestría en IA - UNI', 6, 52.00, 4.78, 156, true);

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
    55.00; -- Precio en Soles Peruanos (PEN)

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