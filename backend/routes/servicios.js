const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { verifyToken } = require('../middleware/auth');
const logAction = require('../middleware/audit');

router.use(verifyToken);

// GET /api/servicios — Catálogo
router.get('/', async (req, res, next) => {
    try {
        const { categoria } = req.query;
        let query = 'SELECT * FROM Servicios WHERE Activo = TRUE';
        const params = [];
        if (categoria) { query += ' AND Categoria = ?'; params.push(categoria); }
        query += ' ORDER BY Categoria, Nombre_Servicio';
        const [rows] = await db.query(query, params);
        res.json({ success: true, data: rows });
    } catch (err) { next(err); }
});

// POST /api/servicios/cargo — Cargar servicio a folio
router.post('/cargo', logAction('M04_Servicios', 'CARGO_CREADO', 'Cargos_Reserva'), async (req, res, next) => {
    try {
        const { ID_Reserva, ID_Servicio, Cantidad, Descuento, Notas, Aprobado_Por } = req.body;
        const [svc] = await db.query('SELECT Precio FROM Servicios WHERE ID_Servicio = ?', [ID_Servicio]);
        if (svc.length === 0) return res.status(404).json({ success: false, message: 'Servicio no encontrado' });

        const precio = svc[0].Precio;
        const desc = Descuento || 0;
        const subtotal = (precio * (Cantidad || 1)) - desc;

        const [result] = await db.query(
            `INSERT INTO Cargos_Reserva (ID_Reserva, ID_Servicio, ID_Empleado, Cantidad, Precio_Unitario, Descuento, Subtotal, Estado, Notas, Aprobado_Por)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [ID_Reserva, ID_Servicio, req.user.id, Cantidad || 1, precio, desc, subtotal, desc > 0 ? 'Cortesía' : 'Pendiente', Notas, Aprobado_Por]
        );
        res.status(201).json({ success: true, id: result.insertId, subtotal });
    } catch (err) { next(err); }
});

// GET /api/servicios/cargos/:idReserva — Cargos de una reserva
router.get('/cargos/:idReserva', async (req, res, next) => {
    try {
        const [rows] = await db.query(
            `SELECT cr.*, s.Nombre_Servicio, s.Categoria, CONCAT(e.Nombre,' ',e.Apellido) AS Empleado
             FROM Cargos_Reserva cr JOIN Servicios s ON s.ID_Servicio = cr.ID_Servicio
             LEFT JOIN Empleados e ON e.ID_Empleado = cr.ID_Empleado WHERE cr.ID_Reserva = ? ORDER BY cr.Fecha_Cargo`,
            [req.params.idReserva]
        );
        const total = rows.reduce((sum, r) => sum + parseFloat(r.Subtotal), 0);
        res.json({ success: true, data: rows, total });
    } catch (err) { next(err); }
});

// PUT /api/servicios/cargo/:id/estado
router.put('/cargo/:id/estado', async (req, res, next) => {
    try {
        const { estado } = req.body;
        await db.query('UPDATE Cargos_Reserva SET Estado = ? WHERE ID_Cargo = ?', [estado, req.params.id]);
        res.json({ success: true, message: `Cargo actualizado a ${estado}` });
    } catch (err) { next(err); }
});

// GET /api/servicios/minibar/:idHabitacion
router.get('/minibar/:idHabitacion', async (req, res, next) => {
    try {
        const [rows] = await db.query(
            `SELECT imi.*, s.Nombre_Servicio, s.Precio, im.Ultima_Revision
             FROM Inventario_Minibar im
             JOIN Inventario_Minibar_Items imi ON imi.ID_Inventario = im.ID_Inventario
             JOIN Servicios s ON s.ID_Servicio = imi.ID_Servicio
             WHERE im.ID_Habitacion = ?`, [req.params.idHabitacion]
        );
        res.json({ success: true, data: rows });
    } catch (err) { next(err); }
});

module.exports = router;
