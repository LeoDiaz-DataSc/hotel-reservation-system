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

// Check-in
router.post('/', async (req, res, next) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const { ID_Cliente, ID_Habitacion, ID_Empleado_Registro, Fecha_Entrada, Fecha_Salida, Total_Estimado } = req.body;
        
        const [result] = await connection.query(
            'INSERT INTO Reservas (ID_Cliente, ID_Habitacion, ID_Empleado_Registro, Fecha_Entrada, Fecha_Salida, Total_Estimado, Estado) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [ID_Cliente, ID_Habitacion, ID_Empleado_Registro, Fecha_Entrada, Fecha_Salida, Total_Estimado, 'Check-in']
        );
        
        // Actualizar estado de habitación
        await connection.query(
            'UPDATE Habitaciones SET Estado = ? WHERE ID_Habitacion = ?',
            ['Ocupada', ID_Habitacion]
        );

        await connection.commit();
        res.status(201).json({ success: true, id: result.insertId });
    } catch (err) {
        await connection.rollback();
        next(err);
    } finally {
        connection.release();
    }
});

// Advanced Check-out Transaction
router.post('/:id/checkout', async (req, res, next) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const ID_Reserva = req.params.id;

        // 1. Get Reserva details
        const [reservas] = await connection.query('SELECT ID_Habitacion FROM Reservas WHERE ID_Reserva = ?', [ID_Reserva]);
        if (reservas.length === 0) throw new Error('Reserva no encontrada');
        const ID_Habitacion = reservas[0].ID_Habitacion;

        // 2. Mark Reserva as Check-out
        await connection.query("UPDATE Reservas SET Estado = 'Check-out' WHERE ID_Reserva = ?", [ID_Reserva]);

        // 3. Send Room to Housekeeping
        await connection.query("UPDATE Habitaciones SET Estado = 'Sucia' WHERE ID_Habitacion = ?", [ID_Habitacion]);

        await connection.commit();
        res.json({ success: true, message: 'Check-out completado. Habitación enviada a limpieza.' });
    } catch (err) {
        await connection.rollback();
        next(err);
    } finally {
        connection.release();
    }
});

module.exports = router;
