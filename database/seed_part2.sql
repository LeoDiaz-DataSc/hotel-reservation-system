-- seed_part2.sql — Datos transaccionales
USE hotel_enterprise;

-- Reservas (mix de estados)
INSERT INTO Reservas (Folio, ID_Cliente, ID_Habitacion, ID_Empleado_Registro, ID_Plan, ID_Canal, Fecha_Entrada, Fecha_Salida, Hora_CheckIn_Real, Adultos, Menores, Estado, Total_Estimado, Total_Servicios, Observaciones) VALUES
('HTL-2026-00001', 1,  3,  2, 1, 1, CURDATE() - INTERVAL 2 DAY, CURDATE() + INTERVAL 1 DAY, NOW() - INTERVAL 2 DAY, 2, 0, 'Check-in', 5400.00, 650.00, 'Huésped frecuente — upgrade cortesía'),
('HTL-2026-00002', 2,  9,  2, 3, 1, CURDATE() - INTERVAL 1 DAY, CURDATE() + INTERVAL 3 DAY, NOW() - INTERVAL 1 DAY, 2, 1, 'Check-in', 16000.00, 0.00, 'Suite con desayuno incluido'),
('HTL-2026-00003', 7, 17,  3, 1, 2, CURDATE() - INTERVAL 3 DAY, CURDATE() + INTERVAL 2 DAY, NOW() - INTERVAL 3 DAY, 2, 0, 'Check-in', 32500.00, 1730.00, 'Booking.com — corporate guest'),
('HTL-2026-00004', 13, 6,  2, 4, 5, CURDATE(),                  CURDATE() + INTERVAL 4 DAY, NOW(),                  1, 0, 'Check-in', 7200.00, 0.00, 'Tarifa corporativa — empresa Grupo Industrial QRO'),
('HTL-2026-00005', 3, 13,  2, 1, 3, CURDATE() - INTERVAL 1 DAY, CURDATE() + INTERVAL 1 DAY, NOW() - INTERVAL 1 DAY, 2, 0, 'Check-in', 6400.00, 950.00, 'Expedia — solicita late checkout'),
('HTL-2026-00006', 5,  7,  3, 2, 1, CURDATE() + INTERVAL 2 DAY, CURDATE() + INTERVAL 5 DAY, NULL,                  2, 0, 'Confirmada', 4590.00, 0.00, NULL),
('HTL-2026-00007', 9,  1,  2, 1, 4, CURDATE() + INTERVAL 3 DAY, CURDATE() + INTERVAL 6 DAY, NULL,                  1, 0, 'Pendiente', 3600.00, 0.00, 'Airbnb — primera visita'),
('HTL-2026-00008', 4, 10,  2, 1, 1, CURDATE() - INTERVAL 5 DAY, CURDATE() - INTERVAL 2 DAY, NOW() - INTERVAL 5 DAY, 2, 0, 'Check-out', 5400.00, 370.00, NULL),
('HTL-2026-00009', 11, 4,  3, 5, 1, CURDATE() - INTERVAL 7 DAY, CURDATE() - INTERVAL 4 DAY, NOW() - INTERVAL 7 DAY, 1, 0, 'Check-out', 4860.00, 0.00, 'Oferta temporada baja'),
('HTL-2026-00010', 8, 12,  2, 1, 1, CURDATE() + INTERVAL 1 DAY, CURDATE() + INTERVAL 3 DAY, NULL,                  2, 0, 'Cancelada', 6400.00, 0.00, NULL);
UPDATE Reservas SET Motivo_Cancelacion='Cliente solicitó cancelación por cambio de planes' WHERE Folio='HTL-2026-00010';

