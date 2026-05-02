import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './components/Dashboard/Dashboard';
import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import './index.css';

gsap.registerPlugin(useGSAP);

function Housekeeping() {
  const container = useRef();
  
  useGSAP(() => {
    gsap.from('.page-title, .page-subtitle', { y: -30, opacity: 0, duration: 0.8, stagger: 0.2, ease: 'power3.out' });
    gsap.from('.card', { scale: 0.95, opacity: 0, duration: 0.6, delay: 0.3, ease: 'back.out(1.7)' });
  }, { scope: container });

  return (
    <div className="dashboard-container" ref={container}>
      <h1 className="page-title">Housekeeping (Limpieza)</h1>
      <p className="page-subtitle">Gestión de estados de habitación</p>
      <div className="card">
        <p>Listado de habitaciones "Sucias" que esperan liberación.</p>
        <button style={{ padding: '8px 16px', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '4px', marginTop: '1rem', cursor: 'pointer' }}>
          Marcar Habitación 101 como Disponible
        </button>
      </div>
    </div>
  );
}

function POS() {
  const container = useRef();
  
  useGSAP(() => {
    gsap.from('.page-title, .page-subtitle', { y: -30, opacity: 0, duration: 0.8, stagger: 0.2, ease: 'power3.out' });
    gsap.from('.card', { scale: 0.95, opacity: 0, duration: 0.6, delay: 0.3, ease: 'back.out(1.7)' });
  }, { scope: container });

  return (
    <div className="dashboard-container" ref={container}>
      <h1 className="page-title">Punto de Venta Interno</h1>
      <p className="page-subtitle">Cargos extra a la habitación</p>
      <div className="card">
        <p>Seleccionar Servicio: (Ej. Room Service, Lavandería, Restaurante)</p>
        <p>Asignar a Reserva ID: #</p>
        <button style={{ padding: '8px 16px', background: 'var(--color-success)', color: 'white', border: 'none', borderRadius: '4px', marginTop: '1rem', cursor: 'pointer' }}>
          Registrar Cargo a Habitación
        </button>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-layout" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <header style={{ 
          height: '64px', 
          background: 'var(--color-bg-sidebar)', 
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px'
        }}>
          <div style={{
            fontSize: '1.25rem',
            fontWeight: '700',
            background: 'var(--gradient-primary)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Hotel Enterprise System
          </div>
          <nav style={{ display: 'flex', gap: '20px' }}>
            <Link to="/" style={{ color: 'var(--color-text)', textDecoration: 'none', fontWeight: '500' }}>Dashboard</Link>
            <Link to="/pos" style={{ color: 'var(--color-text)', textDecoration: 'none', fontWeight: '500' }}>Punto de Venta</Link>
            <Link to="/housekeeping" style={{ color: 'var(--color-text)', textDecoration: 'none', fontWeight: '500' }}>Limpieza</Link>
          </nav>
        </header>
        <main className="app-main page-container">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/pos" element={<POS />} />
            <Route path="/housekeeping" element={<Housekeeping />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
