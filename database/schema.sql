-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS reservas;
USE reservas;

-- 1. Tabla Empleados (Auth y Auditoría)
CREATE TABLE IF NOT EXISTS Empleados (
    ID_Empleado INT PRIMARY KEY AUTO_INCREMENT,
    Nombre VARCHAR(50) NOT NULL,
    Apellido VARCHAR(50) NOT NULL,
    Email VARCHAR(100) UNIQUE NOT NULL,
    Contrasena VARCHAR(255) NOT NULL,
    Rol ENUM('Admin', 'Recepcion', 'Limpieza', 'Mantenimiento') DEFAULT 'Recepcion',
    Activo BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB;

-- 2. Tabla Clientes
CREATE TABLE IF NOT EXISTS Clientes (
    ID_Cliente INT PRIMARY KEY AUTO_INCREMENT,
    Nombre VARCHAR(50) NOT NULL,
    Apellido VARCHAR(50) NOT NULL,
    Email VARCHAR(100) NOT NULL,
    Telefono VARCHAR(20) NOT NULL,
    Documento_Identidad VARCHAR(50) UNIQUE,
    Nacionalidad VARCHAR(50)
) ENGINE=InnoDB;

-- 3. Tabla Habitaciones
CREATE TABLE IF NOT EXISTS Habitaciones (
    ID_Habitacion INT PRIMARY KEY AUTO_INCREMENT,
    Numero_Habitacion VARCHAR(10) UNIQUE NOT NULL,
    Tipo ENUM('Sencilla', 'Doble', 'Suite', 'Presidencial') NOT NULL,
    Capacidad INT NOT NULL DEFAULT 2,
    Precio_noche DECIMAL(10,2) NOT NULL,
    Estado ENUM('Disponible', 'Ocupada', 'Sucia', 'En Limpieza', 'Mantenimiento') DEFAULT 'Disponible',
    Piso INT NOT NULL
) ENGINE=InnoDB;

-- 4. Tabla Reservas (Transaccional)
CREATE TABLE IF NOT EXISTS Reservas (
    ID_Reserva INT PRIMARY KEY AUTO_INCREMENT,
    ID_Cliente INT NOT NULL,
    ID_Habitacion INT NOT NULL,
    ID_Empleado_Registro INT,
    Fecha_Entrada DATE NOT NULL,
    Fecha_Salida DATE NOT NULL,
    Estado ENUM('Pendiente', 'Confirmada', 'Check-in', 'Check-out', 'Cancelada') DEFAULT 'Pendiente',
    Total_Estimado DECIMAL(10,2) NOT NULL,
    Observaciones TEXT,
    Creado_En DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ID_Cliente) REFERENCES Clientes(ID_Cliente),
    FOREIGN KEY (ID_Habitacion) REFERENCES Habitaciones(ID_Habitacion),
    FOREIGN KEY (ID_Empleado_Registro) REFERENCES Empleados(ID_Empleado)
) ENGINE=InnoDB;

-- 5. Tabla Servicios (Catálogo POS)
CREATE TABLE IF NOT EXISTS Servicios (
    ID_Servicio INT PRIMARY KEY AUTO_INCREMENT,
    Nombre_Servicio VARCHAR(100) NOT NULL,
    Descripcion TEXT,
    Precio DECIMAL(10,2) NOT NULL,
    Categoria ENUM('Restaurante', 'Room Service', 'Spa', 'Lavanderia', 'Minibar', 'Otro') NOT NULL
) ENGINE=InnoDB;

-- 6. Tabla Cargos_Reserva (Consumos durante estadía)
CREATE TABLE IF NOT EXISTS Cargos_Reserva (
    ID_Cargo INT PRIMARY KEY AUTO_INCREMENT,
    ID_Reserva INT NOT NULL,
    ID_Servicio INT NOT NULL,
    ID_Empleado INT,
    Cantidad INT DEFAULT 1,
    Subtotal DECIMAL(10,2) NOT NULL,
    Fecha_Cargo DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ID_Reserva) REFERENCES Reservas(ID_Reserva),
    FOREIGN KEY (ID_Servicio) REFERENCES Servicios(ID_Servicio),
    FOREIGN KEY (ID_Empleado) REFERENCES Empleados(ID_Empleado)
) ENGINE=InnoDB;

-- 7. Tabla Pagos (Facturación)
CREATE TABLE IF NOT EXISTS Pagos (
    ID_Pago INT PRIMARY KEY AUTO_INCREMENT,
    ID_Reserva INT NOT NULL,
    ID_Empleado INT,
    Monto DECIMAL(10,2) NOT NULL,
    Metodo_Pago ENUM('Efectivo', 'Tarjeta de Credito', 'Tarjeta de Debito', 'Transferencia') NOT NULL,
    Tipo_Pago ENUM('Deposito', 'Liquidacion', 'Penalizacion') DEFAULT 'Liquidacion',
    Fecha_Pago DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ID_Reserva) REFERENCES Reservas(ID_Reserva),
    FOREIGN KEY (ID_Empleado) REFERENCES Empleados(ID_Empleado)
) ENGINE=InnoDB;

-- INSERTS INICIALES
INSERT INTO Empleados (Nombre, Apellido, Email, Contrasena, Rol) VALUES 
('Admin', 'Hotel', 'admin@hotel.com', SHA2('Admin123', 256), 'Admin'),
('Recep', 'FrontDesk', 'recepcion@hotel.com', SHA2('Recep123', 256), 'Recepcion'),
('Clean', 'Housekeeping', 'limpieza@hotel.com', SHA2('Clean123', 256), 'Limpieza');

INSERT INTO Servicios (Nombre_Servicio, Descripcion, Precio, Categoria) VALUES 
('Desayuno Buffet', 'Desayuno completo en restaurante', 25.00, 'Restaurante'),
('Botella de Vino', 'Vino Tinto Reserva', 45.00, 'Room Service'),
('Masaje Relajante', 'Masaje de 60 mins', 80.00, 'Spa'),
('Lavado de Traje', 'Servicio tintorería', 15.00, 'Lavanderia');