-- Cargos a reservas activas
INSERT INTO Cargos_Reserva (ID_Reserva, ID_Servicio, ID_Empleado, Cantidad, Precio_Unitario, Descuento, Subtotal, Estado, Notas) VALUES
(1, 6,  2, 1, 650.00, 0, 650.00, 'Pendiente', 'Botella de vino de bienvenida'),
(3, 7,  NULL, 2, 950.00, 0, 1900.00, 'Pendiente', 'Masaje para 2 personas'),
(3, 1,  NULL, 1, 250.00, 250.00, 0.00, 'Cortesía', 'Desayuno cortesía por programa lealtad'),
(5, 7,  NULL, 1, 950.00, 0, 950.00, 'Pendiente', 'Spa reservado para mañana 10:00'),
(8, 12, 4, 2, 45.00, 0, 90.00, 'Cobrado', NULL),
(8, 14, 4, 3, 95.00, 0, 285.00, 'Cobrado', 'Minibar — 3 cervezas'),
(4, 1,  NULL, 1, 250.00, 0, 250.00, 'Pendiente', NULL),
(2, 9,  NULL, 2, 450.00, 0, 900.00, 'Pendiente', 'Circuito hidrotermal para 2');

-- Pagos
INSERT INTO Pagos (ID_Reserva, ID_Empleado, Monto, Metodo_Pago, Tipo_Pago, Ultimos_4, Marca_Tarjeta, Estado) VALUES
(1, 2, 2700.00, 'Tarjeta_Credito', 'Deposito', '4532', 'Visa', 'Aprobado'),
(3, 2, 15000.00,'Tarjeta_Credito', 'Deposito', '8891', 'Amex', 'Aprobado'),
(4, 2, 7200.00, 'Transferencia',   'Deposito', NULL,   NULL,   'Aprobado'),
(8, 2, 5770.00, 'Tarjeta_Debito',  'Liquidacion','1234','Mastercard','Aprobado'),
(9, 3, 4860.00, 'Efectivo',        'Liquidacion',NULL,  NULL,   'Aprobado'),
(5, 2, 3200.00, 'Tarjeta_Credito', 'Deposito', '7766', 'Visa', 'Aprobado');

-- Lealtad
INSERT INTO Lealtad_Movimientos (ID_Cliente, ID_Reserva, Tipo, Puntos, Descripcion, Saldo_Resultante) VALUES
(1, 1, 'Acumulacion', 540,  'Estancia HTL-2026-00001', 4740),
(2, 2, 'Acumulacion', 1600, 'Estancia HTL-2026-00002', 14100),
(7, 3, 'Acumulacion', 3250, 'Estancia HTL-2026-00003', 8850),
(13,4, 'Acumulacion', 720,  'Estancia HTL-2026-00004', 15920),
(3, 5, 'Acumulacion', 640,  'Estancia HTL-2026-00005', 2440),
(2, NULL,'Canje',    -2000, 'Canje: upgrade a Suite Presidencial', 12100);

-- Housekeeping
INSERT INTO Tareas_Limpieza (ID_Habitacion, ID_Reserva, ID_Empleado, Tipo, Estado, Prioridad, Asignada_En, Iniciada_En) VALUES
(10, 8, 4, 'Salida',    'Pendiente',   'Alta',    NOW() - INTERVAL 30 MINUTE, NULL),
(15, NULL, 5, 'Rutina',  'En_Proceso',  'Normal',  NOW() - INTERVAL 1 HOUR, NOW() - INTERVAL 20 MINUTE),
(5,  NULL, 4, 'Profunda', 'Pendiente',  'Normal',  NOW() - INTERVAL 2 HOUR, NULL),
(7,  NULL, 5, 'Rutina',   'Completada', 'Normal',  NOW() - INTERVAL 4 HOUR, NOW() - INTERVAL 3 HOUR),
(1,  NULL, 4, 'Inspeccion','Pendiente', 'Urgente', NOW() - INTERVAL 10 MINUTE, NULL);
UPDATE Tareas_Limpieza SET Completada_En=NOW()-INTERVAL 2 HOUR, Tiempo_Min=45, Verificada_Por=8 WHERE ID_Tarea=4;

-- Checklist plantillas
INSERT INTO Checklist_Plantillas (Nombre, Tipo_Limpieza, ID_Tipo_Hab) VALUES
('Checklist Salida Estándar', 'Salida', NULL),
('Checklist Rutina Diaria', 'Rutina', NULL),
('Checklist Profunda Suite', 'Profunda', 3);

