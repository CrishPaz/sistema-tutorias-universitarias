-- =====================================================
-- DATOS DE PRUEBA ADICIONALES (idempotente por ON CONFLICT donde aplica)
-- Contraseñas: estudiantes = Student123!, tutores = Tutor123!
-- Ejecutar: docker exec -i tutorias-postgres psql -U tutorias_user -d tutorias_universitarias < database/test-data.sql
-- =====================================================

BEGIN;

-- ---------- USUARIOS ----------
INSERT INTO usuarios (id, email, password_hash, nombre_completo, telefono, rol, estado, email_verificado, biografia) VALUES
-- Estudiantes (Student123!)
('550e8400-e29b-41d4-a716-446655450001', 'pedro.sanchez@unitru.edu.pe', '$2b$10$lMMZKTBiTuTlqf4ABfHJQ.EKSC8p6mwUwGsLaZhmtXi5EQFLchyIG', 'Pedro Sánchez Quispe', '+51 999 100 001', 'ESTUDIANTE', 'ACTIVO', true, 'Estudiante de Ingeniería de Sistemas, apasionado por la IA.'),
('550e8400-e29b-41d4-a716-446655450002', 'lucia.flores@unitru.edu.pe', '$2b$10$lMMZKTBiTuTlqf4ABfHJQ.EKSC8p6mwUwGsLaZhmtXi5EQFLchyIG', 'Lucía Flores Mendoza', '+51 999 100 002', 'ESTUDIANTE', 'ACTIVO', true, NULL),
('550e8400-e29b-41d4-a716-446655450003', 'diego.torres@unitru.edu.pe', '$2b$10$lMMZKTBiTuTlqf4ABfHJQ.EKSC8p6mwUwGsLaZhmtXi5EQFLchyIG', 'Diego Torres Ramos', '+51 999 100 003', 'ESTUDIANTE', 'ACTIVO', true, NULL),
('550e8400-e29b-41d4-a716-446655450004', 'sofia.ramirez@unitru.edu.pe', '$2b$10$lMMZKTBiTuTlqf4ABfHJQ.EKSC8p6mwUwGsLaZhmtXi5EQFLchyIG', 'Sofía Ramírez León', '+51 999 100 004', 'ESTUDIANTE', 'ACTIVO', true, NULL),
-- Tutores (Tutor123!)
('550e8400-e29b-41d4-a716-446655450011', 'miguel.castro@unitru.edu.pe', '$2b$10$ySPTvx.oP2zMazC2k6idmeXCPtwgEqOrXr31vN5pXAXPz.vbOvKbO', 'Mtro. Miguel Castro Díaz', '+51 999 200 011', 'TUTOR', 'ACTIVO', true, 'Especialista en programación competitiva y estructuras de datos.'),
('550e8400-e29b-41d4-a716-446655450012', 'elena.vargas@unitru.edu.pe', '$2b$10$ySPTvx.oP2zMazC2k6idmeXCPtwgEqOrXr31vN5pXAXPz.vbOvKbO', 'Dra. Elena Vargas Cruz', '+51 999 200 012', 'TUTOR', 'ACTIVO', true, 'Doctora en Bases de Datos, 10 años de experiencia docente.'),
('550e8400-e29b-41d4-a716-446655450013', 'jorge.rojas@unitru.edu.pe', '$2b$10$ySPTvx.oP2zMazC2k6idmeXCPtwgEqOrXr31vN5pXAXPz.vbOvKbO', 'Ing. Jorge Rojas Paredes', '+51 999 200 013', 'TUTOR', 'INACTIVO', true, NULL)
ON CONFLICT (email) DO NOTHING;

