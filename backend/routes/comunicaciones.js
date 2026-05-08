const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

// GET /api/comunicaciones/plantillas
router.get('/plantillas', async (req, res, next) => {
    try {
        const [rows] = await db.query('SELECT * FROM Plantillas_Comunicacion WHERE Activa = TRUE ORDER BY Evento, Canal');
        res.json({ success: true, data: rows });
    } catch (err) { next(err); }
});

// GET /api/comunicaciones/enviadas
router.get('/enviadas', async (req, res, next) => {
    try {
        const { canal, estado } = req.query;
        let query = `SELECT ce.*, pc.Nombre AS Plantilla, CONCAT(c.Nombre,' ',c.Apellido) AS Cliente
                      FROM Comunicaciones_Enviadas ce
                      JOIN Plantillas_Comunicacion pc ON pc.ID_Plantilla = ce.ID_Plantilla
                      JOIN Clientes c ON c.ID_Cliente = ce.ID_Cliente WHERE 1=1`;
        const params = [];
        if (canal)  { query += ' AND ce.Canal = ?'; params.push(canal); }
        if (estado) { query += ' AND ce.Estado = ?'; params.push(estado); }
        query += ' ORDER BY ce.Fecha_Envio DESC LIMIT 100';
        const [rows] = await db.query(query, params);
        res.json({ success: true, data: rows });
    } catch (err) { next(err); }
});

// POST /api/comunicaciones/enviar — Envío simulado
router.post('/enviar', async (req, res, next) => {
    try {
        const { ID_Plantilla, ID_Cliente, ID_Reserva } = req.body;
        const [plantilla] = await db.query('SELECT * FROM Plantillas_Comunicacion WHERE ID_Plantilla = ?', [ID_Plantilla]);
        if (plantilla.length === 0) return res.status(404).json({ success: false, message: 'Plantilla no encontrada' });
        const [cliente] = await db.query('SELECT Email, Telefono FROM Clientes WHERE ID_Cliente = ?', [ID_Cliente]);
        if (cliente.length === 0) return res.status(404).json({ success: false, message: 'Cliente no encontrado' });

        const destinatario = plantilla[0].Canal === 'Email' ? cliente[0].Email : cliente[0].Telefono;
        const [result] = await db.query(
            'INSERT INTO Comunicaciones_Enviadas (ID_Plantilla, ID_Cliente, ID_Reserva, Canal, Destinatario, Estado, Fecha_Envio) VALUES (?, ?, ?, ?, ?, "Enviado", NOW())',
            [ID_Plantilla, ID_Cliente, ID_Reserva, plantilla[0].Canal, destinatario]
        );
        res.status(201).json({ success: true, id: result.insertId, message: `Comunicación enviada a ${destinatario} (simulada)` });
    } catch (err) { next(err); }
});

module.exports = router;
