/**
 * Gestor de Leads del Chatbot
 * Muestra conversaciones y leads capturados por el chatbot
 */

import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { useToast, ToastProvider } from './Toast';

interface Conversation {
  id: string;
  sessionId: string;
  visitorName: string | null;
  visitorEmail: string | null;
  visitorPhone: string | null;
  status: 'ACTIVE' | 'LEAD_CAPTURED' | 'CLOSED' | 'ESCALATED';
  source: string;
  propertyId: number | null;
  lastMessage: string;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
}

interface Message {
  id: number;
  role: 'user' | 'bot';
  content: string;
  createdAt: string;
}

interface ConversationDetail extends Conversation {
  messages: Message[];
}

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  ACTIVE: { label: 'Activa', color: '#059669', bg: '#d1fae5' },
  LEAD_CAPTURED: { label: 'Lead Capturado', color: '#d97706', bg: '#fef3c7' },
  CLOSED: { label: 'Cerrada', color: '#6b7280', bg: '#f3f4f6' },
  ESCALATED: { label: 'Escalada', color: '#dc2626', bg: '#fee2e2' },
};

function ChatLeadsManagerInner() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ConversationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const [total, setTotal] = useState(0);

  const toast = useToast();

  useEffect(() => {
    fetchConversations();
  }, [filter]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      let url = '/chat/conversations?limit=50';

      if (filter === 'leads') {
        url += '&hasContact=true';
      } else if (filter !== 'all') {
        url += `&status=${filter}`;
      }

      const response = await api.get(url);
      setConversations(response.data?.conversations || []);
      setTotal(response.data?.total || 0);
    } catch (err: any) {
      toast.error(err.message || 'Error al cargar las conversaciones');
    } finally {
      setLoading(false);
    }
  };

  const fetchConversationDetail = async (id: string) => {
    try {
      setLoadingDetail(true);
      const response = await api.get(`/chat/conversations/${id}`);
      setSelectedConversation(response.data);
    } catch (err: any) {
      toast.error(err.message || 'Error al cargar la conversación');
    } finally {
      setLoadingDetail(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.put(`/chat/conversations/${id}/status`, { status });
      toast.success('Estado actualizado');

      // Actualizar en la lista
      setConversations(convs =>
        convs.map(c => c.id === id ? { ...c, status: status as any } : c)
      );

      // Actualizar en el detalle si está abierto
      if (selectedConversation?.id === id) {
        setSelectedConversation({ ...selectedConversation, status: status as any });
      }
    } catch (err: any) {
      toast.error(err.message || 'Error al actualizar el estado');
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays} días`;

    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
    });
  };

  const leadsCount = conversations.filter(c =>
    c.visitorEmail || c.visitorPhone
  ).length;

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <p style={{ color: '#6b7280' }}>Cargando conversaciones...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: '700', color: '#111827', marginBottom: '0.5rem' }}>
          Conversaciones del Chat
        </h1>
        <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
          Gestiona las conversaciones del chatbot y los leads capturados
        </p>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div className="admin-card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Total Conversaciones</div>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: '#111827' }}>{total}</div>
        </div>
        <div className="admin-card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Leads Capturados</div>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: '#d97706' }}>{leadsCount}</div>
        </div>
        <div className="admin-card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Activas</div>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: '#059669' }}>
            {conversations.filter(c => c.status === 'ACTIVE').length}
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {[
            { value: 'all', label: 'Todas' },
            { value: 'leads', label: 'Solo Leads' },
            { value: 'ACTIVE', label: 'Activas' },
            { value: 'LEAD_CAPTURED', label: 'Lead Capturado' },
            { value: 'ESCALATED', label: 'Escaladas' },
            { value: 'CLOSED', label: 'Cerradas' },
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: filter === opt.value ? '2px solid #3b82f6' : '1px solid #d1d5db',
                backgroundColor: filter === opt.value ? '#eff6ff' : 'white',
                color: filter === opt.value ? '#3b82f6' : '#374151',
                fontSize: '0.875rem',
                fontWeight: filter === opt.value ? '600' : '400',
                cursor: 'pointer',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Contenido principal */}
      <div style={{ display: 'grid', gridTemplateColumns: selectedConversation ? '1fr 1fr' : '1fr', gap: '1.5rem' }}>
        {/* Lista de conversaciones */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">Conversaciones ({conversations.length})</h2>
          </div>

          {conversations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>💬</p>
              <p style={{ color: '#6b7280' }}>No hay conversaciones</p>
            </div>
          ) : (
            <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
              {conversations.map(conv => (
                <div
                  key={conv.id}
                  onClick={() => fetchConversationDetail(conv.id)}
                  style={{
                    padding: '1rem',
                    borderBottom: '1px solid #e5e7eb',
                    cursor: 'pointer',
                    backgroundColor: selectedConversation?.id === conv.id ? '#eff6ff' : 'transparent',
                    transition: 'background-color 0.15s',
                  }}
                  onMouseOver={(e) => {
                    if (selectedConversation?.id !== conv.id) {
                      e.currentTarget.style.backgroundColor = '#f9fafb';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (selectedConversation?.id !== conv.id) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <div>
                      <span style={{ fontWeight: '600', color: '#111827' }}>
                        {conv.visitorName || conv.visitorEmail || 'Visitante anónimo'}
                      </span>
                      {(conv.visitorEmail || conv.visitorPhone) && (
                        <span style={{
                          marginLeft: '0.5rem',
                          fontSize: '0.75rem',
                          padding: '0.125rem 0.5rem',
                          borderRadius: '9999px',
                          backgroundColor: '#fef3c7',
                          color: '#d97706',
                        }}>
                          Lead
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                      {formatDate(conv.updatedAt)}
                    </span>
                  </div>

                  {conv.visitorEmail && (
                    <div style={{ fontSize: '0.8125rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                      {conv.visitorEmail}
                    </div>
                  )}
                  {conv.visitorPhone && (
                    <div style={{ fontSize: '0.8125rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                      {conv.visitorPhone}
                    </div>
                  )}

                  <div style={{
                    fontSize: '0.8125rem',
                    color: '#6b7280',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    marginBottom: '0.5rem',
                  }}>
                    {conv.lastMessage}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{
                      fontSize: '0.75rem',
                      padding: '0.125rem 0.5rem',
                      borderRadius: '9999px',
                      backgroundColor: STATUS_LABELS[conv.status].bg,
                      color: STATUS_LABELS[conv.status].color,
                    }}>
                      {STATUS_LABELS[conv.status].label}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                      {conv.messageCount} mensajes
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detalle de conversación */}
        {selectedConversation && (
          <div className="admin-card" style={{ display: 'flex', flexDirection: 'column', maxHeight: '700px' }}>
            <div className="admin-card-header" style={{ borderBottom: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h2 className="admin-card-title">
                    {selectedConversation.visitorName || 'Visitante'}
                  </h2>
                  {selectedConversation.visitorEmail && (
                    <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      {selectedConversation.visitorEmail}
                    </p>
                  )}
                  {selectedConversation.visitorPhone && (
                    <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      {selectedConversation.visitorPhone}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setSelectedConversation(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.25rem',
                    color: '#9ca3af',
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Cambiar estado */}
              <div style={{ marginTop: '1rem' }}>
                <label style={{ fontSize: '0.75rem', color: '#6b7280', display: 'block', marginBottom: '0.25rem' }}>
                  Estado:
                </label>
                <select
                  value={selectedConversation.status}
                  onChange={(e) => updateStatus(selectedConversation.id, e.target.value)}
                  style={{
                    padding: '0.5rem',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                  }}
                >
                  <option value="ACTIVE">Activa</option>
                  <option value="LEAD_CAPTURED">Lead Capturado</option>
                  <option value="ESCALATED">Escalada</option>
                  <option value="CLOSED">Cerrada</option>
                </select>
              </div>
            </div>

            {/* Mensajes */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '1rem',
              backgroundColor: '#f9fafb',
            }}>
              {loadingDetail ? (
                <p style={{ textAlign: 'center', color: '#6b7280' }}>Cargando...</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {selectedConversation.messages.map((msg) => (
                    <div
                      key={msg.id}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
                      }}
                    >
                      <div
                        style={{
                          maxWidth: '80%',
                          padding: '0.75rem 1rem',
                          borderRadius: msg.role === 'user'
                            ? '12px 12px 4px 12px'
                            : '12px 12px 12px 4px',
                          backgroundColor: msg.role === 'user' ? '#3b82f6' : 'white',
                          color: msg.role === 'user' ? 'white' : '#374151',
                          fontSize: '0.875rem',
                          lineHeight: '1.5',
                          boxShadow: msg.role === 'bot' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                          whiteSpace: 'pre-wrap',
                        }}
                      >
                        {msg.content}
                      </div>
                      <span style={{ fontSize: '0.6875rem', color: '#9ca3af', marginTop: '0.25rem' }}>
                        {new Date(msg.createdAt).toLocaleTimeString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Componente exportado con ToastProvider
export default function ChatLeadsManager() {
  return (
    <ToastProvider>
      <ChatLeadsManagerInner />
    </ToastProvider>
  );
}