-- ---------- PERFILES ESTUDIANTE ----------
INSERT INTO perfiles_estudiante (usuario_id, matricula, carrera, semestre, promedio_general, creditos_aprobados) VALUES
('550e8400-e29b-41d4-a716-446655450001', '202410001', 'Ingeniería de Sistemas', 7, 8.90, 160),
('550e8400-e29b-41d4-a716-446655450002', '202410002', 'Ingeniería Industrial', 3, 7.80, 70),
('550e8400-e29b-41d4-a716-446655450003', '202410003', 'Ciencias de la Computación', 8, 9.10, 185),
('550e8400-e29b-41d4-a716-446655450004', '202410004', 'Ingeniería de Software', 2, 8.20, 45)
ON CONFLICT (matricula) DO NOTHING;

-- ---------- PERFILES TUTOR ----------
INSERT INTO perfiles_tutor (usuario_id, especialidad, titulo_academico, anos_experiencia, tarifa_hora, calificacion_promedio, total_sesiones, verificado) VALUES
('550e8400-e29b-41d4-a716-446655450011', 'Programación y Estructuras de Datos', 'Maestro en Ciencias de la Computación - UNI', 7, 50.00, 4.80, 120, true),
('550e8400-e29b-41d4-a716-446655450012', 'Bases de Datos y Big Data', 'Doctora en Informática - PUCP', 10, 60.00, 4.95, 230, true),
('550e8400-e29b-41d4-a716-446655450013', 'Algoritmos y Optimización', 'Ingeniero de Sistemas - UNT', 4, 40.00, 4.60, 60, false)
ON CONFLICT (usuario_id) DO NOTHING;

-- ---------- ASIGNAR MATERIAS A NUEVOS TUTORES ----------
INSERT INTO tutorias_materia (tutor_id, materia_id)
SELECT pt.id, m.id FROM perfiles_tutor pt, materias m
WHERE pt.usuario_id = '550e8400-e29b-41d4-a716-446655450011' AND m.codigo IN ('PROG201','MAT101')
ON CONFLICT (tutor_id, materia_id) DO NOTHING;
INSERT INTO tutorias_materia (tutor_id, materia_id)
SELECT pt.id, m.id FROM perfiles_tutor pt, materias m
WHERE pt.usuario_id = '550e8400-e29b-41d4-a716-446655450012' AND m.codigo IN ('BD301','IA401')
ON CONFLICT (tutor_id, materia_id) DO NOTHING;
INSERT INTO tutorias_materia (tutor_id, materia_id)
SELECT pt.id, m.id FROM perfiles_tutor pt, materias m
WHERE pt.usuario_id = '550e8400-e29b-41d4-a716-446655450013' AND m.codigo IN ('IA401')
ON CONFLICT (tutor_id, materia_id) DO NOTHING;

-- ---------- DISPONIBILIDADES NUEVOS TUTORES ----------
INSERT INTO disponibilidades (perfil_tutor_id, dia_semana, hora_inicio, hora_fin)
SELECT pt.id, d.dia, d.inicio, d.fin
FROM perfiles_tutor pt
JOIN (VALUES
  ('550e8400-e29b-41d4-a716-446655450011','LUNES',     TIME '07:00', TIME '11:00'),
  ('550e8400-e29b-41d4-a716-446655450011','JUEVES',    TIME '16:00', TIME '20:00'),
  ('550e8400-e29b-41d4-a716-446655450012','MARTES',    TIME '08:00', TIME '12:00'),
  ('550e8400-e29b-41d4-a716-446655450012','MIERCOLES', TIME '08:00', TIME '12:00'),
  ('550e8400-e29b-41d4-a716-446655450012','SABADO',    TIME '09:00', TIME '13:00'),
  ('550e8400-e29b-41d4-a716-446655450013','VIERNES',   TIME '15:00', TIME '18:00')
) AS d(usuario_id, dia, inicio, fin) ON pt.usuario_id = d.usuario_id::uuid;

