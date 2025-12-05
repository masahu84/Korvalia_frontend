/**
 * Componente Toast para mostrar mensajes de feedback
 * Se puede usar de forma global en el panel admin
 */

import { useState, useEffect, createContext, useContext, useCallback } from 'react';

type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (type: ToastType, message: string, duration?: number) => string;
  hideToast: (id: string) => void;
  showLoading: (message?: string) => string;
  hideLoading: (id: string) => void;
  updateToast: (id: string, type: ToastType, message: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

// Iconos para cada tipo de toast
const icons: Record<ToastType, string> = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
  loading: '◌',
};

// Colores para cada tipo
const colors: Record<ToastType, { bg: string; border: string; text: string; icon: string }> = {
  success: {
    bg: '#ecfdf5',
    border: '#10b981',
    text: '#065f46',
    icon: '#10b981',
  },
  error: {
    bg: '#fef2f2',
    border: '#ef4444',
    text: '#991b1b',
    icon: '#ef4444',
  },
  warning: {
    bg: '#fffbeb',
    border: '#f59e0b',
    text: '#92400e',
    icon: '#f59e0b',
  },
  info: {
    bg: '#eff6ff',
    border: '#3b82f6',
    text: '#1e40af',
    icon: '#3b82f6',
  },
  loading: {
    bg: '#f3f4f6',
    border: '#6b7280',
    text: '#374151',
    icon: '#6b7280',
  },
};

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const color = colors[toast.type];

  useEffect(() => {
    if (toast.type !== 'loading' && toast.duration !== 0) {
      const timer = setTimeout(() => {
        onClose();
      }, toast.duration || 4000);
      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '1rem 1.25rem',
        backgroundColor: color.bg,
        borderLeft: `4px solid ${color.border}`,
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        minWidth: '300px',
        maxWidth: '450px',
        animation: 'slideIn 0.3s ease-out',
      }}
    >
      <span
        style={{
          fontSize: '1.25rem',
          color: color.icon,
          fontWeight: 'bold',
          animation: toast.type === 'loading' ? 'spin 1s linear infinite' : 'none',
        }}
      >
        {icons[toast.type]}
      </span>
      <span style={{ flex: 1, color: color.text, fontSize: '0.9375rem', fontWeight: '500' }}>
        {toast.message}
      </span>
      {toast.type !== 'loading' && (
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: color.text,
            opacity: 0.6,
            fontSize: '1rem',
            padding: '0.25rem',
          }}
        >
          ✕
        </button>
      )}
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const generateId = () => Math.random().toString(36).substring(2, 9);

  const showToast = useCallback((type: ToastType, message: string, duration?: number): string => {
    const id = generateId();
    setToasts((prev) => [...prev, { id, type, message, duration }]);
    return id;
  }, []);

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showLoading = useCallback((message: string = 'Procesando...'): string => {
    return showToast('loading', message, 0);
  }, [showToast]);

  const hideLoading = useCallback((id: string) => {
    hideToast(id);
  }, [hideToast]);

  const updateToast = useCallback((id: string, type: ToastType, message: string) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, type, message, duration: 4000 } : t))
    );
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, hideToast, showLoading, hideLoading, updateToast }}>
      {children}
      {/* Toast Container */}
      <div
        style={{
          position: 'fixed',
          top: '1.5rem',
          right: '1.5rem',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={() => hideToast(toast.id)} />
        ))}
      </div>
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

// Componente de Loading overlay para operaciones largas
export function LoadingOverlay({ message = 'Cargando...' }: { message?: string }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9998,
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          padding: '2rem 3rem',
          borderRadius: '12px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            border: '4px solid #e5e7eb',
            borderTopColor: '#3b82f6',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <p style={{ color: '#374151', fontSize: '1rem', fontWeight: '500', margin: 0 }}>
          {message}
        </p>
      </div>
    </div>
  );
}

export default ToastProvider;
