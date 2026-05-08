const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { verifyToken, checkRole } = require('../middleware/auth');

router.use(verifyToken);
router.use(checkRole('Admin', 'Revenue', 'Supervisor'));

// GET /api/revenue/planes — Planes de tarifa
router.get('/planes', async (req, res, next) => {
    try {
        const [rows] = await db.query('SELECT * FROM Planes_Tarifa ORDER BY Codigo');
        res.json({ success: true, data: rows });
    } catch (err) { next(err); }
});

// GET /api/revenue/calendario — Tarifas calendario
router.get('/calendario', async (req, res, next) => {
    try {
        const { desde, hasta, tipo } = req.query;
        let query = `SELECT tc.*, th.Nombre AS Tipo_Hab, pt.Codigo AS Plan_Codigo
                      FROM Tarifas_Calendario tc
                      JOIN Tipos_Habitacion th ON th.ID_Tipo = tc.ID_Tipo_Hab
                      JOIN Planes_Tarifa pt ON pt.ID_Plan = tc.ID_Plan WHERE 1=1`;
        const params = [];
        if (desde) { query += ' AND tc.Fecha >= ?'; params.push(desde); }
        if (hasta) { query += ' AND tc.Fecha <= ?'; params.push(hasta); }
        if (tipo)  { query += ' AND tc.ID_Tipo_Hab = ?'; params.push(tipo); }
        query += ' ORDER BY tc.Fecha, th.Nombre';
        const [rows] = await db.query(query, params);
        res.json({ success: true, data: rows });
    } catch (err) { next(err); }
});

// PUT /api/revenue/calendario/:id
router.put('/calendario/:id', async (req, res, next) => {
    try {
        const { Precio, Disponible, Estancia_Minima, Stop_Sell } = req.body;
        await db.query(
            'UPDATE Tarifas_Calendario SET Precio=?, Disponible=?, Estancia_Minima=?, Stop_Sell=? WHERE ID_Tarifa=?',
            [Precio, Disponible, Estancia_Minima || 1, Stop_Sell || false, req.params.id]
        );
        res.json({ success: true, message: 'Tarifa actualizada' });
    } catch (err) { next(err); }
});

// GET /api/revenue/reglas — Reglas de precio dinámico
router.get('/reglas', async (req, res, next) => {
    try {
        const [rows] = await db.query('SELECT r.*, th.Nombre AS Tipo_Hab FROM Reglas_Precio r LEFT JOIN Tipos_Habitacion th ON th.ID_Tipo = r.ID_Tipo_Hab ORDER BY r.Prioridad DESC');
        res.json({ success: true, data: rows });
    } catch (err) { next(err); }
});

// POST /api/revenue/regla
router.post('/regla', async (req, res, next) => {
    try {
        const { Nombre, Tipo, ID_Tipo_Hab, Fecha_Inicio, Fecha_Fin, Dias_Semana, Ajuste_Tipo, Ajuste_Valor, Prioridad } = req.body;
        const [result] = await db.query(
            'INSERT INTO Reglas_Precio (Nombre, Tipo, ID_Tipo_Hab, Fecha_Inicio, Fecha_Fin, Dias_Semana, Ajuste_Tipo, Ajuste_Valor, Prioridad) VALUES (?,?,?,?,?,?,?,?,?)',
            [Nombre, Tipo, ID_Tipo_Hab, Fecha_Inicio, Fecha_Fin, Dias_Semana, Ajuste_Tipo, Ajuste_Valor, Prioridad || 0]
        );
        res.status(201).json({ success: true, id: result.insertId });
    } catch (err) { next(err); }
});

// GET /api/revenue/precio — Calcular precio dinámico para una fecha y tipo
router.get('/precio', async (req, res, next) => {
    try {
        const { fecha, tipo, plan } = req.query;
        const [base] = await db.query('SELECT Precio_Base FROM Tipos_Habitacion WHERE ID_Tipo = ?', [tipo]);
        if (base.length === 0) return res.status(404).json({ success: false, message: 'Tipo no encontrado' });
        let precio = parseFloat(base[0].Precio_Base);

        const [reglas] = await db.query(
            'SELECT * FROM Reglas_Precio WHERE Activa=TRUE AND Fecha_Inicio<=? AND Fecha_Fin>=? AND (ID_Tipo_Hab IS NULL OR ID_Tipo_Hab=?) ORDER BY Prioridad DESC',
            [fecha, fecha, tipo]
        );
        for (const r of reglas) {
            if (r.Ajuste_Tipo === 'Porcentaje') precio += precio * (parseFloat(r.Ajuste_Valor) / 100);
            else precio += parseFloat(r.Ajuste_Valor);
        }
        res.json({ success: true, data: { precioBase: base[0].Precio_Base, precioFinal: Math.round(precio * 100) / 100, reglasAplicadas: reglas.length } });
    } catch (err) { next(err); }
});

module.exports = router;
