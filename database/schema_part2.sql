-- =============================================================================
-- schema_part2.sql — M07-M12, Triggers, Views
-- =============================================================================
USE hotel_enterprise;

-- ===================== M07 — HOUSEKEEPING =====================
CREATE TABLE IF NOT EXISTS Tareas_Limpieza (
    ID_Tarea           INT          NOT NULL AUTO_INCREMENT,
    ID_Habitacion      INT          NOT NULL,
    ID_Reserva         INT          NULL,
    ID_Empleado        INT          NULL,
    Tipo               ENUM('Rutina','Salida','Profunda','Inspeccion') NOT NULL,
    Estado             ENUM('Pendiente','En_Proceso','Completada','Verificada') NOT NULL DEFAULT 'Pendiente',
    Prioridad          ENUM('Normal','Alta','Urgente') NOT NULL DEFAULT 'Normal',
    Notas              TEXT         NULL,
    Foto_Evidencia_URL VARCHAR(500) NULL,
    Asignada_En        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Iniciada_En        DATETIME     NULL,
    Completada_En      DATETIME     NULL,
    Verificada_Por     INT          NULL,
    Tiempo_Min         SMALLINT     NULL,
    PRIMARY KEY (ID_Tarea),
    FOREIGN KEY (ID_Habitacion)  REFERENCES Habitaciones(ID_Habitacion),
    FOREIGN KEY (ID_Reserva)     REFERENCES Reservas(ID_Reserva) ON DELETE SET NULL,
    FOREIGN KEY (ID_Empleado)    REFERENCES Empleados(ID_Empleado) ON DELETE SET NULL,
    FOREIGN KEY (Verificada_Por) REFERENCES Empleados(ID_Empleado) ON DELETE SET NULL,
    INDEX idx_hab_estado   (ID_Habitacion, Estado),
    INDEX idx_emp_estado   (ID_Empleado, Estado),
    INDEX idx_asignada     (Asignada_En)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Checklist_Plantillas (
    ID_Plantilla       INT          NOT NULL AUTO_INCREMENT,
    Nombre             VARCHAR(100) NOT NULL,
    Tipo_Limpieza      ENUM('Rutina','Salida','Profunda','Inspeccion') NOT NULL,
    ID_Tipo_Hab        INT          NULL,
    Activa             BOOLEAN      NOT NULL DEFAULT TRUE,
    PRIMARY KEY (ID_Plantilla),
    FOREIGN KEY (ID_Tipo_Hab) REFERENCES Tipos_Habitacion(ID_Tipo) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Checklist_Items_Plantilla (
    ID_Item            INT          NOT NULL AUTO_INCREMENT,
    ID_Plantilla       INT          NOT NULL,
    Descripcion        VARCHAR(200) NOT NULL,
    Orden              TINYINT      NOT NULL,
    Obligatorio        BOOLEAN      NOT NULL DEFAULT TRUE,
    PRIMARY KEY (ID_Item),
    FOREIGN KEY (ID_Plantilla) REFERENCES Checklist_Plantillas(ID_Plantilla) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Checklist_Ejecucion (
    ID_Ejecucion       INT          NOT NULL AUTO_INCREMENT,
    ID_Tarea           INT          NOT NULL,
    ID_Plantilla       INT          NOT NULL,
    Completado_Pct     TINYINT      NOT NULL DEFAULT 0,
    PRIMARY KEY (ID_Ejecucion),
    FOREIGN KEY (ID_Tarea)     REFERENCES Tareas_Limpieza(ID_Tarea) ON DELETE CASCADE,
    FOREIGN KEY (ID_Plantilla) REFERENCES Checklist_Plantillas(ID_Plantilla)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Checklist_Items_Ejecucion (
    ID_Item_Exec       INT          NOT NULL AUTO_INCREMENT,
    ID_Ejecucion       INT          NOT NULL,
    ID_Item_Plantilla  INT          NOT NULL,
    Completado         BOOLEAN      NOT NULL DEFAULT FALSE,
    Notas              VARCHAR(255) NULL,
    PRIMARY KEY (ID_Item_Exec),
    FOREIGN KEY (ID_Ejecucion)      REFERENCES Checklist_Ejecucion(ID_Ejecucion) ON DELETE CASCADE,
    FOREIGN KEY (ID_Item_Plantilla) REFERENCES Checklist_Items_Plantilla(ID_Item)
) ENGINE=InnoDB;

-- ===================== M08 — REPORTES Y AUDITORÍA =====================
CREATE TABLE IF NOT EXISTS Audit_Logs (
    ID_Log             BIGINT       NOT NULL AUTO_INCREMENT,
    ID_Empleado        INT          NULL,
    Modulo             VARCHAR(50)  NOT NULL,
    Accion             VARCHAR(100) NOT NULL,
    Tabla_Afectada     VARCHAR(50)  NULL,
    ID_Registro        INT          NULL,
    Detalle            JSON         NULL,
    Direccion_IP       VARCHAR(45)  NOT NULL,
    User_Agent         VARCHAR(255) NULL,
    Resultado          ENUM('Exito','Error','Denegado') NOT NULL DEFAULT 'Exito',
    Fecha_Hora         DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (ID_Log),
    FOREIGN KEY (ID_Empleado) REFERENCES Empleados(ID_Empleado) ON DELETE SET NULL,
    INDEX idx_empleado  (ID_Empleado, Fecha_Hora),
    INDEX idx_modulo    (Modulo, Fecha_Hora),
    INDEX idx_resultado (Resultado, Fecha_Hora)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Accesos_Datos_Personales (
    ID_Acceso          INT          NOT NULL AUTO_INCREMENT,
    ID_Empleado        INT          NOT NULL,
    ID_Cliente         INT          NOT NULL,
    Motivo             VARCHAR(255) NOT NULL,
    Campos_Accedidos   VARCHAR(500) NOT NULL,
    IP_Origen          VARCHAR(45)  NOT NULL,
    Fecha_Hora         DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (ID_Acceso),
    FOREIGN KEY (ID_Empleado) REFERENCES Empleados(ID_Empleado),
    FOREIGN KEY (ID_Cliente)  REFERENCES Clientes(ID_Cliente),
    INDEX idx_cliente_fecha (ID_Cliente, Fecha_Hora)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Metricas_Diarias (
    ID_Metrica              INT          NOT NULL AUTO_INCREMENT,
    Fecha                   DATE         NOT NULL,
    Habitaciones_Total      SMALLINT     NOT NULL,
    Habitaciones_Ocupadas   SMALLINT     NOT NULL,
    Ocupacion_Pct           DECIMAL(5,2) NOT NULL,
    ADR                     DECIMAL(10,2) NOT NULL,
    RevPAR                  DECIMAL(10,2) NOT NULL,
    Ingresos_Habitacion     DECIMAL(12,2) NOT NULL,
    Ingresos_Servicios      DECIMAL(12,2) NOT NULL,
    Ingresos_Total          DECIMAL(12,2) NOT NULL,
    Check_Ins               SMALLINT     NOT NULL DEFAULT 0,
    Check_Outs              SMALLINT     NOT NULL DEFAULT 0,
    Cancelaciones           SMALLINT     NOT NULL DEFAULT 0,
    No_Shows                SMALLINT     NOT NULL DEFAULT 0,
    Generado_En             DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (ID_Metrica),
    UNIQUE KEY uq_fecha (Fecha)
) ENGINE=InnoDB;

-- ===================== M11 — COMUNICACIONES =====================
CREATE TABLE IF NOT EXISTS Plantillas_Comunicacion (
    ID_Plantilla       INT          NOT NULL AUTO_INCREMENT,
    Nombre             VARCHAR(100) NOT NULL,
    Evento             ENUM('Confirmacion_Reserva','Pre_CheckIn','Bienvenida',
                            'Pre_CheckOut','Post_Estadia','Encuesta','Promocion') NOT NULL,
    Canal              ENUM('Email','SMS','WhatsApp') NOT NULL,
    Idioma             CHAR(5)      NOT NULL DEFAULT 'es-MX',
    Asunto             VARCHAR(200) NULL,
    Cuerpo             TEXT         NOT NULL,
    Activa             BOOLEAN      NOT NULL DEFAULT TRUE,
    PRIMARY KEY (ID_Plantilla),
    UNIQUE KEY uq_evento_canal_idioma (Evento, Canal, Idioma)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Comunicaciones_Enviadas (
    ID_Comunicacion    INT          NOT NULL AUTO_INCREMENT,
    ID_Plantilla       INT          NOT NULL,
    ID_Cliente         INT          NOT NULL,
    ID_Reserva         INT          NULL,
    Canal              ENUM('Email','SMS','WhatsApp') NOT NULL,
    Destinatario       VARCHAR(100) NOT NULL,
    Estado             ENUM('Pendiente','Enviado','Entregado','Fallido') NOT NULL DEFAULT 'Pendiente',
    Referencia_Externa VARCHAR(100) NULL,
    Error_Detalle      TEXT         NULL,
    Fecha_Envio        DATETIME     NULL,
    Fecha_Entrega      DATETIME     NULL,
    PRIMARY KEY (ID_Comunicacion),
    FOREIGN KEY (ID_Plantilla) REFERENCES Plantillas_Comunicacion(ID_Plantilla),
    FOREIGN KEY (ID_Cliente)   REFERENCES Clientes(ID_Cliente),
    FOREIGN KEY (ID_Reserva)   REFERENCES Reservas(ID_Reserva) ON DELETE SET NULL,
    INDEX idx_cliente   (ID_Cliente, Fecha_Envio),
    INDEX idx_reserva   (ID_Reserva)
) ENGINE=InnoDB;

-- ===================== M12 — MANTENIMIENTO PREVENTIVO =====================
CREATE TABLE IF NOT EXISTS Proveedores (
    ID_Proveedor       INT          NOT NULL AUTO_INCREMENT,
    Nombre             VARCHAR(100) NOT NULL,
    RFC                VARCHAR(13)  NULL,
    Contacto           VARCHAR(100) NULL,
    Telefono           VARCHAR(20)  NULL,
    Email              VARCHAR(100) NULL,
    Especialidad       VARCHAR(100) NULL,
    Activo             BOOLEAN      NOT NULL DEFAULT TRUE,
    PRIMARY KEY (ID_Proveedor)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Activos_Hotel (
    ID_Activo          INT          NOT NULL AUTO_INCREMENT,
    Nombre             VARCHAR(100) NOT NULL,
    Codigo_Interno     VARCHAR(30)  NOT NULL,
    Categoria          ENUM('HVAC','Plomeria','Electrico','AV',
                            'Mobiliario','Electrodomestico','Otro') NOT NULL,
    ID_Habitacion      INT          NULL,
    Marca              VARCHAR(50)  NULL,
    Modelo             VARCHAR(100) NULL,
    Numero_Serie       VARCHAR(100) NULL,
    Fecha_Compra       DATE         NULL,
    Garantia_Hasta     DATE         NULL,
    ID_Proveedor       INT          NULL,
    Estado             ENUM('Operativo','En_Reparacion','Dado_de_Baja') NOT NULL DEFAULT 'Operativo',
    PRIMARY KEY (ID_Activo),
    UNIQUE KEY uq_codigo (Codigo_Interno),
    FOREIGN KEY (ID_Habitacion) REFERENCES Habitaciones(ID_Habitacion) ON DELETE SET NULL,
    FOREIGN KEY (ID_Proveedor)  REFERENCES Proveedores(ID_Proveedor)   ON DELETE SET NULL,
    INDEX idx_categoria (Categoria),
    INDEX idx_estado    (Estado)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Ordenes_Mantenimiento (
    ID_Orden           INT          NOT NULL AUTO_INCREMENT,
    Folio              VARCHAR(20)  NOT NULL,
    ID_Activo          INT          NULL,
    ID_Habitacion      INT          NULL,
    ID_Empleado_Solicita INT        NULL,
    ID_Empleado_Asignado INT        NULL,
    ID_Proveedor       INT          NULL,
    Tipo               ENUM('Correctivo','Preventivo','Inspeccion') NOT NULL,
    Prioridad          ENUM('Baja','Normal','Alta','Critica') NOT NULL DEFAULT 'Normal',
    Descripcion        TEXT         NOT NULL,
    Estado             ENUM('Abierta','En_Proceso','Espera_Refaccion','Completada','Cancelada') NOT NULL DEFAULT 'Abierta',
    Costo_Estimado     DECIMAL(10,2) NULL,
    Costo_Real         DECIMAL(10,2) NULL,
    Fecha_Apertura     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Fecha_Inicio       DATETIME     NULL,
    Fecha_Cierre       DATETIME     NULL,
    Notas_Cierre       TEXT         NULL,
    PRIMARY KEY (ID_Orden),
    UNIQUE KEY uq_folio (Folio),
    FOREIGN KEY (ID_Activo)            REFERENCES Activos_Hotel(ID_Activo)    ON DELETE SET NULL,
    FOREIGN KEY (ID_Habitacion)        REFERENCES Habitaciones(ID_Habitacion) ON DELETE SET NULL,
    FOREIGN KEY (ID_Empleado_Solicita) REFERENCES Empleados(ID_Empleado)      ON DELETE SET NULL,
    FOREIGN KEY (ID_Empleado_Asignado) REFERENCES Empleados(ID_Empleado)      ON DELETE SET NULL,
    FOREIGN KEY (ID_Proveedor)         REFERENCES Proveedores(ID_Proveedor)   ON DELETE SET NULL,
    INDEX idx_estado    (Estado, Prioridad),
    INDEX idx_activo    (ID_Activo),
    INDEX idx_apertura  (Fecha_Apertura)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Mantenimiento_Programado (
    ID_Programa        INT          NOT NULL AUTO_INCREMENT,
    ID_Activo          INT          NOT NULL,
    Descripcion        VARCHAR(255) NOT NULL,
    Frecuencia_Tipo    ENUM('Diario','Semanal','Mensual','Trimestral','Anual') NOT NULL,
    Frecuencia_Valor   TINYINT      NOT NULL DEFAULT 1,
    Proxima_Ejecucion  DATE         NOT NULL,
    Ultima_Ejecucion   DATE         NULL,
    ID_Proveedor       INT          NULL,
    Tiempo_Est_Min     SMALLINT     NULL,
    Activo             BOOLEAN      NOT NULL DEFAULT TRUE,
    PRIMARY KEY (ID_Programa),
    FOREIGN KEY (ID_Activo)    REFERENCES Activos_Hotel(ID_Activo) ON DELETE CASCADE,
    FOREIGN KEY (ID_Proveedor) REFERENCES Proveedores(ID_Proveedor) ON DELETE SET NULL,
    INDEX idx_proxima (Proxima_Ejecucion, Activo)
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS = 1;

-- ===================== TRIGGERS =====================
DELIMITER $$

CREATE TRIGGER trg_reserva_estado_after_update
AFTER UPDATE ON Reservas FOR EACH ROW
BEGIN
    IF OLD.Estado <> NEW.Estado THEN
        INSERT INTO Historial_Estado_Reserva (ID_Reserva, Estado_Anterior, Estado_Nuevo, Cambiado_En)
        VALUES (NEW.ID_Reserva, OLD.Estado, NEW.Estado, NOW());
    END IF;
END$$

CREATE TRIGGER trg_habitacion_estado_after_update
AFTER UPDATE ON Habitaciones FOR EACH ROW
BEGIN
    IF OLD.Estado <> NEW.Estado THEN
        INSERT INTO Historial_Estado_Habitacion (ID_Habitacion, Estado_Anterior, Estado_Nuevo, Cambiado_En)
        VALUES (NEW.ID_Habitacion, OLD.Estado, NEW.Estado, NOW());
    END IF;
END$$

CREATE TRIGGER trg_reserva_checkout_total
BEFORE UPDATE ON Reservas FOR EACH ROW
BEGIN
    DECLARE v_noches INT;
    DECLARE v_precio DECIMAL(10,2);
    DECLARE v_servicios DECIMAL(10,2);
    IF NEW.Estado = 'Check-out' AND OLD.Estado = 'Check-in' THEN
        SET v_noches = DATEDIFF(NEW.Fecha_Salida, NEW.Fecha_Entrada);
        SELECT Precio_Base INTO v_precio FROM Tipos_Habitacion t
        INNER JOIN Habitaciones h ON h.ID_Tipo = t.ID_Tipo WHERE h.ID_Habitacion = NEW.ID_Habitacion;
        SELECT COALESCE(SUM(Subtotal), 0) INTO v_servicios FROM Cargos_Reserva
        WHERE ID_Reserva = NEW.ID_Reserva AND Estado = 'Pendiente';
        SET NEW.Total_Real = (v_noches * v_precio) + v_servicios;
        SET NEW.Total_Servicios = v_servicios;
        SET NEW.Hora_CheckOut_Real = NOW();
    END IF;
END$$

CREATE TRIGGER trg_reserva_checkin_habitacion
AFTER UPDATE ON Reservas FOR EACH ROW
BEGIN
    IF NEW.Estado = 'Check-in' AND OLD.Estado <> 'Check-in' THEN
        UPDATE Habitaciones SET Estado = 'Ocupada' WHERE ID_Habitacion = NEW.ID_Habitacion;
    END IF;
END$$

CREATE TRIGGER trg_reserva_checkout_habitacion
AFTER UPDATE ON Reservas FOR EACH ROW
BEGIN
    IF NEW.Estado = 'Check-out' AND OLD.Estado = 'Check-in' THEN
        UPDATE Habitaciones SET Estado = 'Sucia' WHERE ID_Habitacion = NEW.ID_Habitacion;
    END IF;
END$$

CREATE TRIGGER trg_reserva_cancelar_habitacion
AFTER UPDATE ON Reservas FOR EACH ROW
BEGIN
    IF NEW.Estado IN ('Cancelada','No-Show') AND OLD.Estado = 'Check-in' THEN
        UPDATE Habitaciones SET Estado = 'Disponible' WHERE ID_Habitacion = NEW.ID_Habitacion;
    END IF;
END$$

DELIMITER ;

-- ===================== VISTAS =====================
CREATE OR REPLACE VIEW V_Habitaciones_Estado AS
SELECT h.ID_Habitacion, h.Numero_Habitacion, t.Nombre AS Tipo, h.Piso, h.Vista, h.Estado,
    t.Precio_Base, r.ID_Reserva, r.Folio, CONCAT(c.Nombre,' ',c.Apellido) AS Huesped,
    r.Fecha_Entrada, r.Fecha_Salida, DATEDIFF(r.Fecha_Salida, CURDATE()) AS Noches_Restantes
FROM Habitaciones h
INNER JOIN Tipos_Habitacion t ON t.ID_Tipo = h.ID_Tipo
LEFT JOIN Reservas r ON r.ID_Habitacion = h.ID_Habitacion AND r.Estado = 'Check-in'
LEFT JOIN Clientes c ON c.ID_Cliente = r.ID_Cliente
WHERE h.Activa = TRUE;

CREATE OR REPLACE VIEW V_Folio_Reserva AS
SELECT r.ID_Reserva, r.Folio, CONCAT(c.Nombre,' ',c.Apellido) AS Huesped,
    h.Numero_Habitacion, t.Nombre AS Tipo_Habitacion, r.Fecha_Entrada, r.Fecha_Salida,
    DATEDIFF(r.Fecha_Salida, r.Fecha_Entrada) AS Noches, t.Precio_Base AS Precio_Por_Noche,
    (DATEDIFF(r.Fecha_Salida, r.Fecha_Entrada) * t.Precio_Base) AS Subtotal_Hab,
    r.Total_Servicios, r.Total_Estimado, r.Total_Real,
    COALESCE(SUM(p.Monto),0) AS Total_Pagado,
    (COALESCE(r.Total_Real, r.Total_Estimado) - COALESCE(SUM(p.Monto),0)) AS Saldo_Pendiente,
    r.Estado
FROM Reservas r
INNER JOIN Clientes c ON c.ID_Cliente = r.ID_Cliente
INNER JOIN Habitaciones h ON h.ID_Habitacion = r.ID_Habitacion
INNER JOIN Tipos_Habitacion t ON t.ID_Tipo = h.ID_Tipo
LEFT JOIN Pagos p ON p.ID_Reserva = r.ID_Reserva AND p.Estado = 'Aprobado'
GROUP BY r.ID_Reserva;

CREATE OR REPLACE VIEW V_Ocupacion_Hoy AS
SELECT COUNT(*) AS Total_Habitaciones,
    SUM(CASE WHEN h.Estado='Ocupada' THEN 1 ELSE 0 END) AS Ocupadas,
    SUM(CASE WHEN h.Estado='Disponible' THEN 1 ELSE 0 END) AS Disponibles,
    ROUND(SUM(CASE WHEN h.Estado='Ocupada' THEN 1 ELSE 0 END)/COUNT(*)*100,2) AS Ocupacion_Pct,
    ROUND(AVG(CASE WHEN h.Estado='Ocupada' THEN t.Precio_Base END),2) AS ADR,
    ROUND(SUM(CASE WHEN h.Estado='Ocupada' THEN t.Precio_Base ELSE 0 END)/COUNT(*),2) AS RevPAR
FROM Habitaciones h INNER JOIN Tipos_Habitacion t ON t.ID_Tipo = h.ID_Tipo WHERE h.Activa = TRUE;

CREATE OR REPLACE VIEW V_Housekeeping_Pendientes AS
SELECT tl.ID_Tarea, h.Numero_Habitacion, t.Nombre AS Tipo_Habitacion, h.Piso,
    tl.Tipo AS Tipo_Limpieza, tl.Prioridad, tl.Estado,
    CONCAT(e.Nombre,' ',e.Apellido) AS Asignado_A, tl.Asignada_En,
    CASE WHEN r.Fecha_Entrada = CURDATE() THEN TRUE ELSE FALSE END AS Arrival_Hoy
FROM Tareas_Limpieza tl
INNER JOIN Habitaciones h ON h.ID_Habitacion = tl.ID_Habitacion
INNER JOIN Tipos_Habitacion t ON t.ID_Tipo = h.ID_Tipo
LEFT JOIN Empleados e ON e.ID_Empleado = tl.ID_Empleado
LEFT JOIN Reservas r ON r.ID_Habitacion = h.ID_Habitacion AND r.Estado = 'Confirmada' AND r.Fecha_Entrada = CURDATE()
WHERE tl.Estado IN ('Pendiente','En_Proceso')
ORDER BY CASE tl.Prioridad WHEN 'Urgente' THEN 1 WHEN 'Alta' THEN 2 ELSE 3 END, Arrival_Hoy DESC, tl.Asignada_En;

CREATE OR REPLACE VIEW V_Mantenimiento_Alerta AS
SELECT mp.ID_Programa, a.Nombre AS Activo, a.Codigo_Interno, h.Numero_Habitacion,
    mp.Descripcion AS Tarea, mp.Frecuencia_Tipo, mp.Proxima_Ejecucion,
    DATEDIFF(mp.Proxima_Ejecucion, CURDATE()) AS Dias_Para_Vencer,
    CASE WHEN mp.Proxima_Ejecucion < CURDATE() THEN 'VENCIDA'
         WHEN DATEDIFF(mp.Proxima_Ejecucion, CURDATE()) <= 7 THEN 'PROXIMA'
         ELSE 'OK' END AS Estado_Alerta,
    p.Nombre AS Proveedor
FROM Mantenimiento_Programado mp
INNER JOIN Activos_Hotel a ON a.ID_Activo = mp.ID_Activo
LEFT JOIN Habitaciones h ON h.ID_Habitacion = a.ID_Habitacion
LEFT JOIN Proveedores p ON p.ID_Proveedor = mp.ID_Proveedor
WHERE mp.Activo = TRUE ORDER BY mp.Proxima_Ejecucion;
