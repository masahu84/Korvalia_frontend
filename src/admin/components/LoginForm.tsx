/**
 * Formulario de login del admin
 */

import { useState } from 'react';
import { login } from '../lib/auth';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
        <h1 className="auth-logo">Korvalia</h1>
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
