import { useState, useEffect } from 'react';
import { getOcupacionKPIs, getMetricasDiarias, getAuditLogs, generarMetricas } from '../services/api';
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function ReportesPage() {
  const [kpis, setKpis] = useState(null);
  const [metricas, setMetricas] = useState([]);
  const [logs, setLogs] = useState([]);
  const [tab, setTab] = useState('kpis');
  const [loading, setLoading] = useState(true);
  const [filtroModulo, setFiltroModulo] = useState('');
  const [generando, setGenerando] = useState(false);

  useEffect(() => {
    Promise.all([getOcupacionKPIs(), getMetricasDiarias({ dias: 30 })]).then(([k, m]) => {
      setKpis(k.data);
      setMetricas(m.data.slice().reverse());
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (tab === 'audit') {
      const params = filtroModulo ? { modulo: filtroModulo } : {};
      getAuditLogs(params).then(r => setLogs(r.data || [])).catch(() => {});
    }
  }, [tab, filtroModulo]);

  const handleGenerar = async () => {
    setGenerando(true);
    await generarMetricas();
    const m = await getMetricasDiarias({ dias: 30 });
    setMetricas(m.data.slice().reverse());
    setGenerando(false);
  };

  const RESULTADO_COLOR = { Exito:'success', Error:'danger', Denegado:'warning' };
  const MODULOS = [...new Set(logs.map(l => l.Modulo))];

  return (
    <div>
      <div className="page-title">Reportes & Auditoría</div>
      <div className="page-subtitle">ISO 27001 — Audit Logs, KPIs y métricas históricas</div>

      <div style={{ display:'flex', gap:8, marginBottom:20 }}>
        {[['kpis','📊 KPIs Hoy'],['metricas','📈 Tendencia 30d'],['audit','🔍 Audit Log']].map(([k,l]) => (
          <button key={k} className={`btn btn-sm ${tab===k?'btn-primary':'btn-secondary'}`} onClick={() => setTab(k)}>{l}</button>
        ))}
        <div style={{ marginLeft:'auto' }}>
          <button id="btn-generar-metricas" className="btn btn-secondary btn-sm" onClick={handleGenerar} disabled={generando}>
            {generando ? '⏳ Generando...' : '📊 Snapshot Hoy'}
          </button>
        </div>
      </div>

      {loading ? <div className="loading-spinner"><div className="spinner"/></div>
        : tab === 'kpis'
          ? <>
              {kpis && (
                <div className="grid-4 animate-stagger" style={{ marginBottom:24 }}>
                  {[
                    { l:'Total Habitaciones', v:kpis.Total_Habitaciones, c:'#6366f1', i:'🏨' },
                    { l:'Ocupadas', v:kpis.Ocupadas, c:'#6366f1', i:'🔵' },
                    { l:'Disponibles', v:kpis.Disponibles, c:'#10b981', i:'✅' },
                    { l:'Ocupación %', v:`${kpis.Ocupacion_Pct}%`, c:'#06b6d4', i:'📊' },
                    { l:'ADR', v:`$${Number(kpis.ADR||0).toLocaleString()}`, c:'#10b981', i:'💰' },
                    { l:'RevPAR', v:`$${Number(kpis.RevPAR||0).toLocaleString()}`, c:'#8b5cf6', i:'📈' },
                  ].map(k => (
                    <div key={k.l} className="stat-card">
                      <div className="stat-icon" style={{ background:`${k.c}18`, border:`1px solid ${k.c}33`, fontSize:'1.2rem' }}>{k.i}</div>
                      <div><div className="stat-value" style={{ color:k.c }}>{k.v}</div><div className="stat-label">{k.l}</div></div>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ padding:'14px 18px', background:'rgba(99,102,241,0.06)', border:'1px solid rgba(99,102,241,0.18)', borderRadius:'var(--radius-lg)', fontSize:'0.82rem', color:'var(--color-text-secondary)' }}>
                🛡️ <strong>ISO 27001</strong> — Todos los accesos son registrados en Audit_Logs con IP, User-Agent y resultado.<br/>
                🔒 <strong>PCI-DSS</strong> — Datos de tarjetas tokenizados, solo se almacenan últimos 4 dígitos.<br/>
                📋 <strong>LFPDPPP</strong> — Consentimientos ARCO gestionados y accesos a datos personales auditados.<br/>
                🧾 <strong>CFDI 4.0</strong> — Facturación electrónica con UUID SAT, complementos y cancelaciones.
              </div>
            </>

          : tab === 'metricas'
            ? <div className="card">
                <div style={{ marginBottom:24 }}>
                  <div style={{ fontSize:'0.85rem', fontWeight:600, marginBottom:16 }}>Ocupación y ADR — 30 días</div>
                  <ResponsiveContainer width="100%" height={240}>
                    <AreaChart data={metricas}>
                      <defs>
                        <linearGradient id="gOcup30" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="Fecha" tick={{ fontSize:10, fill:'#64748b' }} tickFormatter={v => v?.slice(5)} />
                      <YAxis yAxisId="pct" orientation="left" tick={{ fontSize:10, fill:'#64748b' }} unit="%" domain={[0,100]} />
                      <YAxis yAxisId="adr" orientation="right" tick={{ fontSize:10, fill:'#64748b' }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                      <Tooltip contentStyle={{ background:'#111d30', border:'1px solid #1e293b', fontSize:11 }} />
                      <Legend />
                      <Area yAxisId="pct" type="monotone" dataKey="Ocupacion_Pct" stroke="#6366f1" fill="url(#gOcup30)" strokeWidth={2} name="Ocupación %" />
                      <Line yAxisId="adr" type="monotone" dataKey="ADR" stroke="#10b981" strokeWidth={2} dot={false} name="ADR" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="table-wrap">
                  <table className="data-table">
                    <thead><tr><th>Fecha</th><th>Hab. Ocup.</th><th>Ocup. %</th><th>ADR</th><th>RevPAR</th><th>Ing. Hab.</th><th>Ing. Svc</th><th>Check-in</th><th>Check-out</th><th>Cancelac.</th></tr></thead>
                    <tbody>
                      {metricas.map(m => (
                        <tr key={m.Fecha}>
                          <td>{m.Fecha}</td>
                          <td style={{ textAlign:'center' }}>{m.Habitaciones_Ocupadas}</td>
                          <td>{m.Ocupacion_Pct}%</td>
                          <td>${Number(m.ADR).toLocaleString()}</td>
                          <td>${Number(m.RevPAR).toLocaleString()}</td>
                          <td style={{ color:'var(--color-success)' }}>${Number(m.Ingresos_Habitacion).toLocaleString()}</td>
                          <td style={{ color:'var(--color-info)' }}>${Number(m.Ingresos_Servicios).toLocaleString()}</td>
                          <td style={{ textAlign:'center' }}>{m.Check_Ins}</td>
                          <td style={{ textAlign:'center' }}>{m.Check_Outs}</td>
                          <td style={{ textAlign:'center', color: m.Cancelaciones > 0 ? 'var(--color-danger)' : undefined }}>{m.Cancelaciones}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            : <div className="card">
                <div className="filters-row" style={{ marginBottom:16 }}>
                  <select id="filtro-modulo" className="form-select" style={{ width:200 }} value={filtroModulo} onChange={e => setFiltroModulo(e.target.value)}>
                    <option value="">Todos los módulos</option>
                    {MODULOS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div className="table-wrap">
                  <table className="data-table">
                    <thead><tr><th>Fecha/Hora</th><th>Empleado</th><th>Módulo</th><th>Acción</th><th>Tabla</th><th>IP</th><th>Resultado</th></tr></thead>
                    <tbody>
                      {logs.map(l => (
                        <tr key={l.ID_Log}>
                          <td style={{ fontSize:'0.75rem', fontFamily:'var(--font-mono)' }}>{l.Fecha_Hora?.slice(0,19)}</td>
                          <td style={{ fontSize:'0.82rem' }}>{l.Empleado || <span className="text-muted">Sistema</span>}</td>
                          <td><span className="badge badge-primary" style={{ fontSize:'0.68rem' }}>{l.Modulo}</span></td>
                          <td style={{ fontSize:'0.82rem' }}>{l.Accion}</td>
                          <td style={{ fontSize:'0.78rem', color:'var(--color-text-muted)' }}>{l.Tabla_Afectada || '—'}</td>
                          <td className="font-mono" style={{ fontSize:'0.72rem', color:'var(--color-text-muted)' }}>{l.Direccion_IP}</td>
                          <td><span className={`badge badge-${RESULTADO_COLOR[l.Resultado]||'muted'}`}>{l.Resultado}</span></td>
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
