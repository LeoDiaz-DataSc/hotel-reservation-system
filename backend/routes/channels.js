const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { verifyToken, checkRole } = require('../middleware/auth');

router.use(verifyToken);

// GET /api/channels — Listar canales OTA
router.get('/', async (req, res, next) => {
    try {
        const [rows] = await db.query('SELECT * FROM Canales_OTA ORDER BY Nombre');
        res.json({ success: true, data: rows });
    } catch (err) { next(err); }
});

// GET /api/channels/disponibilidad — Disponibilidad por canal y fecha
router.get('/disponibilidad', async (req, res, next) => {
    try {
        const { fecha } = req.query;
        const [rows] = await db.query(
            `SELECT dc.*, co.Nombre AS Canal, th.Nombre AS Tipo_Hab
             FROM Disponibilidad_Canal dc
             JOIN Canales_OTA co ON co.ID_Canal = dc.ID_Canal
             JOIN Tipos_Habitacion th ON th.ID_Tipo = dc.ID_Tipo_Hab
             WHERE dc.Fecha = ? ORDER BY co.Nombre, th.Nombre`,
            [fecha || new Date().toISOString().split('T')[0]]
        );
        res.json({ success: true, data: rows });
    } catch (err) { next(err); }
});

// PUT /api/channels/disponibilidad/:id
router.put('/disponibilidad/:id', checkRole('Admin', 'Revenue'), async (req, res, next) => {
    try {
        const { Cupo_Total, Precio_Canal, Stop_Sell } = req.body;
        await db.query(
            'UPDATE Disponibilidad_Canal SET Cupo_Total = ?, Precio_Canal = ?, Stop_Sell = ?, Ultima_Sync = NOW() WHERE ID_Disp = ?',
            [Cupo_Total, Precio_Canal, Stop_Sell || false, req.params.id]
        );
        res.json({ success: true, message: 'Disponibilidad actualizada' });
    } catch (err) { next(err); }
});

// POST /api/channels/sync — Simular sincronización con OTA
router.post('/sync', checkRole('Admin', 'Revenue'), async (req, res, next) => {
    try {
        await db.query('UPDATE Disponibilidad_Canal SET Ultima_Sync = NOW()');
        res.json({ success: true, message: 'Sincronización completada (simulada)' });
    } catch (err) { next(err); }
});

module.exports = router;
