-- =============================================================================
-- BASE DE DATOS: hotel_enterprise
-- Hotel Management System — Enterprise Edition v2.0
-- Arquitectura de 12 módulos
-- Cumplimiento: ISO 27001 · PCI-DSS · LFPDPPP · CFDI 4.0
-- =============================================================================
CREATE DATABASE IF NOT EXISTS hotel_enterprise
    CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE hotel_enterprise;
SET FOREIGN_KEY_CHECKS = 0;

-- ===================== M01 — AUTENTICACIÓN =====================
CREATE TABLE IF NOT EXISTS Empleados (
    ID_Empleado        INT          NOT NULL AUTO_INCREMENT,
    Nombre             VARCHAR(50)  NOT NULL,
    Apellido           VARCHAR(50)  NOT NULL,
    Email              VARCHAR(100) NOT NULL,
    Contrasena_Hash    VARCHAR(255) NOT NULL,
    Rol                ENUM('Admin','Recepcion','Limpieza','Mantenimiento',
                            'Revenue','Supervisor') NOT NULL DEFAULT 'Recepcion',
    Activo             BOOLEAN      NOT NULL DEFAULT TRUE,
    Requiere_2FA       BOOLEAN      NOT NULL DEFAULT FALSE,
    Secreto_2FA        VARCHAR(64)  NULL,
    Intentos_Fallidos  TINYINT      NOT NULL DEFAULT 0,
    Bloqueado_Hasta    DATETIME     NULL,
    Ultimo_Login       DATETIME     NULL,
    IP_Ultimo_Login    VARCHAR(45)  NULL,
    Creado_En          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Actualizado_En     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (ID_Empleado),
    UNIQUE KEY uq_email (Email),
    INDEX idx_rol (Rol),
    INDEX idx_activo (Activo)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Sesiones_Auth (
    ID_Sesion          CHAR(36)     NOT NULL,
    ID_Empleado        INT          NOT NULL,
    Token_Hash         VARCHAR(255) NOT NULL,
    IP_Origen          VARCHAR(45)  NOT NULL,
    User_Agent         VARCHAR(255) NULL,
    Activa             BOOLEAN      NOT NULL DEFAULT TRUE,
    Expira_En          DATETIME     NOT NULL,
    Creada_En          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (ID_Sesion),
    FOREIGN KEY (ID_Empleado) REFERENCES Empleados(ID_Empleado) ON DELETE CASCADE,
    INDEX idx_token  (Token_Hash(32)),
    INDEX idx_activa (ID_Empleado, Activa, Expira_En)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Dispositivos_Confiables (
    ID_Dispositivo     INT          NOT NULL AUTO_INCREMENT,
    ID_Empleado        INT          NOT NULL,
    Fingerprint_Hash   VARCHAR(128) NOT NULL,
    Nombre_Dispositivo VARCHAR(100) NULL,
    Aprobado_Por       INT          NULL,
    Aprobado_En        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Ultimo_Uso         DATETIME     NULL,
    Revocado           BOOLEAN      NOT NULL DEFAULT FALSE,
    PRIMARY KEY (ID_Dispositivo),
    FOREIGN KEY (ID_Empleado)  REFERENCES Empleados(ID_Empleado) ON DELETE CASCADE,
    FOREIGN KEY (Aprobado_Por) REFERENCES Empleados(ID_Empleado) ON DELETE SET NULL,
    UNIQUE KEY uq_emp_device (ID_Empleado, Fingerprint_Hash)
) ENGINE=InnoDB;

-- ===================== M03 — HABITACIONES =====================
CREATE TABLE IF NOT EXISTS Tipos_Habitacion (
    ID_Tipo            INT          NOT NULL AUTO_INCREMENT,
    Nombre             VARCHAR(50)  NOT NULL,
    Descripcion        TEXT         NULL,
    Capacidad_Max      TINYINT      NOT NULL DEFAULT 2,
    Precio_Base        DECIMAL(10,2) NOT NULL,
    Activo             BOOLEAN      NOT NULL DEFAULT TRUE,
    PRIMARY KEY (ID_Tipo)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Amenidades (
    ID_Amenidad        INT          NOT NULL AUTO_INCREMENT,
    Nombre             VARCHAR(80)  NOT NULL,
    Icono              VARCHAR(50)  NULL,
    Categoria          ENUM('Baño','Entretenimiento','Seguridad',
                            'Climatización','Conectividad','Otro') NOT NULL,
    PRIMARY KEY (ID_Amenidad)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Habitaciones (
    ID_Habitacion      INT          NOT NULL AUTO_INCREMENT,
    Numero_Habitacion  VARCHAR(10)  NOT NULL,
    ID_Tipo            INT          NOT NULL,
    Piso               TINYINT      NOT NULL,
    Vista              ENUM('Calle','Jardín','Piscina','Mar','Interior') NOT NULL DEFAULT 'Interior',
    Estado             ENUM('Disponible','Ocupada','Sucia',
                            'En Limpieza','Mantenimiento','Bloqueada') NOT NULL DEFAULT 'Disponible',
    Notas_Internas     TEXT         NULL,
    Activa             BOOLEAN      NOT NULL DEFAULT TRUE,
    Actualizado_En     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (ID_Habitacion),
    UNIQUE KEY uq_numero (Numero_Habitacion),
    FOREIGN KEY (ID_Tipo) REFERENCES Tipos_Habitacion(ID_Tipo),
    INDEX idx_estado (Estado),
    INDEX idx_piso   (Piso)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Habitacion_Amenidades (
    ID_Habitacion INT NOT NULL,
    ID_Amenidad   INT NOT NULL,
    PRIMARY KEY (ID_Habitacion, ID_Amenidad),
    FOREIGN KEY (ID_Habitacion) REFERENCES Habitaciones(ID_Habitacion) ON DELETE CASCADE,
    FOREIGN KEY (ID_Amenidad)   REFERENCES Amenidades(ID_Amenidad)     ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Historial_Estado_Habitacion (
    ID_Historial       INT          NOT NULL AUTO_INCREMENT,
    ID_Habitacion      INT          NOT NULL,
    Estado_Anterior    ENUM('Disponible','Ocupada','Sucia','En Limpieza','Mantenimiento','Bloqueada') NULL,
    Estado_Nuevo       ENUM('Disponible','Ocupada','Sucia','En Limpieza','Mantenimiento','Bloqueada') NOT NULL,
    ID_Empleado        INT          NULL,
    Motivo             VARCHAR(255) NULL,
    Cambiado_En        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (ID_Historial),
    FOREIGN KEY (ID_Habitacion) REFERENCES Habitaciones(ID_Habitacion),
    FOREIGN KEY (ID_Empleado)   REFERENCES Empleados(ID_Empleado) ON DELETE SET NULL,
    INDEX idx_hab_fecha (ID_Habitacion, Cambiado_En)
) ENGINE=InnoDB;

-- ===================== M05 — CLIENTES =====================
CREATE TABLE IF NOT EXISTS Clientes (
    ID_Cliente         INT          NOT NULL AUTO_INCREMENT,
    Nombre             VARCHAR(50)  NOT NULL,
    Apellido           VARCHAR(50)  NOT NULL,
    Email              VARCHAR(100) NOT NULL,
    Telefono           VARCHAR(20)  NOT NULL,
    Documento_Tipo     ENUM('INE','Pasaporte','Cédula','Licencia','Otro') NOT NULL DEFAULT 'Pasaporte',
    Documento_Identidad VARCHAR(50) NULL,
    Nacionalidad       VARCHAR(50)  NULL,
    Fecha_Nacimiento   DATE         NULL,
    RFC                VARCHAR(13)  NULL,
    Nivel_Lealtad      ENUM('Bronce','Plata','Oro','Platino') NOT NULL DEFAULT 'Bronce',
    Puntos_Lealtad     INT          NOT NULL DEFAULT 0,
    Activo             BOOLEAN      NOT NULL DEFAULT TRUE,
    Fecha_Baja         DATETIME     NULL,
    Creado_En          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Actualizado_En     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (ID_Cliente),
    UNIQUE KEY uq_doc (Documento_Identidad),
    INDEX idx_email    (Email),
    INDEX idx_lealtad  (Nivel_Lealtad)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Clientes_Consentimiento (
    ID_Consentimiento  INT          NOT NULL AUTO_INCREMENT,
    ID_Cliente         INT          NOT NULL,
    Tipo               ENUM('Datos_Personales','Marketing','Comunicaciones','Compartir_Terceros') NOT NULL,
    Otorgado           BOOLEAN      NOT NULL DEFAULT FALSE,
    Canal              ENUM('Web','Presencial','Email','App') NOT NULL,
    IP_Registro        VARCHAR(45)  NULL,
    Texto_Aviso        TEXT         NULL,
    Version_Aviso      VARCHAR(10)  NULL,
    Fecha_Otorgado     DATETIME     NULL,
    Fecha_Revocado     DATETIME     NULL,
    Activo             BOOLEAN      NOT NULL DEFAULT TRUE,
    PRIMARY KEY (ID_Consentimiento),
    FOREIGN KEY (ID_Cliente) REFERENCES Clientes(ID_Cliente) ON DELETE CASCADE,
    UNIQUE KEY uq_cliente_tipo (ID_Cliente, Tipo)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Preferencias_Cliente (
    ID_Cliente         INT          NOT NULL,
    Piso_Preferido     ENUM('Bajo','Medio','Alto') NULL,
    Tipo_Almohada      ENUM('Suave','Firme') NULL,
    Temperatura_AC     TINYINT      NULL,
    Dieta_Especial     VARCHAR(100) NULL,
    Alergenos          VARCHAR(255) NULL,
    Solicitudes_Fijas  TEXT         NULL,
    Idioma_Preferido   CHAR(5)      NOT NULL DEFAULT 'es-MX',
    Canal_Notif_Pref   ENUM('Email','SMS','WhatsApp','Sin preferencia') NOT NULL DEFAULT 'Email',
    PRIMARY KEY (ID_Cliente),
    FOREIGN KEY (ID_Cliente) REFERENCES Clientes(ID_Cliente) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Lealtad_Movimientos (
    ID_Movimiento      INT          NOT NULL AUTO_INCREMENT,
    ID_Cliente         INT          NOT NULL,
    ID_Reserva         INT          NULL,
    Tipo               ENUM('Acumulacion','Canje','Ajuste','Vencimiento') NOT NULL,
    Puntos             INT          NOT NULL,
    Descripcion        VARCHAR(255) NULL,
    Saldo_Resultante   INT          NOT NULL DEFAULT 0,
    Creado_En          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (ID_Movimiento),
    FOREIGN KEY (ID_Cliente) REFERENCES Clientes(ID_Cliente),
    INDEX idx_cliente_fecha (ID_Cliente, Creado_En)
) ENGINE=InnoDB;

-- ===================== M10 — REVENUE MANAGEMENT =====================
CREATE TABLE IF NOT EXISTS Planes_Tarifa (
    ID_Plan            INT          NOT NULL AUTO_INCREMENT,
    Codigo             VARCHAR(20)  NOT NULL,
    Nombre             VARCHAR(100) NOT NULL,
    Descripcion        TEXT         NULL,
    Politica_Cancelacion ENUM('Flexible','48h','No_Reembolsable') NOT NULL DEFAULT 'Flexible',
    Incluye_Desayuno   BOOLEAN      NOT NULL DEFAULT FALSE,
    Activo             BOOLEAN      NOT NULL DEFAULT TRUE,
    PRIMARY KEY (ID_Plan),
    UNIQUE KEY uq_codigo (Codigo)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Tarifas_Calendario (
    ID_Tarifa          INT          NOT NULL AUTO_INCREMENT,
    ID_Tipo_Hab        INT          NOT NULL,
    ID_Plan            INT          NOT NULL,
    Fecha              DATE         NOT NULL,
    Precio             DECIMAL(10,2) NOT NULL,
    Disponible         BOOLEAN      NOT NULL DEFAULT TRUE,
    Estancia_Minima    TINYINT      NOT NULL DEFAULT 1,
    Stop_Sell          BOOLEAN      NOT NULL DEFAULT FALSE,
    PRIMARY KEY (ID_Tarifa),
    FOREIGN KEY (ID_Tipo_Hab) REFERENCES Tipos_Habitacion(ID_Tipo),
    FOREIGN KEY (ID_Plan)     REFERENCES Planes_Tarifa(ID_Plan),
    UNIQUE KEY uq_tipo_plan_fecha (ID_Tipo_Hab, ID_Plan, Fecha),
    INDEX idx_fecha (Fecha)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Reglas_Precio (
    ID_Regla           INT          NOT NULL AUTO_INCREMENT,
    Nombre             VARCHAR(100) NOT NULL,
    Tipo               ENUM('Temporada_Alta','Temporada_Baja','Fin_Semana',
                            'Early_Bird','Last_Minute','Evento') NOT NULL,
    ID_Tipo_Hab        INT          NULL,
    Fecha_Inicio       DATE         NOT NULL,
    Fecha_Fin          DATE         NOT NULL,
    Dias_Semana        SET('Lun','Mar','Mie','Jue','Vie','Sab','Dom') NULL,
    Ajuste_Tipo        ENUM('Porcentaje','Monto_Fijo') NOT NULL,
    Ajuste_Valor       DECIMAL(10,2) NOT NULL,
    Prioridad          TINYINT      NOT NULL DEFAULT 0,
    Activa             BOOLEAN      NOT NULL DEFAULT TRUE,
    PRIMARY KEY (ID_Regla),
    FOREIGN KEY (ID_Tipo_Hab) REFERENCES Tipos_Habitacion(ID_Tipo) ON DELETE SET NULL,
    INDEX idx_fechas (Fecha_Inicio, Fecha_Fin, Activa)
) ENGINE=InnoDB;

-- ===================== M09 — CHANNEL MANAGER =====================
CREATE TABLE IF NOT EXISTS Canales_OTA (
    ID_Canal           INT          NOT NULL AUTO_INCREMENT,
    Nombre             VARCHAR(50)  NOT NULL,
    Codigo             VARCHAR(20)  NOT NULL,
    Comision_Pct       DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    API_Endpoint       VARCHAR(255) NULL,
    Activo             BOOLEAN      NOT NULL DEFAULT TRUE,
    PRIMARY KEY (ID_Canal),
    UNIQUE KEY uq_codigo (Codigo)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Disponibilidad_Canal (
    ID_Disp            INT          NOT NULL AUTO_INCREMENT,
    ID_Canal           INT          NOT NULL,
    ID_Tipo_Hab        INT          NOT NULL,
    Fecha              DATE         NOT NULL,
    Cupo_Total         TINYINT      NOT NULL DEFAULT 0,
    Cupo_Vendido       TINYINT      NOT NULL DEFAULT 0,
    Precio_Canal       DECIMAL(10,2) NOT NULL,
    Stop_Sell          BOOLEAN      NOT NULL DEFAULT FALSE,
    Ultima_Sync        DATETIME     NULL,
    PRIMARY KEY (ID_Disp),
    FOREIGN KEY (ID_Canal)    REFERENCES Canales_OTA(ID_Canal),
    FOREIGN KEY (ID_Tipo_Hab) REFERENCES Tipos_Habitacion(ID_Tipo),
    UNIQUE KEY uq_canal_tipo_fecha (ID_Canal, ID_Tipo_Hab, Fecha),
    INDEX idx_fecha (Fecha)
) ENGINE=InnoDB;

-- ===================== M02 — RESERVAS =====================
CREATE TABLE IF NOT EXISTS Reservas (
    ID_Reserva         INT          NOT NULL AUTO_INCREMENT,
    Folio              VARCHAR(20)  NOT NULL,
    ID_Cliente         INT          NOT NULL,
    ID_Habitacion      INT          NOT NULL,
    ID_Empleado_Registro INT        NULL,
    ID_Plan            INT          NULL,
    ID_Canal           INT          NULL,
    Fecha_Entrada      DATE         NOT NULL,
    Fecha_Salida       DATE         NOT NULL,
    Hora_CheckIn_Real  DATETIME     NULL,
    Hora_CheckOut_Real DATETIME     NULL,
    Adultos            TINYINT      NOT NULL DEFAULT 1,
    Menores            TINYINT      NOT NULL DEFAULT 0,
    Estado             ENUM('Pendiente','Confirmada','Check-in',
                            'Check-out','Cancelada','No-Show') NOT NULL DEFAULT 'Pendiente',
    Total_Estimado     DECIMAL(10,2) NOT NULL,
    Total_Servicios    DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    Total_Real         DECIMAL(10,2) NULL,
    Observaciones      TEXT         NULL,
    Motivo_Cancelacion TEXT         NULL,
    Creado_En          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Actualizado_En     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (ID_Reserva),
    UNIQUE KEY uq_folio (Folio),
    FOREIGN KEY (ID_Cliente)           REFERENCES Clientes(ID_Cliente),
    FOREIGN KEY (ID_Habitacion)        REFERENCES Habitaciones(ID_Habitacion),
    FOREIGN KEY (ID_Empleado_Registro) REFERENCES Empleados(ID_Empleado) ON DELETE SET NULL,
    FOREIGN KEY (ID_Plan)              REFERENCES Planes_Tarifa(ID_Plan) ON DELETE SET NULL,
    FOREIGN KEY (ID_Canal)             REFERENCES Canales_OTA(ID_Canal)  ON DELETE SET NULL,
    INDEX idx_cliente    (ID_Cliente),
    INDEX idx_habitacion (ID_Habitacion),
    INDEX idx_fechas     (Fecha_Entrada, Fecha_Salida),
    INDEX idx_estado     (Estado)
) ENGINE=InnoDB;

ALTER TABLE Lealtad_Movimientos
    ADD CONSTRAINT fk_lealtad_reserva
    FOREIGN KEY (ID_Reserva) REFERENCES Reservas(ID_Reserva) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS Historial_Estado_Reserva (
    ID_Historial       INT          NOT NULL AUTO_INCREMENT,
    ID_Reserva         INT          NOT NULL,
    Estado_Anterior    ENUM('Pendiente','Confirmada','Check-in','Check-out','Cancelada','No-Show') NULL,
    Estado_Nuevo       ENUM('Pendiente','Confirmada','Check-in','Check-out','Cancelada','No-Show') NOT NULL,
    ID_Empleado        INT          NULL,
    Notas              TEXT         NULL,
    Cambiado_En        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (ID_Historial),
    FOREIGN KEY (ID_Reserva)  REFERENCES Reservas(ID_Reserva) ON DELETE CASCADE,
    FOREIGN KEY (ID_Empleado) REFERENCES Empleados(ID_Empleado) ON DELETE SET NULL,
    INDEX idx_reserva_fecha (ID_Reserva, Cambiado_En)
) ENGINE=InnoDB;

-- ===================== M04 — SERVICIOS / POS =====================
CREATE TABLE IF NOT EXISTS Servicios (
    ID_Servicio        INT          NOT NULL AUTO_INCREMENT,
    Nombre_Servicio    VARCHAR(100) NOT NULL,
    Descripcion        TEXT         NULL,
    Precio             DECIMAL(10,2) NOT NULL,
    Categoria          ENUM('Restaurante','Room Service','Spa',
                            'Lavanderia','Minibar','Otro') NOT NULL,
    Clave_SAT          VARCHAR(8)   NULL,
    Activo             BOOLEAN      NOT NULL DEFAULT TRUE,
    PRIMARY KEY (ID_Servicio),
    INDEX idx_categoria (Categoria)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Cargos_Reserva (
    ID_Cargo           INT          NOT NULL AUTO_INCREMENT,
    ID_Reserva         INT          NOT NULL,
    ID_Servicio        INT          NOT NULL,
    ID_Empleado        INT          NULL,
    Cantidad           INT          NOT NULL DEFAULT 1,
    Precio_Unitario    DECIMAL(10,2) NOT NULL,
    Descuento          DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    Subtotal           DECIMAL(10,2) NOT NULL,
    Estado             ENUM('Pendiente','Cobrado','Cortesía','Cancelado') NOT NULL DEFAULT 'Pendiente',
    Notas              VARCHAR(255) NULL,
    Aprobado_Por       INT          NULL,
    Fecha_Cargo        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (ID_Cargo),
    FOREIGN KEY (ID_Reserva)   REFERENCES Reservas(ID_Reserva),
    FOREIGN KEY (ID_Servicio)  REFERENCES Servicios(ID_Servicio),
    FOREIGN KEY (ID_Empleado)  REFERENCES Empleados(ID_Empleado) ON DELETE SET NULL,
    FOREIGN KEY (Aprobado_Por) REFERENCES Empleados(ID_Empleado) ON DELETE SET NULL,
    INDEX idx_reserva_estado (ID_Reserva, Estado)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Inventario_Minibar (
    ID_Inventario      INT          NOT NULL AUTO_INCREMENT,
    ID_Habitacion      INT          NOT NULL,
    Ultima_Revision    DATETIME     NULL,
    ID_Empleado_Rev    INT          NULL,
    PRIMARY KEY (ID_Inventario),
    UNIQUE KEY uq_habitacion (ID_Habitacion),
    FOREIGN KEY (ID_Habitacion)   REFERENCES Habitaciones(ID_Habitacion),
    FOREIGN KEY (ID_Empleado_Rev) REFERENCES Empleados(ID_Empleado) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Inventario_Minibar_Items (
    ID_Item            INT          NOT NULL AUTO_INCREMENT,
    ID_Inventario      INT          NOT NULL,
    ID_Servicio        INT          NOT NULL,
    Stock_Total        TINYINT      NOT NULL DEFAULT 0,
    Stock_Actual       TINYINT      NOT NULL DEFAULT 0,
    PRIMARY KEY (ID_Item),
    FOREIGN KEY (ID_Inventario) REFERENCES Inventario_Minibar(ID_Inventario) ON DELETE CASCADE,
    FOREIGN KEY (ID_Servicio)   REFERENCES Servicios(ID_Servicio),
    UNIQUE KEY uq_inv_svc (ID_Inventario, ID_Servicio)
) ENGINE=InnoDB;

-- ===================== M06 — FACTURACIÓN =====================
CREATE TABLE IF NOT EXISTS Pagos (
    ID_Pago            INT          NOT NULL AUTO_INCREMENT,
    ID_Reserva         INT          NOT NULL,
    ID_Empleado        INT          NULL,
    Monto              DECIMAL(10,2) NOT NULL,
    Metodo_Pago        ENUM('Efectivo','Tarjeta_Credito','Tarjeta_Debito',
                            'Transferencia','Puntos_Lealtad') NOT NULL,
    Tipo_Pago          ENUM('Deposito','Liquidacion','Penalizacion','Reembolso') NOT NULL DEFAULT 'Liquidacion',
    Ultimos_4          CHAR(4)      NULL,
    Marca_Tarjeta      ENUM('Visa','Mastercard','Amex','Other') NULL,
    Token_Gateway      VARCHAR(100) NULL,
    Referencia_Auth    VARCHAR(50)  NULL,
    Estado             ENUM('Pendiente','Aprobado','Rechazado','Reversado') NOT NULL DEFAULT 'Aprobado',
    Fecha_Pago         DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (ID_Pago),
    FOREIGN KEY (ID_Reserva)  REFERENCES Reservas(ID_Reserva),
    FOREIGN KEY (ID_Empleado) REFERENCES Empleados(ID_Empleado) ON DELETE SET NULL,
    INDEX idx_reserva (ID_Reserva),
    INDEX idx_estado  (Estado)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Facturas (
    ID_Factura         INT          NOT NULL AUTO_INCREMENT,
    ID_Reserva         INT          NOT NULL,
    Serie              CHAR(1)      NOT NULL DEFAULT 'A',
    Folio_Fiscal       VARCHAR(20)  NOT NULL,
    UUID_SAT           CHAR(36)     NULL,
    RFC_Emisor         VARCHAR(13)  NOT NULL,
    Razon_Social_Emisor VARCHAR(200) NOT NULL,
    Regimen_Fiscal_Emisor VARCHAR(3) NOT NULL,
    RFC_Receptor       VARCHAR(13)  NOT NULL,
    Nombre_Receptor    VARCHAR(200) NOT NULL,
    Regimen_Fiscal_Receptor VARCHAR(3) NULL,
    CP_Receptor        CHAR(5)      NULL,
    Uso_CFDI           VARCHAR(3)   NOT NULL DEFAULT 'G03',
    Forma_Pago_SAT     VARCHAR(2)   NOT NULL DEFAULT '04',
    Metodo_Pago_SAT    ENUM('PUE','PPD') NOT NULL DEFAULT 'PUE',
    Subtotal           DECIMAL(10,2) NOT NULL,
    Descuento          DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    IVA                DECIMAL(10,2) NOT NULL,
    Total              DECIMAL(10,2) NOT NULL,
    Estado             ENUM('Borrador','Timbrada','Cancelada') NOT NULL DEFAULT 'Borrador',
    Fecha_Emision      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Fecha_Cancelacion  DATETIME     NULL,
    Motivo_Cancelacion VARCHAR(3)   NULL,
    UUID_Sustitucion   CHAR(36)     NULL,
    PRIMARY KEY (ID_Factura),
    UNIQUE KEY uq_folio_serie (Serie, Folio_Fiscal),
    FOREIGN KEY (ID_Reserva) REFERENCES Reservas(ID_Reserva),
    INDEX idx_uuid    (UUID_SAT),
    INDEX idx_receptor (RFC_Receptor),
    INDEX idx_estado  (Estado)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Conceptos_Factura (
    ID_Concepto        INT          NOT NULL AUTO_INCREMENT,
    ID_Factura         INT          NOT NULL,
    Descripcion        VARCHAR(255) NOT NULL,
    Clave_SAT          VARCHAR(8)   NOT NULL,
    Clave_Unidad_SAT   VARCHAR(3)   NOT NULL DEFAULT 'E48',
    Cantidad           DECIMAL(10,3) NOT NULL DEFAULT 1.000,
    Valor_Unitario     DECIMAL(10,2) NOT NULL,
    Descuento          DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    Importe            DECIMAL(10,2) NOT NULL,
    IVA_Pct            DECIMAL(5,2)  NOT NULL DEFAULT 16.00,
    Objeto_Imp         CHAR(2)      NOT NULL DEFAULT '02',
    PRIMARY KEY (ID_Concepto),
    FOREIGN KEY (ID_Factura) REFERENCES Facturas(ID_Factura) ON DELETE CASCADE
) ENGINE=InnoDB;