INSERT INTO Checklist_Items_Plantilla (ID_Plantilla, Descripcion, Orden, Obligatorio) VALUES
(1, 'Retirar sábanas y toallas usadas', 1, TRUE),
(1, 'Limpiar y desinfectar baño completo', 2, TRUE),
(1, 'Aspirar alfombra y trapear pisos', 3, TRUE),
(1, 'Revisar y reponer minibar', 4, TRUE),
(1, 'Cambiar amenidades de baño', 5, TRUE),
(1, 'Verificar funcionamiento de luces y AC', 6, TRUE),
(1, 'Hacer cama con ropa limpia', 7, TRUE),
(1, 'Limpiar ventanas y espejos', 8, FALSE),
(2, 'Hacer cama', 1, TRUE),
(2, 'Reponer toallas', 2, TRUE),
(2, 'Vaciar basura', 3, TRUE),
(2, 'Limpiar superficies', 4, TRUE),
(3, 'Desmontar y lavar cortinas', 1, TRUE),
(3, 'Limpiar debajo de muebles', 2, TRUE),
(3, 'Pulir superficies de mármol', 3, TRUE),
(3, 'Desinfección profunda de jacuzzi', 4, TRUE);

-- M12: Proveedores
INSERT INTO Proveedores (Nombre, RFC, Contacto, Telefono, Email, Especialidad) VALUES
('ClimaTech HVAC SA de CV',     'CTH201015AB3', 'Ing. Raúl Mendoza',   '+52 442 333 4455', 'raul@climatech.mx',      'HVAC'),
('ElectroServ Querétaro',       'ESQ180620KL9', 'Lic. Fernando Ríos',  '+52 442 222 3344', 'contacto@electroserv.mx', 'Eléctrico'),
('Plomería Industrial del Bajío','PIB150310MN2', 'Sr. Miguel Ángel Cruz','+52 442 111 2233','miguel@pibajio.com',     'Plomeria'),
('Muebles y Tapicería Fina',    'MTF190805QW4', 'Sra. Laura Estrada',  '+52 442 444 5566', 'ventas@mtfina.com',       'Mobiliario');

-- M12: Activos
INSERT INTO Activos_Hotel (Nombre, Codigo_Interno, Categoria, ID_Habitacion, Marca, Modelo, Fecha_Compra, Garantia_Hasta, ID_Proveedor, Estado) VALUES
('Minisplit Inverter 2TR',    'HVAC-101',  'HVAC',            1,    'Mirage', 'Absolut X32', '2024-03-15', '2027-03-15', 1, 'Operativo'),
('Minisplit Inverter 2TR',    'HVAC-201',  'HVAC',            6,    'Mirage', 'Absolut X32', '2024-03-15', '2027-03-15', 1, 'Operativo'),
('Minisplit Inverter 3TR',    'HVAC-401',  'HVAC',            16,   'Carrier','XPower Gold', '2024-06-01', '2027-06-01', 1, 'Operativo'),
('Calentador Solar 300L',     'PLM-SOLAR', 'Plomeria',        NULL, 'Solaris','Eco 300',     '2023-01-10', '2028-01-10', 3, 'Operativo'),
('Elevador Panorámico',       'ELEV-01',   'Electrodomestico',NULL, 'Otis',   'Gen2 Comfort','2022-08-20', '2032-08-20', 2, 'Operativo'),
('Smart TV 55" Suite 203',    'AV-203',    'AV',              8,    'Samsung','Crystal UHD', '2024-11-01', '2026-11-01', NULL,'Operativo'),
('Cafetera Nespresso Suite',  'CAFE-204',  'Electrodomestico',9,    'Nespresso','Vertuo Next','2025-01-15','2027-01-15', NULL,'Operativo'),
('Bomba Recirculación Alberca','PLM-POOL', 'Plomeria',        NULL, 'Pentair','SuperFlo VS', '2023-06-01', '2026-06-01', 3, 'En_Reparacion');