-- ---------- CERTIFICACIONES NUEVOS TUTORES ----------
INSERT INTO certificaciones (perfil_tutor_id, nombre, institucion, anio)
SELECT pt.id, c.nombre, c.institucion, c.anio
FROM perfiles_tutor pt
JOIN (VALUES
  ('550e8400-e29b-41d4-a716-446655450011','ICPC Regional Finalist','ACM', 2019),
  ('550e8400-e29b-41d4-a716-446655450011','AWS Certified Developer','Amazon', 2021),
  ('550e8400-e29b-41d4-a716-446655450012','PostgreSQL Certified Engineer','EDB', 2020),
  ('550e8400-e29b-41d4-a716-446655450012','Google Cloud Professional Data Engineer','Google', 2022),
  ('550e8400-e29b-41d4-a716-446655450013','Scrum Master Certified','Scrum.org', 2023)
) AS c(usuario_id, nombre, institucion, anio) ON pt.usuario_id = c.usuario_id::uuid;

-- ---------- SESIONES DE TUTORÍA (varios estados) ----------
-- Helper inline via subconsultas por usuario_id de estudiante/tutor y código de materia.
INSERT INTO sesiones_tutoria
  (id, estudiante_id, tutor_id, materia_id, fecha_hora_inicio, fecha_hora_fin, estado, modalidad, enlace_reunion, ubicacion, precio,
   notas_estudiante, calificacion_estudiante, resena_estudiante, nota_academica, resena_tutor)
VALUES
-- S01 COMPLETADA (con calificación y nota académica)
('5e510000-0000-0000-0000-000000000001',
  (SELECT id FROM perfiles_estudiante WHERE usuario_id='550e8400-e29b-41d4-a716-446655450001'),
  (SELECT id FROM perfiles_tutor WHERE usuario_id='550e8400-e29b-41d4-a716-446655440011'),
  (SELECT id FROM materias WHERE codigo='MAT101'),
  CURRENT_TIMESTAMP - INTERVAL '7 days', CURRENT_TIMESTAMP - INTERVAL '7 days' + INTERVAL '90 minutes',
  'COMPLETADA','VIRTUAL','https://meet.google.com/abc-defg-hij',NULL,82.50,
  'Necesito reforzar límites y derivadas.',5,'Excelente explicación, muy clara.',18.50,'Estudiante muy participativo.'),
-- S02 CONFIRMADA (futura, virtual)
('5e510000-0000-0000-0000-000000000002',
  (SELECT id FROM perfiles_estudiante WHERE usuario_id='550e8400-e29b-41d4-a716-446655450002'),
  (SELECT id FROM perfiles_tutor WHERE usuario_id='550e8400-e29b-41d4-a716-446655450011'),
  (SELECT id FROM materias WHERE codigo='PROG201'),
  CURRENT_TIMESTAMP + INTERVAL '2 days', CURRENT_TIMESTAMP + INTERVAL '2 days' + INTERVAL '60 minutes',
  'CONFIRMADA','VIRTUAL','https://zoom.us/j/123456789',NULL,50.00,
  'Quiero entender POO y herencia.',NULL,NULL,NULL,NULL),
-- S03 PENDIENTE (presencial)
('5e510000-0000-0000-0000-000000000003',
  (SELECT id FROM perfiles_estudiante WHERE usuario_id='550e8400-e29b-41d4-a716-446655450003'),
  (SELECT id FROM perfiles_tutor WHERE usuario_id='550e8400-e29b-41d4-a716-446655450012'),
  (SELECT id FROM materias WHERE codigo='BD301'),
  CURRENT_TIMESTAMP + INTERVAL '5 days', CURRENT_TIMESTAMP + INTERVAL '5 days' + INTERVAL '120 minutes',
  'PENDIENTE','PRESENCIAL',NULL,'Biblioteca Central, sala 3',120.00,
  'Optimización de consultas y normalización.',NULL,NULL,NULL,NULL),
-- S04 CANCELADA
('5e510000-0000-0000-0000-000000000004',
  (SELECT id FROM perfiles_estudiante WHERE usuario_id='550e8400-e29b-41d4-a716-446655450004'),
  (SELECT id FROM perfiles_tutor WHERE usuario_id='550e8400-e29b-41d4-a716-446655440013'),
  (SELECT id FROM materias WHERE codigo='IA401'),
  CURRENT_TIMESTAMP - INTERVAL '1 days', CURRENT_TIMESTAMP - INTERVAL '1 days' + INTERVAL '60 minutes',
  'CANCELADA','VIRTUAL',NULL,NULL,52.00,
  'Introducción a redes neuronales.',NULL,NULL,NULL,NULL),
