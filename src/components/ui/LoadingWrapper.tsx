/**
 * LoadingWrapper - Wrapper con loading para contenido de Emblematic
 * Maneja automáticamente el estado de carga
 */

import CorporateLoader from './CorporateLoader';
import './CorporateLoader.css';

interface LoadingWrapperProps {
  /** Estado de carga */
  loading: boolean;
  /** Contenido a mostrar cuando no está cargando */
  children: React.ReactNode;
  /** Texto del loader */
  text?: string;
  /** Tamaño del loader */
  size?: 'sm' | 'md' | 'lg';
  /** Altura mínima del contenedor */
  minHeight?: string;
  /** Usar overlay en pantalla completa */
  fullScreen?: boolean;
}

export default function LoadingWrapper({
  loading,
  children,
  text = 'Cargando propiedades...',
  size = 'md',
  minHeight = '300px',
  fullScreen = false,
}: LoadingWrapperProps) {
  if (fullScreen) {
    return (
      <>
        <CorporateLoader visible={loading} fullScreen text={text} size={size} />
        {children}
      </>
    );
  }

  if (loading) {
    return (
      <div className="corporate-loader-inline" style={{ minHeight }}>
        <CorporateLoader visible={true} text={text} size={size} />
      </div>
    );
  }

  return <>{children}</>;
}

/**
 * SkeletonGrid - Grid de skeleton cards para propiedades
 */
export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="skeleton-grid" style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: '1.5rem',
    }}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

/**
 * SkeletonCard - Tarjeta skeleton individual
 */
export function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-image" />
      <div className="skeleton-content">
        <div className="skeleton-line title" />
        <div className="skeleton-line subtitle" />
        <div className="skeleton-line" style={{ width: '70%' }} />
        <div className="skeleton-line price" />
      </div>
    </div>
  );
}
