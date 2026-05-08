import { useState, useEffect } from 'react';
import { getServicios, getCargos, addCargo } from '../services/api';

const CAT_ICON = { Restaurante:'🍽️', 'Room Service':'🛎️', Spa:'💆', Lavanderia:'👔', Minibar:'🍺', Otro:'📦' };
const CAT_COLOR = { Restaurante:'#10b981','Room Service':'#6366f1',Spa:'#8b5cf6',Lavanderia:'#06b6d4',Minibar:'#f59e0b',Otro:'#64748b' };

export default function ServiciosPage() {
  const [servicios, setServicios] = useState([]);
  const [cargos, setCargos] = useState([]);
  const [catFiltro, setCatFiltro] = useState('');
  const [idReserva, setIdReserva] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params = catFiltro ? { categoria: catFiltro } : {};
        const res = await getServicios(params);
        setServicios(res.data || []);
      } finally { setLoading(false); }
    };
    load();
  }, [catFiltro]);

  const loadCargos = async () => {
    if (!idReserva) return;
    const res = await getCargos(idReserva);
    setCargos(res.data || []);
  };

  const handleCargo = async (svc) => {
    if (!idReserva) return alert('Ingresa un ID de Reserva primero');
    const cant = parseInt(prompt(`Cantidad de "${svc.Nombre_Servicio}":`) || '1');
    if (cant < 1) return;
    await addCargo({ ID_Reserva: parseInt(idReserva), ID_Servicio: svc.ID_Servicio, Cantidad: cant });
    loadCargos();
  };

  const cats = [...new Set(servicios.map(s => s.Categoria))];
  const totalCargos = cargos.reduce((s, c) => s + parseFloat(c.Subtotal), 0);

  return (
    <div>
      <div className="page-title">Punto de Venta</div>
      <div className="page-subtitle">Catálogo de servicios — Cargos al folio</div>

      <div className="filters-row">
        <input id="id-reserva" className="form-input" style={{ width: 180 }} placeholder="ID Reserva..." value={idReserva} onChange={e => setIdReserva(e.target.value)} onBlur={loadCargos} />
        <select id="cat-filtro" className="form-select" style={{ width: 180 }} value={catFiltro} onChange={e => setCatFiltro(e.target.value)}>
          <option value="">Todas las categorías</option>
          {cats.map(c => <option key={c} value={c}>{CAT_ICON[c]} {c}</option>)}
        </select>
      </div>

      <div className="grid-2">
        {/* Catálogo */}
        <div>
          <div style={{ fontSize:'0.85rem', fontWeight:600, color:'var(--color-text-muted)', marginBottom:12 }}>CATÁLOGO DE SERVICIOS</div>
          {loading ? <div className="loading-spinner"><div className="spinner"/></div>
            : <div className="grid-auto">
                {servicios.map(s => (
                  <div key={s.ID_Servicio} className="card" style={{ cursor:'pointer', borderColor: catFiltro === s.Categoria ? `${CAT_COLOR[s.Categoria]}50` : undefined }} onClick={() => handleCargo(s)}>
                    <div style={{ fontSize:'1.5rem', marginBottom:8 }}>{CAT_ICON[s.Categoria]}</div>
                    <div style={{ fontWeight:600, fontSize:'0.9rem', marginBottom:4 }}>{s.Nombre_Servicio}</div>
                    <div style={{ fontSize:'0.75rem', color:'var(--color-text-muted)', marginBottom:8 }}>{s.Descripcion?.slice(0,60)}...</div>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <span style={{ fontSize:'1.1rem', fontWeight:700, color:'var(--color-success)' }}>${Number(s.Precio).toLocaleString()}</span>
                      <span className="badge" style={{ background:`${CAT_COLOR[s.Categoria]}20`, color:CAT_COLOR[s.Categoria] }}>{s.Categoria}</span>
                    </div>
                    <div style={{ marginTop:10, fontSize:'0.72rem', color:'var(--color-primary)', textAlign:'center' }}>+ Agregar al folio</div>
                  </div>
                ))}
              </div>
          }
        </div>

        {/* Folio de cargos */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">🧾 Folio de Cargos {idReserva && `— Reserva #${idReserva}`}</h2>
            {idReserva && <button className="btn btn-secondary btn-sm" onClick={loadCargos}>↻ Refrescar</button>}
          </div>
          {cargos.length === 0
            ? <div className="empty-state"><div className="empty-icon">🛎️</div><div className="empty-title">{idReserva ? 'Sin cargos' : 'Ingresa un ID de Reserva'}</div></div>
            : <>
                {cargos.map((c,i) => (
                  <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid var(--color-border)', alignItems:'center' }}>
                    <div>
                      <div style={{ fontSize:'0.875rem', fontWeight:600 }}>{c.Nombre_Servicio}</div>
                      <div style={{ fontSize:'0.75rem', color:'var(--color-text-muted)' }}>x{c.Cantidad} × ${Number(c.Precio_Unitario).toLocaleString()}</div>
                    </div>
                    <div style={{ textAlign:'right' }}>
                      <div style={{ fontWeight:700 }}>${Number(c.Subtotal).toLocaleString()}</div>
                      <span className={`badge badge-${c.Estado==='Cobrado'?'success':c.Estado==='Cortesía'?'info':'warning'}`}>{c.Estado}</span>
                    </div>
                  </div>
                ))}
                <div style={{ display:'flex', justifyContent:'space-between', marginTop:16, padding:'12px 0', borderTop:'2px solid var(--color-border)' }}>
                  <strong>TOTAL SERVICIOS</strong>
                  <strong style={{ fontSize:'1.2rem', color:'var(--color-success)' }}>${totalCargos.toLocaleString()}</strong>
                </div>
              </>
          }
        </div>
      </div>
    </div>
  );
}
