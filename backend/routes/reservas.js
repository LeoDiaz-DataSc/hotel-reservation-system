const express = require('express');
const router = express.Router();
const db = require('../config/database');

router.get('/', async (req, res, next) => {
    try {
        const query = `
            SELECT r.*, c.Nombre, c.Apellido, h.Tipo, h.Precio_noche
            FROM Reservas r
            JOIN Clientes c ON r.ID_Cliente = c.ID_Cliente
            JOIN Habitaciones h ON r.ID_Habitacion = h.ID_Habitacion
        `;
        const [reservas] = await db.query(query);
        res.json({ success: true, data: reservas });
    } catch (err) {
        next(err);
    }
});

router.post('/', async (req, res, next) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const { ID_Reserva, ID_Cliente, ID_Habitacion, Fecha_Entrada, Fecha_Salida } = req.body;
        
        await connection.query(
            'INSERT INTO Reservas (ID_Reserva, ID_Cliente, ID_Habitacion, Fecha_Entrada, Fecha_Salida) VALUES (?, ?, ?, ?, ?)',
            [ID_Reserva, ID_Cliente, ID_Habitacion, Fecha_Entrada, Fecha_Salida]
        );
        
        // Actualizar estado de habitación
        await connection.query(
            'UPDATE Habitaciones SET Estado = ? WHERE ID_Habitacion = ?',
            ['Ocupada', ID_Habitacion]
        );

        await connection.commit();
        res.status(201).json({ success: true, message: 'Reserva created' });
    } catch (err) {
        await connection.rollback();
        next(err);
    } finally {
        connection.release();
    }
});

module.exports = router;
