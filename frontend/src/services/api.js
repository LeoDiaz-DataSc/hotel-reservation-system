import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 15000,
});

// JWT interceptor automático
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// Redirect a login si 401
api.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// M01 Auth
export const login = async (email, contrasena) => (await api.post('/auth/login', { email, contrasena })).data;
export const logout = async () => (await api.post('/auth/logout')).data;
export const getMe = async () => (await api.get('/auth/me')).data;

// M02 Reservas
export const getReservas = async (params) => (await api.get('/reservas', { params })).data;
export const getReserva = async (id) => (await api.get(`/reservas/${id}`)).data;
export const createReserva = async (d) => (await api.post('/reservas', d)).data;
export const checkIn = async (id) => (await api.post(`/reservas/${id}/checkin`)).data;
export const checkOut = async (id) => (await api.post(`/reservas/${id}/checkout`)).data;
export const cancelReserva = async (id, motivo) => (await api.post(`/reservas/${id}/cancel`, { motivo })).data;

// M03 Habitaciones
export const getHabitaciones = async (params) => (await api.get('/habitaciones', { params })).data;
export const getHabitacion = async (id) => (await api.get(`/habitaciones/${id}`)).data;
export const getTiposHabitacion = async () => (await api.get('/habitaciones/tipos')).data;
export const getAmenidades = async () => (await api.get('/habitaciones/amenidades')).data;
export const updateEstadoHabitacion = async (id, estado, motivo) => (await api.put(`/habitaciones/${id}/estado`, { estado, motivo })).data;
export const getOcupacionHoy = async () => (await api.get('/habitaciones/ocupacion/hoy')).data;

// M04 Servicios / POS
export const getServicios = async (params) => (await api.get('/servicios', { params })).data;
export const addCargo = async (d) => (await api.post('/servicios/cargo', d)).data;
export const getCargos = async (idReserva) => (await api.get(`/servicios/cargos/${idReserva}`)).data;
export const updateCargo = async (id, estado) => (await api.put(`/servicios/cargo/${id}/estado`, { estado })).data;
export const getMinibar = async (idHabitacion) => (await api.get(`/servicios/minibar/${idHabitacion}`)).data;

// M05 Clientes
export const getClientes = async (params) => (await api.get('/clientes', { params })).data;
export const getCliente = async (id) => (await api.get(`/clientes/${id}`)).data;
export const createCliente = async (d) => (await api.post('/clientes', d)).data;
export const updateCliente = async (id, d) => (await api.put(`/clientes/${id}`, d)).data;
export const getLealtad = async (id) => (await api.get(`/clientes/${id}/lealtad`)).data;

// M06 Facturación
export const getPagos = async (idReserva) => (await api.get(`/facturacion/pagos/${idReserva}`)).data;
export const addPago = async (d) => (await api.post('/facturacion/pago', d)).data;
export const getFacturas = async (params) => (await api.get('/facturacion/facturas', { params })).data;
export const createFactura = async (d) => (await api.post('/facturacion/factura', d)).data;

// M07 Housekeeping
export const getHousekeepingPendientes = async () => (await api.get('/housekeeping')).data;
export const getHousekeepingTodas = async (params) => (await api.get('/housekeeping/todas', { params })).data;
export const createTarea = async (d) => (await api.post('/housekeeping', d)).data;
export const iniciarTarea = async (id) => (await api.put(`/housekeeping/${id}/iniciar`)).data;
export const completarTarea = async (id, d) => (await api.put(`/housekeeping/${id}/completar`, d)).data;
export const verificarTarea = async (id) => (await api.put(`/housekeeping/${id}/verificar`)).data;
export const getChecklists = async () => (await api.get('/housekeeping/checklists')).data;

// M08 Reportes
export const getOcupacionKPIs = async () => (await api.get('/reportes/ocupacion')).data;
export const getMetricasDiarias = async (params) => (await api.get('/reportes/metricas', { params })).data;
export const getAuditLogs = async (params) => (await api.get('/reportes/audit', { params })).data;
export const generarMetricas = async () => (await api.post('/reportes/generar-metricas')).data;

// M09 Channels
export const getCanales = async () => (await api.get('/channels')).data;
export const getDisponibilidad = async (fecha) => (await api.get('/channels/disponibilidad', { params: { fecha } })).data;
export const syncChannels = async () => (await api.post('/channels/sync')).data;

// M10 Revenue
export const getPlanes = async () => (await api.get('/revenue/planes')).data;
export const getCalendario = async (params) => (await api.get('/revenue/calendario', { params })).data;
export const updateTarifa = async (id, d) => (await api.put(`/revenue/calendario/${id}`, d)).data;
export const getReglas = async () => (await api.get('/revenue/reglas')).data;
export const createRegla = async (d) => (await api.post('/revenue/regla', d)).data;
export const calcularPrecio = async (params) => (await api.get('/revenue/precio', { params })).data;

// M11 Comunicaciones
export const getPlantillas = async () => (await api.get('/comunicaciones/plantillas')).data;
export const getComunicacionesEnviadas = async (params) => (await api.get('/comunicaciones/enviadas', { params })).data;
export const enviarComunicacion = async (d) => (await api.post('/comunicaciones/enviar', d)).data;

// M12 Mantenimiento
export const getAlertasMantenimiento = async () => (await api.get('/mantenimiento/alertas')).data;
export const getOrdenesMantenimiento = async (params) => (await api.get('/mantenimiento/ordenes', { params })).data;
export const createOrden = async (d) => (await api.post('/mantenimiento/orden', d)).data;
export const updateOrden = async (id, d) => (await api.put(`/mantenimiento/orden/${id}/estado`, d)).data;
export const getActivos = async () => (await api.get('/mantenimiento/activos')).data;
export const getProveedores = async () => (await api.get('/mantenimiento/proveedores')).data;
export const getProgramado = async () => (await api.get('/mantenimiento/programado')).data;

export default api;
