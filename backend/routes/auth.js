const express = require('express');
const router = express.Router();
const db = require('../config/database');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const { verifyToken } = require('../middleware/auth');
const logAction = require('../middleware/audit');

// POST /api/auth/login
router.post('/login', logAction('M01_Auth', 'LOGIN_ATTEMPT', 'Empleados'), async (req, res, next) => {
    try {
        const { email, contrasena } = req.body;
        if (!email || !contrasena) {
            return res.status(400).json({ success: false, message: 'Email y contraseña son requeridos' });
        }

        const [users] = await db.query(
            'SELECT ID_Empleado, Nombre, Apellido, Email, Contrasena_Hash, Rol, Activo, Intentos_Fallidos, Bloqueado_Hasta, Requiere_2FA FROM Empleados WHERE Email = ?',
            [email]
        );

        const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '0.0.0.0';

        if (users.length === 0) {
            await db.query(
                `INSERT INTO Audit_Logs (Modulo, Accion, Detalle, Direccion_IP, Resultado) VALUES (?, ?, ?, ?, ?)`,
                ['M01_Auth', 'LOGIN_FAILED', JSON.stringify({ email, reason: 'user_not_found' }), ip, 'Denegado']
            );
            return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
        }

        const user = users[0];

        // Verificar bloqueo por intentos fallidos
        if (user.Bloqueado_Hasta && new Date(user.Bloqueado_Hasta) > new Date()) {
            return res.status(423).json({ success: false, message: 'Cuenta bloqueada temporalmente. Intente más tarde.' });
        }

        if (!user.Activo) {
            return res.status(403).json({ success: false, message: 'Cuenta desactivada' });
        }

        // Verificar contraseña — soporta bcrypt Y SHA2 (migración progresiva)
        let passwordValid = false;
        const isBcrypt = user.Contrasena_Hash.startsWith('$2');

        if (isBcrypt) {
            passwordValid = await bcrypt.compare(contrasena, user.Contrasena_Hash);
        } else {
            // Legacy SHA2 — comparar y migrar
            const sha2Hash = crypto.createHash('sha256').update(contrasena).digest('hex');
            passwordValid = sha2Hash === user.Contrasena_Hash;
            if (passwordValid) {
                // Migrar a bcrypt automáticamente
                const bcryptHash = await bcrypt.hash(contrasena, 12);
                await db.query('UPDATE Empleados SET Contrasena_Hash = ? WHERE ID_Empleado = ?', [bcryptHash, user.ID_Empleado]);
            }
        }

        if (!passwordValid) {
            const intentos = user.Intentos_Fallidos + 1;
            const bloqueado = intentos >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null; // 15 min lockout
            await db.query(
                'UPDATE Empleados SET Intentos_Fallidos = ?, Bloqueado_Hasta = ? WHERE ID_Empleado = ?',
                [intentos, bloqueado, user.ID_Empleado]
            );
            await db.query(
                `INSERT INTO Audit_Logs (ID_Empleado, Modulo, Accion, Detalle, Direccion_IP, Resultado) VALUES (?, ?, ?, ?, ?, ?)`,
                [user.ID_Empleado, 'M01_Auth', 'LOGIN_FAILED', JSON.stringify({ email, intentos }), ip, 'Denegado']
            );
            return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
        }

        // Login exitoso — resetear intentos
        await db.query(
            'UPDATE Empleados SET Intentos_Fallidos = 0, Bloqueado_Hasta = NULL, Ultimo_Login = NOW(), IP_Ultimo_Login = ? WHERE ID_Empleado = ?',
            [ip, user.ID_Empleado]
        );

        // Generar JWT
        const token = jwt.sign(
            { id: user.ID_Empleado, email: user.Email, rol: user.Rol, nombre: `${user.Nombre} ${user.Apellido}` },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        // Registrar sesión
        const sessionId = uuidv4();
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
        await db.query(
            `INSERT INTO Sesiones_Auth (ID_Sesion, ID_Empleado, Token_Hash, IP_Origen, User_Agent, Expira_En) VALUES (?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 8 HOUR))`,
            [sessionId, user.ID_Empleado, tokenHash, ip, req.headers['user-agent']]
        );

        await db.query(
            `INSERT INTO Audit_Logs (ID_Empleado, Modulo, Accion, Tabla_Afectada, Detalle, Direccion_IP, Resultado) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [user.ID_Empleado, 'M01_Auth', 'LOGIN_OK', 'Empleados', JSON.stringify({ email }), ip, 'Exito']
        );

        res.json({
            success: true,
            token,
            user: { id: user.ID_Empleado, nombre: user.Nombre, apellido: user.Apellido, email: user.Email, rol: user.Rol }
        });
    } catch (err) { next(err); }
});

// POST /api/auth/logout
router.post('/logout', verifyToken, async (req, res, next) => {
    try {
        const token = req.headers['authorization'].replace('Bearer ', '');
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
        await db.query('UPDATE Sesiones_Auth SET Activa = FALSE WHERE Token_Hash = ?', [tokenHash]);
        res.json({ success: true, message: 'Sesión cerrada' });
    } catch (err) { next(err); }
});

// GET /api/auth/me — Perfil del usuario autenticado
router.get('/me', verifyToken, async (req, res, next) => {
    try {
        const [users] = await db.query(
            'SELECT ID_Empleado, Nombre, Apellido, Email, Rol, Ultimo_Login, IP_Ultimo_Login FROM Empleados WHERE ID_Empleado = ?',
            [req.user.id]
        );
        if (users.length === 0) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        res.json({ success: true, data: users[0] });
    } catch (err) { next(err); }
});

module.exports = router;
