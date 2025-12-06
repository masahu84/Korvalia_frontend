/**
 * Componente Toast para mostrar mensajes de feedback
 * Toast y Loading aparecen CENTRADOS en la pantalla como modal flotante
 */

import { useState, useEffect, createContext, useContext, useCallback } from 'react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextType {
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
  loading: (message?: string) => void;
  dismiss: () => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

// Colores e iconos para cada tipo
const toastConfig: Record<ToastType, { bg: string; border: string; icon: string; iconBg: string }> = {
  success: {
    bg: '#ffffff',
    border: '#10b981',
    icon: '✓',
    iconBg: '#d1fae5',
  },
  error: {
    bg: '#ffffff',
    border: '#ef4444',
    icon: '✕',
    iconBg: '#fee2e2',
  },
  warning: {
    bg: '#ffffff',
    border: '#f59e0b',
    icon: '⚠',
    iconBg: '#fef3c7',
  },
  info: {
    bg: '#ffffff',
    border: '#3b82f6',
    icon: 'ℹ',
    iconBg: '#dbeafe',
  },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Procesando...');

  // Auto-dismiss toast después de la duración
  useEffect(() => {
    if (toast && toast.duration) {
      const timer = setTimeout(() => {
        setToast(null);
      }, toast.duration);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = useCallback((type: ToastType, message: string, duration: number = 3000) => {
    // Primero ocultar loading si está activo
    setIsLoading(false);
    // Mostrar toast
    setToast({ id: Date.now().toString(), type, message, duration });
  }, []);

  const success = useCallback((message: string) => {
    showToast('success', message, 3000);
  }, [showToast]);

  const error = useCallback((message: string) => {
    showToast('error', message, 4000);
  }, [showToast]);

  const warning = useCallback((message: string) => {
    showToast('warning', message, 3500);
  }, [showToast]);

  const info = useCallback((message: string) => {
    showToast('info', message, 3000);
  }, [showToast]);

  const loading = useCallback((message: string = 'Procesando...') => {
    setToast(null); // Ocultar cualquier toast previo
    setLoadingMessage(message);
    setIsLoading(true);
  }, []);

  const dismiss = useCallback(() => {
    setIsLoading(false);
    setToast(null);
  }, []);

  return (
    <ToastContext.Provider value={{ success, error, warning, info, loading, dismiss }}>
      {children}

      {/* LOADING OVERLAY - Centrado en pantalla completa */}
      {isLoading && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            animation: 'fadeIn 0.15s ease-out',
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '2rem 3rem',
              borderRadius: '16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1.25rem',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
              animation: 'scaleIn 0.2s ease-out',
              minWidth: '280px',
            }}
          >
            <div
              style={{
                width: '50px',
                height: '50px',
                border: '4px solid #e5e7eb',
                borderTopColor: '#3b82f6',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
              }}
            />
            <p style={{
              color: '#374151',
              fontSize: '1rem',
              fontWeight: '600',
              margin: 0,
              textAlign: 'center',
            }}>
              {loadingMessage}
            </p>
          </div>
        </div>
      )}

      {/* TOAST - Centrado en pantalla como modal */}
      {toast && !isLoading && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99998,
            animation: 'fadeIn 0.15s ease-out',
          }}
          onClick={() => setToast(null)}
        >
          <div
            style={{
              backgroundColor: toastConfig[toast.type].bg,
              padding: '1.5rem 2rem',
              borderRadius: '16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
              animation: 'scaleIn 0.2s ease-out',
              minWidth: '300px',
              maxWidth: '400px',
              border: `3px solid ${toastConfig[toast.type].border}`,
              cursor: 'pointer',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Icono grande */}
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: toastConfig[toast.type].iconBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `3px solid ${toastConfig[toast.type].border}`,
              }}
            >
              <span
                style={{
                  fontSize: '2rem',
                  color: toastConfig[toast.type].border,
                  fontWeight: 'bold',
                }}
              >
                {toastConfig[toast.type].icon}
              </span>
            </div>

            {/* Mensaje */}
            <p style={{
              color: '#1f2937',
              fontSize: '1.0625rem',
              fontWeight: '600',
              margin: 0,
              textAlign: 'center',
              lineHeight: '1.5',
            }}>
              {toast.message}
            </p>

            {/* Botón cerrar */}
            <button
              onClick={() => setToast(null)}
              style={{
                marginTop: '0.5rem',
                padding: '0.625rem 2rem',
                backgroundColor: toastConfig[toast.type].border,
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.9375rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.9';
                e.currentTarget.style.transform = 'scale(1.02)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              Aceptar
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export default ToastProvider;
