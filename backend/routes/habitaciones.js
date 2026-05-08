const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

// GET /api/habitaciones — Vista de estado operativo
router.get('/', async (req, res, next) => {
    try {
        const { estado, piso } = req.query;
        let query = 'SELECT * FROM V_Habitaciones_Estado WHERE 1=1';
        const params = [];
        if (estado) { query += ' AND Estado = ?'; params.push(estado); }
        if (piso)   { query += ' AND Piso = ?'; params.push(piso); }
        query += ' ORDER BY Numero_Habitacion';
        const [rows] = await db.query(query, params);
        res.json({ success: true, data: rows });
    } catch (err) { next(err); }
});

// GET /api/habitaciones/tipos
router.get('/tipos', async (req, res, next) => {
    try {
        const [rows] = await db.query('SELECT * FROM Tipos_Habitacion WHERE Activo = TRUE');
        res.json({ success: true, data: rows });
    } catch (err) { next(err); }
});

// GET /api/habitaciones/amenidades
router.get('/amenidades', async (req, res, next) => {
    try {
        const [rows] = await db.query('SELECT * FROM Amenidades ORDER BY Categoria, Nombre');
        res.json({ success: true, data: rows });
    } catch (err) { next(err); }
});

// GET /api/habitaciones/:id
router.get('/:id', async (req, res, next) => {
    try {
        const [hab] = await db.query('SELECT h.*, t.Nombre AS Tipo, t.Precio_Base FROM Habitaciones h JOIN Tipos_Habitacion t ON t.ID_Tipo = h.ID_Tipo WHERE h.ID_Habitacion = ?', [req.params.id]);
        if (hab.length === 0) return res.status(404).json({ success: false, message: 'Habitación no encontrada' });
        const [amenidades] = await db.query('SELECT a.* FROM Amenidades a JOIN Habitacion_Amenidades ha ON ha.ID_Amenidad = a.ID_Amenidad WHERE ha.ID_Habitacion = ?', [req.params.id]);
        const [historial] = await db.query('SELECT * FROM Historial_Estado_Habitacion WHERE ID_Habitacion = ? ORDER BY Cambiado_En DESC LIMIT 10', [req.params.id]);
        res.json({ success: true, data: { ...hab[0], amenidades, historial } });
    } catch (err) { next(err); }
});

// PUT /api/habitaciones/:id/estado
router.put('/:id/estado', async (req, res, next) => {
    try {
        const { estado, motivo } = req.body;
        await db.query('UPDATE Habitaciones SET Estado = ? WHERE ID_Habitacion = ?', [estado, req.params.id]);
        // Trigger registra historial automáticamente
        if (motivo) {
            await db.query('UPDATE Historial_Estado_Habitacion SET Motivo = ?, ID_Empleado = ? WHERE ID_Habitacion = ? ORDER BY Cambiado_En DESC LIMIT 1',
                [motivo, req.user.id, req.params.id]);
        }
        res.json({ success: true, message: `Estado actualizado a ${estado}` });
    } catch (err) { next(err); }
});

// GET /api/habitaciones/ocupacion/hoy
router.get('/ocupacion/hoy', async (req, res, next) => {
    try {
        const [rows] = await db.query('SELECT * FROM V_Ocupacion_Hoy');
        res.json({ success: true, data: rows[0] });
    } catch (err) { next(err); }
});

module.exports = router;
