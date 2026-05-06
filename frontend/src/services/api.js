import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
    timeout: 10000,
});

export const login = async (email, contrasena) => {
    const response = await api.post('/auth/login', { email, contrasena });
    return response.data;
};

export const getClientes = async () => {
    const response = await api.get('/clientes');
    return response.data;
};

export const getHabitaciones = async () => {
    const response = await api.get('/habitaciones');
    return response.data;
};

export const getReservas = async () => {
    const response = await api.get('/reservas');
    return response.data;
};

export const createReserva = async (reservaData) => {
    const response = await api.post('/reservas', reservaData);
    return response.data;
};

export const checkoutReserva = async (id) => {
    const response = await api.post(`/reservas/${id}/checkout`);
    return response.data;
};

export const addCargo = async (cargoData) => {
    const response = await api.post('/cargos', cargoData);
    return response.data;
};

export const addPago = async (pagoData) => {
    const response = await api.post('/pagos', pagoData);
    return response.data;
};

export const getHousekeepingTareas = async () => {
    const response = await api.get('/housekeeping/tareas');
    return response.data;
};

export const updateEstadoHabitacion = async (id, nuevoEstado) => {
    const response = await api.put(`/housekeeping/${id}/estado`, { nuevoEstado });
    return response.data;
};

export default api;
