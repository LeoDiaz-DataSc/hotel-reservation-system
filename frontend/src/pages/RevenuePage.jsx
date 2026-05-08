import { useState, useEffect } from 'react';
import { getPlanes, getCalendario, getReglas, calcularPrecio } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function RevenuePage() {
  const [planes, setPlanes] = useState([]);
  const [calendario, setCalendario] = useState([]);
  const [reglas, setReglas] = useState([]);
  const [precioCalc, setPrecioCalc] = useState(null);
  const [formCalc, setFormCalc] = useState({ fecha: new Date().toISOString().split('T')[0], tipo: '2' });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('planes');

  useEffect(() => {
    Promise.all([getPlanes(), getCalendario({ dias: 14 }), getReglas()]).then(([p, c, r]) => {
      setPlanes(p.data || []);
      setCalendario(c.data || []);
      setReglas(r.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleCalc = async () => {
    const r = await calcularPrecio({ fecha: formCalc.fecha, tipo: formCalc.tipo, plan: 1 });
    setPrecioCalc(r.data);
  };

  const AJUSTE_COLOR = { Porcentaje: '#6366f1', Monto_Fijo: '#10b981' };

  return (
    <div>
      <div className="page-title">Revenue Management</div>
      <div className="page-subtitle">Tarifas dinámicas, planes y calendario de precios</div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:8, marginBottom:20 }}>
        {[['planes','📋 Planes'],['calendario','📅 Calendario'],['reglas','⚡ Reglas'],['calc','🧮 Calculadora']].map(([k,l]) => (
          <button key={k} className={`btn btn-sm ${tab===k?'btn-primary':'btn-secondary'}`} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>

      {loading ? <div className="loading-spinner"><div className="spinner"/></div>
        : tab === 'planes'
          ? <div className="grid-3 animate-stagger">
              {planes.map(p => (
                <div key={p.ID_Plan} className="card">
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:12 }}>
                    <span className="font-mono" style={{ color:'var(--color-primary-hover)', fontSize:'1.1rem', fontWeight:700 }}>{p.Codigo}</span>
                    {p.Incluye_Desayuno && <span className="badge badge-success">🍳 Desayuno</span>}
                  </div>
                  <div style={{ fontWeight:600, marginBottom:6 }}>{p.Nombre}</div>
                  <div style={{ fontSize:'0.8rem', color:'var(--color-text-muted)', marginBottom:8 }}>{p.Descripcion}</div>
                  <div style={{ fontSize:'0.78rem' }}>
                    <span className="badge badge-warning">⏱️ {p.Politica_Cancelacion}</span>
                  </div>
                </div>
              ))}
            </div>

          : tab === 'calendario'
            ? <div className="card">
                <div style={{ marginBottom:16 }}>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={calendario.slice(0,14)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="Fecha" tick={{ fontSize:10, fill:'#64748b' }} tickFormatter={v => v?.slice(5)} />
                      <YAxis tick={{ fontSize:10, fill:'#64748b' }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                      <Tooltip contentStyle={{ background:'#111d30', border:'1px solid #1e293b', fontSize:11 }} formatter={v => [`$${Number(v).toLocaleString()}`, 'Precio']} />
                      <Bar dataKey="Precio" fill="#6366f1" radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="table-wrap">
                  <table className="data-table">
                    <thead><tr><th>Fecha</th><th>Tipo Hab.</th><th>Plan</th><th>Precio</th><th>Mín. Noches</th><th>Disponible</th></tr></thead>
                    <tbody>
                      {calendario.map(t => (
                        <tr key={t.ID_Tarifa}>
                          <td>{t.Fecha}</td><td>{t.Tipo_Hab}</td><td className="font-mono">{t.Plan_Codigo}</td>
                          <td style={{ fontWeight:700, color:'var(--color-success)' }}>${Number(t.Precio).toLocaleString()}</td>
                          <td style={{ textAlign:'center' }}>{t.Estancia_Minima}N</td>
                          <td>{t.Disponible ? <span className="badge badge-success">✅ Sí</span> : <span className="badge badge-danger">🚫 No</span>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            : tab === 'reglas'
              ? <div className="card">
                  <div className="table-wrap">
                    <table className="data-table">
                      <thead><tr><th>Regla</th><th>Tipo</th><th>Vigencia</th><th>Ajuste</th><th>Prioridad</th><th>Activa</th></tr></thead>
                      <tbody>
                        {reglas.map(r => (
                          <tr key={r.ID_Regla}>
                            <td><strong>{r.Nombre}</strong></td>
                            <td><span className="badge badge-primary">{r.Tipo}</span></td>
                            <td style={{ fontSize:'0.78rem' }}>{r.Fecha_Inicio} → {r.Fecha_Fin}</td>
                            <td>
                              <span style={{ fontWeight:700, color: parseFloat(r.Ajuste_Valor) >= 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>
                                {parseFloat(r.Ajuste_Valor) >= 0 ? '+' : ''}{r.Ajuste_Valor}{r.Ajuste_Tipo==='Porcentaje' ? '%' : ' MXN'}
                              </span>
                            </td>
                            <td style={{ textAlign:'center' }}>{r.Prioridad}</td>
                            <td>{r.Activa ? <span className="badge badge-success">✅</span> : <span className="badge badge-muted">🚫</span>}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              : <div className="card" style={{ maxWidth:480 }}>
                  <div className="card-header"><h2 className="card-title">🧮 Calculadora de Precio Dinámico</h2></div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Fecha</label>
                      <input type="date" className="form-input" value={formCalc.fecha} onChange={e => setFormCalc(f => ({...f, fecha:e.target.value}))} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Tipo Habitación</label>
                      <select className="form-select" value={formCalc.tipo} onChange={e => setFormCalc(f => ({...f, tipo:e.target.value}))}>
                        <option value="1">Estándar Sencilla</option>
                        <option value="2">Estándar Doble</option>
                        <option value="3">Junior Suite</option>
                        <option value="4">Suite Presidencial</option>
                      </select>
                    </div>
                  </div>
                  <button id="btn-calc-precio" className="btn btn-primary" onClick={handleCalc} style={{ width:'100%', justifyContent:'center' }}>Calcular Precio</button>
                  {precioCalc && (
                    <div style={{ marginTop:20, textAlign:'center' }}>
                      <div style={{ fontSize:'0.8rem', color:'var(--color-text-muted)' }}>Precio Base: ${Number(precioCalc.precioBase).toLocaleString()}</div>
                      <div style={{ fontSize:'2.5rem', fontWeight:800, color:'var(--color-success)', marginTop:8 }}>
                        ${Number(precioCalc.precioFinal).toLocaleString()}
                      </div>
                      <div style={{ fontSize:'0.8rem', color:'var(--color-text-muted)', marginTop:4 }}>
                        {precioCalc.reglasAplicadas} regla(s) aplicada(s)
                      </div>
                    </div>
                  )}
                </div>
      }
    </div>
  );
}
