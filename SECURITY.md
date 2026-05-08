# 🔐 Security Policy — Hotel Enterprise System v2.0

## Estándares de Cumplimiento

| Estándar | Alcance | Estado |
|---|---|---|
| **ISO/IEC 27001:2022** | Gestión de Seguridad de la Información | ✅ Implementado |
| **PCI-DSS Nivel 4** | Datos de tarjetas de pago | ✅ Implementado |
| **LFPDPPP** | Protección de Datos Personales (México) | ✅ Implementado |
| **CFDI 4.0 SAT** | Facturación electrónica México | ✅ Implementado |

---

## 1. Autenticación y Gestión de Identidad (M01)

### 1.1 Hash de Contraseñas
- **Algoritmo:** bcrypt con cost factor **12** (≈400ms por operación)
- **Migración automática:** Si se detecta hash SHA2 legacy al login, se migra a bcrypt transparentemente sin interrupción del servicio
- **Nunca** se almacena la contraseña en texto plano ni en logs

```javascript
// Implementación — backend/routes/auth.js
const passwordHash = await bcrypt.hash(password, 12);
```

### 1.2 JSON Web Tokens
- **Algoritmo:** HS256
- **Expiración:** 8 horas
- **Payload:** `{ id, email, rol, nombre }` — sin datos sensibles
- **Rotación:** Al logout se invalida la sesión en `Sesiones_Auth`
- **Hash de token:** El token se registra hasheado (SHA-256) en BD, nunca en texto plano

### 1.3 Control de Acceso Basado en Roles (RBAC)

| Rol | Módulos accesibles |
|---|---|
| **Admin** | Todos los módulos + Audit Logs + accesos a datos personales |
| **Supervisor** | Operativo + Reportes + Housekeeping (verificación) |
| **Recepcion** | Reservas, Habitaciones, Clientes, Servicios, Facturación |
| **Revenue** | Revenue, Channels (Admin) |
| **Limpieza** | Solo Housekeeping (tareas propias) |
| **Mantenimiento** | Solo módulo Mantenimiento |

### 1.4 Protección contra Fuerza Bruta
- **Límite:** 5 intentos fallidos consecutivos
- **Bloqueo:** 15 minutos (campo `Bloqueado_Hasta`)
- **Log:** Cada intento fallido se registra en `Audit_Logs` con IP y User-Agent
- **Reset automático:** Al login exitoso se resetean los contadores

---

## 2. Cumplimiento PCI-DSS (M06 — Facturación)

### Datos que NUNCA se almacenan
- ❌ Número completo de tarjeta (PAN)
- ❌ CVV/CVC/CID
- ❌ PIN de tarjeta
- ❌ Track 1 / Track 2 de banda magnética

### Datos permitidos (con restricciones)
- ✅ **Últimos 4 dígitos** del PAN (campo `Ultimos_4 CHAR(4)`)
- ✅ **Marca de tarjeta** (Visa, Mastercard, Amex, Other)
- ✅ **Token de gateway** (referencia opaca del procesador de pagos)
- ✅ **Código de autorización** (referencia de la transacción aprobada)

### Requerimientos adicionales PCI-DSS
- La integración con pasarela de pago (Stripe/Conekta/OpenPay) debe realizarse via **tokenización del lado del cliente**
- El backend **nunca recibe** el PAN en ningún endpoint
- Las conexiones al gateway deben ser **TLS 1.2+** obligatorio en producción

---

## 3. Cumplimiento LFPDPPP (M05 — Clientes)

### Principios implementados

| Principio | Implementación |
|---|---|
| **Licitud** | Consentimiento explícito al registrar cliente |
| **Consentimiento** | Tabla `Clientes_Consentimiento` con 4 tipos ARCO |
| **Información** | Texto del aviso de privacidad versionado |
| **Calidad** | Campos de actualización y baja lógica |
| **Finalidad** | Canal y finalidad de cada consentimiento registrados |
| **Lealtad** | Log de accesos a datos personales en `Accesos_Datos_Personales` |
| **Proporcionalidad** | Solo se recolectan datos necesarios para la operación |
| **Responsabilidad** | Empleado que accede al perfil queda registrado con IP |

