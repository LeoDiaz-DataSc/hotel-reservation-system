import { useState, useEffect } from 'react';
import { getAlertasMantenimiento, getOrdenesMantenimiento, getActivos, getProgramado, updateOrden } from '../services/api';

const PRIO_COLOR = { Critica:'#ef4444', Alta:'#f59e0b', Normal:'#6366f1', Baja:'#64748b' };
const ALERTA_COLOR = { VENCIDA:'#ef4444', PROXIMA:'#f59e0b', OK:'#10b981' };
const ESTADO_BADGE = { Abierta:'warning', En_Proceso:'info', Espera_Refaccion:'warning', Completada:'success', Cancelada:'muted' };

export default function MantenimientoPage() {
  const [alertas, setAlertas] = useState([]);
  const [ordenes, setOrdenes] = useState([]);
  const [activos, setActivos] = useState([]);
  const [programado, setProgramado] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('alertas');

  const load = async () => {
    setLoading(true);
    try {
      const [a, o, ac, p] = await Promise.all([
        getAlertasMantenimiento(), getOrdenesMantenimiento(), getActivos(), getProgramado()
      ]);
      setAlertas(a.data || []); setOrdenes(o.data || []); setActivos(ac.data || []); setProgramado(p.data || []);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleUpdateOrden = async (id, estado) => {
    let costo = null, notas = null;
    if (estado === 'Completada') { costo = prompt('Costo real (MXN):'); notas = prompt('Notas de cierre:'); }
    await updateOrden(id, { Estado: estado, Costo_Real: costo ? parseFloat(costo) : null, Notas_Cierre: notas });
    load();
  };

  const vencidas = alertas.filter(a => a.Estado_Alerta === 'VENCIDA').length;
  const proximas = alertas.filter(a => a.Estado_Alerta === 'PROXIMA').length;
  const abiertas = ordenes.filter(o => ['Abierta','En_Proceso'].includes(o.Estado)).length;

  return (
    <div>
      <div className="page-title">Mantenimiento Preventivo</div>
      <div className="page-subtitle">Activos del hotel, órdenes de trabajo y programación</div>

      {/* KPIs */}
      <div className="grid-4 animate-stagger" style={{ marginBottom: 20 }}>
        {[
          { l:'Vencidas', v:vencidas, c:'#ef4444', i:'🔴' },
          { l:'Próximas', v:proximas, c:'#f59e0b', i:'🟡' },
          { l:'Órdenes Abiertas', v:abiertas, c:'#6366f1', i:'📋' },
          { l:'Activos', v:activos.length, c:'#10b981', i:'🔧' },
        ].map(k => (
          <div key={k.l} className="stat-card">
            <div className="stat-icon" style={{ background:`${k.c}18`, border:`1px solid ${k.c}33` }}>{k.i}</div>
            <div><div className="stat-value" style={{ color:k.c }}>{k.v}</div><div className="stat-label">{k.l}</div></div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:8, marginBottom:20 }}>
        {[['alertas','⚠️ Alertas'],['ordenes','📋 Órdenes'],['activos','🔧 Activos'],['programado','📅 Programado']].map(([k,l]) => (
          <button key={k} className={`btn btn-sm ${tab===k?'btn-primary':'btn-secondary'}`} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>

      {loading ? <div className="loading-spinner"><div className="spinner"/></div>
        : tab === 'alertas'
          ? <div className="card">
              <div className="table-wrap">
                <table className="data-table">
                  <thead><tr><th>Activo</th><th>Código</th><th>Hab.</th><th>Tarea</th><th>Frecuencia</th><th>Próxima</th><th>Días</th><th>Estado</th><th>Proveedor</th></tr></thead>
                  <tbody>
                    {alertas.map((a,i) => (
                      <tr key={i}>
                        <td><strong>{a.Activo}</strong></td>
                        <td className="font-mono" style={{ fontSize:'0.78rem' }}>{a.Codigo_Interno}</td>
                        <td>{a.Numero_Habitacion || '—'}</td>
                        <td style={{ fontSize:'0.82rem' }}>{a.Tarea}</td>
                        <td><span className="badge badge-muted">{a.Frecuencia_Tipo}</span></td>
                        <td>{a.Proxima_Ejecucion?.slice(0,10)}</td>
                        <td style={{ textAlign:'center', fontWeight:700, color: a.Dias_Para_Vencer < 0 ? 'var(--color-danger)' : a.Dias_Para_Vencer <= 7 ? 'var(--color-warning)' : 'var(--color-success)' }}>
                          {a.Dias_Para_Vencer < 0 ? `${Math.abs(a.Dias_Para_Vencer)}d VENC.` : `${a.Dias_Para_Vencer}d`}
                        </td>
                        <td><span className="badge" style={{ background:`${ALERTA_COLOR[a.Estado_Alerta]}20`, color:ALERTA_COLOR[a.Estado_Alerta] }}>{a.Estado_Alerta}</span></td>
                        <td style={{ fontSize:'0.8rem' }}>{a.Proveedor || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          : tab === 'ordenes'
            ? <div className="card">
                <div className="table-wrap">
                  <table className="data-table">
                    <thead><tr><th>Folio</th><th>Activo/Hab.</th><th>Tipo</th><th>Prioridad</th><th>Descripción</th><th>Asignado</th><th>Estado</th><th>Costo Est.</th><th>Acciones</th></tr></thead>
                    <tbody>
                      {ordenes.map(o => (
                        <tr key={o.ID_Orden}>
                          <td className="font-mono" style={{ fontSize:'0.78rem', color:'var(--color-primary-hover)' }}>{o.Folio}</td>
                          <td>{o.Activo || `Hab. ${o.Numero_Habitacion}` || '—'}</td>
                          <td><span className="badge badge-primary">{o.Tipo}</span></td>
                          <td><span className="badge" style={{ background:`${PRIO_COLOR[o.Prioridad]}20`, color:PRIO_COLOR[o.Prioridad] }}>{o.Prioridad}</span></td>
                          <td style={{ fontSize:'0.8rem', maxWidth:200 }}>{o.Descripcion?.slice(0,60)}...</td>
                          <td style={{ fontSize:'0.8rem' }}>{o.Asignado || '—'}</td>
                          <td><span className={`badge badge-${ESTADO_BADGE[o.Estado]||'muted'}`}>{o.Estado}</span></td>
                          <td>{o.Costo_Estimado ? `$${Number(o.Costo_Estimado).toLocaleString()}` : '—'}</td>
                          <td>
                            <div style={{ display:'flex', gap:4 }}>
                              {o.Estado === 'Abierta' && <button className="btn btn-warning btn-sm" onClick={() => handleUpdateOrden(o.ID_Orden,'En_Proceso')}>▶ Iniciar</button>}
                              {o.Estado === 'En_Proceso' && <button className="btn btn-success btn-sm" onClick={() => handleUpdateOrden(o.ID_Orden,'Completada')}>✅ Cerrar</button>}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            : tab === 'activos'
              ? <div className="card">
                  <div className="table-wrap">
                    <table className="data-table">
                      <thead><tr><th>Nombre</th><th>Código</th><th>Categoría</th><th>Hab.</th><th>Marca/Modelo</th><th>Garantía hasta</th><th>Estado</th></tr></thead>
                      <tbody>
                        {activos.map(a => (
                          <tr key={a.ID_Activo}>
                            <td><strong>{a.Nombre}</strong></td>
                            <td className="font-mono" style={{ fontSize:'0.78rem' }}>{a.Codigo_Interno}</td>
                            <td><span className="badge badge-primary">{a.Categoria}</span></td>
                            <td>{a.Numero_Habitacion || '—'}</td>
                            <td style={{ fontSize:'0.8rem' }}>{a.Marca} {a.Modelo}</td>
                            <td style={{ fontSize:'0.78rem', color: a.Garantia_Hasta < new Date().toISOString().split('T')[0] ? 'var(--color-danger)' : 'var(--color-text-muted)' }}>{a.Garantia_Hasta}</td>
                            <td><span className={`badge badge-${a.Estado==='Operativo'?'success':a.Estado==='En_Reparacion'?'warning':'muted'}`}>{a.Estado}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              : <div className="card">
                  <div className="table-wrap">
                    <table className="data-table">
                      <thead><tr><th>Activo</th><th>Tarea</th><th>Frecuencia</th><th>Próxima</th><th>Última</th><th>Est. min</th><th>Proveedor</th></tr></thead>
                      <tbody>
                        {programado.map(p => (
                          <tr key={p.ID_Programa}>
                            <td><strong>{p.Activo}</strong> <span className="font-mono" style={{ fontSize:'0.72rem', color:'var(--color-text-muted)' }}>{p.Codigo_Interno}</span></td>
                            <td style={{ fontSize:'0.82rem' }}>{p.Descripcion}</td>
                            <td><span className="badge badge-muted">{p.Frecuencia_Tipo}</span></td>
                            <td style={{ color: p.Proxima_Ejecucion < new Date().toISOString().split('T')[0] ? 'var(--color-danger)' : 'var(--color-text)' }}>{p.Proxima_Ejecucion}</td>
                            <td style={{ fontSize:'0.78rem', color:'var(--color-text-muted)' }}>{p.Ultima_Ejecucion || '—'}</td>
                            <td style={{ textAlign:'center' }}>{p.Tiempo_Est_Min ? `${p.Tiempo_Est_Min} min` : '—'}</td>
                            <td style={{ fontSize:'0.8rem' }}>{p.Proveedor || '—'}</td>
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
