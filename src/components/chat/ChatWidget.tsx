/**
 * Widget de Chat para Korvalia
 * Chatbot flotante que aparece en todas las páginas públicas
 */

import { useState, useEffect, useRef } from 'react';

interface Message {
  role: 'user' | 'bot';
  content: string;
  timestamp: Date;
  properties?: Property[];
  suggestions?: string[];
}

interface Property {
  id: number;
  title: string;
  slug: string;
  price: number;
  operation: 'RENT' | 'SALE';
  propertyType: string;
  bedrooms?: number;
  bathrooms?: number;
  areaM2?: number;
  city: string;
  image?: string;
}

// Generar ID de sesión único (solo en cliente)
function generateSessionId(): string {
  if (typeof window === 'undefined') return '';

  const stored = localStorage.getItem('korvalia_chat_session');
  if (stored) return stored;

  const newId = 'chat_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
  localStorage.setItem('korvalia_chat_session', newId);
  return newId;
}

// API URL (añadir /api al final)
const API_URL = import.meta.env.PUBLIC_API_URL
  ? `${import.meta.env.PUBLIC_API_URL}/api`
  : 'http://localhost:4000/api';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [hasNewMessage, setHasNewMessage] = useState(false);

  // Inicializar sessionId en el cliente
  useEffect(() => {
    if (!sessionId) {
      setSessionId(generateSessionId());
    }
  }, [sessionId]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll al último mensaje
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus en input cuando se abre el chat
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Mensaje inicial al abrir por primera vez
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        role: 'bot',
        content: '¡Hola! Soy el asistente virtual de Korvalia. ¿En qué puedo ayudarte hoy?',
        timestamp: new Date(),
        suggestions: [
          'Busco piso en alquiler',
          'Quiero comprar una casa',
          'Ver propiedades destacadas',
          'Contactar con un agente'
        ]
      }]);
    }
  }, [isOpen]);

  // Enviar mensaje
  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading || !sessionId) return;

    const userMessage: Message = {
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/chat/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          message: text.trim(),
        }),
      });

      const data = await response.json();

      if (data.success && data.data) {
        const botMessage: Message = {
          role: 'bot',
          content: data.data.message,
          timestamp: new Date(),
          properties: data.data.properties,
          suggestions: data.data.suggestions,
        };

        setMessages(prev => [...prev, botMessage]);
      } else {
        throw new Error('Error en la respuesta');
      }
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      setMessages(prev => [...prev, {
        role: 'bot',
        content: 'Lo siento, ha ocurrido un error. Por favor, intenta de nuevo.',
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar envío con Enter
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  // Click en sugerencia
  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  // Formatear precio
  const formatPrice = (price: number, operation: string) => {
    const formatted = price.toLocaleString('es-ES');
    return operation === 'RENT' ? `${formatted} €/mes` : `${formatted} €`;
  };

  // Renderizar propiedades
  const renderProperties = (properties: Property[]) => (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
      marginTop: '0.75rem'
    }}>
      {properties.map(property => (
        <a
          key={property.id}
          href={`/propiedades/${property.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            gap: '0.75rem',
            padding: '0.75rem',
            backgroundColor: 'white',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            textDecoration: 'none',
            color: 'inherit',
            transition: 'all 0.2s',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.borderColor = '#3b82f6';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.15)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.borderColor = '#e5e7eb';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          {property.image && (
            <img
              src={property.image.startsWith('http') ? property.image : `${API_URL.replace('/api', '')}${property.image}`}
              alt={property.title}
              style={{
                width: '70px',
                height: '55px',
                objectFit: 'cover',
                borderRadius: '6px',
                flexShrink: 0,
              }}
            />
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: '0.8125rem',
              fontWeight: '600',
              color: '#111827',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {property.title}
            </div>
            <div style={{
              fontSize: '0.75rem',
              color: '#6b7280',
              marginTop: '0.125rem',
            }}>
              {property.city}
              {property.bedrooms && ` · ${property.bedrooms} hab.`}
              {property.areaM2 && ` · ${property.areaM2}m²`}
            </div>
            <div style={{
              fontSize: '0.8125rem',
              fontWeight: '600',
              color: '#3b82f6',
              marginTop: '0.25rem',
            }}>
              {formatPrice(property.price, property.operation)}
            </div>
          </div>
        </a>
      ))}
    </div>
  );

  // Renderizar sugerencias
  const renderSuggestions = (suggestions: string[]) => (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.5rem',
      marginTop: '0.75rem'
    }}>
      {suggestions.map((suggestion, index) => (
        <button
          key={index}
          onClick={() => handleSuggestionClick(suggestion)}
          style={{
            padding: '0.5rem 0.875rem',
            backgroundColor: 'white',
            border: '1px solid #3b82f6',
            borderRadius: '20px',
            color: '#3b82f6',
            fontSize: '0.8125rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#3b82f6';
            e.currentTarget.style.color = 'white';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = 'white';
            e.currentTarget.style.color = '#3b82f6';
          }}
        >
          {suggestion}
        </button>
      ))}
    </div>
  );

  return (
    <>
      {/* Botón flotante */}
      <button
        className="chat-float-btn"
        onClick={() => {
          setIsOpen(!isOpen);
          setHasNewMessage(false);
        }}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          backgroundColor: '#3b82f6',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(59, 130, 246, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          transition: 'all 0.3s ease',
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.boxShadow = '0 6px 25px rgba(59, 130, 246, 0.5)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(59, 130, 246, 0.4)';
        }}
        aria-label={isOpen ? 'Cerrar chat' : 'Abrir chat'}
      >
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        ) : (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
            <circle cx="8" cy="10" r="1"/>
            <circle cx="12" cy="10" r="1"/>
            <circle cx="16" cy="10" r="1"/>
          </svg>
        )}

        {/* Badge de nuevo mensaje */}
        {hasNewMessage && !isOpen && (
          <span style={{
            position: 'absolute',
            top: '-2px',
            right: '-2px',
            width: '16px',
            height: '16px',
            backgroundColor: '#ef4444',
            borderRadius: '50%',
            border: '2px solid white',
          }} />
        )}
      </button>

      {/* Ventana del chat */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '100px',
            right: '24px',
            width: '380px',
            maxWidth: 'calc(100vw - 48px)',
            height: '520px',
            maxHeight: 'calc(100vh - 140px)',
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            zIndex: 9998,
            animation: 'slideUp 0.3s ease',
          }}
        >
          {/* Header */}
          <div style={{
            padding: '1rem 1.25rem',
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.25rem',
            }}>
              🏠
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: '600', fontSize: '1rem' }}>
                Korvalia
              </div>
              <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>
                Tu asistente inmobiliario
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                padding: '0.25rem',
                opacity: 0.8,
              }}
              aria-label="Cerrar chat"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          {/* Mensajes */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            backgroundColor: '#f9fafb',
          }}>
            {messages.map((message, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: message.role === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <div
                  style={{
                    maxWidth: '85%',
                    padding: '0.875rem 1rem',
                    borderRadius: message.role === 'user'
                      ? '16px 16px 4px 16px'
                      : '16px 16px 16px 4px',
                    backgroundColor: message.role === 'user' ? '#3b82f6' : 'white',
                    color: message.role === 'user' ? 'white' : '#374151',
                    fontSize: '0.875rem',
                    lineHeight: '1.5',
                    boxShadow: message.role === 'bot'
                      ? '0 1px 3px rgba(0,0,0,0.08)'
                      : 'none',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {message.content}

                  {/* Propiedades */}
                  {message.properties && message.properties.length > 0 && renderProperties(message.properties)}

                  {/* Sugerencias */}
                  {message.suggestions && message.suggestions.length > 0 && renderSuggestions(message.suggestions)}
                </div>

                <div style={{
                  fontSize: '0.6875rem',
                  color: '#9ca3af',
                  marginTop: '0.25rem',
                  paddingLeft: '0.25rem',
                  paddingRight: '0.25rem',
                }}>
                  {message.timestamp.toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            ))}

            {/* Indicador de escribiendo */}
            {isLoading && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1rem',
                backgroundColor: 'white',
                borderRadius: '16px',
                width: 'fit-content',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
              }}>
                <div style={{
                  display: 'flex',
                  gap: '0.25rem',
                }}>
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: '#9ca3af',
                        animation: `bounce 1.4s infinite ease-in-out both`,
                        animationDelay: `${i * 0.16}s`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: '1rem',
            borderTop: '1px solid #e5e7eb',
            backgroundColor: 'white',
          }}>
            <div style={{
              display: 'flex',
              gap: '0.5rem',
            }}>
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Escribe tu mensaje..."
                disabled={isLoading}
                style={{
                  flex: 1,
                  padding: '0.75rem 1rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '24px',
                  fontSize: '0.875rem',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                }}
              />
              <button
                onClick={() => sendMessage(inputValue)}
                disabled={!inputValue.trim() || isLoading}
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  backgroundColor: inputValue.trim() ? '#3b82f6' : '#e5e7eb',
                  border: 'none',
                  cursor: inputValue.trim() ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill={inputValue.trim() ? 'white' : '#9ca3af'}>
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                </svg>
              </button>
            </div>

            <div style={{
              fontSize: '0.6875rem',
              color: '#9ca3af',
              textAlign: 'center',
              marginTop: '0.5rem',
            }}>
              Powered by Korvalia
            </div>
          </div>
        </div>
      )}

      {/* Estilos de animación */}
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounce {
          0%, 80%, 100% {
            transform: scale(0);
          }
          40% {
            transform: scale(1);
          }
        }

        @media (max-width: 640px) {
          .chat-float-btn {
            width: 48px !important;
            height: 48px !important;
            bottom: 20px !important;
            right: 20px !important;
          }
        }
      `}</style>
    </>
  );
}
