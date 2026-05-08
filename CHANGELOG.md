# Changelog — Hotel Enterprise System

Todos los cambios notables en este proyecto serán documentados en este archivo.

Formato basado en [Keep a Changelog](https://keepachangelog.com/es/1.0.0/),
siguiendo [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.0.0] — 2026-05-08

### 🚀 Lanzamiento — Arquitectura Enterprise de 12 Módulos

Esta versión representa una reescritura completa del sistema, migrando de un prototipo
básico a una plataforma enterprise con cumplimiento regulatorio completo.

---

### ⚠️ Breaking Changes

- **Base de datos renombrada:** `hotel_reservas` → `hotel_enterprise`
- **Schema completamente reemplazado:** 40+ tablas nuevas (incompatible con v1.x)
- **Endpoint auth cambiado:** `POST /login` → `POST /api/auth/login`
- **Hash de contraseñas:** SHA2 reemplazado por bcrypt (migración automática progresiva)
- **Campo `password`** renombrado a `Contrasena_Hash` en tabla `Empleados`
- **Puerto backend cambiado:** 3001 → 3000 (configurable vía `PORT`)

---

### ✨ Added (Nuevas Funcionalidades)

#### M01 — Autenticación Enterprise
- JWT HS256 con expiración 8h y registro de sesión en `Sesiones_Auth`
- bcrypt cost-12 para hash de contraseñas
- Migración automática SHA2 → bcrypt en tiempo de login
- Account lockout tras 5 intentos fallidos (15 min de bloqueo)
- Middleware `verifyToken` + `checkRole(...roles)` para RBAC granular
- Tabla `Dispositivos_Confiables` (scaffold para 2FA futuro)

#### M02 — Reservas con Folios
- Generación automática de folios `HTL-YYYY-NNNNN`
- Flujo completo: Pendiente → Confirmada → Check-in → Check-out
- Triggers automáticos para cambio de estado de habitación
- Trigger de cálculo de `Total_Real` en check-out
- Historial de estados en `Historial_Estado_Reserva`
- Soporte para canal OTA y plan de tarifa asociado

#### M03 — Habitaciones Operativas
- Vista `V_Habitaciones_Estado` con huésped activo en tiempo real
- 6 estados operativos: Disponible, Ocupada, Sucia, En Limpieza, Mantenimiento, Bloqueada
- Grid visual por piso con código de color
- Historial de cambios de estado auditado

#### M04 — Punto de Venta (POS)
- Catálogo de 18 servicios en 6 categorías
- Cargos directos al folio de la reserva
- Soporte para descuentos y cortesías con aprobador
- Gestión de inventario minibar por habitación
- Estados de cargo: Pendiente, Cobrado, Cortesía, Cancelado

#### M05 — CRM de Clientes
- Perfiles completos con preferencias y alergenos
- Programa de lealtad: Bronce, Plata, Oro, Platino
- Movimientos de puntos (acumulación, canje, vencimiento)
- Consentimientos LFPDPPP con tipo, canal, versión de aviso
- Log de accesos a datos personales (`Accesos_Datos_Personales`)

#### M06 — Facturación PCI-DSS / CFDI 4.0
- Registro de pagos sin PAN ni CVV (solo últimos 4 dígitos + token)
- Métodos: Efectivo, Tarjeta Crédito/Débito, Transferencia, Puntos Lealtad
- Generación de CFDI 4.0 con RFC emisor/receptor, régimen fiscal, CP
- Conceptos con clave SAT, clave unidad, IVA 16%
- Folios automáticos por serie

#### M07 — Housekeeping
- Kanban board: Pendiente → En Proceso → Completada → Verificada
- Tipos: Rutina, Salida, Profunda, Inspección
- Prioridades: Normal, Alta, Urgente
- Flag de "Arrival hoy" para habitaciones con entrada programada
- Checklists con plantillas por tipo de limpieza y tipo de habitación
- Liberación automática de habitación al verificar

#### M08 — Reportes y Auditoría ISO 27001
- `Audit_Logs` con módulo, acción, tabla, JSON diff, IP, resultado
- Masking automático de contraseñas en logs
- Vista `V_Ocupacion_Hoy` con ADR y RevPAR en tiempo real
- Tabla `Metricas_Diarias` con snapshot histórico
- Endpoint `POST /api/reportes/generar-metricas` para snapshot del día

#### M09 — Channel Manager
- Tabla `Disponibilidad_Canal` con cupo por tipo de habitación/fecha/canal
- 6 canales OTA: Direct, Booking.com, Expedia, Airbnb, Teléfono, Agencias
- Comisiones por canal configurables
- Stop-sell por canal/fecha
- Sincronización simulada (scaffold para integración real con CM API)

#### M10 — Revenue Management
- `Planes_Tarifa` con política de cancelación (Flexible/48h/No reembolsable)
- `Tarifas_Calendario` con precio por tipo/plan/fecha y estancia mínima
- `Reglas_Precio` dinámico: Temporada Alta/Baja, Fin de Semana, Early Bird, Last Minute, Evento
- Calculadora de precio con aplicación de reglas en cascada por prioridad
- Gráfica de barras de precios calendario (últimos 14 días)

#### M11 — Comunicaciones Multicanal
- Plantillas para Email, SMS y WhatsApp
- 7 eventos: Confirmación, Pre CheckIn, Bienvenida, Pre CheckOut, Post Estadía, Encuesta, Promoción
- Soporte multiidioma (es-MX, en-US)
- Log de envíos con estado y referencia externa del proveedor
- Envío simulado (scaffold para integración Twilio/SendGrid/WhatsApp API)

#### M12 — Mantenimiento Preventivo
- Registro de activos del hotel con garantía y proveedor
- Órdenes de trabajo con folio `MNT-YYYY-NNNNN`
- Ciclo: Abierta → En Proceso → Espera Refacción → Completada
- Bloqueo automático de habitación al crear orden con habitación
- Liberación automática al completar orden
- `Mantenimiento_Programado` con frecuencias (Diario/Semanal/Mensual/Trimestral/Anual)
- Vista `V_Mantenimiento_Alerta` con countdown y estados VENCIDA/PROXIMA/OK

---

### 🎨 Frontend Enterprise

- **Design System** completo con CSS custom (dark mode profundo, glassmorphism)
- **GSAP animations** en Login (orbs, logo spin, form stagger) y Sidebar (stagger nav)
- **Sidebar colapsable** con 12 módulos organizados en secciones
- **Dashboard ejecutivo** con KPIs live + AreaChart + BarChart (Recharts)
- **Lazy loading** de páginas para performance
- **PrivateRoute** con guard JWT (redirect a /login)
- **Axios interceptor** para inyección automática de Bearer token
- **Auto-redirect a /login** en respuesta 401

---

### 🔧 Changed (Cambios)

- `server.js` refactorizado de 30 líneas a arquitectura modular de 12 rutas
- `config/database.js` migrado a connection pool con `mysql2/promise`
- `middleware/auth.js` reemplaza `verifyToken` simple por `checkRole()` flexible
- `middleware/audit.js` reemplaza log básico por trazabilidad ISO 27001 completa
- `docker-compose.yml` actualizado: 4 SQL files en orden de carga, puertos actualizados

---

### 🗑 Removed (Eliminados)

- `routes/cargos.js` → funcionalidad integrada en `routes/servicios.js`
- `routes/pagos.js` → funcionalidad integrada en `routes/facturacion.js`
- Hash SHA2 como mecanismo principal de autenticación (mantenido solo para migración)
- Base de datos `hotel_reservas` (reemplazada por `hotel_enterprise`)

---

### 🔒 Security (Seguridad)

- Eliminado almacenamiento de contraseñas en SHA2 (deprecado, migración automática)
- Implementado account lockout anti-brute-force
- Agregado enmascaramiento de passwords en Audit_Logs
- Implementado PCI-DSS: eliminación de campos PAN y CVV del esquema
- Agregado log de accesos a datos personales (LFPDPPP Art. 21)
- JWT ahora se registra hasheado (SHA-256) en tabla de sesiones

---

### 🐛 Fixed (Correcciones)

- Corregido cálculo de `Total_Real` al hacer check-out (ahora vía trigger)
- Corregido estado de habitación que no se actualizaba al cancelar reserva
- Corregida generación de folios duplicados en entorno concurrente (transacción + lock)
- Corregido CORS para permitir tanto `localhost:5173` como `localhost:5175`

---

## [1.0.0] — 2026-03-15

### Prototipo Inicial

- CRUD básico de reservas con 8 tablas
- Autenticación simple con SHA2 (deprecado)
- Frontend estático sin framework
- Sin soporte multi-módulo
- Sin cumplimiento regulatorio

---

*Para más detalles de seguridad ver [SECURITY.md](SECURITY.md).*
*Para instrucciones de instalación ver [README.md](README.md).*
