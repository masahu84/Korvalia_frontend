/**
 * Wrapper que incluye el ToastProvider para todos los componentes del admin
 * Uso: envolver cualquier componente que necesite acceso a Toast
 */

import { type ReactNode } from 'react';
import { ToastProvider } from './Toast';

interface AdminWrapperProps {
  children: ReactNode;
}

export default function AdminWrapper({ children }: AdminWrapperProps) {
  return <ToastProvider>{children}</ToastProvider>;
}
