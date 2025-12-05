/**
 * Configuración de cuenta (cambio de contraseña)
 */

import { useState, useEffect } from 'react';
import { changePassword } from '../lib/auth';
import { api } from '../lib/api';

export default function AccountSettings() {
  const [userEmail, setUserEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await api.get('/auth/me');
      setUserEmail(response.data?.email || '');
    } catch (err) {
      console.error('Error al cargar datos del usuario');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas nuevas no coinciden');
      return;
    }

    if (newPassword.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      await changePassword({
        currentPassword,
        newPassword,
      });

      setSuccess('Contraseña actualizada correctamente');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message || 'Error al cambiar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="admin-card" style={{ marginBottom: '2rem' }}>
        <div className="admin-card-header">
          <h2 className="admin-card-title">Información de la Cuenta</h2>
        </div>

        <div className="admin-form-group">
          <label className="admin-label">Email</label>
          <input
            type="email"
            className="admin-input"
            value={userEmail}
            disabled
            style={{ backgroundColor: '#f9fafb', cursor: 'not-allowed' }}
          />
          <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>
            El email no puede ser modificado
          </p>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <h2 className="admin-card-title">Cambiar Contraseña</h2>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
            Actualiza tu contraseña de acceso al panel de administración
          </p>
        </div>

        {error && (
          <div
            style={{
              backgroundColor: '#fee2e2',
              color: '#991b1b',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              marginBottom: '1.5rem',
              borderLeft: '4px solid #dc2626',
            }}
          >
            {error}
          </div>
        )}

        {success && (
          <div
            style={{
              backgroundColor: '#d1fae5',
              color: '#065f46',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              marginBottom: '1.5rem',
              borderLeft: '4px solid #10b981',
            }}
          >
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="admin-form-group">
            <label className="admin-label">Contraseña Actual *</label>
            <input
              type="password"
              className="admin-input"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-label">Nueva Contraseña *</label>
            <input
              type="password"
              className="admin-input"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              autoComplete="new-password"
            />
            <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>
              Mínimo 6 caracteres
            </p>
          </div>

          <div className="admin-form-group">
            <label className="admin-label">Confirmar Nueva Contraseña *</label>
            <input
              type="password"
              className="admin-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>

          <button type="submit" className="admin-btn admin-btn-primary" disabled={loading}>
            {loading ? 'Actualizando...' : 'Cambiar Contraseña'}
          </button>
        </form>
      </div>
    </div>
  );
}
