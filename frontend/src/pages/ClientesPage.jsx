import { useState, useEffect } from 'react';
import { getClientes, getLealtad } from '../services/api';

const NIVEL_COLOR = { Platino:'#a8b4c8', Oro:'#f59e0b', Plata:'#94a3b8', Bronce:'#b45309' };
const NIVEL_ICON  = { Platino:'💎', Oro:'🥇', Plata:'🥈', Bronce:'🥉' };

export default function ClientesPage() {
  const [clientes, setClientes] = useState([]);
  const [buscar, setBuscar] = useState('');
  const [lealtadFiltro, setLealtadFiltro] = useState('');
  const [loading, setLoading] = useState(true);
  const [detalle, setDetalle] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await getClientes({ buscar: buscar || undefined, lealtad: lealtadFiltro || undefined });
        setClientes(res.data || []);
      } finally { setLoading(false); }
    };
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [buscar, lealtadFiltro]);

  const verDetalle = async (id) => {
    const res = await getLealtad(id);
    const cli = clientes.find(c => c.ID_Cliente === id);
    setDetalle({ ...cli, ...res.data });
  };

  return (
    <div>
      <div className="page-title">Clientes</div>
      <div className="page-subtitle">CRM — Huéspedes, lealtad y consentimientos LFPDPPP</div>

      <div className="filters-row">
        <input id="buscar-cliente" className="form-input" style={{ width: 260 }} placeholder="🔍 Nombre, email..." value={buscar} onChange={e => setBuscar(e.target.value)} />
        <select id="filtro-lealtad" className="form-select" style={{ width: 140 }} value={lealtadFiltro} onChange={e => setLealtadFiltro(e.target.value)}>
          <option value="">Todos los niveles</option>
          {['Platino','Oro','Plata','Bronce'].map(n => <option key={n} value={n}>{NIVEL_ICON[n]} {n}</option>)}
        </select>
      </div>

      <div className="grid-2">
        <div className="card">
          {loading ? <div className="loading-spinner"><div className="spinner"/></div>
            : <div className="table-wrap">
                <table className="data-table">
                  <thead><tr><th>Nombre</th><th>Email</th><th>Nacionalidad</th><th>Nivel</th><th>Puntos</th><th>Acciones</th></tr></thead>
                  <tbody>
                    {clientes.map(c => (
                      <tr key={c.ID_Cliente}>
                        <td><strong>{c.Nombre} {c.Apellido}</strong></td>
                        <td style={{ fontSize:'0.8rem' }}>{c.Email}</td>
                        <td>{c.Nacionalidad}</td>
                        <td>
                          <span className="badge" style={{ background:`${NIVEL_COLOR[c.Nivel_Lealtad]}22`, color:NIVEL_COLOR[c.Nivel_Lealtad] }}>
                            {NIVEL_ICON[c.Nivel_Lealtad]} {c.Nivel_Lealtad}
                          </span>
                        </td>
                        <td><span className="font-mono">{Number(c.Puntos_Lealtad).toLocaleString()}</span></td>
                        <td><button className="btn btn-secondary btn-sm" onClick={() => verDetalle(c.ID_Cliente)}>Ver lealtad</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
          }
        </div>

        {/* Panel de lealtad */}
        <div className="card">
          {!detalle
            ? <div className="empty-state"><div className="empty-icon">👥</div><div className="empty-title">Selecciona un cliente</div></div>
            : <>
                <div className="card-header">
                  <h2 className="card-title">🏅 {detalle.Nombre} {detalle.Apellido}</h2>
                  <span className="badge badge-gold">{NIVEL_ICON[detalle.Nivel_Lealtad]} {detalle.nivel}</span>
                </div>
                <div style={{ display:'flex', gap:16, marginBottom:16 }}>
                  <div className="stat-card" style={{ flex:1, padding:14 }}>
                    <div><div className="stat-value" style={{ color:'#f59e0b' }}>{Number(detalle.puntos).toLocaleString()}</div><div className="stat-label">Puntos disponibles</div></div>
                  </div>
                </div>
                <div style={{ fontSize:'0.82rem', fontWeight:600, color:'var(--color-text-muted)', marginBottom:8 }}>HISTORIAL DE MOVIMIENTOS</div>
                {(detalle.movimientos || []).slice(0,8).map((m,i) => (
                  <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid var(--color-border)', fontSize:'0.82rem' }}>
                    <span>{m.Tipo === 'Acumulacion' ? '➕' : '➖'} {m.Descripcion}</span>
                    <span style={{ color: m.Puntos > 0 ? 'var(--color-success)' : 'var(--color-danger)', fontWeight:600 }}>
                      {m.Puntos > 0 ? '+' : ''}{m.Puntos}
                    </span>
                  </div>
                ))}
              </>
          }
        </div>
      </div>
    </div>
  );
}
