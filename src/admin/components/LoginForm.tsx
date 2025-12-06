/**
 * Formulario de login del admin
 */

import { useState, useEffect } from 'react';
import { login } from '../lib/auth';

const API_BASE = typeof window !== 'undefined'
  ? (import.meta.env?.PUBLIC_API_URL || 'http://localhost:4000')
  : 'http://localhost:4000';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [logoUrl, setLogoUrl] = useState('/logo.png');

  useEffect(() => {
    // Cargar logo desde settings
    fetch(`${API_BASE}/api/settings`)
      .then(res => res.json())
      .then(data => {
        if (data.data?.logo) {
          const logo = data.data.logo;
          if (logo.startsWith('http')) {
            setLogoUrl(logo);
          } else {
            setLogoUrl(`${API_BASE}${logo.startsWith('/') ? '' : '/'}${logo}`);
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await login({ email, password });

      // Guardar email para mostrarlo en el topbar
      if (response.data?.user?.email) {
        localStorage.setItem('admin_email', response.data.user.email);
      }

      // Redirigir al dashboard
      window.location.href = '/admin/dashboard';
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión. Verifica tus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <div className="auth-header">
        <img src={logoUrl} alt="Korvalia" className="auth-logo-img" />
        <p className="auth-subtitle">Panel de Administración</p>
      </div>

      {error && <div className="auth-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="auth-form-group">
          <label htmlFor="email" className="auth-label">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="auth-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@korvalia.com"
            required
            autoComplete="email"
          />
        </div>

        <div className="auth-form-group">
          <label htmlFor="password" className="auth-label">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            className="auth-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            autoComplete="current-password"
          />
        </div>

        <button type="submit" className="auth-btn" disabled={loading}>
          {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
        </button>
      </form>

      <div className="auth-link">
        <a href="/admin/reset-password">¿Olvidaste tu contraseña?</a>
      </div>
    </div>
  );
}
