const db = require('../config/database');

/**
 * Middleware de auditoría enterprise — ISO 27001 (A.12.4)
 * Registra en Audit_Logs: módulo, acción, tabla, diff JSON, resultado
 * 
 * Uso: logAction('M02_Reservas', 'RESERVA_CREADA', 'Reservas')
 */
const logAction = (modulo, accion, tablaAfectada = null) => {
    return async (req, res, next) => {
        const originalJson = res.json;
        res.json = function (data) {
            const userId = req.user ? req.user.id : null;
            const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '0.0.0.0';
            const userAgent = req.headers['user-agent'] || null;
            const resultado = res.statusCode >= 200 && res.statusCode < 300 ? 'Exito' : 'Error';
            const idRegistro = data?.id || data?.data?.ID_Reserva || data?.data?.ID_Habitacion || null;

            const detalle = JSON.stringify({
                method: req.method,
                path: req.originalUrl,
                body: req.body ? Object.keys(req.body).reduce((acc, k) => {
                    // No loggear contraseñas
                    if (k.toLowerCase().includes('contrasena') || k.toLowerCase().includes('password')) {
                        acc[k] = '***';
                    } else {
                        acc[k] = req.body[k];
                    }
                    return acc;
                }, {}) : {},
                params: req.params
            });

            db.query(
                `INSERT INTO Audit_Logs (ID_Empleado, Modulo, Accion, Tabla_Afectada, ID_Registro, Detalle, Direccion_IP, User_Agent, Resultado)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [userId, modulo, accion, tablaAfectada, idRegistro, detalle, ip, userAgent, resultado]
            ).catch(err => console.error('Audit log error:', err.message));

            return originalJson.call(this, data);
        };
        next();
    };
};

module.exports = logAction;
