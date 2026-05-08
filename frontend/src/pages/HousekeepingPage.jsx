import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { getHousekeepingPendientes, getHousekeepingTodas, iniciarTarea, completarTarea, verificarTarea, createTarea } from '../services/api';

const PRIOR_COLOR = { Urgente: '#ef4444', Alta: '#f59e0b', Normal: '#6366f1' };
const TIPO_ICON   = { Rutina: '🧹', Salida: '🚪', Profunda: '🧽', Inspeccion: '🔍' };

export default function HousekeepingPage() {
  const [pendientes, setPendientes] = useState([]);
  const [todas, setTodas] = useState([]);
  const [tab, setTab] = useState('pendientes');
  const [loading, setLoading] = useState(true);
  const container = useRef();

  useGSAP(() => {
    gsap.from('.kanban-card', { y: 16, opacity: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out', delay: 0.2 });
  }, { scope: container, dependencies: [loading] });

  const load = async () => {
    setLoading(true);
    try {
      const [pRes, tRes] = await Promise.all([
        getHousekeepingPendientes(),
        getHousekeepingTodas()
      ]);
      setPendientes(pRes.data || []);
      setTodas(tRes.data || []);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleIniciar = async (id) => { await iniciarTarea(id); load(); };
  const handleCompletar = async (id) => {
    const mins = prompt('Tiempo empleado (minutos):') || '';
    await completarTarea(id, { Tiempo_Min: parseInt(mins) || null });
    load();
  };
  const handleVerificar = async (id) => {
    if (!confirm('¿Marcar como verificada y liberar habitación?')) return;
    await verificarTarea(id); load();
  };

  const porEstado = (estado) => pendientes.filter(t => t.Estado === estado);

  const urgentes  = pendientes.filter(t => t.Prioridad === 'Urgente').length;
  const arrivals  = pendientes.filter(t => t.Arrival_Hoy).length;

  return (
    <div ref={container}>
      <div className="page-title">Housekeeping</div>
      <div className="page-subtitle">Gestión de limpieza e inspección de habitaciones</div>

      {/* Stats rápidas */}
      <div className="grid-4 animate-stagger" style={{ marginBottom: 20 }}>
        {[
          { label: 'Pendientes', value: pendientes.filter(t=>t.Estado==='Pendiente').length, color: '#f59e0b', icon: '⏳' },
          { label: 'En proceso', value: pendientes.filter(t=>t.Estado==='En_Proceso').length, color: '#06b6d4', icon: '🔄' },
          { label: 'Urgentes',   value: urgentes, color: '#ef4444', icon: '🚨' },
          { label: 'Arrivals hoy', value: arrivals, color: '#6366f1', icon: '✈️' },
        ].map(k => (
          <div key={k.label} className="stat-card">
            <div className="stat-icon" style={{ background:`${k.color}18`, border:`1px solid ${k.color}33` }}>{k.icon}</div>
            <div><div className="stat-value" style={{ color: k.color }}>{k.value}</div><div className="stat-label">{k.label}</div></div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:8, marginBottom:20 }}>
        <button id="tab-kanban"   className={`btn btn-sm ${tab==='pendientes'?'btn-primary':'btn-secondary'}`} onClick={() => setTab('pendientes')}>⊞ Kanban</button>
        <button id="tab-todas"    className={`btn btn-sm ${tab==='todas'?'btn-primary':'btn-secondary'}`}     onClick={() => setTab('todas')}>≡ Todas</button>
      </div>

      {loading
        ? <div className="loading-spinner"><div className="spinner" /></div>
        : tab === 'pendientes'
          ? <div className="kanban-board">
              {/* Pendientes */}
              <div className="kanban-col">
                <div className="kanban-col-title">
                  <span style={{ width:10,height:10,borderRadius:'50%',background:'#f59e0b',display:'inline-block' }}/>
                  Pendiente ({porEstado('Pendiente').length})
                </div>
                {porEstado('Pendiente').map(t => (
                  <div key={t.ID_Tarea} className="kanban-card">
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                      <span>{TIPO_ICON[t.Tipo_Limpieza]} <strong>Hab. {t.Numero_Habitacion}</strong></span>
                      <span className="badge" style={{ background:`${PRIOR_COLOR[t.Prioridad]}20`, color:PRIOR_COLOR[t.Prioridad] }}>{t.Prioridad}</span>
                    </div>
                    <div style={{ fontSize:'0.78rem', color:'var(--color-text-muted)', marginBottom:8 }}>
                      {t.Tipo_Habitacion} {t.Arrival_Hoy && <span className="badge badge-danger">Arrival 🚨</span>}
                    </div>
                    <div style={{ fontSize:'0.75rem', color:'var(--color-text-muted)', marginBottom:8 }}>
                      👤 {t.Asignado_A || 'Sin asignar'}
                    </div>
                    <button className="btn btn-warning btn-sm" style={{ width:'100%', justifyContent:'center' }} onClick={() => handleIniciar(t.ID_Tarea)}>▶ Iniciar</button>
                  </div>
                ))}
              </div>

              {/* En proceso */}
              <div className="kanban-col">
                <div className="kanban-col-title">
                  <span style={{ width:10,height:10,borderRadius:'50%',background:'#06b6d4',display:'inline-block' }}/>
                  En Proceso ({porEstado('En_Proceso').length})
                </div>
                {porEstado('En_Proceso').map(t => (
                  <div key={t.ID_Tarea} className="kanban-card">
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                      <span>{TIPO_ICON[t.Tipo_Limpieza]} <strong>Hab. {t.Numero_Habitacion}</strong></span>
                      <span className="badge badge-info">En proceso</span>
                    </div>
                    <div style={{ fontSize:'0.75rem', color:'var(--color-text-muted)', marginBottom:8 }}>👤 {t.Asignado_A}</div>
                    <button className="btn btn-success btn-sm" style={{ width:'100%', justifyContent:'center' }} onClick={() => handleCompletar(t.ID_Tarea)}>✅ Completar</button>
                  </div>
                ))}
              </div>

              {/* Completadas (pendientes verificación) */}
              <div className="kanban-col">
                <div className="kanban-col-title">
                  <span style={{ width:10,height:10,borderRadius:'50%',background:'#10b981',display:'inline-block' }}/>
                  Completada ({todas.filter(t=>t.Estado==='Completada').length})
                </div>
                {todas.filter(t=>t.Estado==='Completada').slice(0,5).map(t => (
                  <div key={t.ID_Tarea} className="kanban-card">
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                      <span>✅ <strong>Hab. {t.Numero_Habitacion}</strong></span>
                      <span className="badge badge-success">Completada</span>
                    </div>
                    <div style={{ fontSize:'0.75rem', color:'var(--color-text-muted)', marginBottom:8 }}>👤 {t.Asignado_A}</div>
                    <button className="btn btn-primary btn-sm" style={{ width:'100%', justifyContent:'center' }} onClick={() => handleVerificar(t.ID_Tarea)}>🔍 Verificar</button>
                  </div>
                ))}
              </div>
            </div>
          : <div className="card">
              <div className="table-wrap">
                <table className="data-table">
                  <thead><tr><th>Hab.</th><th>Tipo</th><th>Limpieza</th><th>Prioridad</th><th>Asignado</th><th>Estado</th><th>Asignada</th><th>Acciones</th></tr></thead>
                  <tbody>
                    {todas.map(t => (
                      <tr key={t.ID_Tarea}>
                        <td><strong>{t.Numero_Habitacion}</strong></td>
                        <td>{TIPO_ICON[t.Tipo]} {t.Tipo}</td>
                        <td>{t.Tipo_Habitacion}</td>
                        <td><span className="badge" style={{ background:`${PRIOR_COLOR[t.Prioridad]}20`, color:PRIOR_COLOR[t.Prioridad] }}>{t.Prioridad}</span></td>
                        <td>{t.Asignado_A || '—'}</td>
                        <td><span className={`badge badge-${t.Estado==='Completada'?'success':t.Estado==='En_Proceso'?'info':'warning'}`}>{t.Estado}</span></td>
                        <td style={{ fontSize:'0.75rem' }}>{t.Asignada_En?.slice(0,16)}</td>
                        <td>
                          {t.Estado==='Pendiente'  && <button className="btn btn-warning btn-sm" onClick={() => handleIniciar(t.ID_Tarea)}>▶ Iniciar</button>}
                          {t.Estado==='En_Proceso' && <button className="btn btn-success btn-sm" onClick={() => handleCompletar(t.ID_Tarea)}>✅ Completar</button>}
                          {t.Estado==='Completada' && <button className="btn btn-primary btn-sm" onClick={() => handleVerificar(t.ID_Tarea)}>🔍 Verificar</button>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
      }
    </div>
  );
}