### Tipos de consentimiento
```sql
ENUM('Datos_Personales','Marketing','Comunicaciones','Compartir_Terceros')
```

### Derechos ARCO
Los titulares pueden ejercer sus derechos de:
- **A**cceso — GET /api/clientes/:id (requiere autenticación del titular)
- **R**ectificación — PUT /api/clientes/:id
- **C**ancelación — PUT /api/clientes/:id (baja lógica `Activo = FALSE`)
- **O**posición — PUT /api/clientes/:id/consentimiento (revocar)

---

## 4. Auditoría ISO 27001 (M08 — Reportes)

### Tabla Audit_Logs

Cada acción en el sistema genera un registro con:

| Campo | Descripción |
|---|---|
| `ID_Empleado` | Quién realizó la acción (NULL si sistema) |
| `Modulo` | Módulo afectado (ej. `M02_Reservas`) |
| `Accion` | Acción específica (ej. `CHECKIN_OK`) |
| `Tabla_Afectada` | Tabla de BD modificada |
| `ID_Registro` | PK del registro afectado |
| `Detalle` | JSON con body/params (passwords enmascaradas) |
| `Direccion_IP` | IP origen (soporta X-Forwarded-For) |
| `User_Agent` | Navegador/cliente |
| `Resultado` | `Exito` / `Error` / `Denegado` |
| `Fecha_Hora` | Timestamp con precisión de milisegundos |

### Eventos auditados obligatoriamente
- `LOGIN_ATTEMPT` / `LOGIN_OK` / `LOGIN_FAILED`
- `RESERVA_CREADA` / `CHECKIN_OK` / `CHECKOUT_OK` / `RESERVA_CANCELADA`
- `PAGO_REGISTRADO` / `FACTURA_EMITIDA`
- `TAREA_CREADA` / `TAREA_COMPLETADA` / `TAREA_VERIFICADA`
- `ORDEN_CREADA` / `ORDEN_ACTUALIZADA`
- `CLIENTE_CREADO` / `CLIENTE_ACTUALIZADO`

### Controles de acceso a logs
- Solo roles **Admin** y **Supervisor** pueden consultar `Audit_Logs`
- Solo rol **Admin** puede consultar `Accesos_Datos_Personales`
- Los logs son **append-only** — no hay endpoint de eliminación

---

## 5. Seguridad en Tránsito

### Producción (obligatorio)
```nginx
# nginx.conf — TLS obligatorio
server {
    listen 443 ssl http2;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    add_header Strict-Transport-Security "max-age=63072000" always;
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
}
```

### Headers de seguridad recomendados
```
Strict-Transport-Security: max-age=63072000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Content-Security-Policy: default-src 'self'
Referrer-Policy: strict-origin-when-cross-origin
```

---

## 6. Variables de Entorno Sensibles

| Variable | Descripción | Nunca exponer |
|---|---|---|
| `JWT_SECRET` | Firma de tokens | ✅ Solo en servidor |
| `DB_PASSWORD` | Contraseña MySQL | ✅ Solo en servidor |
| `BCRYPT_ROUNDS` | Cost factor bcrypt | Puede ser 10-14 |

**Regla:** Ninguna variable sensible debe aparecer en:
- Código fuente
- Logs de aplicación
- Respuestas de API
- Control de versiones (git)

---

## 7. Reporte de Vulnerabilidades

Si descubres una vulnerabilidad de seguridad en este proyecto:

1. **NO** la reportes públicamente en GitHub Issues
2. Envía un email a: `security@hotel-enterprise.local` con:
   - Descripción de la vulnerabilidad
   - Pasos para reproducir
   - Impacto estimado
3. Recibirás respuesta en máximo **72 horas**
4. Las vulnerabilidades confirmadas se publicarán en [CHANGELOG.md](CHANGELOG.md) tras el fix

---

## 8. Auditoría Externa

Se recomienda realizar auditorías periódicas:

| Frecuencia | Actividad |
|---|---|
| **Mensual** | Revisar Audit_Logs por accesos anómalos |
| **Trimestral** | Rotación de JWT_SECRET |
| **Semestral** | Pruebas de penetración |
| **Anual** | Auditoría completa PCI-DSS / ISO 27001 |

---

*Última actualización: Mayo 2026 — Hotel Enterprise System v2.0*
