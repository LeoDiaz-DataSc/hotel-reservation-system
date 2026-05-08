import { useState, useEffect } from 'react';
import { getPlantillas, getComunicacionesEnviadas, enviarComunicacion, getClientes } from '../services/api';

const CANAL_ICON = { Email:'📧', SMS:'💬', WhatsApp:'📱' };
const ESTADO_COLOR = { Enviado:'success', Entregado:'success', Fallido:'danger', Pendiente:'warning' };

export default function ComunicacionesPage() {
  const [plantillas, setPlantillas] = useState([]);
  const [enviadas, setEnviadas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ ID_Plantilla:'', ID_Cliente:'', ID_Reserva:'' });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('plantillas');

  useEffect(() => {
    Promise.all([getPlantillas(), getComunicacionesEnviadas(), getClientes()]).then(([p,e,c]) => {
      setPlantillas(p.data || []);
      setEnviadas(e.data || []);
      setClientes(c.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleEnviar = async () => {
    if (!form.ID_Plantilla || !form.ID_Cliente) return alert('Selecciona plantilla y cliente');
    await enviarComunicacion({ ID_Plantilla: parseInt(form.ID_Plantilla), ID_Cliente: parseInt(form.ID_Cliente), ID_Reserva: form.ID_Reserva ? parseInt(form.ID_Reserva) : null });
    const r = await getComunicacionesEnviadas();
    setEnviadas(r.data || []);
    setForm({ ID_Plantilla:'', ID_Cliente:'', ID_Reserva:'' });
    alert('Comunicación enviada (simulada) ✅');
  };

  return (
    <div>
      <div className="page-title">Comunicaciones</div>
      <div className="page-subtitle">Plantillas multi-canal y log de envíos</div>

      <div style={{ display:'flex', gap:8, marginBottom:20 }}>
        <button className={`btn btn-sm ${tab==='plantillas'?'btn-primary':'btn-secondary'}`} onClick={() => setTab('plantillas')}>📋 Plantillas</button>
        <button className={`btn btn-sm ${tab==='enviar'?'btn-primary':'btn-secondary'}`} onClick={() => setTab('enviar')}>📤 Enviar</button>
        <button className={`btn btn-sm ${tab==='historial'?'btn-primary':'btn-secondary'}`} onClick={() => setTab('historial')}>📜 Historial</button>
      </div>

      {loading ? <div className="loading-spinner"><div className="spinner"/></div>
        : tab === 'plantillas'
          ? <div className="grid-2">
              <div>
                {plantillas.map(p => (
                  <div key={p.ID_Plantilla} className={`card`} style={{ marginBottom:12, cursor:'pointer', borderColor: selected?.ID_Plantilla === p.ID_Plantilla ? 'var(--color-primary)' : undefined }} onClick={() => setSelected(p)}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                      <div style={{ fontWeight:600 }}>{p.Nombre}</div>
                      <span className="badge badge-primary">{CANAL_ICON[p.Canal]} {p.Canal}</span>
                    </div>
                    <div style={{ fontSize:'0.78rem', color:'var(--color-text-muted)' }}>{p.Evento} • {p.Idioma}</div>
                  </div>
                ))}
              </div>
              <div className="card">
                {!selected
                  ? <div className="empty-state"><div className="empty-icon">📋</div><div className="empty-title">Selecciona una plantilla</div></div>
                  : <>
                      <div className="card-header">
                        <h2 className="card-title">{selected.Nombre}</h2>
                        <span className="badge badge-primary">{CANAL_ICON[selected.Canal]} {selected.Canal}</span>
                      </div>
                      {selected.Asunto && <div style={{ fontSize:'0.85rem', fontWeight:600, marginBottom:8, color:'var(--color-text-secondary)' }}>Asunto: {selected.Asunto}</div>}
                      <div style={{ background:'var(--color-bg-input)', border:'1px solid var(--color-border)', borderRadius:'var(--radius-md)', padding:16, fontFamily:'var(--font-mono)', fontSize:'0.8rem', whiteSpace:'pre-wrap', color:'var(--color-text-secondary)', lineHeight:1.8 }}>
                        {selected.Cuerpo}
                      </div>
                    </>
                }
              </div>
            </div>

          : tab === 'enviar'
            ? <div className="card" style={{ maxWidth: 480 }}>
                <div className="card-header"><h2 className="card-title">📤 Enviar Comunicación</h2></div>
                <div className="form-group">
                  <label className="form-label">Plantilla</label>
                  <select id="sel-plantilla" className="form-select" value={form.ID_Plantilla} onChange={e => setForm(f => ({...f, ID_Plantilla:e.target.value}))}>
                    <option value="">Seleccionar...</option>
                    {plantillas.map(p => <option key={p.ID_Plantilla} value={p.ID_Plantilla}>{CANAL_ICON[p.Canal]} {p.Nombre}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Cliente</label>
                  <select id="sel-cliente" className="form-select" value={form.ID_Cliente} onChange={e => setForm(f => ({...f, ID_Cliente:e.target.value}))}>
                    <option value="">Seleccionar...</option>
                    {clientes.map(c => <option key={c.ID_Cliente} value={c.ID_Cliente}>{c.Nombre} {c.Apellido}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">ID Reserva (opcional)</label>
                  <input className="form-input" placeholder="Ej. 3" value={form.ID_Reserva} onChange={e => setForm(f => ({...f, ID_Reserva:e.target.value}))} />
                </div>
                <button id="btn-enviar-com" className="btn btn-primary" style={{ width:'100%', justifyContent:'center' }} onClick={handleEnviar}>📤 Enviar (Simulado)</button>
              </div>

            : <div className="card">
                <div className="table-wrap">
                  <table className="data-table">
                    <thead><tr><th>Plantilla</th><th>Cliente</th><th>Canal</th><th>Destinatario</th><th>Estado</th><th>Enviado</th></tr></thead>
                    <tbody>
                      {enviadas.map(e => (
                        <tr key={e.ID_Comunicacion}>
                          <td>{e.Plantilla}</td>
                          <td>{e.Cliente}</td>
                          <td>{CANAL_ICON[e.Canal]} {e.Canal}</td>
                          <td style={{ fontSize:'0.8rem' }}>{e.Destinatario}</td>
                          <td><span className={`badge badge-${ESTADO_COLOR[e.Estado]||'muted'}`}>{e.Estado}</span></td>
                          <td style={{ fontSize:'0.75rem', color:'var(--color-text-muted)' }}>{e.Fecha_Envio?.slice(0,16)}</td>
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
