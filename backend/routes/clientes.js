const express = require('express');
const router = express.Router();
const db = require('../config/database');

router.get('/', async (req, res, next) => {
    try {
        const [clientes] = await db.query('SELECT * FROM Clientes');
        res.json({ success: true, data: clientes });
    } catch (err) {
        next(err);
    }
});

router.post('/', async (req, res, next) => {
    try {
        const { ID_Cliente, Nombre, Apellido, Email, Telefono } = req.body;
        await db.query(
            'INSERT INTO Clientes (ID_Cliente, Nombre, Apellido, Email, Telefono) VALUES (?, ?, ?, ?, ?)',
            [ID_Cliente, Nombre, Apellido, Email, Telefono]
        );
        res.status(201).json({ success: true, message: 'Cliente created' });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
