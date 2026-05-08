const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { verifyToken, checkRole } = require('../middleware/auth');
const logAction = require('../middleware/audit');

router.use(verifyToken);

// GET /api/mantenimiento/alertas — Vista de mantenimiento próximo
router.get('/alertas', async (req, res, next) => {
    try {
        const [rows] = await db.query('SELECT * FROM V_Mantenimiento_Alerta');
        res.json({ success: true, data: rows });
    } catch (err) { next(err); }
});

// GET /api/mantenimiento/ordenes
router.get('/ordenes', async (req, res, next) => {
    try {
        const { estado, prioridad } = req.query;
        let query = `SELECT om.*, a.Nombre AS Activo, a.Codigo_Interno, h.Numero_Habitacion,
                      CONCAT(es.Nombre,' ',es.Apellido) AS Solicitante, CONCAT(ea.Nombre,' ',ea.Apellido) AS Asignado,
                      p.Nombre AS Proveedor
                      FROM Ordenes_Mantenimiento om
                      LEFT JOIN Activos_Hotel a ON a.ID_Activo = om.ID_Activo
                      LEFT JOIN Habitaciones h ON h.ID_Habitacion = om.ID_Habitacion
                      LEFT JOIN Empleados es ON es.ID_Empleado = om.ID_Empleado_Solicita
                      LEFT JOIN Empleados ea ON ea.ID_Empleado = om.ID_Empleado_Asignado
                      LEFT JOIN Proveedores p ON p.ID_Proveedor = om.ID_Proveedor WHERE 1=1`;
        const params = [];
        if (estado)    { query += ' AND om.Estado = ?'; params.push(estado); }
        if (prioridad) { query += ' AND om.Prioridad = ?'; params.push(prioridad); }
        query += ' ORDER BY CASE om.Prioridad WHEN "Critica" THEN 1 WHEN "Alta" THEN 2 WHEN "Normal" THEN 3 ELSE 4 END, om.Fecha_Apertura DESC';
        const [rows] = await db.query(query, params);
        res.json({ success: true, data: rows });
    } catch (err) { next(err); }
});

// POST /api/mantenimiento/orden
router.post('/orden', logAction('M12_Mantenimiento', 'ORDEN_CREADA', 'Ordenes_Mantenimiento'), async (req, res, next) => {
    try {
        const { ID_Activo, ID_Habitacion, ID_Empleado_Asignado, ID_Proveedor, Tipo, Prioridad, Descripcion, Costo_Estimado } = req.body;
        const [count] = await db.query('SELECT COUNT(*) AS total FROM Ordenes_Mantenimiento');
        const folio = `MNT-${new Date().getFullYear()}-${String(count[0].total + 1).padStart(5, '0')}`;

        const [result] = await db.query(
            `INSERT INTO Ordenes_Mantenimiento (Folio, ID_Activo, ID_Habitacion, ID_Empleado_Solicita, ID_Empleado_Asignado, ID_Proveedor, Tipo, Prioridad, Descripcion, Costo_Estimado)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [folio, ID_Activo, ID_Habitacion, req.user.id, ID_Empleado_Asignado, ID_Proveedor, Tipo || 'Correctivo', Prioridad || 'Normal', Descripcion, Costo_Estimado]
        );

        // Si tiene habitación, bloquearla
        if (ID_Habitacion) {
            await db.query('UPDATE Habitaciones SET Estado = "Mantenimiento" WHERE ID_Habitacion = ?', [ID_Habitacion]);
        }
        res.status(201).json({ success: true, id: result.insertId, folio });
    } catch (err) { next(err); }
});

// PUT /api/mantenimiento/orden/:id/estado
router.put('/orden/:id/estado', logAction('M12_Mantenimiento', 'ORDEN_ACTUALIZADA', 'Ordenes_Mantenimiento'), async (req, res, next) => {
    try {
        const { Estado, Costo_Real, Notas_Cierre } = req.body;
        let query = 'UPDATE Ordenes_Mantenimiento SET Estado = ?';
        const params = [Estado];
        if (Estado === 'En_Proceso') { query += ', Fecha_Inicio = NOW()'; }
        if (Estado === 'Completada') {
            query += ', Fecha_Cierre = NOW(), Costo_Real = ?, Notas_Cierre = ?';
            params.push(Costo_Real || null, Notas_Cierre || null);
        }
        query += ' WHERE ID_Orden = ?';
        params.push(req.params.id);
        await db.query(query, params);

        // Si completada, liberar habitación
        if (Estado === 'Completada') {
            const [orden] = await db.query('SELECT ID_Habitacion FROM Ordenes_Mantenimiento WHERE ID_Orden = ?', [req.params.id]);
            if (orden[0]?.ID_Habitacion) {
                await db.query('UPDATE Habitaciones SET Estado = "Disponible" WHERE ID_Habitacion = ?', [orden[0].ID_Habitacion]);
            }
        }
        res.json({ success: true, message: `Orden actualizada a ${Estado}` });
    } catch (err) { next(err); }
});

// GET /api/mantenimiento/activos
router.get('/activos', async (req, res, next) => {
    try {
        const [rows] = await db.query(
            `SELECT a.*, h.Numero_Habitacion, p.Nombre AS Proveedor FROM Activos_Hotel a
             LEFT JOIN Habitaciones h ON h.ID_Habitacion = a.ID_Habitacion
             LEFT JOIN Proveedores p ON p.ID_Proveedor = a.ID_Proveedor ORDER BY a.Categoria, a.Nombre`
        );
        res.json({ success: true, data: rows });
    } catch (err) { next(err); }
});

// GET /api/mantenimiento/proveedores
router.get('/proveedores', async (req, res, next) => {
    try {
        const [rows] = await db.query('SELECT * FROM Proveedores WHERE Activo = TRUE ORDER BY Nombre');
        res.json({ success: true, data: rows });
    } catch (err) { next(err); }
});

// GET /api/mantenimiento/programado
router.get('/programado', async (req, res, next) => {
    try {
        const [rows] = await db.query(
            `SELECT mp.*, a.Nombre AS Activo, a.Codigo_Interno, p.Nombre AS Proveedor
             FROM Mantenimiento_Programado mp
             JOIN Activos_Hotel a ON a.ID_Activo = mp.ID_Activo
             LEFT JOIN Proveedores p ON p.ID_Proveedor = mp.ID_Proveedor
             WHERE mp.Activo = TRUE ORDER BY mp.Proxima_Ejecucion`
        );
        res.json({ success: true, data: rows });
    } catch (err) { next(err); }
});

module.exports = router;
