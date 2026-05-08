import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import './index.css';

import Layout from './components/Layout/Layout';
import Login from './components/Login/Login';
import Dashboard from './components/Dashboard/Dashboard';

// Lazy imports para los 11 módulos restantes
import { lazy, Suspense } from 'react';
const ReservasPage     = lazy(() => import('./pages/ReservasPage'));
const HabitacionesPage = lazy(() => import('./pages/HabitacionesPage'));
const HousekeepingPage = lazy(() => import('./pages/HousekeepingPage'));
const ClientesPage     = lazy(() => import('./pages/ClientesPage'));
const ServiciosPage    = lazy(() => import('./pages/ServiciosPage'));
const FacturacionPage  = lazy(() => import('./pages/FacturacionPage'));
const RevenuePage      = lazy(() => import('./pages/RevenuePage'));
const ChannelsPage     = lazy(() => import('./pages/ChannelsPage'));
const ComunicacionesPage = lazy(() => import('./pages/ComunicacionesPage'));
const MantenimientoPage = lazy(() => import('./pages/MantenimientoPage'));
const ReportesPage     = lazy(() => import('./pages/ReportesPage'));

gsap.registerPlugin(useGSAP);

const isAuthenticated = () => !!localStorage.getItem('token');

const PrivateRoute = ({ children }) =>
  isAuthenticated() ? children : <Navigate to="/login" replace />;

const Loading = () => (
  <div className="loading-spinner"><div className="spinner" /></div>
);

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="reservas"       element={<ReservasPage />} />
            <Route path="habitaciones"   element={<HabitacionesPage />} />
            <Route path="housekeeping"   element={<HousekeepingPage />} />
            <Route path="clientes"       element={<ClientesPage />} />
            <Route path="servicios"      element={<ServiciosPage />} />
            <Route path="facturacion"    element={<FacturacionPage />} />
            <Route path="revenue"        element={<RevenuePage />} />
            <Route path="channels"       element={<ChannelsPage />} />
            <Route path="comunicaciones" element={<ComunicacionesPage />} />
            <Route path="mantenimiento"  element={<MantenimientoPage />} />
            <Route path="reportes"       element={<ReportesPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
