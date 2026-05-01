-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS reservas;
USE reservas;

-- Crear tabla Clientes
CREATE TABLE IF NOT EXISTS Clientes (
    ID_Cliente INT PRIMARY KEY,
    Nombre VARCHAR(50) NOT NULL,
    Apellido VARCHAR(50) NOT NULL,
    Email VARCHAR(100) NOT NULL,
    Telefono VARCHAR(20) NOT NULL
);

-- Crear tabla Habitaciones
CREATE TABLE IF NOT EXISTS Habitaciones (
    ID_Habitacion INT PRIMARY KEY,
    Tipo VARCHAR(50) NOT NULL,
    Precio_noche DECIMAL(10,2) NOT NULL,
    Estado VARCHAR(20) NOT NULL,
    Piso INT NOT NULL
);

-- Crear tabla Reservas
CREATE TABLE IF NOT EXISTS Reservas (
    ID_Reserva INT PRIMARY KEY,
    ID_Cliente INT NOT NULL,
    ID_Habitacion INT NOT NULL,
    Fecha_Entrada DATE NOT NULL,
    Fecha_Salida DATE NOT NULL,
    FOREIGN KEY (ID_Cliente) REFERENCES Clientes(ID_Cliente),
    FOREIGN KEY (ID_Habitacion) REFERENCES Habitaciones(ID_Habitacion)
); 