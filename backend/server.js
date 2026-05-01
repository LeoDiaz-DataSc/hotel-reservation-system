require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/clientes', require('./routes/clientes'));
app.use('/api/habitaciones', require('./routes/habitaciones'));
app.use('/api/reservas', require('./routes/reservas'));

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Reservas API is running' });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!', details: err.message });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
