const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { verifyToken } = require('../middleware/auth');
const logAction = require('../middleware/audit');

router.use(verifyToken);

// GET /api/reservas — Listado con vista V_Folio_Reserva
router.get('/', async (req, res, next) => {
    try {
        const { estado, desde, hasta } = req.query;
        let query = 'SELECT * FROM V_Folio_Reserva WHERE 1=1';
        const params = [];
        if (estado) { query += ' AND Estado = ?'; params.push(estado); }
        if (desde)  { query += ' AND Fecha_Entrada >= ?'; params.push(desde); }
        if (hasta)  { query += ' AND Fecha_Salida <= ?'; params.push(hasta); }
        query += ' ORDER BY Fecha_Entrada DESC';
        const [rows] = await db.query(query, params);
        res.json({ success: true, data: rows });
    } catch (err) { next(err); }
});

// GET /api/reservas/:id
router.get('/:id', async (req, res, next) => {
    try {
        const [rows] = await db.query('SELECT * FROM V_Folio_Reserva WHERE ID_Reserva = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ success: false, message: 'Reserva no encontrada' });
        const [cargos] = await db.query('SELECT cr.*, s.Nombre_Servicio FROM Cargos_Reserva cr JOIN Servicios s ON s.ID_Servicio = cr.ID_Servicio WHERE cr.ID_Reserva = ?', [req.params.id]);
        const [pagos] = await db.query('SELECT * FROM Pagos WHERE ID_Reserva = ?', [req.params.id]);
        const [historial] = await db.query('SELECT h.*, CONCAT(e.Nombre," ",e.Apellido) AS Empleado FROM Historial_Estado_Reserva h LEFT JOIN Empleados e ON e.ID_Empleado = h.ID_Empleado WHERE h.ID_Reserva = ? ORDER BY h.Cambiado_En', [req.params.id]);
        res.json({ success: true, data: { ...rows[0], cargos, pagos, historial } });
    } catch (err) { next(err); }
});

// POST /api/reservas — Crear reserva
router.post('/', logAction('M02_Reservas', 'RESERVA_CREADA', 'Reservas'), async (req, res, next) => {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();
        const { ID_Cliente, ID_Habitacion, ID_Plan, ID_Canal, Fecha_Entrada, Fecha_Salida, Adultos, Menores, Observaciones } = req.body;

        // Generar folio
        const [countRes] = await conn.query('SELECT COUNT(*) AS total FROM Reservas');
        const folio = `HTL-${new Date().getFullYear()}-${String(countRes[0].total + 1).padStart(5, '0')}`;

        // Calcular total estimado
        const [hab] = await conn.query('SELECT t.Precio_Base FROM Habitaciones h JOIN Tipos_Habitacion t ON t.ID_Tipo = h.ID_Tipo WHERE h.ID_Habitacion = ?', [ID_Habitacion]);
        const noches = Math.ceil((new Date(Fecha_Salida) - new Date(Fecha_Entrada)) / (1000 * 60 * 60 * 24));
        const totalEstimado = hab[0].Precio_Base * noches;

        const [result] = await conn.query(
            `INSERT INTO Reservas (Folio, ID_Cliente, ID_Habitacion, ID_Empleado_Registro, ID_Plan, ID_Canal, Fecha_Entrada, Fecha_Salida, Adultos, Menores, Total_Estimado, Observaciones)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [folio, ID_Cliente, ID_Habitacion, req.user.id, ID_Plan || null, ID_Canal || null, Fecha_Entrada, Fecha_Salida, Adultos || 1, Menores || 0, totalEstimado, Observaciones || null]
        );

        await conn.commit();
        res.status(201).json({ success: true, id: result.insertId, folio, totalEstimado });
    } catch (err) { await conn.rollback(); next(err); }
    finally { conn.release(); }
});

// POST /api/reservas/:id/checkin
router.post('/:id/checkin', logAction('M02_Reservas', 'CHECKIN_OK', 'Reservas'), async (req, res, next) => {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();
        const [reserva] = await conn.query('SELECT * FROM Reservas WHERE ID_Reserva = ? AND Estado IN ("Pendiente","Confirmada")', [req.params.id]);
        if (reserva.length === 0) return res.status(400).json({ success: false, message: 'Reserva no válida para check-in' });

        await conn.query('UPDATE Reservas SET Estado = "Check-in", Hora_CheckIn_Real = NOW() WHERE ID_Reserva = ?', [req.params.id]);
        // Trigger automático cambia habitación a Ocupada
        await conn.commit();
        res.json({ success: true, message: 'Check-in completado', data: { ID_Reserva: parseInt(req.params.id) } });
    } catch (err) { await conn.rollback(); next(err); }
    finally { conn.release(); }
});

// POST /api/reservas/:id/checkout
router.post('/:id/checkout', logAction('M02_Reservas', 'CHECKOUT_OK', 'Reservas'), async (req, res, next) => {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();
        const [reserva] = await conn.query('SELECT * FROM Reservas WHERE ID_Reserva = ? AND Estado = "Check-in"', [req.params.id]);
        if (reserva.length === 0) return res.status(400).json({ success: false, message: 'Reserva no válida para check-out' });

        // Trigger calcula Total_Real y cambia habitación a Sucia
        await conn.query('UPDATE Reservas SET Estado = "Check-out" WHERE ID_Reserva = ?', [req.params.id]);
        const [updated] = await conn.query('SELECT Total_Real, Total_Servicios FROM Reservas WHERE ID_Reserva = ?', [req.params.id]);

        await conn.commit();
        res.json({ success: true, message: 'Check-out completado', data: { ...updated[0], ID_Reserva: parseInt(req.params.id) } });
    } catch (err) { await conn.rollback(); next(err); }
    finally { conn.release(); }
});

// POST /api/reservas/:id/cancel
router.post('/:id/cancel', logAction('M02_Reservas', 'RESERVA_CANCELADA', 'Reservas'), async (req, res, next) => {
    try {
        const { motivo } = req.body;
        await db.query('UPDATE Reservas SET Estado = "Cancelada", Motivo_Cancelacion = ? WHERE ID_Reserva = ?', [motivo || 'Sin motivo especificado', req.params.id]);
        res.json({ success: true, message: 'Reserva cancelada' });
    } catch (err) { next(err); }
});

module.exports = router;
