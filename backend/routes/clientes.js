const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { verifyToken } = require('../middleware/auth');
const logAction = require('../middleware/audit');

router.use(verifyToken);

// GET /api/clientes
router.get('/', async (req, res, next) => {
    try {
        const { buscar, lealtad } = req.query;
        let query = 'SELECT * FROM Clientes WHERE Activo = TRUE';
        const params = [];
        if (buscar) { query += ' AND (Nombre LIKE ? OR Apellido LIKE ? OR Email LIKE ?)'; params.push(`%${buscar}%`, `%${buscar}%`, `%${buscar}%`); }
        if (lealtad) { query += ' AND Nivel_Lealtad = ?'; params.push(lealtad); }
        query += ' ORDER BY Apellido, Nombre';
        const [rows] = await db.query(query, params);
        res.json({ success: true, data: rows });
    } catch (err) { next(err); }
});

// GET /api/clientes/:id
router.get('/:id', async (req, res, next) => {
    try {
        const [cliente] = await db.query('SELECT * FROM Clientes WHERE ID_Cliente = ?', [req.params.id]);
        if (cliente.length === 0) return res.status(404).json({ success: false, message: 'Cliente no encontrado' });
        const [consentimientos] = await db.query('SELECT * FROM Clientes_Consentimiento WHERE ID_Cliente = ?', [req.params.id]);
        const [preferencias] = await db.query('SELECT * FROM Preferencias_Cliente WHERE ID_Cliente = ?', [req.params.id]);
        const [lealtad] = await db.query('SELECT * FROM Lealtad_Movimientos WHERE ID_Cliente = ? ORDER BY Creado_En DESC LIMIT 20', [req.params.id]);
        const [reservas] = await db.query('SELECT ID_Reserva, Folio, Fecha_Entrada, Fecha_Salida, Estado, Total_Real FROM Reservas WHERE ID_Cliente = ? ORDER BY Fecha_Entrada DESC LIMIT 10', [req.params.id]);

        // Registrar acceso a datos personales (LFPDPPP)
        const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '0.0.0.0';
        await db.query('INSERT INTO Accesos_Datos_Personales (ID_Empleado, ID_Cliente, Motivo, Campos_Accedidos, IP_Origen) VALUES (?, ?, ?, ?, ?)',
            [req.user.id, req.params.id, 'Consulta de perfil completo', 'Nombre,Apellido,Email,Telefono,Documento,RFC', ip]);

        res.json({ success: true, data: { ...cliente[0], consentimientos, preferencias: preferencias[0] || null, lealtad, reservas } });
    } catch (err) { next(err); }
});

// POST /api/clientes
router.post('/', logAction('M05_Clientes', 'CLIENTE_CREADO', 'Clientes'), async (req, res, next) => {
    try {
        const { Nombre, Apellido, Email, Telefono, Documento_Tipo, Documento_Identidad, Nacionalidad, Fecha_Nacimiento, RFC } = req.body;
        const [result] = await db.query(
            'INSERT INTO Clientes (Nombre, Apellido, Email, Telefono, Documento_Tipo, Documento_Identidad, Nacionalidad, Fecha_Nacimiento, RFC) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [Nombre, Apellido, Email, Telefono, Documento_Tipo || 'Pasaporte', Documento_Identidad, Nacionalidad, Fecha_Nacimiento, RFC]
        );
        res.status(201).json({ success: true, id: result.insertId });
    } catch (err) { next(err); }
});

// PUT /api/clientes/:id
router.put('/:id', logAction('M05_Clientes', 'CLIENTE_ACTUALIZADO', 'Clientes'), async (req, res, next) => {
    try {
        const fields = req.body;
        const keys = Object.keys(fields).filter(k => ['Nombre','Apellido','Email','Telefono','Nacionalidad','RFC'].includes(k));
        if (keys.length === 0) return res.status(400).json({ success: false, message: 'No hay campos para actualizar' });
        const sets = keys.map(k => `${k} = ?`).join(', ');
        const vals = keys.map(k => fields[k]);
        await db.query(`UPDATE Clientes SET ${sets} WHERE ID_Cliente = ?`, [...vals, req.params.id]);
        res.json({ success: true, message: 'Cliente actualizado' });
    } catch (err) { next(err); }
});

// GET /api/clientes/:id/lealtad
router.get('/:id/lealtad', async (req, res, next) => {
    try {
        const [movimientos] = await db.query('SELECT * FROM Lealtad_Movimientos WHERE ID_Cliente = ? ORDER BY Creado_En DESC', [req.params.id]);
        const [cliente] = await db.query('SELECT Nivel_Lealtad, Puntos_Lealtad FROM Clientes WHERE ID_Cliente = ?', [req.params.id]);
        res.json({ success: true, data: { nivel: cliente[0]?.Nivel_Lealtad, puntos: cliente[0]?.Puntos_Lealtad, movimientos } });
    } catch (err) { next(err); }
});

module.exports = router;
