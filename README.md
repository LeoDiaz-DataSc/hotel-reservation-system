# Hotel Reservation System

[![Java](https://img.shields.io/badge/Java-11-orange?logo=openjdk)](https://openjdk.org/)
[![Maven](https://img.shields.io/badge/Maven-3.x-C71A36?logo=apachemaven)](https://maven.apache.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql&logoColor=white)](https://www.mysql.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)

## Overview

A hotel reservation management system built with Java Swing featuring a clean layered architecture based on the Data Access Object (DAO) pattern. The application manages clients, rooms, and reservations with MySQL persistence, calendar-based date selection, and a tabbed panel interface.

## System Architecture

```
Presentation Layer    UI panels: MainFrame, ClientesPanel, HabitacionesPanel, ReservasPanel
Data Access Layer     DAO classes: ClienteDAO, HabitacionDAO, ReservaDAO
Domain Layer          Models: Cliente, Habitacion, Reserva
Infrastructure        ConexionDB: MySQL connection management
```

### Design Patterns

| Pattern | Implementation | Purpose |
|---------|---------------|---------|
| **DAO** | `ClienteDAO`, `HabitacionDAO`, `ReservaDAO` | Database operation abstraction per entity |
| **Layered Architecture** | `model/` -> `dao/` -> `db/` -> `ui/` | Clear separation of concerns |
| **Singleton** | `ConexionDB` | Single database connection instance |

## Functional Modules

| Module | Description |
|--------|-------------|
| **Client Management** | Full CRUD for hotel clients |
| **Room Management** | Room inventory with types and availability |
| **Reservation Booking** | Booking with JCalendar date selection, modification, cancellation |

## Technology Stack

| Component | Technology |
|-----------|-----------|
| Language | Java 11 |
| Build | Maven 3.x |
| GUI | Swing |
| Date Selection | JCalendar 1.4 |
| Database | MySQL 8.0 |
| JDBC | mysql-connector-j 8.0.33 |

## Project Structure

```
hotel-reservation-system/
    pom.xml
    src/main/java/com/reservas/
        dao/
            ClienteDAO.java
            HabitacionDAO.java
            ReservaDAO.java
        db/
            ConexionDB.java
        model/
            Cliente.java
            Habitacion.java
            Reserva.java
        ui/
            MainFrame.java
            ClientesPanel.java
            HabitacionesPanel.java
            ReservasPanel.java
```

## Installation

### Prerequisites
- JDK 11+, Maven 3.x, MySQL 8.0

```bash
mvn clean compile exec:java -Dexec.mainClass="com.reservas.ui.MainFrame"
```

## Roadmap

- [ ] Database schema SQL file
- [ ] Service layer between DAO and UI
- [ ] Web frontend (React) with Node.js REST API
- [ ] Docker containerization
- [ ] Unit tests (JUnit 5)

## License

MIT License. See [LICENSE](./LICENSE).

**Developed by [Diego Leobardo Diaz Hernandez](https://github.com/LeoDiaz-DataSc)**

---

# Version en Espanol

## Descripcion General

Sistema de gestion de reservas hoteleras construido con Java Swing con una arquitectura limpia por capas basada en el patron Data Access Object (DAO). La aplicacion gestiona clientes, habitaciones y reservas con persistencia MySQL, seleccion de fechas mediante calendario y una interfaz con paneles tabulados.

## Arquitectura del Sistema

```
Capa de Presentacion     Paneles UI: MainFrame, ClientesPanel, HabitacionesPanel, ReservasPanel
Capa de Acceso a Datos   Clases DAO: ClienteDAO, HabitacionDAO, ReservaDAO
Capa de Dominio          Modelos: Cliente, Habitacion, Reserva
Infraestructura          ConexionDB: Gestion de conexion MySQL
```

### Patrones de Diseno

| Patron | Implementacion | Proposito |
|--------|---------------|-----------|
| **DAO** | `ClienteDAO`, `HabitacionDAO`, `ReservaDAO` | Abstraccion de operaciones de BD por entidad |
| **Arquitectura por Capas** | `model/` -> `dao/` -> `db/` -> `ui/` | Separacion clara de responsabilidades |
| **Singleton** | `ConexionDB` | Instancia unica de conexion |

## Modulos Funcionales

| Modulo | Descripcion |
|--------|-------------|
| **Gestion de Clientes** | CRUD completo para clientes del hotel |
| **Gestion de Habitaciones** | Inventario de habitaciones con tipos y disponibilidad |
| **Reservaciones** | Reservas con seleccion de fechas JCalendar, modificacion y cancelacion |

## Instalacion

### Requisitos Previos
- JDK 11+, Maven 3.x, MySQL 8.0

```bash
mvn clean compile exec:java -Dexec.mainClass="com.reservas.ui.MainFrame"
```

## Hoja de Ruta

- [ ] Archivo SQL de esquema de base de datos
- [ ] Capa de servicio entre DAO y UI
- [ ] Frontend web (React) con API REST Node.js
- [ ] Contenedorizacion con Docker
- [ ] Pruebas unitarias (JUnit 5)

**Desarrollado por [Diego Leobardo Diaz Hernandez](https://github.com/LeoDiaz-DataSc)**
