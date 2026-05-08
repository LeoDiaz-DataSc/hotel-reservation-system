import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';

const PAGE_TITLES = {
  '/':              { title: 'Dashboard', subtitle: 'Vista general del hotel' },
  '/reservas':      { title: 'Reservas', subtitle: 'Gestión de reservas y folios' },
  '/habitaciones':  { title: 'Habitaciones', subtitle: 'Estado operativo y tipos' },
  '/housekeeping':  { title: 'Housekeeping', subtitle: 'Tareas de limpieza e inspección' },
  '/clientes':      { title: 'Clientes', subtitle: 'CRM y programa de lealtad' },
  '/servicios':     { title: 'Punto de Venta', subtitle: 'Cargos y servicios a folio' },
  '/facturacion':   { title: 'Facturación', subtitle: 'Pagos y emisión CFDI 4.0' },
  '/revenue':       { title: 'Revenue Management', subtitle: 'Tarifas, calendario y reglas de precio' },
  '/channels':      { title: 'Channel Manager', subtitle: 'OTAs, disponibilidad y sincronización' },
  '/comunicaciones':{ title: 'Comunicaciones', subtitle: 'Plantillas y envíos multicanal' },
  '/mantenimiento': { title: 'Mantenimiento', subtitle: 'Activos, órdenes y preventivo' },
  '/reportes':      { title: 'Reportes & Auditoría', subtitle: 'ISO 27001 — Audit logs y métricas' },
};

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const meta = PAGE_TITLES[location.pathname] || { title: 'Hotel Enterprise', subtitle: '' };
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const now = new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="app-layout">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />

      <div className={`main-content${collapsed ? ' collapsed' : ''}`}>
        {/* Top Header */}
        <header className="top-header">
          <div>
            <div className="header-title">{meta.title}</div>
            <div className="header-subtitle">{meta.subtitle}</div>
          </div>
          <div className="header-actions">
            <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>{now}</span>
            <div style={{
              padding: '6px 14px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
              borderRadius: 'var(--radius-md)', fontSize: '0.78rem', color: 'var(--color-primary-hover)'
            }}>
              🔒 {user.rol || 'Rol'}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