-- M12: Mantenimiento Programado
INSERT INTO Mantenimiento_Programado (ID_Activo, Descripcion, Frecuencia_Tipo, Frecuencia_Valor, Proxima_Ejecucion, Ultima_Ejecucion, ID_Proveedor, Tiempo_Est_Min) VALUES
(1, 'Limpieza de filtros de aire acondicionado', 'Trimestral', 1, CURDATE() + INTERVAL 5 DAY,  CURDATE() - INTERVAL 85 DAY, 1, 30),
(4, 'Revisión de panel solar y conexiones',      'Mensual',    1, CURDATE() - INTERVAL 3 DAY,  CURDATE() - INTERVAL 33 DAY, 3, 60),
(5, 'Inspección general de elevador',            'Mensual',    1, CURDATE() + INTERVAL 12 DAY, CURDATE() - INTERVAL 18 DAY, 2, 120),
(8, 'Cambio de sello mecánico de bomba',         'Anual',      1, CURDATE() + INTERVAL 30 DAY, CURDATE() - INTERVAL 335 DAY,3, 180);

-- M12: Orden de mantenimiento activa
INSERT INTO Ordenes_Mantenimiento (Folio, ID_Activo, ID_Habitacion, ID_Empleado_Solicita, ID_Empleado_Asignado, ID_Proveedor, Tipo, Prioridad, Descripcion, Estado, Costo_Estimado) VALUES
('MNT-2026-00001', 8, NULL, 8, 6, 3, 'Correctivo', 'Alta', 'Bomba de alberca presenta fuga — ruido anormal y baja presión', 'En_Proceso', 4500.00),
('MNT-2026-00002', NULL, 5, 4, 6, 2, 'Correctivo', 'Normal', 'Falla en contacto eléctrico de baño — no enciende luz espejo', 'Abierta', 800.00);

-- M11: Plantillas de comunicación
INSERT INTO Plantillas_Comunicacion (Nombre, Evento, Canal, Idioma, Asunto, Cuerpo) VALUES
('Confirmación Reserva Email', 'Confirmacion_Reserva', 'Email', 'es-MX', 'Confirmación de su reserva {{folio}} — Hotel Enterprise', 'Estimado/a {{nombre_cliente}},\n\nLe confirmamos su reserva con folio {{folio}}.\nFecha de entrada: {{fecha_entrada}}\nFecha de salida: {{fecha_salida}}\nHabitación: {{tipo_habitacion}}\n\n¡Le esperamos!\nHotel Enterprise'),
('Pre Check-In WhatsApp', 'Pre_CheckIn', 'WhatsApp', 'es-MX', NULL, 'Hola {{nombre_cliente}} 👋 Mañana te esperamos en Hotel Enterprise. Tu habitación {{numero_habitacion}} estará lista a partir de las 15:00. ¿Necesitas transporte desde el aeropuerto? Responde SÍ para coordinar. 🏨'),
('Bienvenida SMS', 'Bienvenida', 'SMS', 'es-MX', NULL, 'Bienvenido/a al Hotel Enterprise, {{nombre_cliente}}. WiFi: HotelEnterprise_Guest / Pass: {{wifi_password}}. Recepción 24hrs: ext. 0'),
('Post Estadía Encuesta', 'Encuesta', 'Email', 'es-MX', '¿Cómo fue su estancia? — Hotel Enterprise', 'Estimado/a {{nombre_cliente}},\n\nEsperamos que haya disfrutado su estancia. Su opinión es muy importante para nosotros.\n\nCalifique su experiencia: {{link_encuesta}}\n\nGracias por elegirnos.'),
('Confirmación EN', 'Confirmacion_Reserva', 'Email', 'en-US', 'Booking Confirmation {{folio}} — Hotel Enterprise', 'Dear {{nombre_cliente}},\n\nWe are pleased to confirm your reservation {{folio}}.\nCheck-in: {{fecha_entrada}}\nCheck-out: {{fecha_salida}}\nRoom: {{tipo_habitacion}}\n\nWe look forward to welcoming you!\nHotel Enterprise'),
('Promoción Temporada', 'Promocion', 'Email', 'es-MX', '🌴 Oferta Especial — Hotel Enterprise', 'Estimado/a {{nombre_cliente}},\n\nTenemos una oferta exclusiva para usted: 20% de descuento en su próxima estancia.\nUse el código: VERANO2026\nVálido hasta el 31 de agosto.\n\n¡Reserve ahora!');

