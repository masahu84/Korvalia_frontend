/**
 * Topbar del panel de administración
 */

import { useState, useEffect } from 'react';
import { logout } from '../lib/auth';

interface TopbarProps {
  title?: string;
}

export default function AdminTopbar({ title = 'Panel de Administración' }: TopbarProps) {
  const [userEmail, setUserEmail] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    // Obtener email del usuario si está disponible
    const storedEmail = localStorage.getItem('admin_email');
    if (storedEmail) {
      setUserEmail(storedEmail);
    }
  }, []);

  const handleLogout = () => {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      logout();
    }
  };

  return (
    <header className="admin-topbar">
      <div>
        <h1 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827' }}>{title}</h1>
      </div>

      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.5rem 1rem',
            backgroundColor: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f3f4f6';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#f9fafb';
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: '600',
              fontSize: '0.875rem',
            }}
          >
            {userEmail ? userEmail[0].toUpperCase() : 'A'}
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#111827' }}>
              {userEmail || 'Administrador'}
            </div>
          </div>
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            style={{ transition: 'transform 0.2s', transform: showDropdown ? 'rotate(180deg)' : 'rotate(0)' }}
          >
            <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {showDropdown && (
          <div
            style={{
              position: 'absolute',
              right: 0,
              top: 'calc(100% + 0.5rem)',
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
              minWidth: '200px',
              zIndex: 50,
            }}
          >
            <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #e5e7eb' }}>
              <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Conectado como</div>
              <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#111827', marginTop: '0.25rem' }}>
                {userEmail || 'admin@korvalia.com'}
              </div>
            </div>

            <div style={{ padding: '0.5rem' }}>
              <a
                href="/admin/account"
                style={{
                  display: 'block',
                  padding: '0.625rem 0.75rem',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  color: '#374151',
                  fontSize: '0.875rem',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                ⚙️ Configuración
              </a>

              <button
                onClick={handleLogout}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '0.625rem 0.75rem',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: '#dc2626',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#fee2e2';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                🚪 Cerrar sesión
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
