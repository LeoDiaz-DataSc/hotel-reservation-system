const express = require('express');
const router = express.Router();
const db = require('../config/database');

router.post('/', async (req, res, next) => {
    try {
        const { ID_Reserva, ID_Servicio, ID_Empleado, Cantidad } = req.body;
        
        // Obtenemos el precio del servicio
        const [servicios] = await db.query('SELECT Precio FROM Servicios WHERE ID_Servicio = ?', [ID_Servicio]);
        if (servicios.length === 0) return res.status(404).json({ error: 'Servicio no encontrado' });
        
        const subtotal = servicios[0].Precio * Cantidad;

        await db.query(
            'INSERT INTO Cargos_Reserva (ID_Reserva, ID_Servicio, ID_Empleado, Cantidad, Subtotal) VALUES (?, ?, ?, ?, ?)',
            [ID_Reserva, ID_Servicio, ID_Empleado, Cantidad, subtotal]
        );

        res.status(201).json({ success: true, subtotal });
    } catch (err) {
        next(err);
    }
});

router.get('/reserva/:id', async (req, res, next) => {
    try {
        const [cargos] = await db.query(`
            SELECT c.*, s.Nombre_Servicio 
            FROM Cargos_Reserva c 
            JOIN Servicios s ON c.ID_Servicio = s.ID_Servicio 
            WHERE c.ID_Reserva = ?
        `, [req.params.id]);
        res.json({ success: true, data: cargos });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
