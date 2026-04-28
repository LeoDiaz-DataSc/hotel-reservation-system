# 🏨 Hotel Reservation System — Sistema de Reservas de Hotel

[![Java](https://img.shields.io/badge/Java-11-orange?logo=openjdk)](https://openjdk.org/)
[![Maven](https://img.shields.io/badge/Maven-3.x-C71A36?logo=apachemaven)](https://maven.apache.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql&logoColor=white)](https://www.mysql.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)

A **Hotel Reservation Management System** built with Java Swing featuring a clean DAO architecture for managing clients, rooms, and reservations with MySQL persistence.

---

## 📸 Screenshots

> _Screenshots coming soon — the application provides tabbed panels for client management, room inventory, and reservation booking with calendar date selection._

---

## 🎯 Features

| Feature | Description |
|---------|-------------|
| 👤 **Client Management** | Full CRUD for hotel clients |
| 🛏️ **Room Management** | Room inventory with types and availability tracking |
| 📅 **Reservation Booking** | Book, modify, and cancel reservations with JCalendar date picker |
| 🔗 **Relational Model** | Clients ↔ Rooms ↔ Reservations with referential integrity |

---

## 🏗️ Architecture

This project implements a **clean layered architecture** with well-defined separation of concerns:

```
┌──────────────────────┐
│     UI Layer          │  ← Swing Panels (MainFrame, ClientesPanel, etc.)
│  (Presentation)       │
├──────────────────────┤
│     DAO Layer         │  ← Data Access Objects (ClienteDAO, HabitacionDAO, etc.)
│  (Data Access)        │
├──────────────────────┤
│    Model Layer        │  ← POJOs (Cliente, Habitacion, Reserva)
│  (Domain)             │
├──────────────────────┤
│     DB Layer          │  ← ConexionDB (MySQL Connector)
│  (Infrastructure)     │
└──────────────────────┘
```

### Design Patterns
- **DAO (Data Access Object)** — Abstracts database operations per entity
- **Layered Architecture** — Clear separation: `model` → `dao` → `db` → `ui`
- **Singleton** — Single database connection instance

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Language** | Java 11 |
| **Build** | Maven |
| **GUI** | Swing |
| **Date Picker** | JCalendar 1.4 |
| **Database** | MySQL 8.0 |
| **Connector** | mysql-connector-j 8.0.33 |

---

## 📁 Project Structure

```
hotel-reservation-system/
├── pom.xml
└── src/main/java/com/reservas/
    ├── dao/                        # Data Access Objects
    │   ├── ClienteDAO.java         # Client database operations
    │   ├── HabitacionDAO.java      # Room database operations
    │   └── ReservaDAO.java         # Reservation database operations
    ├── db/                         # Database Infrastructure
    │   └── ConexionDB.java         # MySQL connection manager
    ├── model/                      # Domain Models
    │   ├── Cliente.java            # Client entity
    │   ├── Habitacion.java         # Room entity
    │   └── Reserva.java            # Reservation entity
    └── ui/                         # User Interface
        ├── MainFrame.java          # Main application window (JTabbedPane)
        ├── ClientesPanel.java      # Client management panel
        ├── HabitacionesPanel.java  # Room management panel
        └── ReservasPanel.java      # Reservation booking panel
```

---

## 🚀 Getting Started

### Prerequisites
- Java 11+ (JDK)
- Maven 3.x
- MySQL 8.0

### 1. Set up the Database
```sql
CREATE DATABASE reservas_hotel;
USE reservas_hotel;

-- Create tables (schema coming soon)
```

### 2. Configure Database Connection
Update `ConexionDB.java` with your MySQL credentials.

### 3. Build & Run
```bash
mvn clean compile exec:java -Dexec.mainClass="com.reservas.ui.MainFrame"
```

---

## 🔮 Roadmap

- [ ] Create database schema SQL file
- [ ] Web version with React frontend + Node.js API
- [ ] Docker containerization
- [ ] Add Service layer between DAO and UI
- [ ] Unit tests (JUnit)
- [ ] REST API documentation

---

## 📄 License

This project is licensed under the MIT License — see [LICENSE](./LICENSE) for details.

---

**Developed by [Leonardo Diaz](https://github.com/LeoDiaz-DataSc)**
