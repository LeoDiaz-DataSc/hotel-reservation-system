import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { getHabitaciones, getOcupacionHoy, updateEstadoHabitacion } from '../services/api';

const ESTADO_COLOR = { Disponible:'#10b981', Ocupada:'#6366f1', Sucia:'#f59e0b', 'En Limpieza':'#06b6d4', Mantenimiento:'#ef4444', Bloqueada:'#64748b' };
const ESTADO_DOT   = { Disponible:'#10b981', Ocupada:'#6366f1', Sucia:'#f59e0b', 'En Limpieza':'#06b6d4', Mantenimiento:'#ef4444', Bloqueada:'#64748b' };
const ESTADO_ICON  = { Disponible:'✅', Ocupada:'🔵', Sucia:'🟡', 'En Limpieza':'🔄', Mantenimiento:'🔴', Bloqueada:'⛔' };
const ESTADOS_OPC  = ['Disponible','Ocupada','Sucia','En Limpieza','Mantenimiento','Bloqueada'];

export default function HabitacionesPage() {
  const [habitaciones, setHabitaciones] = useState([]);
  const [kpis, setKpis] = useState(null);
  const [filtro, setFiltro] = useState('Todas');
  const [vista, setVista] = useState('grid'); // grid | tabla
  const [loading, setLoading] = useState(true);
  const container = useRef();

  useGSAP(() => {
    gsap.from('.room-card', { scale: 0.85, opacity: 0, duration: 0.4, stagger: 0.04, ease: 'back.out(1.4)', delay: 0.2 });
  }, { scope: container, dependencies: [loading, filtro, vista] });

  const load = async () => {
    setLoading(true);
    try {
      const params = filtro !== 'Todas' ? { estado: filtro } : {};
      const [habRes, kpiRes] = await Promise.all([getHabitaciones(params), getOcupacionHoy()]);
      setHabitaciones(habRes.data || []);
      setKpis(kpiRes.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [filtro]);

  const handleEstado = async (id, actual) => {
    const opts = ESTADOS_OPC.filter(e => e !== actual).join(', ');
    const nuevo = prompt(`Estado actual: ${actual}\nCambiar a (${opts}):`);
    if (!nuevo || !ESTADOS_OPC.includes(nuevo)) return;
    const motivo = prompt('Motivo (opcional):') || '';
    await updateEstadoHabitacion(id, nuevo, motivo);
    load();
  };

  const pisos = [...new Set(habitaciones.map(h => h.Piso))].sort((a, b) => a - b);

  return (
    <div ref={container}>
      <div className="page-title">Habitaciones</div>
      <div className="page-subtitle">Estado operativo en tiempo real — {habitaciones.length} habitaciones</div>

      {/* KPIs */}
      {kpis && (
        <div className="grid-4 animate-stagger" style={{ marginBottom: 20 }}>
          {[
            { label: 'Total', value: kpis.Total_Habitaciones, color: '#6366f1', icon: '🏨' },
            { label: 'Ocupadas', value: kpis.Ocupadas, color: '#6366f1', icon: '🔵' },
            { label: 'Disponibles', value: kpis.Disponibles, color: '#10b981', icon: '✅' },
            { label: 'Ocupación', value: `${kpis.Ocupacion_Pct}%`, color: '#06b6d4', icon: '📊' },
          ].map(k => (
            <div key={k.label} className="stat-card">
              <div className="stat-icon" style={{ background: `${k.color}18`, border: `1px solid ${k.color}33`, fontSize: '1.2rem' }}>{k.icon}</div>
              <div><div className="stat-value" style={{ color: k.color }}>{k.value}</div><div className="stat-label">{k.label}</div></div>
            </div>
          ))}
        </div>
      )}

      {/* Filtros + Vista */}
      <div className="filters-row">
        {['Todas', ...ESTADOS_OPC].map(e => (
          <button key={e} id={`fil-hab-${e}`} className={`btn btn-sm ${filtro === e ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFiltro(e)}>
            {ESTADO_ICON[e] || ''} {e}
          </button>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
          <button className={`btn btn-sm ${vista==='grid'?'btn-primary':'btn-secondary'}`} onClick={() => setVista('grid')}>⊞ Grid</button>
          <button className={`btn btn-sm ${vista==='tabla'?'btn-primary':'btn-secondary'}`} onClick={() => setVista('tabla')}>≡ Tabla</button>
        </div>
      </div>

      {loading
        ? <div className="loading-spinner"><div className="spinner" /></div>
        : vista === 'grid'
          ? pisos.map(piso => (
              <div key={piso} style={{ marginBottom: 24 }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
                  Piso {piso}
                </div>
                <div className="room-grid">
                  {habitaciones.filter(h => h.Piso === piso).map(h => (
                    <div key={h.ID_Habitacion}
                      className={`room-card ${h.Estado?.toLowerCase().replace(' ', '-')}`}
                      onClick={() => handleEstado(h.ID_Habitacion, h.Estado)}
                      title={`${h.Tipo} — Clic para cambiar estado`}
                    >
                      <div className="room-number">{h.Numero_Habitacion}</div>
                      <div className="room-tipo">{h.Tipo?.split(' ')[0]}</div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>{h.Vista}</div>
                      <div className="room-estado-dot" style={{ background: ESTADO_DOT[h.Estado] }} />
                      <div style={{ fontSize: '0.65rem', marginTop: 4, color: ESTADO_COLOR[h.Estado] }}>{h.Estado}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          : <div className="card">
              <div className="table-wrap">
                <table className="data-table">
                  <thead><tr><th>Num</th><th>Tipo</th><th>Piso</th><th>Vista</th><th>Estado</th><th>Huésped</th><th>Precio/Noche</th><th>Acción</th></tr></thead>
                  <tbody>
                    {habitaciones.map(h => (
                      <tr key={h.ID_Habitacion}>
                        <td><strong>{h.Numero_Habitacion}</strong></td>
                        <td>{h.Tipo}</td>
                        <td>{h.Piso}°</td>
                        <td>{h.Vista}</td>
                        <td><span className="badge" style={{ background: `${ESTADO_COLOR[h.Estado]}20`, color: ESTADO_COLOR[h.Estado] }}>{ESTADO_ICON[h.Estado]} {h.Estado}</span></td>
                        <td>{h.Huesped || <span className="text-muted">—</span>}</td>
                        <td>${Number(h.Precio_Base || 0).toLocaleString()}</td>
                        <td><button className="btn btn-secondary btn-sm" onClick={() => handleEstado(h.ID_Habitacion, h.Estado)}>Cambiar estado</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
      }

      {/* Leyenda */}
      <div style={{ display: 'flex', gap: 16, marginTop: 16, flexWrap: 'wrap' }}>
        {ESTADOS_OPC.map(e => (
          <div key={e} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: ESTADO_DOT[e] }} />
            {e}
          </div>
        ))}
      </div>
    </div>
  );
}
