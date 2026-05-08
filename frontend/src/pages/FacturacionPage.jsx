import { useState, useEffect } from 'react';
import { getFacturas, getPagos, addPago } from '../services/api';

export default function FacturacionPage() {
  const [facturas, setFacturas] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [idReserva, setIdReserva] = useState('');
  const [loading, setLoading] = useState(true);
  const [pagoForm, setPagoForm] = useState({ Monto:'', Metodo_Pago:'Tarjeta_Credito', Tipo_Pago:'Liquidacion', Ultimos_4:'', Marca_Tarjeta:'Visa' });

  useEffect(() => {
    getFacturas().then(r => { setFacturas(r.data || []); setLoading(false); });
  }, []);

  const loadPagos = async () => {
    if (!idReserva) return;
    const r = await getPagos(idReserva);
    setPagos(r.data || []);
  };

  const handlePago = async (e) => {
    e.preventDefault();
    if (!idReserva) return alert('Ingresa un ID de Reserva');
    await addPago({ ...pagoForm, ID_Reserva: parseInt(idReserva), Monto: parseFloat(pagoForm.Monto) });
    setPagoForm(p => ({ ...p, Monto:'' }));
    loadPagos();
  };

  const totalPagado = pagos.reduce((s,p) => s + parseFloat(p.Monto), 0);
  const METODO_ICON = { Efectivo:'💵', Tarjeta_Credito:'💳', Tarjeta_Debito:'🏧', Transferencia:'🏦', Puntos_Lealtad:'🏅' };

  return (
    <div>
      <div className="page-title">Facturación</div>
      <div className="page-subtitle">Pagos PCI-DSS y emisión de CFDI 4.0</div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* Registro de pagos */}
        <div className="card">
          <div className="card-header"><h2 className="card-title">💳 Registrar Pago</h2></div>
          <div className="form-group">
            <label className="form-label">ID de Reserva</label>
            <div style={{ display:'flex', gap:8 }}>
              <input id="pago-reserva" className="form-input" placeholder="Ej. 1" value={idReserva} onChange={e => setIdReserva(e.target.value)} />
              <button className="btn btn-secondary" onClick={loadPagos}>Ver pagos</button>
            </div>
          </div>
          <form onSubmit={handlePago}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Monto</label>
                <input id="pago-monto" className="form-input" type="number" step="0.01" placeholder="0.00" value={pagoForm.Monto} onChange={e => setPagoForm(p => ({...p, Monto:e.target.value}))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Tipo de Pago</label>
                <select className="form-select" value={pagoForm.Tipo_Pago} onChange={e => setPagoForm(p => ({...p, Tipo_Pago:e.target.value}))}>
                  <option value="Deposito">Depósito</option>
                  <option value="Liquidacion">Liquidación</option>
                  <option value="Reembolso">Reembolso</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Método</label>
                <select id="pago-metodo" className="form-select" value={pagoForm.Metodo_Pago} onChange={e => setPagoForm(p => ({...p, Metodo_Pago:e.target.value}))}>
                  <option value="Efectivo">💵 Efectivo</option>
                  <option value="Tarjeta_Credito">💳 Tarjeta Crédito</option>
                  <option value="Tarjeta_Debito">🏧 Tarjeta Débito</option>
                  <option value="Transferencia">🏦 Transferencia</option>
                  <option value="Puntos_Lealtad">🏅 Puntos Lealtad</option>
                </select>
              </div>
              {pagoForm.Metodo_Pago.startsWith('Tarjeta') && (
                <div className="form-group">
                  <label className="form-label">Últimos 4 dígitos</label>
                  <input className="form-input font-mono" maxLength={4} placeholder="••••" value={pagoForm.Ultimos_4} onChange={e => setPagoForm(p => ({...p, Ultimos_4:e.target.value}))} />
                </div>
              )}
            </div>
            <button id="btn-registrar-pago" className="btn btn-primary" type="submit" style={{ width:'100%', justifyContent:'center' }}>💾 Registrar Pago</button>
          </form>

          {/* Historial de pagos */}
          {pagos.length > 0 && (
            <div style={{ marginTop:20, borderTop:'1px solid var(--color-border)', paddingTop:16 }}>
              {pagos.map((p,i) => (
                <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', fontSize:'0.85rem' }}>
                  <span>{METODO_ICON[p.Metodo_Pago]} {p.Metodo_Pago.replace('_',' ')} {p.Ultimos_4 && `••••${p.Ultimos_4}`}</span>
                  <span style={{ fontWeight:700, color:'var(--color-success)' }}>${Number(p.Monto).toLocaleString()}</span>
                </div>
              ))}
              <div style={{ display:'flex', justifyContent:'space-between', borderTop:'1px solid var(--color-border)', paddingTop:8, marginTop:4, fontWeight:700 }}>
                <span>TOTAL PAGADO</span>
                <span style={{ color:'var(--color-success)' }}>${totalPagado.toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>

        {/* Facturas CFDI */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">🧾 Facturas CFDI 4.0</h2>
          </div>
          {loading ? <div className="loading-spinner"><div className="spinner"/></div>
            : facturas.length === 0
              ? <div className="empty-state"><div className="empty-icon">🧾</div><div className="empty-title">Sin facturas emitidas</div></div>
              : <div className="table-wrap">
                  <table className="data-table">
                    <thead><tr><th>Folio</th><th>RFC Receptor</th><th>Total</th><th>Estado</th><th>Fecha</th></tr></thead>
                    <tbody>
                      {facturas.map(f => (
                        <tr key={f.ID_Factura}>
                          <td><span className="font-mono" style={{ color:'var(--color-primary-hover)' }}>A-{f.Folio_Fiscal}</span></td>
                          <td className="font-mono">{f.RFC_Receptor}</td>
                          <td style={{ fontWeight:700 }}>${Number(f.Total).toLocaleString()}</td>
                          <td><span className={`badge badge-${f.Estado==='Timbrada'?'success':f.Estado==='Cancelada'?'danger':'warning'}`}>{f.Estado}</span></td>
                          <td style={{ fontSize:'0.78rem' }}>{f.Fecha_Emision?.slice(0,10)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
          }
          <div style={{ marginTop:16, padding:'12px', background:'rgba(99,102,241,0.06)', borderRadius:'var(--radius-md)', border:'1px solid rgba(99,102,241,0.15)', fontSize:'0.78rem', color:'var(--color-text-muted)' }}>
            🔒 <strong>PCI-DSS:</strong> No se almacenan PAN ni CVV — solo últimos 4 dígitos y token de gateway.<br/>
            📋 <strong>CFDI 4.0:</strong> Timbrado SAT simulado con UUID único por factura.
          </div>
        </div>
      </div>
    </div>
  );
}
