/**
 * GlobalLoader - Loader global para transiciones de página
 * Se activa automáticamente cuando hay navegación
 */

import { useEffect, useState } from 'react';
import CorporateLoader from './CorporateLoader';

interface GlobalLoaderProps {
  /** Mostrar mientras los datos se cargan inicialmente */
  initialLoading?: boolean;
  /** Texto personalizado */
  text?: string;
}

export default function GlobalLoader({
  initialLoading = false,
  text = 'Cargando...'
}: GlobalLoaderProps) {
  const [isNavigating, setIsNavigating] = useState(initialLoading);

  useEffect(() => {
    // Escuchar evento para mostrar loader
    const handleShowLoader = () => {
      setIsNavigating(true);
    };

    // Escuchar evento para ocultar loader
    const handleHideLoader = () => {
      setIsNavigating(false);
    };

    // Escuchar eventos personalizados
    window.addEventListener('showLoader', handleShowLoader);
    window.addEventListener('hideLoader', handleHideLoader);

    // Escuchar clicks en links para mostrar loader
    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');

      if (link && link.href && !link.href.startsWith('#') &&
          !link.href.includes('javascript:') &&
          !link.target &&
          link.hostname === window.location.hostname) {
        // Es un link interno, mostrar loader
        setIsNavigating(true);
      }
    };

    // Escuchar submit de formularios (solo los que causan navegación)
    const handleFormSubmit = (e: SubmitEvent) => {
      const form = e.target as HTMLFormElement;
      // Ignorar formularios con clase 'no-loader' o que usan JS (preventDefault)
      if (form.classList.contains('no-loader') || form.classList.contains('cta-form')) {
        return;
      }
      // Solo mostrar loader para formularios GET que causan navegación real
      if ((form.method === 'get' || !form.method) && form.action) {
        setIsNavigating(true);
      }
    };

    document.addEventListener('click', handleLinkClick);
    document.addEventListener('submit', handleFormSubmit as EventListener);

    // Ocultar loader cuando la página termine de cargar
    const handleLoad = () => {
      setIsNavigating(false);
    };

    window.addEventListener('load', handleLoad);

    // También ocultar cuando el DOM esté listo (para SSR)
    if (document.readyState === 'complete') {
      setIsNavigating(false);
    }

    return () => {
      window.removeEventListener('showLoader', handleShowLoader);
      window.removeEventListener('hideLoader', handleHideLoader);
      document.removeEventListener('click', handleLinkClick);
      document.removeEventListener('submit', handleFormSubmit as EventListener);
      window.removeEventListener('load', handleLoad);
    };
  }, []);

  return <CorporateLoader visible={isNavigating} fullScreen text={text} size="lg" />;
}

/**
 * Función helper para mostrar el loader programáticamente
 */
export function showGlobalLoader() {
  window.dispatchEvent(new CustomEvent('showLoader'));
}

/**
 * Función helper para ocultar el loader programáticamente
 */
export function hideGlobalLoader() {
  window.dispatchEvent(new CustomEvent('hideLoader'));
}
