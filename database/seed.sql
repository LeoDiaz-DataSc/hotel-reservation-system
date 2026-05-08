-- =============================================================================
-- SEED DATA: hotel_enterprise — Datos realistas para demostración
-- =============================================================================
USE hotel_enterprise;

-- M01: Empleados (SHA2 para bootstrap — la app migra a bcrypt al primer login)
INSERT INTO Empleados (Nombre, Apellido, Email, Contrasena_Hash, Rol, Requiere_2FA) VALUES
('Adrián',   'Morales García',   'admin@hotel.com',         SHA2('Admin123!',256),  'Admin',         TRUE),
('Lucía',    'Hernández Ruiz',   'recepcion@hotel.com',     SHA2('Recep123!',256),  'Recepcion',     FALSE),
('Mariana',  'López Torres',     'recepcion2@hotel.com',    SHA2('Recep456!',256),  'Recepcion',     FALSE),
('Roberto',  'Sánchez Vega',     'limpieza@hotel.com',      SHA2('Clean123!',256),  'Limpieza',      FALSE),
('Elena',    'Ramírez Díaz',     'limpieza2@hotel.com',     SHA2('Clean456!',256),  'Limpieza',      FALSE),
('Carlos',   'Martínez Flores',  'mantenimiento@hotel.com', SHA2('Maint123!',256),  'Mantenimiento', FALSE),
('Sofía',    'Navarro Reyes',    'revenue@hotel.com',       SHA2('Rev123!',256),    'Revenue',       TRUE),
('Patricia', 'Guzmán Ortega',    'supervisor@hotel.com',    SHA2('Sup123!',256),    'Supervisor',    FALSE);

-- M03: Tipos de Habitación
INSERT INTO Tipos_Habitacion (Nombre, Descripcion, Capacidad_Max, Precio_Base) VALUES
('Estándar Sencilla', 'Habitación cómoda con cama individual, ideal para viajero de negocios', 1, 1200.00),
('Estándar Doble',    'Habitación con cama king-size, baño completo y escritorio de trabajo',  2, 1800.00),
('Junior Suite',      'Suite con sala de estar separada, minibar premium y vista al jardín',    3, 3200.00),
('Suite Presidencial','Suite de lujo con terraza panorámica, jacuzzi privado y sala comedor',   4, 6500.00);

-- M03: Amenidades
INSERT INTO Amenidades (Nombre, Icono, Categoria) VALUES
('Smart TV 55"',            'ti-device-tv',      'Entretenimiento'),
('Caja fuerte digital',     'ti-lock',           'Seguridad'),
('Aire acondicionado',      'ti-air-conditioning','Climatización'),
('Jacuzzi privado',         'ti-bath',           'Baño'),
('Minibar premium',         'ti-fridge',         'Entretenimiento'),
('Cafetera Nespresso',      'ti-coffee',         'Otro'),
('Balcón privado',          'ti-window',         'Otro'),
('Wi-Fi Gigabit',           'ti-wifi',           'Conectividad'),
('Bañera independiente',    'ti-bath',           'Baño'),
('Secadora de cabello',     'ti-hair-dryer',     'Baño'),
('Plancha y burro',         'ti-iron',           'Otro'),
('Cargador USB integrado',  'ti-usb',            'Conectividad');

-- M03: Habitaciones (20 habitaciones en 4 pisos)
INSERT INTO Habitaciones (Numero_Habitacion, ID_Tipo, Piso, Vista, Estado) VALUES
('101', 1, 1, 'Calle',    'Disponible'),
('102', 1, 1, 'Calle',    'Disponible'),
('103', 2, 1, 'Jardín',   'Ocupada'),
('104', 2, 1, 'Jardín',   'Disponible'),
('105', 1, 1, 'Interior', 'Mantenimiento'),
('201', 2, 2, 'Piscina',  'Ocupada'),
('202', 2, 2, 'Piscina',  'Disponible'),
('203', 3, 2, 'Jardín',   'Disponible'),
('204', 3, 2, 'Piscina',  'Ocupada'),
('205', 2, 2, 'Interior', 'Sucia'),
('301', 3, 3, 'Piscina',  'Disponible'),
('302', 3, 3, 'Jardín',   'Disponible'),
('303', 3, 3, 'Piscina',  'Ocupada'),
('304', 2, 3, 'Calle',    'Disponible'),
('305', 2, 3, 'Interior', 'En Limpieza'),
('401', 4, 4, 'Mar',      'Disponible'),
('402', 4, 4, 'Mar',      'Ocupada'),
('403', 3, 4, 'Piscina',  'Disponible'),
('404', 3, 4, 'Mar',      'Bloqueada'),
('405', 2, 4, 'Calle',    'Disponible');

