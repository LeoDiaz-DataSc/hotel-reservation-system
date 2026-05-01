import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/api',
    timeout: 10000,
});

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

export default api;
