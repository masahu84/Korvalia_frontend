/**
 * Configuración de cuenta (cambio de contraseña)
 */

import { useState, useEffect } from 'react';
import { changePassword } from '../lib/auth';
import { api } from '../lib/api';
import { useToast, ToastProvider } from './Toast';

function AccountSettingsInner() {
  const [userEmail, setUserEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const toast = useToast();

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

    if (newPassword !== confirmPassword) {
      toast.error('Las contraseñas nuevas no coinciden');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    toast.loading('Actualizando contraseña...');

    try {
      await changePassword({
        currentPassword,
        newPassword,
      });

      toast.success('Contraseña actualizada correctamente');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err.message || 'Error al cambiar la contraseña');
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

// Componente exportado con ToastProvider
export default function AccountSettings() {
  return (
    <ToastProvider>
      <AccountSettingsInner />
    </ToastProvider>
  );
}
