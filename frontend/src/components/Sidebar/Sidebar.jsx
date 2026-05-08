import { useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

const NAV = [
  { section: 'OPERACIONES' },
  { to: '/',                 icon: '📊', label: 'Dashboard',      id: 'nav-dashboard' },
  { to: '/reservas',         icon: '📅', label: 'Reservas',       id: 'nav-reservas' },
  { to: '/habitaciones',     icon: '🛏️', label: 'Habitaciones',   id: 'nav-habitaciones' },
  { to: '/housekeeping',     icon: '🧹', label: 'Housekeeping',   id: 'nav-housekeeping' },
  { section: 'COMERCIAL' },
  { to: '/clientes',         icon: '👥', label: 'Clientes',       id: 'nav-clientes' },
  { to: '/servicios',        icon: '🛎️', label: 'Punto de Venta', id: 'nav-servicios' },
  { to: '/facturacion',      icon: '💳', label: 'Facturación',    id: 'nav-facturacion' },
  { section: 'ESTRATEGIA' },
  { to: '/revenue',          icon: '📈', label: 'Revenue Mgmt',   id: 'nav-revenue' },
  { to: '/channels',         icon: '🌐', label: 'Channel Mgr',    id: 'nav-channels' },
  { to: '/comunicaciones',   icon: '📨', label: 'Comunicaciones', id: 'nav-comunicaciones' },
  { section: 'ADMINISTRACIÓN' },
  { to: '/mantenimiento',    icon: '🔧', label: 'Mantenimiento',  id: 'nav-mantenimiento' },
  { to: '/reportes',         icon: '🔍', label: 'Reportes',       id: 'nav-reportes' },
];

export default function Sidebar({ collapsed, onToggle }) {
  const container = useRef();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useGSAP(() => {
    gsap.from('.sidebar-item', {
      x: -20, opacity: 0, duration: 0.4, stagger: 0.04, ease: 'power2.out', delay: 0.1
    });
  }, { scope: container });

  const handleLogout = () => {
    gsap.to('.sidebar', { x: -20, opacity: 0, duration: 0.3 });
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const initials = user.nombre
    ? user.nombre.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : '??';

  return (
    <nav className={`sidebar${collapsed ? ' collapsed' : ''}`} ref={container}>
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">🏨</div>
        {!collapsed && (
          <div>
            <div className="sidebar-logo-text">Hotel Enterprise</div>
            <div className="sidebar-logo-sub">Sistema v2.0</div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="sidebar-nav">
        {NAV.map((item, idx) => {
          if (item.section) {
            return !collapsed
              ? <div key={idx} className="sidebar-section-title">{item.section}</div>
              : <div key={idx} style={{ height: 8 }} />;
          }
          return (
            <NavLink
              key={item.to}
              to={item.to}
              id={item.id}
              className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`}
              title={collapsed ? item.label : undefined}
              end={item.to === '/'}
            >
              <span className="sidebar-item-icon">{item.icon}</span>
              {!collapsed && <span className="sidebar-item-label">{item.label}</span>}
            </NavLink>
          );
        })}
      </div>

      {/* Footer con usuario */}
      <div className="sidebar-footer">
        <button
          className="sidebar-user"
          style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text)' }}
          onClick={onToggle}
          title={collapsed ? 'Expandir menú' : 'Colapsar menú'}
        >
          <div className="sidebar-user-avatar">{initials}</div>
          {!collapsed && (
            <div style={{ textAlign: 'left', overflow: 'hidden' }}>
              <div className="sidebar-user-name">{user.nombre || 'Usuario'}</div>
              <div className="sidebar-user-role">{user.rol || ''}</div>
            </div>
          )}
        </button>
        {!collapsed && (
          <button
            className="btn btn-danger btn-sm"
            style={{ width: '100%', marginTop: 8, justifyContent: 'center' }}
            onClick={handleLogout}
            id="btn-logout"
          >
            🚪 Cerrar sesión
          </button>
        )}
      </div>
    </nav>
  );
}