-- M03: Amenidades por habitación
INSERT INTO Habitacion_Amenidades (ID_Habitacion, ID_Amenidad) VALUES
(1,3),(1,8),(1,10),(1,11),
(2,3),(2,8),(2,10),(2,11),
(3,1),(3,3),(3,5),(3,8),(3,10),(3,11),
(4,1),(4,3),(4,5),(4,8),(4,10),(4,11),
(5,3),(5,8),(5,10),
(6,1),(6,3),(6,5),(6,6),(6,8),(6,10),(6,11),
(7,1),(7,3),(7,5),(7,6),(7,8),(7,10),(7,11),
(8,1),(8,2),(8,3),(8,4),(8,5),(8,6),(8,7),(8,8),(8,10),(8,11),(8,12),
(9,1),(9,2),(9,3),(9,4),(9,5),(9,6),(9,7),(9,8),(9,10),(9,11),(9,12),
(16,1),(16,2),(16,3),(16,4),(16,5),(16,6),(16,7),(16,8),(16,9),(16,10),(16,11),(16,12),
(17,1),(17,2),(17,3),(17,4),(17,5),(17,6),(17,7),(17,8),(17,9),(17,10),(17,11),(17,12);

-- M09: Canales OTA
INSERT INTO Canales_OTA (Nombre, Codigo, Comision_Pct) VALUES
('Directo Web',  'DIRECT',  0.00),
('Booking.com',  'BOOKING', 15.00),
('Expedia',      'EXPEDIA', 18.00),
('Airbnb',       'AIRBNB',  3.00),
('Teléfono',     'PHONE',   0.00),
('Agencia Viajes','AGENCY', 12.00);

-- M10: Planes de Tarifa
INSERT INTO Planes_Tarifa (Codigo, Nombre, Politica_Cancelacion, Incluye_Desayuno) VALUES
('BAR',   'Best Available Rate',       'Flexible',         FALSE),
('NR',    'No Reembolsable (-15%)',     'No_Reembolsable',  FALSE),
('BB',    'Bed & Breakfast',            'Flexible',         TRUE),
('CORP',  'Tarifa Corporativa',         '48h',              FALSE),
('PROMO', 'Oferta Temporada',           '48h',              FALSE),
('PACK',  'Paquete Romántico (2N+Spa)', 'Flexible',         TRUE);

-- M05: Clientes
INSERT INTO Clientes (Nombre, Apellido, Email, Telefono, Documento_Tipo, Documento_Identidad, Nacionalidad, Fecha_Nacimiento, RFC, Nivel_Lealtad, Puntos_Lealtad) VALUES
('Juan Carlos',  'Pérez Mendoza',    'jcperez@gmail.com',       '+52 442 123 4567', 'INE',       'PEMJ850312HQTRNL08', 'Mexicana',       '1985-03-12', 'PEMJ850312AB1', 'Oro',     4200),
('María Elena',  'González Soto',    'maria.glez@outlook.com',  '+52 55 9876 5432', 'INE',       'GOSM900815MDFNTR02', 'Mexicana',       '1990-08-15', 'GOSM9008159K3', 'Platino', 12500),
('James',        'Thompson',         'j.thompson@email.com',    '+1 555 234 5678',  'Pasaporte', 'US-P987654321',      'Estadounidense', '1978-11-22', NULL,            'Plata',   1800),
('Ana Sofía',    'Ramírez Luna',     'ana.ramirez@yahoo.com',   '+52 33 4455 6677', 'INE',       'RALA950420MJCMNR05', 'Mexicana',       '1995-04-20', 'RALA950420HJ7', 'Bronce',  350),
('Pierre',       'Dubois',           'p.dubois@mail.fr',        '+33 6 12 34 56 78','Pasaporte', 'FR-C1234567',        'Francesa',       '1982-07-03', NULL,            'Bronce',  0),
('Roberto',      'Castillo Vega',    'r.castillo@hotmail.com',  '+52 81 2233 4455', 'INE',       'CAVR880101HNLSGL06', 'Mexicana',       '1988-01-01', 'CAVR880101QW2', 'Plata',   2100),
('Sarah',        'Williams',         'swilliams@company.com',   '+1 212 555 0199',  'Pasaporte', 'US-P123456789',      'Estadounidense', '1992-12-05', NULL,            'Oro',     5600),
('Claudia',      'Fernández Ríos',   'claudia.f@gmail.com',     '+52 222 334 5566', 'INE',       'FERC870630MPLRNL03', 'Mexicana',       '1987-06-30', 'FERC870630MN8', 'Bronce',  120),
('Hiroshi',      'Tanaka',           'h.tanaka@email.jp',       '+81 90 1234 5678', 'Pasaporte', 'JP-TK9876543',       'Japonesa',       '1975-09-18', NULL,            'Bronce',  0),
('Valentina',    'Moreno Aguilar',   'val.moreno@live.com',      '+52 664 778 8990', 'INE',       'MOAV000214MBCRGL09', 'Mexicana',       '2000-02-14', NULL,            'Bronce',  0),
('David',        'Müller',           'd.mueller@web.de',        '+49 170 123 4567', 'Pasaporte', 'DE-C9988776',        'Alemana',        '1980-04-25', NULL,            'Plata',   1500),
('Gabriela',     'Ortiz Salazar',    'gaby.ortiz@gmail.com',    '+52 999 112 2334', 'INE',       'OISG930711MYCRBL01', 'Mexicana',       '1993-07-11', 'OISG930711KL4', 'Oro',     3800),
('Carlos Alberto','Domínguez Herrera','carlosd@empresa.mx',     '+52 442 556 7788', 'INE',       'DOHC760523HQTMRR07', 'Mexicana',       '1976-05-23', 'DOHC760523P95', 'Platino', 15200),
('Emma',         'Johnson',          'emma.j@outlook.com',      '+44 7911 123456',  'Pasaporte', 'GB-P5544332',        'Británica',      '1988-10-31', NULL,            'Bronce',  200),
('Luis Fernando','Ávila Reyes',      'lfavila@proton.me',       '+52 477 889 9001', 'Licencia',  'LIC-GTO-2345678',   'Mexicana',       '1991-12-01', 'AIRL911201AB3', 'Bronce',  0);

