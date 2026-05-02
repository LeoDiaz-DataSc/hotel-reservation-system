const express = require('express');
const router = express.Router();
const db = require('../config/database');
const jwt = require('jsonwebtoken');

router.post('/login', async (req, res, next) => {
    try {
        const { email, contrasena } = req.body;
        const [users] = await db.query(
            'SELECT ID_Empleado, Nombre, Rol FROM Empleados WHERE Email = ? AND Contrasena = SHA2(?, 256) AND Activo = TRUE',
            [email, contrasena]
        );

        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

        if (users.length === 0) {
            await db.query('INSERT INTO Audit_Logs (Accion, Detalle, Direccion_IP) VALUES (?, ?, ?)', 
                ['LOGIN_FAILED', `Attempt for email: ${email}`, ip]);
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const user = users[0];
        
        const token = jwt.sign(
            { id: user.ID_Empleado, rol: user.Rol, email: email },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        await db.query('INSERT INTO Audit_Logs (ID_Usuario, Accion, Detalle, Direccion_IP) VALUES (?, ?, ?, ?)', 
            [user.ID_Empleado, 'LOGIN_SUCCESS', `User ${email} logged in`, ip]);

        res.json({ success: true, token, user });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
