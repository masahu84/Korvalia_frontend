/**
 * Componente CTA final de la home
 * Permite a los usuarios registrarse dejando su email
 */

import { useState } from 'react';
import './FinalCTA.css';

export default function FinalCTA() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      setMessage({ type: 'error', text: 'Por favor, introduce un email válido' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const API_BASE = import.meta.env.PUBLIC_API_URL || 'http://localhost:4000';
      const response = await fetch(`${API_BASE}/api/leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          source: 'cta_home',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          type: 'success',
          text: '¡Gracias por tu interés! Pronto te contactaremos.'
        });
        setEmail('');

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
      console.error('Error al enviar email:', error);
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

          {/* Formulario email */}
          <form className="cta-form" onSubmit={handleSubmit}>
            <input
              type="email"
              name="email"
              className="cta-input"
              placeholder="Introduce tu correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
            <button type="submit" className="cta-submit" disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar'}
            </button>
          </form>

          <p className="cta-footer-text">Más de 100 clientes han confiado en Korvalia</p>

          {/* Botones finales */}
          <div className="cta-actions">
            <a href="/propiedades" className="cta-button cta-button-primary">
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
