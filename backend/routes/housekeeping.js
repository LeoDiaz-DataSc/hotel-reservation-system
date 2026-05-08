const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { verifyToken } = require('../middleware/auth');
const logAction = require('../middleware/audit');

router.use(verifyToken);

// GET /api/housekeeping — Vista de tareas pendientes
router.get('/', async (req, res, next) => {
    try {
        const [rows] = await db.query('SELECT * FROM V_Housekeeping_Pendientes');
        res.json({ success: true, data: rows });
    } catch (err) { next(err); }
});

// GET /api/housekeeping/todas
router.get('/todas', async (req, res, next) => {
    try {
        const { estado, tipo } = req.query;
        let query = `SELECT tl.*, h.Numero_Habitacion, CONCAT(e.Nombre,' ',e.Apellido) AS Asignado_A
                      FROM Tareas_Limpieza tl
                      JOIN Habitaciones h ON h.ID_Habitacion = tl.ID_Habitacion
                      LEFT JOIN Empleados e ON e.ID_Empleado = tl.ID_Empleado WHERE 1=1`;
        const params = [];
        if (estado) { query += ' AND tl.Estado = ?'; params.push(estado); }
        if (tipo) { query += ' AND tl.Tipo = ?'; params.push(tipo); }
        query += ' ORDER BY tl.Asignada_En DESC';
        const [rows] = await db.query(query, params);
        res.json({ success: true, data: rows });
    } catch (err) { next(err); }
});

// POST /api/housekeeping — Crear tarea
router.post('/', logAction('M07_Housekeeping', 'TAREA_CREADA', 'Tareas_Limpieza'), async (req, res, next) => {
    try {
        const { ID_Habitacion, ID_Reserva, ID_Empleado, Tipo, Prioridad, Notas } = req.body;
        const [result] = await db.query(
            'INSERT INTO Tareas_Limpieza (ID_Habitacion, ID_Reserva, ID_Empleado, Tipo, Prioridad, Notas) VALUES (?, ?, ?, ?, ?, ?)',
            [ID_Habitacion, ID_Reserva, ID_Empleado, Tipo || 'Rutina', Prioridad || 'Normal', Notas]
        );
        res.status(201).json({ success: true, id: result.insertId });
    } catch (err) { next(err); }
});

// PUT /api/housekeeping/:id/iniciar
router.put('/:id/iniciar', async (req, res, next) => {
    try {
        await db.query('UPDATE Tareas_Limpieza SET Estado = "En_Proceso", Iniciada_En = NOW() WHERE ID_Tarea = ?', [req.params.id]);
        // Cambiar estado de habitación a "En Limpieza"
        const [tarea] = await db.query('SELECT ID_Habitacion FROM Tareas_Limpieza WHERE ID_Tarea = ?', [req.params.id]);
        if (tarea.length > 0) await db.query('UPDATE Habitaciones SET Estado = "En Limpieza" WHERE ID_Habitacion = ?', [tarea[0].ID_Habitacion]);
        res.json({ success: true, message: 'Tarea iniciada' });
    } catch (err) { next(err); }
});

// PUT /api/housekeeping/:id/completar
router.put('/:id/completar', logAction('M07_Housekeeping', 'TAREA_COMPLETADA', 'Tareas_Limpieza'), async (req, res, next) => {
    try {
        const { Tiempo_Min, Notas } = req.body;
        await db.query('UPDATE Tareas_Limpieza SET Estado = "Completada", Completada_En = NOW(), Tiempo_Min = ?, Notas = CONCAT(COALESCE(Notas,""), ?) WHERE ID_Tarea = ?',
            [Tiempo_Min || null, Notas ? `\n${Notas}` : '', req.params.id]);
        res.json({ success: true, message: 'Tarea completada — pendiente de verificación' });
    } catch (err) { next(err); }
});

// PUT /api/housekeeping/:id/verificar
router.put('/:id/verificar', logAction('M07_Housekeeping', 'TAREA_VERIFICADA', 'Tareas_Limpieza'), async (req, res, next) => {
    try {
        await db.query('UPDATE Tareas_Limpieza SET Estado = "Verificada", Verificada_Por = ? WHERE ID_Tarea = ?', [req.user.id, req.params.id]);
        // Liberar habitación
        const [tarea] = await db.query('SELECT ID_Habitacion FROM Tareas_Limpieza WHERE ID_Tarea = ?', [req.params.id]);
        if (tarea.length > 0) await db.query('UPDATE Habitaciones SET Estado = "Disponible" WHERE ID_Habitacion = ?', [tarea[0].ID_Habitacion]);
        res.json({ success: true, message: 'Tarea verificada — habitación disponible' });
    } catch (err) { next(err); }
});

// GET /api/housekeeping/checklists — Plantillas
router.get('/checklists', async (req, res, next) => {
    try {
        const [plantillas] = await db.query('SELECT * FROM Checklist_Plantillas WHERE Activa = TRUE');
        for (const p of plantillas) {
            const [items] = await db.query('SELECT * FROM Checklist_Items_Plantilla WHERE ID_Plantilla = ? ORDER BY Orden', [p.ID_Plantilla]);
            p.items = items;
        }
        res.json({ success: true, data: plantillas });
    } catch (err) { next(err); }
});

module.exports = router;
