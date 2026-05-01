import { useState, useEffect } from 'react';
import { getClientes, getHabitaciones, getReservas } from '../../services/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
    const [stats, setStats] = useState({ clientes: 0, habitaciones: 0, reservas: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [clientesRes, habRes, resRes] = await Promise.all([
                    getClientes(),
                    getHabitaciones(),
                    getReservas()
                ]);

                setStats({
                    clientes: clientesRes.success ? clientesRes.data.length : 0,
                    habitaciones: habRes.success ? habRes.data.length : 0,
                    reservas: resRes.success ? resRes.data.length : 0
                });
            } catch (error) {
                console.error("Error fetching data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

    const dummyData = [
        { name: 'Lun', reservas: 4 },
        { name: 'Mar', reservas: 3 },
        { name: 'Mie', reservas: 2 },
        { name: 'Jue', reservas: 6 },
        { name: 'Vie', reservas: 8 },
        { name: 'Sab', reservas: 10 },
        { name: 'Dom', reservas: 5 },
    ];

    return (
        <div className="dashboard-container">
            <h1 className="page-title">Hotel Reservations Dashboard</h1>
            <p className="page-subtitle">Monitoreo de ocupación y clientes</p>

            <div className="grid-container" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title">Clientes Registrados</h2>
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                        {stats.clientes}
                    </div>
                </div>
                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title">Habitaciones Activas</h2>
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-success)' }}>
                        {stats.habitaciones}
                    </div>
                </div>
                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title">Reservas Totales</h2>
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-warning)' }}>
                        {stats.reservas}
                    </div>
                </div>
            </div>

            <div className="card" style={{ marginTop: '2rem' }}>
                <div className="card-header">
                    <h2 className="card-title">Tendencia de Reservas</h2>
                </div>
                <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                        <AreaChart data={dummyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <XAxis dataKey="name" stroke="#94a3b8" />
                            <YAxis stroke="#94a3b8" />
                            <Tooltip contentStyle={{ backgroundColor: '#1a2332', borderColor: '#1e293b' }} />
                            <Area type="monotone" dataKey="reservas" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