-- M08: Audit Logs iniciales
INSERT INTO Audit_Logs (ID_Empleado, Modulo, Accion, Tabla_Afectada, ID_Registro, Detalle, Direccion_IP, Resultado) VALUES
(1, 'M01_Auth', 'LOGIN_OK', 'Empleados', 1, '{"email":"admin@hotel.com"}', '192.168.1.10', 'Exito'),
(2, 'M01_Auth', 'LOGIN_OK', 'Empleados', 2, '{"email":"recepcion@hotel.com"}', '192.168.1.20', 'Exito'),
(NULL, 'M01_Auth', 'LOGIN_FAILED', 'Empleados', NULL, '{"email":"hacker@test.com","reason":"user_not_found"}', '45.33.22.11', 'Denegado'),
(2, 'M02_Reservas', 'RESERVA_CREADA', 'Reservas', 1, '{"folio":"HTL-2026-00001","cliente":"Juan Carlos Pérez"}', '192.168.1.20', 'Exito'),
(2, 'M02_Reservas', 'CHECKIN_OK', 'Reservas', 1, '{"folio":"HTL-2026-00001","habitacion":"103"}', '192.168.1.20', 'Exito'),
(2, 'M02_Reservas', 'RESERVA_CREADA', 'Reservas', 3, '{"folio":"HTL-2026-00003","canal":"Booking.com"}', '192.168.1.20', 'Exito'),
(4, 'M07_Housekeeping', 'TAREA_COMPLETADA', 'Tareas_Limpieza', 4, '{"habitacion":"202","tipo":"Rutina","tiempo_min":45}', '192.168.1.30', 'Exito'),
(8, 'M07_Housekeeping', 'TAREA_VERIFICADA', 'Tareas_Limpieza', 4, '{"habitacion":"202","verificado_por":"Patricia Guzmán"}', '192.168.1.40', 'Exito');

-- M09: Disponibilidad por canal (hoy)
INSERT INTO Disponibilidad_Canal (ID_Canal, ID_Tipo_Hab, Fecha, Cupo_Total, Cupo_Vendido, Precio_Canal) VALUES
(1, 1, CURDATE(), 3, 0, 1200.00),
(1, 2, CURDATE(), 5, 2, 1800.00),
(1, 3, CURDATE(), 4, 2, 3200.00),
(2, 2, CURDATE(), 2, 1, 2070.00),
(2, 3, CURDATE(), 1, 0, 3680.00),
(3, 2, CURDATE(), 2, 0, 2124.00),
(4, 1, CURDATE(), 1, 0, 1236.00);

-- M08: Métricas del día anterior
INSERT INTO Metricas_Diarias (Fecha, Habitaciones_Total, Habitaciones_Ocupadas, Ocupacion_Pct, ADR, RevPAR, Ingresos_Habitacion, Ingresos_Servicios, Ingresos_Total, Check_Ins, Check_Outs, Cancelaciones, No_Shows) VALUES
(CURDATE() - INTERVAL 1 DAY, 20, 12, 60.00, 2450.00, 1470.00, 29400.00, 3850.00, 33250.00, 3, 2, 1, 0),
(CURDATE() - INTERVAL 2 DAY, 20, 14, 70.00, 2380.00, 1666.00, 33320.00, 5200.00, 38520.00, 4, 1, 0, 0),
(CURDATE() - INTERVAL 3 DAY, 20, 11, 55.00, 2200.00, 1210.00, 24200.00, 2100.00, 26300.00, 2, 3, 0, 1);
