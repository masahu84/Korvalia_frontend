/**
 * CorporateLoader - Loading corporativo de Korvalia
 * Animación elegante con los colores de la marca
 */

import { useEffect, useState } from 'react';
import './CorporateLoader.css';

interface CorporateLoaderProps {
  /** Mostrar el loader a pantalla completa (overlay) */
  fullScreen?: boolean;
  /** Texto a mostrar debajo del loader */
  text?: string;
  /** Tamaño del loader: 'sm' | 'md' | 'lg' */
  size?: 'sm' | 'md' | 'lg';
  /** Mostrar/ocultar el loader */
  visible?: boolean;
}

export default function CorporateLoader({
  fullScreen = false,
  text = 'Cargando propiedades...',
  size = 'md',
  visible = true,
}: CorporateLoaderProps) {
  const [show, setShow] = useState(visible);

  useEffect(() => {
    if (visible) {
      setShow(true);
    } else {
      // Pequeño delay para la animación de salida
      const timer = setTimeout(() => setShow(false), 300);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!show) return null;

  const loaderContent = (
    <div className={`corporate-loader ${size} ${visible ? 'visible' : 'hiding'}`}>
      <div className="loader-animation">
        {/* Icono de casa animado */}
        <div className="house-icon">
          <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Techo */}
            <path
              className="roof"
              d="M32 8L4 32h8v24h40V32h8L32 8z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Puerta */}
            <rect
              className="door"
              x="26"
              y="40"
              width="12"
              height="16"
              stroke="currentColor"
              strokeWidth="2"
            />
            {/* Ventana izquierda */}
            <rect
              className="window window-left"
              x="16"
              y="36"
              width="8"
              height="8"
              stroke="currentColor"
              strokeWidth="2"
            />
            {/* Ventana derecha */}
            <rect
              className="window window-right"
              x="40"
              y="36"
              width="8"
              height="8"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
        </div>

        {/* Puntos de carga */}
        <div className="loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>

      {text && <p className="loader-text">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className={`corporate-loader-overlay ${visible ? 'visible' : 'hiding'}`}>
        {loaderContent}
      </div>
    );
  }

  return loaderContent;
}

/**
 * Hook para usar el loader en componentes
 */
export function useLoader(initialState = false) {
  const [loading, setLoading] = useState(initialState);
  const [text, setText] = useState('Cargando propiedades...');

  const startLoading = (message?: string) => {
    if (message) setText(message);
    setLoading(true);
  };

  const stopLoading = () => {
    setLoading(false);
  };

  return { loading, text, startLoading, stopLoading, setLoading, setText };
}
