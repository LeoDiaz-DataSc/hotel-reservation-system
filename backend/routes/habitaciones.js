const express = require('express');
const router = express.Router();
const db = require('../config/database');

router.get('/', async (req, res, next) => {
    try {
        const [habitaciones] = await db.query('SELECT * FROM Habitaciones');
        res.json({ success: true, data: habitaciones });
    } catch (err) {
        next(err);
    }
});

router.post('/', async (req, res, next) => {
    try {
        const { ID_Habitacion, Tipo, Precio_noche, Estado, Piso } = req.body;
        await db.query(
            'INSERT INTO Habitaciones (ID_Habitacion, Tipo, Precio_noche, Estado, Piso) VALUES (?, ?, ?, ?, ?)',
            [ID_Habitacion, Tipo, Precio_noche, Estado, Piso]
        );
        res.status(201).json({ success: true, message: 'Habitacion created' });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
