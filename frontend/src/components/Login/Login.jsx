import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { login } from '../../services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const container = useRef();

  useGSAP(() => {
    const orbs = gsap.utils.toArray('.login-bg-orb');
    orbs.forEach((orb, i) => {
      gsap.to(orb, { x: i % 2 === 0 ? 60 : -60, y: 40, duration: 8 + i * 2, repeat: -1, yoyo: true, ease: 'sine.inOut' });
    });
    gsap.from('.login-logo-icon', { scale: 0, rotation: -180, duration: 0.8, ease: 'back.out(2)' });
    gsap.from('.login-title, .login-subtitle', { y: -20, opacity: 0, duration: 0.6, stagger: 0.15, delay: 0.3 });
    gsap.from('.form-group', { y: 20, opacity: 0, duration: 0.5, stagger: 0.1, delay: 0.5 });
    gsap.from('.btn-login', { scale: 0.9, opacity: 0, duration: 0.5, delay: 0.8, ease: 'back.out(1.7)' });
  }, { scope: container });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(email, password);
      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        // GSAP exit
        gsap.to('.login-card', { scale: 0.95, opacity: 0, duration: 0.3, onComplete: () => navigate('/') });
      } else {
        setError(data.message || 'Credenciales inválidas');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page" ref={container}>
      {/* Orbs decorativos */}
      <div className="login-bg-orb" style={{ width: 400, height: 400, background: 'rgba(99,102,241,0.08)', top: '-10%', left: '-10%' }} />
      <div className="login-bg-orb" style={{ width: 300, height: 300, background: 'rgba(139,92,246,0.06)', bottom: '-5%', right: '-5%' }} />
      <div className="login-bg-orb" style={{ width: 200, height: 200, background: 'rgba(6,182,212,0.05)', top: '50%', left: '60%' }} />

      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-icon">🏨</div>
          <div className="login-title">Hotel Enterprise</div>
          <div className="login-subtitle">Sistema de Gestión v2.0</div>
        </div>

        {error && <div className="login-error">⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Correo electrónico</label>
            <input id="login-email" className="form-input" type="email" placeholder="admin@hotel.com" value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <input id="login-password" className="form-input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button id="login-btn" className="btn btn-primary btn-login" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: 8, padding: '12px' }}>
            {loading ? '🔄 Autenticando...' : '🔐 Iniciar Sesión'}
          </button>
        </form>

        <div style={{ marginTop: 24, padding: '14px', background: 'rgba(99,102,241,0.06)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(99,102,241,0.15)' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginBottom: 6 }}>CREDENCIALES DEMO</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>📧 admin@hotel.com / Admin123!</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>📧 recepcion@hotel.com / Recep123!</div>
        </div>
      </div>
    </div>
  );
}
