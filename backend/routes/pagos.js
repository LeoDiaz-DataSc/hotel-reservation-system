const express = require('express');
const router = express.Router();
const db = require('../config/database');

router.post('/', async (req, res, next) => {
    try {
        const { ID_Reserva, ID_Empleado, Monto, Metodo_Pago, Tipo_Pago } = req.body;
        
        await db.query(
            'INSERT INTO Pagos (ID_Reserva, ID_Empleado, Monto, Metodo_Pago, Tipo_Pago) VALUES (?, ?, ?, ?, ?)',
            [ID_Reserva, ID_Empleado, Monto, Metodo_Pago, Tipo_Pago]
        );

        res.status(201).json({ success: true, message: 'Pago registrado' });
    } catch (err) {
        next(err);
    }
});

router.get('/reserva/:id', async (req, res, next) => {
    try {
        const [pagos] = await db.query('SELECT * FROM Pagos WHERE ID_Reserva = ?', [req.params.id]);
        res.json({ success: true, data: pagos });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