-- M05: Consentimientos LFPDPPP
INSERT INTO Clientes_Consentimiento (ID_Cliente, Tipo, Otorgado, Canal, Fecha_Otorgado) VALUES
(1,'Datos_Personales',TRUE,'Presencial','2024-01-15 10:30:00'),
(1,'Marketing',TRUE,'Web','2024-01-15 10:31:00'),
(2,'Datos_Personales',TRUE,'Web','2023-06-20 14:00:00'),
(2,'Marketing',TRUE,'Web','2023-06-20 14:00:00'),
(2,'Comunicaciones',TRUE,'Email','2023-07-01 09:00:00'),
(3,'Datos_Personales',TRUE,'Presencial','2024-03-10 16:45:00'),
(4,'Datos_Personales',TRUE,'Web','2025-01-05 11:20:00'),
(5,'Datos_Personales',TRUE,'Presencial','2025-04-18 08:00:00'),
(6,'Datos_Personales',TRUE,'Presencial','2024-02-28 13:15:00'),
(6,'Marketing',FALSE,'Presencial',NULL),
(7,'Datos_Personales',TRUE,'Web','2024-05-12 19:30:00'),
(7,'Comunicaciones',TRUE,'Web','2024-05-12 19:30:00'),
(12,'Datos_Personales',TRUE,'Presencial','2023-11-03 10:00:00'),
(12,'Marketing',TRUE,'Email','2023-11-05 08:00:00'),
(13,'Datos_Personales',TRUE,'Presencial','2023-03-15 12:00:00'),
(13,'Marketing',TRUE,'Presencial','2023-03-15 12:00:00'),
(13,'Comunicaciones',TRUE,'Presencial','2023-03-15 12:00:00');

-- M05: Preferencias de huéspedes VIP
INSERT INTO Preferencias_Cliente (ID_Cliente, Piso_Preferido, Tipo_Almohada, Temperatura_AC, Dieta_Especial, Alergenos, Solicitudes_Fijas, Idioma_Preferido, Canal_Notif_Pref) VALUES
(2,  'Alto', 'Suave', 21, NULL, NULL, 'Flores frescas en la habitación, periódico La Jornada', 'es-MX', 'WhatsApp'),
(7,  'Alto', 'Firme', 22, 'Vegetariana', NULL, 'Extra pillows, sparkling water in room', 'en-US', 'Email'),
(13, 'Alto', 'Firme', 20, NULL, 'Mariscos', 'Habitación alejada del elevador, late checkout cuando esté disponible', 'es-MX', 'WhatsApp'),
(12, 'Medio','Suave', 22, NULL, 'Gluten', 'Café descafeinado en minibar', 'es-MX', 'Email'),
(3,  'Alto', 'Firme', 23, NULL, NULL, 'Room facing pool preferred', 'en-US', 'Email');

