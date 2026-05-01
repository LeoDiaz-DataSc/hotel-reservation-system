const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Obtener habitaciones que necesitan atención
router.get('/tareas', async (req, res, next) => {
    try {
        const [habitaciones] = await db.query(
            "SELECT * FROM Habitaciones WHERE Estado IN ('Sucia', 'En Limpieza', 'Mantenimiento')"
        );
        res.json({ success: true, data: habitaciones });
    } catch (err) {
        next(err);
    }
});

// Cambiar estado de habitación
router.put('/:id/estado', async (req, res, next) => {
    try {
        const { nuevoEstado } = req.body;
        await db.query(
            'UPDATE Habitaciones SET Estado = ? WHERE ID_Habitacion = ?',
            [nuevoEstado, req.params.id]
        );
        res.json({ success: true, message: `Estado actualizado a ${nuevoEstado}` });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
