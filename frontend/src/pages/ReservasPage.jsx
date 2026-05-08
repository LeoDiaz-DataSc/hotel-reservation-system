import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { getReservas, checkIn, checkOut, cancelReserva } from '../services/api';

const ESTADOS = ['Todas', 'Pendiente', 'Confirmada', 'Check-in', 'Check-out', 'Cancelada'];
const BADGE = { 'Check-in': 'success', Confirmada: 'info', Pendiente: 'warning', 'Check-out': 'muted', Cancelada: 'danger' };

export default function ReservasPage() {
  const [reservas, setReservas] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState('Todas');
  const [loading, setLoading] = useState(true);
  const [buscar, setBuscar] = useState('');
  const container = useRef();

  useGSAP(() => {
    gsap.from('.page-title,.page-subtitle', { y: -20, opacity: 0, duration: 0.6, stagger: 0.15, ease: 'power3.out' });
    gsap.from('.card', { y: 20, opacity: 0, duration: 0.5, delay: 0.2 });
  }, { scope: container });

  const load = async () => {
    setLoading(true);
    try {
      const params = filtroEstado !== 'Todas' ? { estado: filtroEstado } : {};
      const res = await getReservas(params);
      setReservas(res.data || []);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [filtroEstado]);

  const handleCheckIn = async (id) => {
    if (!confirm('¿Confirmar check-in?')) return;
    await checkIn(id); load();
  };
  const handleCheckOut = async (id) => {
    if (!confirm('¿Confirmar check-out?')) return;
    await checkOut(id); load();
  };
  const handleCancel = async (id) => {
    const motivo = prompt('Motivo de cancelación:');
    if (motivo === null) return;
    await cancelReserva(id, motivo); load();
  };

  const filtradas = reservas.filter(r =>
    !buscar || r.Huesped?.toLowerCase().includes(buscar.toLowerCase()) ||
    r.Folio?.includes(buscar) || r.Numero_Habitacion?.includes(buscar)
  );

  return (
    <div ref={container}>
      <div className="page-title">Reservas</div>
      <div className="page-subtitle">Gestión de folios, check-in y check-out</div>

      <div className="filters-row">
        <div className="search-input" style={{ position: 'relative' }}>
          <span className="search-icon" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }}>🔍</span>
          <input id="buscar-reserva" className="form-input" style={{ paddingLeft: 34, width: 260 }} placeholder="Folio, huésped o habitación..." value={buscar} onChange={e => setBuscar(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {ESTADOS.map(e => (
            <button key={e} id={`filtro-${e}`} className={`btn btn-sm ${filtroEstado === e ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFiltroEstado(e)}>{e}</button>
          ))}
        </div>
      </div>

      <div className="card">
        {loading
          ? <div className="loading-spinner"><div className="spinner" /></div>
          : filtradas.length === 0
            ? <div className="empty-state"><div className="empty-icon">📅</div><div className="empty-title">Sin reservas</div></div>
            : <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Folio</th><th>Huésped</th><th>Habitación</th><th>Entrada</th><th>Salida</th>
                      <th>Noches</th><th>Total</th><th>Estado</th><th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtradas.map(r => (
                      <tr key={r.ID_Reserva}>
                        <td><span className="font-mono" style={{ color: 'var(--color-primary-hover)' }}>{r.Folio}</span></td>
                        <td>{r.Huesped}</td>
                        <td>🛏️ {r.Numero_Habitacion} <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{r.Tipo_Habitacion}</span></td>
                        <td>{r.Fecha_Entrada?.slice(0,10)}</td>
                        <td>{r.Fecha_Salida?.slice(0,10)}</td>
                        <td style={{ textAlign: 'center' }}>{r.Noches}</td>
                        <td>${Number(r.Total_Real || r.Total_Estimado || 0).toLocaleString()}</td>
                        <td><span className={`badge badge-${BADGE[r.Estado] || 'muted'}`}>{r.Estado}</span></td>
                        <td>
                          <div style={{ display: 'flex', gap: 4 }}>
                            {r.Estado === 'Confirmada' && <button className="btn btn-success btn-sm" onClick={() => handleCheckIn(r.ID_Reserva)}>Check-in</button>}
                            {r.Estado === 'Check-in'   && <button className="btn btn-primary btn-sm" onClick={() => handleCheckOut(r.ID_Reserva)}>Check-out</button>}
                            {['Pendiente','Confirmada'].includes(r.Estado) && <button className="btn btn-danger btn-sm" onClick={() => handleCancel(r.ID_Reserva)}>Cancelar</button>}
                          </div>
                        </td>
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