-- M04: Servicios (catálogo POS)
INSERT INTO Servicios (Nombre_Servicio, Descripcion, Precio, Categoria, Clave_SAT, Activo) VALUES
('Desayuno Buffet',          'Desayuno completo en restaurante — 7:00 a 11:00',                250.00, 'Restaurante',  '90101500', TRUE),
('Comida 3 Tiempos',         'Menú del día: entrada, plato fuerte, postre y bebida',            380.00, 'Restaurante',  '90101500', TRUE),
('Cena à la Carte',          'Cena en restaurante principal — reservación requerida',            520.00, 'Restaurante',  '90101500', TRUE),
('Room Service Desayuno',    'Charola de desayuno servida en habitación',                        320.00, 'Room Service', '90101500', TRUE),
('Room Service Nocturno',    'Menú limitado de 22:00 a 06:00',                                   280.00, 'Room Service', '90101500', TRUE),
('Botella Vino Tinto',       'Vino tinto reserva de casa, 750ml',                                650.00, 'Room Service', '50202300', TRUE),
('Masaje Relajante 60min',   'Masaje corporal con aceites esenciales de lavanda',                 950.00, 'Spa',          '90121700', TRUE),
('Facial Hidratante',        'Tratamiento facial con colágeno y ácido hialurónico',              780.00, 'Spa',          '90121700', TRUE),
('Circuito Hidrotermal',     'Acceso a sauna, vapor, jacuzzi y regadera sensaciones — 2hrs',     450.00, 'Spa',          '90121700', TRUE),
('Lavado y Planchado Traje', 'Servicio de tintorería para traje completo — entrega en 4hrs',     350.00, 'Lavanderia',   '91111700', TRUE),
('Planchado Express',        'Planchado de una prenda — entrega en 1hr',                         120.00, 'Lavanderia',   '91111700', TRUE),
('Agua Embotellada 600ml',   'Agua purificada marca premium',                                     45.00, 'Minibar',      '50202300', TRUE),
('Refresco Lata',            'Coca-Cola, Sprite o Fanta 355ml',                                   55.00, 'Minibar',      '50202300', TRUE),
('Cerveza Artesanal',        'Cerveza artesanal local 355ml',                                     95.00, 'Minibar',      '50202300', TRUE),
('Snack Premium',            'Mezcla de nueces, chocolate o papas gourmet',                       85.00, 'Minibar',      '50202300', TRUE),
('Licor Miniatura 50ml',     'Whisky, vodka o tequila — botella individual',                     130.00, 'Minibar',      '50202300', TRUE),
('Translado Aeropuerto',     'Servicio de transporte privado al aeropuerto',                     800.00, 'Otro',         '78111800', TRUE),
('Late Check-out',           'Extensión de salida hasta las 16:00 hrs (sujeto a disponibilidad)',500.00, 'Otro',         '90111600', TRUE);

-- M10: Tarifas Calendario (próximos 7 días ejemplo para tipo Estándar Doble + BAR)
INSERT INTO Tarifas_Calendario (ID_Tipo_Hab, ID_Plan, Fecha, Precio, Disponible, Estancia_Minima) VALUES
(2, 1, CURDATE(),              1800.00, TRUE, 1),
(2, 1, CURDATE() + INTERVAL 1 DAY, 1800.00, TRUE, 1),
(2, 1, CURDATE() + INTERVAL 2 DAY, 1800.00, TRUE, 1),
(2, 1, CURDATE() + INTERVAL 3 DAY, 2100.00, TRUE, 1),
(2, 1, CURDATE() + INTERVAL 4 DAY, 2100.00, TRUE, 2),
(2, 1, CURDATE() + INTERVAL 5 DAY, 2400.00, TRUE, 2),
(2, 1, CURDATE() + INTERVAL 6 DAY, 2100.00, TRUE, 1),
(3, 1, CURDATE(),              3200.00, TRUE, 1),
(3, 1, CURDATE() + INTERVAL 5 DAY, 3800.00, TRUE, 2);

-- M10: Reglas de Precio
INSERT INTO Reglas_Precio (Nombre, Tipo, ID_Tipo_Hab, Fecha_Inicio, Fecha_Fin, Dias_Semana, Ajuste_Tipo, Ajuste_Valor, Prioridad, Activa) VALUES
('Fin de Semana',          'Fin_Semana',     NULL, '2025-01-01','2025-12-31', 'Vie,Sab',     'Porcentaje', 15.00,  1, TRUE),
('Temporada Alta Verano',  'Temporada_Alta', NULL, '2025-06-15','2025-08-31', NULL,          'Porcentaje', 25.00,  2, TRUE),
('Early Bird 30 días',     'Early_Bird',     NULL, '2025-01-01','2025-12-31', NULL,          'Porcentaje',-10.00,  1, TRUE),
('Semana Santa',           'Evento',         NULL, '2025-04-13','2025-04-20', NULL,          'Porcentaje', 35.00,  3, TRUE),
('Temporada Baja Enero',   'Temporada_Baja', NULL, '2026-01-05','2026-02-15', NULL,          'Porcentaje',-20.00,  2, TRUE);
