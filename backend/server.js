require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ===================== 12 MÓDULOS =====================
app.use('/api/auth',           require('./routes/auth'));           // M01 — Autenticación
app.use('/api/reservas',       require('./routes/reservas'));       // M02 — Reservas
app.use('/api/habitaciones',   require('./routes/habitaciones'));   // M03 — Habitaciones
app.use('/api/servicios',      require('./routes/servicios'));      // M04 — Servicios / POS
app.use('/api/clientes',       require('./routes/clientes'));       // M05 — Clientes (CRM)
app.use('/api/facturacion',    require('./routes/facturacion'));    // M06 — Facturación
app.use('/api/housekeeping',   require('./routes/housekeeping'));   // M07 — Housekeeping
app.use('/api/reportes',       require('./routes/reportes'));       // M08 — Reportes / Auditoría
app.use('/api/channels',       require('./routes/channels'));       // M09 — Channel Manager
app.use('/api/revenue',        require('./routes/revenue'));        // M10 — Revenue Management
app.use('/api/comunicaciones', require('./routes/comunicaciones')); // M11 — Comunicaciones
app.use('/api/mantenimiento',  require('./routes/mantenimiento')); // M12 — Mant. Preventivo

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', version: '2.0.0', modules: 12, message: 'Hotel Enterprise API running' });
});

// Error handler global
app.use((err, req, res, next) => {
    console.error(`[${new Date().toISOString()}]`, err.stack);
    res.status(500).json({ success: false, error: 'Error interno del servidor', details: process.env.NODE_ENV === 'development' ? err.message : undefined });
});

app.listen(PORT, () => {
    console.log(`🏨 Hotel Enterprise API v2.0 running on port ${PORT} — 12 modules loaded`);
});
