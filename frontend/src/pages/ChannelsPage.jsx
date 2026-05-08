import { useState, useEffect } from 'react';
import { getCanales, getDisponibilidad, syncChannels } from '../services/api';

const CANAL_ICON = { DIRECT:'🏨', BOOKING:'📘', EXPEDIA:'🟡', AIRBNB:'🔴', PHONE:'📞', AGENCY:'🤝' };

export default function ChannelsPage() {
  const [canales, setCanales] = useState([]);
  const [disponibilidad, setDisponibilidad] = useState([]);
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    getCanales().then(r => { setCanales(r.data || []); setLoading(false); });
  }, []);

  useEffect(() => {
    getDisponibilidad(fecha).then(r => setDisponibilidad(r.data || []));
  }, [fecha]);

  const handleSync = async () => {
    setSyncing(true);
    await syncChannels();
    setSyncing(false);
    getDisponibilidad(fecha).then(r => setDisponibilidad(r.data || []));
  };

  const ocupacion = (d) => d.Cupo_Total > 0 ? Math.round(d.Cupo_Vendido / d.Cupo_Total * 100) : 0;

  return (
    <div>
      <div className="page-title">Channel Manager</div>
      <div className="page-subtitle">OTAs, disponibilidad y sincronización de inventario</div>

      {/* Canales */}
      {!loading && (
        <div className="grid-4 animate-stagger" style={{ marginBottom: 24 }}>
          {canales.map(c => (
            <div key={c.ID_Canal} className="stat-card">
              <div className="stat-icon" style={{ fontSize:'1.5rem', background:'rgba(99,102,241,0.1)', border:'1px solid rgba(99,102,241,0.2)' }}>
                {CANAL_ICON[c.Codigo] || '🌐'}
              </div>
              <div>
                <div className="stat-value" style={{ fontSize:'1rem', color: c.Comision_Pct > 0 ? 'var(--color-warning)' : 'var(--color-success)' }}>{c.Nombre}</div>
                <div className="stat-label">{c.Comision_Pct > 0 ? `Comisión ${c.Comision_Pct}%` : 'Sin comisión'}</div>
                <div className="stat-label"><span className={`badge badge-${c.Activo ? 'success' : 'muted'}`}>{c.Activo ? 'Activo' : 'Inactivo'}</span></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Disponibilidad */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">📅 Disponibilidad por Canal</h2>
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            <input type="date" className="form-input" style={{ width:160 }} value={fecha} onChange={e => setFecha(e.target.value)} />
            <button id="btn-sync" className="btn btn-primary btn-sm" onClick={handleSync} disabled={syncing}>
              {syncing ? '🔄 Sincronizando...' : '🔄 Sincronizar OTAs'}
            </button>
          </div>
        </div>
        {disponibilidad.length === 0
          ? <div className="empty-state"><div className="empty-icon">📅</div><div className="empty-title">Sin disponibilidad para esa fecha</div></div>
          : <div className="table-wrap">
              <table className="data-table">
                <thead><tr><th>Canal</th><th>Tipo Hab.</th><th>Cupo Total</th><th>Vendido</th><th>Ocupación</th><th>Precio</th><th>Stop Sell</th><th>Última Sync</th></tr></thead>
                <tbody>
                  {disponibilidad.map(d => (
                    <tr key={d.ID_Disp}>
                      <td>{CANAL_ICON[d.ID_Canal] || '🌐'} <strong>{d.Canal}</strong></td>
                      <td>{d.Tipo_Hab}</td>
                      <td style={{ textAlign:'center' }}>{d.Cupo_Total}</td>
                      <td style={{ textAlign:'center' }}>{d.Cupo_Vendido}</td>
                      <td>
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <div style={{ flex:1, height:6, background:'var(--color-border)', borderRadius:3, overflow:'hidden' }}>
                            <div style={{ height:'100%', background: ocupacion(d) > 80 ? 'var(--color-danger)' : 'var(--color-success)', width:`${ocupacion(d)}%`, borderRadius:3 }} />
                          </div>
                          <span style={{ fontSize:'0.75rem', minWidth:32 }}>{ocupacion(d)}%</span>
                        </div>
                      </td>
                      <td style={{ fontWeight:700 }}>${Number(d.Precio_Canal).toLocaleString()}</td>
                      <td>{d.Stop_Sell ? <span className="badge badge-danger">🚫 Stop</span> : <span className="badge badge-success">✅ Open</span>}</td>
                      <td style={{ fontSize:'0.75rem', color:'var(--color-text-muted)' }}>{d.Ultima_Sync?.slice(0,16) || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
        }
      </div>
    </div>
  );
}
