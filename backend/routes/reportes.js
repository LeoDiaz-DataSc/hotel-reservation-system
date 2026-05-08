const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { verifyToken, checkRole } = require('../middleware/auth');

router.use(verifyToken);

// GET /api/reportes/ocupacion — KPIs de hoy
router.get('/ocupacion', async (req, res, next) => {
    try {
        const [rows] = await db.query('SELECT * FROM V_Ocupacion_Hoy');
        res.json({ success: true, data: rows[0] });
    } catch (err) { next(err); }
});

// GET /api/reportes/metricas — Métricas diarias históricas
router.get('/metricas', async (req, res, next) => {
    try {
        const { dias } = req.query;
        const [rows] = await db.query(
            'SELECT * FROM Metricas_Diarias ORDER BY Fecha DESC LIMIT ?', [parseInt(dias) || 30]
        );
        res.json({ success: true, data: rows });
    } catch (err) { next(err); }
});

// GET /api/reportes/audit — Audit logs con filtros
router.get('/audit', checkRole('Admin', 'Supervisor'), async (req, res, next) => {
    try {
        const { modulo, resultado, desde, hasta, limit } = req.query;
        let query = `SELECT al.*, CONCAT(e.Nombre,' ',e.Apellido) AS Empleado
                      FROM Audit_Logs al LEFT JOIN Empleados e ON e.ID_Empleado = al.ID_Empleado WHERE 1=1`;
        const params = [];
        if (modulo)    { query += ' AND al.Modulo = ?'; params.push(modulo); }
        if (resultado) { query += ' AND al.Resultado = ?'; params.push(resultado); }
        if (desde)     { query += ' AND al.Fecha_Hora >= ?'; params.push(desde); }
        if (hasta)     { query += ' AND al.Fecha_Hora <= ?'; params.push(hasta); }
        query += ' ORDER BY al.Fecha_Hora DESC LIMIT ?';
        params.push(parseInt(limit) || 100);
        const [rows] = await db.query(query, params);
        res.json({ success: true, data: rows });
    } catch (err) { next(err); }
});

// GET /api/reportes/accesos-datos — LFPDPPP access log
router.get('/accesos-datos', checkRole('Admin'), async (req, res, next) => {
    try {
        const [rows] = await db.query(
            `SELECT adp.*, CONCAT(e.Nombre,' ',e.Apellido) AS Empleado, CONCAT(c.Nombre,' ',c.Apellido) AS Cliente
             FROM Accesos_Datos_Personales adp
             JOIN Empleados e ON e.ID_Empleado = adp.ID_Empleado
             JOIN Clientes c ON c.ID_Cliente = adp.ID_Cliente ORDER BY adp.Fecha_Hora DESC LIMIT 100`
        );
        res.json({ success: true, data: rows });
    } catch (err) { next(err); }
});

// POST /api/reportes/generar-metricas — Calcula y guarda snapshot del día
router.post('/generar-metricas', checkRole('Admin', 'Supervisor'), async (req, res, next) => {
    try {
        const [ocu] = await db.query('SELECT * FROM V_Ocupacion_Hoy');
        const [checkins] = await db.query('SELECT COUNT(*) AS total FROM Reservas WHERE Estado="Check-in" AND DATE(Hora_CheckIn_Real) = CURDATE()');
        const [checkouts] = await db.query('SELECT COUNT(*) AS total FROM Reservas WHERE Estado="Check-out" AND DATE(Hora_CheckOut_Real) = CURDATE()');
        const [cancels] = await db.query('SELECT COUNT(*) AS total FROM Reservas WHERE Estado="Cancelada" AND DATE(Actualizado_En) = CURDATE()');
        const o = ocu[0];
        const ingHab = parseFloat(o.ADR || 0) * parseInt(o.Ocupadas || 0);
        const [svcTotal] = await db.query('SELECT COALESCE(SUM(Subtotal),0) AS total FROM Cargos_Reserva WHERE DATE(Fecha_Cargo) = CURDATE() AND Estado != "Cancelado"');

        await db.query(
            `INSERT INTO Metricas_Diarias (Fecha, Habitaciones_Total, Habitaciones_Ocupadas, Ocupacion_Pct, ADR, RevPAR, Ingresos_Habitacion, Ingresos_Servicios, Ingresos_Total, Check_Ins, Check_Outs, Cancelaciones)
             VALUES (CURDATE(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE Habitaciones_Ocupadas=VALUES(Habitaciones_Ocupadas), Ocupacion_Pct=VALUES(Ocupacion_Pct), ADR=VALUES(ADR), RevPAR=VALUES(RevPAR), Ingresos_Habitacion=VALUES(Ingresos_Habitacion), Ingresos_Servicios=VALUES(Ingresos_Servicios), Ingresos_Total=VALUES(Ingresos_Total)`,
            [o.Total_Habitaciones, o.Ocupadas, o.Ocupacion_Pct, o.ADR || 0, o.RevPAR || 0, ingHab, svcTotal[0].total, ingHab + parseFloat(svcTotal[0].total), checkins[0].total, checkouts[0].total, cancels[0].total]
        );
        res.json({ success: true, message: 'Métricas del día generadas' });
    } catch (err) { next(err); }
});

module.exports = router;