-- S05 COMPLETADA (usuarios existentes juan + roberto)
('5e510000-0000-0000-0000-000000000005',
  (SELECT id FROM perfiles_estudiante WHERE usuario_id='550e8400-e29b-41d4-a716-446655440001'),
  (SELECT id FROM perfiles_tutor WHERE usuario_id='550e8400-e29b-41d4-a716-446655440012'),
  (SELECT id FROM materias WHERE codigo='PROG201'),
  CURRENT_TIMESTAMP - INTERVAL '3 days', CURRENT_TIMESTAMP - INTERVAL '3 days' + INTERVAL '60 minutes',
  'COMPLETADA','HIBRIDA','https://meet.google.com/xyz',NULL,48.00,
  'Patrones de diseño.',4,'Buena sesión, faltó tiempo.',16.00,'Buen avance, debe practicar más.'),
-- S06 EN_PROGRESO
('5e510000-0000-0000-0000-000000000006',
  (SELECT id FROM perfiles_estudiante WHERE usuario_id='550e8400-e29b-41d4-a716-446655450001'),
  (SELECT id FROM perfiles_tutor WHERE usuario_id='550e8400-e29b-41d4-a716-446655440011'),
  (SELECT id FROM materias WHERE codigo='MAT101'),
  CURRENT_TIMESTAMP - INTERVAL '20 minutes', CURRENT_TIMESTAMP + INTERVAL '40 minutes',
  'EN_PROGRESO','VIRTUAL','https://meet.google.com/live-now',NULL,55.00,
  'Integrales por partes.',NULL,NULL,NULL,NULL),
-- S07 CONFIRMADA (lucia + laura existente)
('5e510000-0000-0000-0000-000000000007',
  (SELECT id FROM perfiles_estudiante WHERE usuario_id='550e8400-e29b-41d4-a716-446655450002'),
  (SELECT id FROM perfiles_tutor WHERE usuario_id='550e8400-e29b-41d4-a716-446655440013'),
  (SELECT id FROM materias WHERE codigo='IA401'),
  CURRENT_TIMESTAMP + INTERVAL '1 days', CURRENT_TIMESTAMP + INTERVAL '1 days' + INTERVAL '90 minutes',
  'CONFIRMADA','VIRTUAL','https://zoom.us/j/987654321',NULL,78.00,
  'Machine Learning básico.',NULL,NULL,NULL,NULL)
ON CONFLICT (id) DO NOTHING;

-- ---------- MENSAJES (chat) ----------
INSERT INTO mensajes (sesion_id, remitente_id, destinatario_id, contenido, leido) VALUES
-- S02 (lucia <-> miguel)
('5e510000-0000-0000-0000-000000000002','550e8400-e29b-41d4-a716-446655450002','550e8400-e29b-41d4-a716-446655450011','Hola profe, ¿la sesión es por Zoom?', true),
('5e510000-0000-0000-0000-000000000002','550e8400-e29b-41d4-a716-446655450011','550e8400-e29b-41d4-a716-446655450002','Hola Lucía, sí, te paso el enlace. ¡Prepara tus dudas de POO!', true),
('5e510000-0000-0000-0000-000000000002','550e8400-e29b-41d4-a716-446655450002','550e8400-e29b-41d4-a716-446655450011','Perfecto, gracias 🙌', false),
-- S06 (pedro <-> ana - en progreso)
('5e510000-0000-0000-0000-000000000006','550e8400-e29b-41d4-a716-446655450001','550e8400-e29b-41d4-a716-446655440011','Ya estoy conectado.', true),
('5e510000-0000-0000-0000-000000000006','550e8400-e29b-41d4-a716-446655440011','550e8400-e29b-41d4-a716-446655450001','Genial, empecemos con un ejemplo.', false);

