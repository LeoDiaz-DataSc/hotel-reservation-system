# 🏨 Hotel Enterprise System v2.0

> **Sistema de Gestión Hotelera Enterprise** — Arquitectura de 12 módulos con cumplimiento ISO 27001 · PCI-DSS · LFPDPPP · CFDI 4.0

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18+-61DAFB?style=flat-square&logo=react)](https://reactjs.org)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=flat-square&logo=mysql)](https://mysql.com)
[![License](https://img.shields.io/badge/License-MIT-6366f1?style=flat-square)](LICENSE)
[![ISO 27001](https://img.shields.io/badge/ISO-27001-10b981?style=flat-square)](SECURITY.md)
[![PCI-DSS](https://img.shields.io/badge/PCI--DSS-Compliant-ef4444?style=flat-square)](SECURITY.md)

---

## 📋 Tabla de Contenidos

1. [Descripción](#-descripción)
2. [Arquitectura de 12 Módulos](#-arquitectura-de-12-módulos)
3. [Stack Tecnológico](#-stack-tecnológico)
4. [Instalación Rápida](#-instalación-rápida)
5. [Variables de Entorno](#-variables-de-entorno)
6. [Estructura del Proyecto](#-estructura-del-proyecto)
7. [API Reference](#-api-reference)
8. [Seguridad y Cumplimiento](#-seguridad-y-cumplimiento)
9. [Base de Datos](#-base-de-datos)
10. [Capturas de Pantalla](#-capturas-de-pantalla)

---

## 📖 Descripción

Hotel Enterprise System es una plataforma de gestión hotelera de nivel empresarial diseñada para propiedades de mediana a gran escala. El sistema cubre el ciclo operativo completo: desde la reserva y check-in hasta la facturación CFDI 4.0, gestión de revenue dinámico y mantenimiento preventivo.

### Características Principales

| Característica | Detalle |
|---|---|
| **Seguridad** | JWT HS256 + bcrypt (cost 12) + lockout 5 intentos + sesiones auditadas |
| **Cumplimiento** | ISO 27001 (A.12.4), PCI-DSS Nivel 4, LFPDPPP ARCO, CFDI 4.0 |
| **Revenue** | ADR, RevPAR, reglas de precio dinámico por temporada/evento |
| **Channel Manager** | OTA sync: Booking.com, Expedia, Airbnb, Agencias |
| **Housekeeping** | Kanban de tareas + checklists + ciclo verificación |
| **Facturación** | CFDI 4.0 con UUID SAT, conceptos, cancelaciones y sustitución |

---

## 🏗 Arquitectura de 12 Módulos

```
M01 — Autenticación        JWT + bcrypt + 2FA scaffold + sesiones
M02 — Reservas             Folios HTL-YYYY-NNNNN, check-in/out, historial
M03 — Habitaciones         Estados en tiempo real, amenidades, tipos
M04 — Servicios / POS      Cargos a folio, minibar, room service
M05 — Clientes (CRM)       Lealtad, consentimientos LFPDPPP, preferencias
M06 — Facturación          Pagos PCI-DSS, CFDI 4.0, conceptos SAT
M07 — Housekeeping         Kanban tareas, checklists, verificación
M08 — Reportes / Auditoría ISO 27001 Audit_Logs, KPIs, métricas diarias
M09 — Channel Manager      OTAs, disponibilidad, stop-sell, sync
M10 — Revenue Management   Tarifas calendario, reglas dinámicas, RevPAR/ADR
M11 — Comunicaciones       Plantillas Email/SMS/WhatsApp, log de envíos
M12 — Mantenimiento        Activos, órdenes de trabajo, mantenimiento preventivo
```

---

## 🛠 Stack Tecnológico

### Backend
| Tecnología | Versión | Uso |
|---|---|---|
| Node.js | 18+ | Runtime |
| Express | 5.x | API REST |
| MySQL2 | 3.x | Driver BD (promise pool) |
| bcryptjs | 3.x | Hash contraseñas (cost 12) |
| jsonwebtoken | 9.x | JWT HS256 |
| uuid | 11.x | UUIDs para sesiones |
| dotenv | 17.x | Variables de entorno |

### Frontend
| Tecnología | Versión | Uso |
|---|---|---|
| React | 18+ | UI Framework |
| Vite | 6+ | Build tool |
| React Router | 7.x | SPA routing |
| Axios | 1.x | HTTP client con interceptors |
| GSAP + @gsap/react | 3.x | Animaciones premium |
| Recharts | 2.x | Gráficas de KPIs |

### Base de Datos
| Objeto | Cantidad |
|---|---|
| Tablas | 40+ |
| Triggers | 6 |
| Vistas | 5 |
| Índices | 35+ |

---

## 🚀 Instalación Rápida

### Prerrequisitos
- Node.js 18+
- MySQL 8.0+ o Docker
- npm 9+

### 1. Clonar el repositorio
```bash
git clone https://github.com/LeoDiaz-DataSc/hotel-enterprise.git
cd hotel-enterprise/Proyecto_Reservas
```

### 2. Configurar variables de entorno
```bash
cp backend/.env.example backend/.env
# Editar backend/.env con tus credenciales
```

### 3. Opción A — Docker (recomendado)
```bash
docker-compose up -d
# Esto levanta MySQL, Backend y Frontend automáticamente
# Los 4 SQL files se ejecutan en orden:
#   01_schema.sql → 02_schema_part2.sql → 03_seed.sql → 04_seed_part2.sql
```

### 4. Opción B — Manual
```bash
# Base de datos
mysql -u root -p < database/schema.sql
mysql -u root -p hotel_enterprise < database/schema_part2.sql
mysql -u root -p hotel_enterprise < database/seed.sql
mysql -u root -p hotel_enterprise < database/seed_part2.sql

# Backend
cd backend
npm install
npm run dev   # Puerto 3000

# Frontend
cd ../frontend
npm install
npm run dev   # Puerto 5173
```

### 5. Acceso
| Servicio | URL | Puerto |
|---|---|---|
| Frontend | http://localhost:5173 | 5173 |
| Backend API | http://localhost:3000/api | 3000 |
| Health check | http://localhost:3000/api/health | — |
| MySQL (Docker) | localhost:3308 | 3308 |

### Credenciales Demo
| Email | Contraseña | Rol |
|---|---|---|
| admin@hotel.com | Admin123! | Admin |
| recepcion@hotel.com | Recep123! | Recepcion |
| limpieza@hotel.com | Limp123! | Limpieza |
| revenue@hotel.com | Rev123! | Revenue |

---

## 🔐 Variables de Entorno

```env
# backend/.env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_password_seguro
DB_NAME=hotel_enterprise

PORT=3000
NODE_ENV=production

JWT_SECRET=cadena_aleatoria_minimo_32_chars
BCRYPT_ROUNDS=12
```

> ⚠️ **NUNCA** versionar el archivo `.env`. El repositorio incluye `.env.example` como referencia.

---

## 📁 Estructura del Proyecto

```
Proyecto_Reservas/
├── backend/
│   ├── config/
│   │   └── database.js          # MySQL connection pool
│   ├── middleware/
│   │   ├── auth.js              # JWT verifyToken + checkRole RBAC
│   │   └── audit.js             # ISO 27001 audit middleware
│   ├── routes/
│   │   ├── auth.js              # M01 — Login/logout/me
│   │   ├── reservas.js          # M02 — CRUD + check-in/out
│   │   ├── habitaciones.js      # M03 — Estado + ocupación
│   │   ├── servicios.js         # M04 — POS + cargos
│   │   ├── clientes.js          # M05 — CRM + lealtad
│   │   ├── facturacion.js       # M06 — Pagos + CFDI
│   │   ├── housekeeping.js      # M07 — Tareas lifecycle
│   │   ├── reportes.js          # M08 — KPIs + audit
│   │   ├── channels.js          # M09 — OTAs + sync
│   │   ├── revenue.js           # M10 — Tarifas + reglas
│   │   ├── comunicaciones.js    # M11 — Plantillas + envío
│   │   └── mantenimiento.js     # M12 — Activos + órdenes
│   ├── server.js                # Express app — 12 módulos
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── Login/Login.jsx
│       │   ├── Sidebar/Sidebar.jsx
│       │   ├── Layout/Layout.jsx
│       │   └── Dashboard/Dashboard.jsx
│       ├── pages/
│       │   ├── ReservasPage.jsx
│       │   ├── HabitacionesPage.jsx
│       │   ├── HousekeepingPage.jsx
│       │   ├── ClientesPage.jsx
│       │   ├── ServiciosPage.jsx
│       │   ├── FacturacionPage.jsx
│       │   ├── RevenuePage.jsx
│       │   ├── ChannelsPage.jsx
│       │   ├── ComunicacionesPage.jsx
│       │   ├── MantenimientoPage.jsx
│       │   └── ReportesPage.jsx
│       ├── services/
│       │   └── api.js           # Axios + JWT interceptor
│       ├── App.jsx              # Router + lazy loading
│       └── index.css            # Design system completo
│
├── database/
│   ├── schema.sql               # Tablas M01-M06
│   ├── schema_part2.sql         # Tablas M07-M12 + triggers + vistas
│   ├── seed.sql                 # Datos de referencia
│   └── seed_part2.sql           # Datos transaccionales
│
└── docker-compose.yml
```

---

## 📡 API Reference

### Autenticación
```
POST /api/auth/login     { email, contrasena } → { token, user }
POST /api/auth/logout    [JWT] → { success }
GET  /api/auth/me        [JWT] → { data: empleado }
```

### Reservas (requiere JWT)
```
GET  /api/reservas                     ?estado=&desde=&hasta=
GET  /api/reservas/:id                 → folio + cargos + pagos + historial
POST /api/reservas                     Crear reserva (auto-genera folio)
POST /api/reservas/:id/checkin         Ejecutar check-in
POST /api/reservas/:id/checkout        Ejecutar check-out (calcula Total_Real)
POST /api/reservas/:id/cancel          Cancelar con motivo
```

### Habitaciones
```
GET /api/habitaciones                  ?estado=&piso=
GET /api/habitaciones/tipos
GET /api/habitaciones/ocupacion/hoy    → ADR, RevPAR, Ocupacion_Pct
PUT /api/habitaciones/:id/estado       { estado, motivo }
```

### Revenue
```
GET /api/revenue/precio                ?fecha=&tipo=&plan= → precio dinámico
GET /api/revenue/reglas                Reglas activas
POST /api/revenue/regla                [Admin/Revenue] Crear regla
```

> Ver documentación completa en `/api/health` para lista de todos los endpoints.

---

## 🛡 Seguridad y Cumplimiento

Ver [SECURITY.md](SECURITY.md) para detalles completos.

| Estándar | Implementación |
|---|---|
| **ISO 27001** | Audit_Logs con módulo, acción, IP, User-Agent, resultado |
| **PCI-DSS** | Sin almacenamiento de PAN/CVV; solo últimos 4 dígitos + token |
| **LFPDPPP** | Consentimientos ARCO, log de accesos a datos personales |
| **CFDI 4.0** | UUID SAT, RFC emisor/receptor, complementos de pago |
| **bcrypt** | Cost factor 12 con migración automática desde SHA2 legacy |
| **JWT** | HS256, 8h expiry, sesión registrada con hash del token |
| **Account Lockout** | 5 intentos fallidos → bloqueo 15 minutos |

---

## 🗄 Base de Datos

### Vistas principales
| Vista | Descripción |
|---|---|
| `V_Habitaciones_Estado` | Estado operativo con huésped activo |
| `V_Folio_Reserva` | Folio completo con saldo pendiente |
| `V_Ocupacion_Hoy` | KPIs en tiempo real (ADR, RevPAR, Ocupación%) |
| `V_Housekeeping_Pendientes` | Tareas ordenadas por prioridad + arrival flag |
| `V_Mantenimiento_Alerta` | Activos con mantenimiento vencido o próximo |

### Triggers
| Trigger | Evento |
|---|---|
| `trg_reserva_estado_after_update` | Registra historial de estados |
| `trg_habitacion_estado_after_update` | Registra historial de habitación |
| `trg_reserva_checkout_total` | Calcula Total_Real al hacer check-out |
| `trg_reserva_checkin_habitacion` | Marca habitación como Ocupada |
| `trg_reserva_checkout_habitacion` | Marca habitación como Sucia |
| `trg_reserva_cancelar_habitacion` | Libera habitación en cancelación |

---

## 👨‍💻 Autor

**Diego Leobardo Diaz Hernandez** — Senior Data Scientist & Full-Stack Developer  
GitHub: [@LeoDiaz-DataSc](https://github.com/LeoDiaz-DataSc)

---

*Hotel Enterprise System v2.0 — Desarrollado con estándares enterprise mexicanos e internacionales.*
