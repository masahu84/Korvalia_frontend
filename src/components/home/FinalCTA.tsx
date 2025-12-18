/**
 * Componente CTA final de la home
 * Permite a los usuarios registrarse dejando su teléfono
 */

import { useState } from 'react';
import './FinalCTA.css';

interface FinalCTAProps {
  /** Origen del lead para tracking */
  source?: string;
}

export default function FinalCTA({ source = 'cta_home' }: FinalCTAProps) {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  /**
   * Valida un teléfono español
   */
  const validatePhone = (phone: string): boolean => {
    const cleanPhone = phone.replace(/[\s\-]/g, '');
    const phoneRegex = /^(\+34|0034)?[6789]\d{8}$/;
    return phoneRegex.test(cleanPhone);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phone || !validatePhone(phone)) {
      setMessage({ type: 'error', text: 'Por favor, introduce un teléfono válido' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const API_BASE = import.meta.env.PUBLIC_API_URL || 'http://localhost:4000';
      const response = await fetch(`${API_BASE}/api/leads/phone`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: phone,
          source: source,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          type: 'success',
          text: '¡Gracias! Te llamaremos lo antes posible.'
        });
        setPhone('');

        // Limpiar mensaje después de 5 segundos
        setTimeout(() => {
          setMessage(null);
        }, 5000);
      } else {
        setMessage({
          type: 'error',
          text: data.message || 'Hubo un error. Por favor, inténtalo de nuevo.'
        });
      }
    } catch (error) {
      console.error('Error al enviar teléfono:', error);
      setMessage({
        type: 'error',
        text: 'No se pudo conectar con el servidor. Por favor, inténtalo más tarde.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="final-cta">
      <div className="container">
        <div className="cta-content">
          <h2 className="cta-title">¿Buscas casa o quieres vender la tuya?</h2>
          <p className="cta-subtitle">Te ayudamos y asesoramos en todo el proceso</p>

          {/* Mensaje de éxito o error */}
          {message && (
            <div className={`cta-message cta-message-${message.type}`}>
              {message.text}
            </div>
          )}

          {/* Formulario teléfono */}
          <form className="cta-form no-loader" onSubmit={handleSubmit}>
            <input
              type="tel"
              name="phone"
              className="cta-input"
              placeholder="Introduce tu número de teléfono"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={loading}
              required
            />
            <button type="submit" className="cta-submit" disabled={loading}>
              {loading ? (
                <span className="cta-submit-loading">
                  <span className="cta-spinner"></span>
                  Enviando...
                </span>
              ) : (
                'Te llamamos'
              )}
            </button>
          </form>

          <p className="cta-footer-text">Más de 100 clientes han confiado en Korvalia</p>

          {/* Botones finales */}
          <div className="cta-actions">
            <a href="/inmuebles" className="cta-button cta-button-primary">
              Ver propiedades
            </a>
            <a href="/contacto" className="cta-button cta-button-secondary">
              Vender mi vivienda
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