-- ---------- NOTIFICACIONES ----------
INSERT INTO notificaciones (usuario_id, titulo, mensaje, tipo, leida) VALUES
('550e8400-e29b-41d4-a716-446655450001','Sesión completada','Tu sesión de Cálculo I fue marcada como completada. ¡Califícala!','SESION', false),
('550e8400-e29b-41d4-a716-446655450001','Pago confirmado','Recibimos tu pago de S/ 82.50 por la tutoría de Cálculo I.','PAGO', true),
('550e8400-e29b-41d4-a716-446655450002','Sesión confirmada','Tu sesión de POO con el Mtro. Miguel Castro fue confirmada.','SESION', false),
('550e8400-e29b-41d4-a716-446655450002','Recordatorio','Tienes una sesión mañana a las 09:00.','RECORDATORIO', false),
('550e8400-e29b-41d4-a716-446655440011','Nueva calificación','Un estudiante calificó tu tutoría con 5 estrellas ⭐','CALIFICACION', false),
('550e8400-e29b-41d4-a716-446655450012','Bienvenida','Tu perfil de tutor fue verificado correctamente.','SISTEMA', true),
('550e8400-e29b-41d4-a716-446655450003','Sesión pendiente','Tu solicitud de tutoría de Bases de Datos está pendiente de confirmación.','SESION', false);

-- ---------- PAGOS (sesiones completadas) ----------
INSERT INTO pagos (sesion_id, monto, moneda, estado, metodo_pago, transaccion_id) VALUES
('5e510000-0000-0000-0000-000000000001', 82.50, 'PEN', 'COMPLETADO', 'TARJETA', 'TXN-2026-0001'),
('5e510000-0000-0000-0000-000000000005', 48.00, 'PEN', 'COMPLETADO', 'YAPE', 'TXN-2026-0002'),
('5e510000-0000-0000-0000-000000000002', 50.00, 'PEN', 'PENDIENTE', 'PLIN', 'TXN-2026-0003');

-- ---------- HISTORIAL ACADÉMICO ----------
INSERT INTO historial_academico (estudiante_id, materia_id, calificacion, periodo, estado)
SELECT pe.id, m.id, h.cal, h.periodo, h.estado
FROM perfiles_estudiante pe
JOIN (VALUES
  ('550e8400-e29b-41d4-a716-446655450001','PROG201', 17.0, '2025-1', 'APROBADA'),
  ('550e8400-e29b-41d4-a716-446655450001','BD301',   14.5, '2025-2', 'APROBADA'),
  ('550e8400-e29b-41d4-a716-446655450003','IA401',   18.0, '2025-1', 'APROBADA'),
  ('550e8400-e29b-41d4-a716-446655450003','MAT101',  11.0, '2025-2', 'EN_CURSO'),
  ('550e8400-e29b-41d4-a716-446655450002','MAT101',   9.0, '2025-1', 'REPROBADA')
) AS h(usuario_id, codigo, cal, periodo, estado) ON pe.usuario_id = h.usuario_id::uuid
JOIN materias m ON m.codigo = h.codigo;

COMMIT;

-- ---------- RESUMEN ----------
SELECT 'usuarios' AS tabla, count(*) FROM usuarios
UNION ALL SELECT 'perfiles_estudiante', count(*) FROM perfiles_estudiante
UNION ALL SELECT 'perfiles_tutor', count(*) FROM perfiles_tutor
UNION ALL SELECT 'sesiones_tutoria', count(*) FROM sesiones_tutoria
UNION ALL SELECT 'mensajes', count(*) FROM mensajes
UNION ALL SELECT 'notificaciones', count(*) FROM notificaciones
UNION ALL SELECT 'pagos', count(*) FROM pagos
UNION ALL SELECT 'historial_academico', count(*) FROM historial_academico
UNION ALL SELECT 'disponibilidades', count(*) FROM disponibilidades
UNION ALL SELECT 'certificaciones', count(*) FROM certificaciones
ORDER BY tabla;
