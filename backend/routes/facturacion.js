const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { verifyToken } = require('../middleware/auth');
const logAction = require('../middleware/audit');

router.use(verifyToken);

// GET /api/facturacion/pagos/:idReserva
router.get('/pagos/:idReserva', async (req, res, next) => {
    try {
        const [rows] = await db.query('SELECT * FROM Pagos WHERE ID_Reserva = ? ORDER BY Fecha_Pago', [req.params.idReserva]);
        const totalPagado = rows.reduce((sum, r) => sum + parseFloat(r.Monto), 0);
        res.json({ success: true, data: rows, totalPagado });
    } catch (err) { next(err); }
});

// POST /api/facturacion/pago — Registrar pago (PCI-DSS: no almacena PAN ni CVV)
router.post('/pago', logAction('M06_Facturacion', 'PAGO_REGISTRADO', 'Pagos'), async (req, res, next) => {
    try {
        const { ID_Reserva, Monto, Metodo_Pago, Tipo_Pago, Ultimos_4, Marca_Tarjeta, Token_Gateway, Referencia_Auth } = req.body;
        const [result] = await db.query(
            `INSERT INTO Pagos (ID_Reserva, ID_Empleado, Monto, Metodo_Pago, Tipo_Pago, Ultimos_4, Marca_Tarjeta, Token_Gateway, Referencia_Auth)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [ID_Reserva, req.user.id, Monto, Metodo_Pago, Tipo_Pago || 'Liquidacion', Ultimos_4, Marca_Tarjeta, Token_Gateway, Referencia_Auth]
        );
        res.status(201).json({ success: true, id: result.insertId, message: 'Pago registrado' });
    } catch (err) { next(err); }
});

// GET /api/facturacion/facturas — Listado de facturas
router.get('/facturas', async (req, res, next) => {
    try {
        const { estado } = req.query;
        let query = 'SELECT * FROM Facturas';
        const params = [];
        if (estado) { query += ' WHERE Estado = ?'; params.push(estado); }
        query += ' ORDER BY Fecha_Emision DESC';
        const [rows] = await db.query(query, params);
        res.json({ success: true, data: rows });
    } catch (err) { next(err); }
});

// POST /api/facturacion/factura — Crear factura CFDI 4.0
router.post('/factura', logAction('M06_Facturacion', 'FACTURA_EMITIDA', 'Facturas'), async (req, res, next) => {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();
        const { ID_Reserva, RFC_Receptor, Nombre_Receptor, Regimen_Fiscal_Receptor, CP_Receptor, Uso_CFDI, Forma_Pago_SAT, Metodo_Pago_SAT, conceptos } = req.body;

        // Generar folio fiscal
        const [count] = await conn.query('SELECT COUNT(*) AS total FROM Facturas WHERE Serie = "A"');
        const folioFiscal = String(count[0].total + 1).padStart(6, '0');

        const subtotal = conceptos.reduce((s, c) => s + c.Importe - (c.Descuento || 0), 0);
        const iva = subtotal * 0.16;
        const total = subtotal + iva;

        const [result] = await conn.query(
            `INSERT INTO Facturas (ID_Reserva, Serie, Folio_Fiscal, RFC_Emisor, Razon_Social_Emisor, Regimen_Fiscal_Emisor,
             RFC_Receptor, Nombre_Receptor, Regimen_Fiscal_Receptor, CP_Receptor, Uso_CFDI, Forma_Pago_SAT, Metodo_Pago_SAT,
             Subtotal, IVA, Total) VALUES (?, 'A', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [ID_Reserva, folioFiscal, 'XAXX010101000', 'Hotel Enterprise SA de CV', '601',
             RFC_Receptor, Nombre_Receptor, Regimen_Fiscal_Receptor, CP_Receptor,
             Uso_CFDI || 'G03', Forma_Pago_SAT || '04', Metodo_Pago_SAT || 'PUE', subtotal, iva, total]
        );

        for (const c of conceptos) {
            await conn.query(
                `INSERT INTO Conceptos_Factura (ID_Factura, Descripcion, Clave_SAT, Clave_Unidad_SAT, Cantidad, Valor_Unitario, Descuento, Importe)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [result.insertId, c.Descripcion, c.Clave_SAT || '90111600', c.Clave_Unidad || 'E48', c.Cantidad || 1, c.Valor_Unitario, c.Descuento || 0, c.Importe]
            );
        }

        await conn.commit();
        res.status(201).json({ success: true, id: result.insertId, folioFiscal: `A-${folioFiscal}`, total });
    } catch (err) { await conn.rollback(); next(err); }
    finally { conn.release(); }
});

module.exports = router;
