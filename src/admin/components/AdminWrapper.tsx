/**
 * Wrapper para paginas del admin que provee el ToastProvider
 * Envuelve el contenido con el contexto necesario para Toast
 */

import { ToastProvider } from './Toast';

interface AdminWrapperProps {
  children: React.ReactNode;
}

export default function AdminWrapper({ children }: AdminWrapperProps) {
  return <ToastProvider>{children}</ToastProvider>;
}
