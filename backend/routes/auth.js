const express = require('express');
const router = express.Router();
const db = require('../config/database');

router.post('/login', async (req, res, next) => {
    try {
        const { email, contrasena } = req.body;
        const [users] = await db.query(
            'SELECT ID_Empleado, Nombre, Rol FROM Empleados WHERE Email = ? AND Contrasena = SHA2(?, 256) AND Activo = TRUE',
            [email, contrasena]
        );

        if (users.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        res.json({ success: true, user: users[0] });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
