import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getOcupacionKPIs, getMetricasDiarias, getHousekeepingPendientes, getAlertasMantenimiento } from '../../services/api';

const KPI = ({ icon, label, value, sub, color, trend }) => (
  <div className="stat-card">
    <div className="stat-icon" style={{ background: `linear-gradient(135deg, ${color}22, ${color}11)`, border: `1px solid ${color}33` }}>
      <span>{icon}</span>
    </div>
    <div>
      <div className="stat-value" style={{ color }}>{value}</div>
      <div className="stat-label">{label}</div>
      {trend !== undefined && (
        <div className={`stat-trend ${trend >= 0 ? 'up' : 'down'}`}>
          {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}% vs ayer
        </div>
      )}
      {sub && <div className="stat-label" style={{ marginTop: 2 }}>{sub}</div>}
    </div>
  </div>
);

export default function Dashboard() {
  const [kpis, setKpis] = useState(null);
  const [metricas, setMetricas] = useState([]);
  const [housekeeping, setHousekeeping] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const container = useRef();
  const navigate = useNavigate();

  useGSAP(() => {
    if (!loading) {
      gsap.from('.stat-card', { y: 24, opacity: 0, duration: 0.5, stagger: 0.08, ease: 'power2.out' });
      gsap.from('.card', { y: 16, opacity: 0, duration: 0.5, stagger: 0.06, delay: 0.3, ease: 'power2.out' });
    }
  }, { scope: container, dependencies: [loading] });

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [kpiRes, metRes, hkRes, altRes] = await Promise.allSettled([
          getOcupacionKPIs(), getMetricasDiarias({ dias: 7 }), getHousekeepingPendientes(), getAlertasMantenimiento()
        ]);
        if (kpiRes.status === 'fulfilled') setKpis(kpiRes.value.data);
        if (metRes.status === 'fulfilled') setMetricas(metRes.value.data.slice().reverse());
        if (hkRes.status === 'fulfilled') setHousekeeping(hkRes.value.data.slice(0, 5));
        if (altRes.status === 'fulfilled') setAlertas(altRes.value.data.filter(a => a.Estado_Alerta !== 'OK').slice(0, 4));
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  const priorColor = { Urgente: '#ef4444', Alta: '#f59e0b', Normal: '#6366f1' };
  const alertColor = { VENCIDA: '#ef4444', PROXIMA: '#f59e0b', OK: '#10b981' };

  return (
    <div ref={container}>
      <div className="page-title">Dashboard Ejecutivo</div>
      <div className="page-subtitle">Resumen operativo en tiempo real — Hotel Enterprise v2.0</div>

      {/* KPI Cards */}
      <div className="grid-4 animate-stagger" style={{ marginBottom: 24 }}>
        <KPI icon="🏨" label="Ocupación"     value={kpis ? `${kpis.Ocupacion_Pct}%` : '—'} sub={`${kpis?.Ocupadas || 0}/${kpis?.Total_Habitaciones || 0} hab`} color="#6366f1" trend={5} />
        <KPI icon="💰" label="ADR"            value={kpis ? `$${Number(kpis.ADR||0).toLocaleString()}` : '—'} sub="Tarifa promedio" color="#10b981" trend={3} />
        <KPI icon="📈" label="RevPAR"         value={kpis ? `$${Number(kpis.RevPAR||0).toLocaleString()}` : '—'} sub="Revenue por hab" color="#06b6d4" trend={-2} />
        <KPI icon="🧹" label="Housekeeping"   value={housekeeping.length} sub="Tareas pendientes" color="#f59e0b" />
      </div>

      {/* Gráficas */}
      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">📊 Ocupación — Últimos 7 días</h2>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={metricas}>
              <defs>
                <linearGradient id="gOcup" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="Fecha" tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={v => v?.slice(5)} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} unit="%" domain={[0, 100]} />
              <Tooltip contentStyle={{ background: '#111d30', border: '1px solid #1e293b', fontSize: 12 }} formatter={v => [`${v}%`, 'Ocupación']} />
              <Area type="monotone" dataKey="Ocupacion_Pct" stroke="#6366f1" fill="url(#gOcup)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">💵 Ingresos — Últimos 7 días</h2>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={metricas}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="Fecha" tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={v => v?.slice(5)} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ background: '#111d30', border: '1px solid #1e293b', fontSize: 12 }} formatter={v => [`$${Number(v).toLocaleString()}`, '']} />
              <Bar dataKey="Ingresos_Habitacion" fill="#6366f1" radius={[4,4,0,0]} name="Habitación" />
              <Bar dataKey="Ingresos_Servicios"  fill="#06b6d4" radius={[4,4,0,0]} name="Servicios" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Alertas */}
      <div className="grid-2">
        {/* Housekeeping pendiente */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">🧹 Housekeeping Urgente</h2>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/housekeeping')}>Ver todo</button>
          </div>
          {housekeeping.length === 0
            ? <div className="empty-state"><div className="empty-icon">✅</div><div className="empty-title">Sin tareas pendientes</div></div>
            : housekeeping.map((t, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < housekeeping.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: `${priorColor[t.Prioridad]}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>
                  {t.Tipo_Limpieza === 'Salida' ? '🚪' : t.Tipo_Limpieza === 'Profunda' ? '🧽' : '🧹'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>Hab. {t.Numero_Habitacion} — {t.Tipo_Limpieza}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{t.Asignado_A || 'Sin asignar'} {t.Arrival_Hoy ? '• 🚨 Arrival hoy' : ''}</div>
                </div>
                <span className="badge" style={{ background: `${priorColor[t.Prioridad]}22`, color: priorColor[t.Prioridad] }}>{t.Prioridad}</span>
              </div>
            ))
          }
        </div>

        {/* Alertas Mantenimiento */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">🔧 Alertas Mantenimiento</h2>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/mantenimiento')}>Ver todo</button>
          </div>
          {alertas.length === 0
            ? <div className="empty-state"><div className="empty-icon">✅</div><div className="empty-title">Sin alertas activas</div></div>
            : alertas.map((a, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < alertas.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: `${alertColor[a.Estado_Alerta]}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>🔧</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{a.Activo}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{a.Tarea} • {a.Proxima_Ejecucion?.slice(0, 10)}</div>
                </div>
                <span className="badge" style={{ background: `${alertColor[a.Estado_Alerta]}22`, color: alertColor[a.Estado_Alerta] }}>
                  {a.Estado_Alerta === 'VENCIDA' ? '⚠️ VENCIDA' : `${a.Dias_Para_Vencer}d`}
                </span>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}
