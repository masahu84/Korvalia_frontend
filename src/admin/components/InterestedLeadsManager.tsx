/**
 * Gestor de Leads Interesados (teléfonos del CTA)
 */

import { useState, useEffect } from 'react';
import { api } from '../lib/api';

interface Lead {
  id: number;
  phone: string | null;
  email: string | null;
  source: string;
  status: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

// Mapeo de sources a nombres legibles
const sourceLabels: Record<string, string> = {
  'cta_home': 'Página Principal',
  'cta_about': 'Sobre Nosotros',
  'cta_contact': 'Contacto',
  'cta_properties': 'Listado Propiedades',
  'cta_property_detail': 'Detalle Propiedad',
};

// Mapeo de estados
const statusLabels: Record<string, string> = {
  'NEW': 'Nuevo',
  'CONTACTED': 'Contactado',
  'QUALIFIED': 'Cualificado',
  'CONVERTED': 'Convertido',
  'LOST': 'Perdido',
};

const statusColors: Record<string, string> = {
  'NEW': '#3b82f6',
  'CONTACTED': '#f59e0b',
  'QUALIFIED': '#8b5cf6',
  'CONVERTED': '#10b981',
  'LOST': '#ef4444',
};

export default function InterestedLeadsManager() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const response = await api.get('/leads');
      // Filtrar solo los que tienen teléfono
      const phoneLeads = (response.data || []).filter((lead: Lead) => lead.phone);
      setLeads(phoneLeads);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los interesados');
    } finally {
      setLoading(false);
    }
  };

  const updateLeadStatus = async (id: number, newStatus: string) => {
    try {
      setUpdatingId(id);
      await api.put(`/leads/${id}`, { status: newStatus });
      // Actualizar el lead localmente
      setLeads(leads.map(lead =>
        lead.id === id ? { ...lead, status: newStatus } : lead
      ));
    } catch (err: any) {
      alert('Error al actualizar: ' + (err.message || 'Error desconocido'));
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <p style={{ color: '#6b7280' }}>Cargando interesados...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          backgroundColor: '#fee2e2',
          color: '#991b1b',
          padding: '1rem',
          borderRadius: '8px',
          borderLeft: '4px solid #dc2626',
        }}
      >
        {error}
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827', marginBottom: '0.5rem' }}>
          Personas Interesadas
        </h1>
        <p style={{ color: '#6b7280' }}>
          Listado de personas que han dejado su telefono en la web
        </p>
      </div>

      {/* Stats */}
      <div className="admin-grid admin-grid-4" style={{ marginBottom: '2rem' }}>
        <div className="admin-card" style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              backgroundColor: '#dbeafe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.25rem',
            }}>
              📞
            </div>
            <div>
              <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827' }}>{leads.length}</p>
              <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>Total</p>
            </div>
          </div>
        </div>

        <div className="admin-card" style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              backgroundColor: '#dbeafe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.25rem',
            }}>
              🆕
            </div>
            <div>
              <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#3b82f6' }}>
                {leads.filter(l => l.status === 'NEW').length}
              </p>
              <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>Nuevos</p>
            </div>
          </div>
        </div>

        <div className="admin-card" style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              backgroundColor: '#fef3c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.25rem',
            }}>
              📱
            </div>
            <div>
              <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#f59e0b' }}>
                {leads.filter(l => l.status === 'CONTACTED').length}
              </p>
              <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>Contactados</p>
            </div>
          </div>
        </div>

        <div className="admin-card" style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              backgroundColor: '#d1fae5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.25rem',
            }}>
              ✅
            </div>
            <div>
              <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#10b981' }}>
                {leads.filter(l => l.status === 'CONVERTED').length}
              </p>
              <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>Convertidos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      {leads.length === 0 ? (
        <div className="admin-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', marginBottom: '0.5rem' }}>
            No hay interesados todavia
          </h3>
          <p style={{ color: '#6b7280' }}>
            Cuando alguien deje su telefono en la web, aparecera aqui.
          </p>
        </div>
      ) : (
        <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>
                    Telefono
                  </th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>
                    Origen
                  </th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>
                    Fecha
                  </th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>
                    Hora
                  </th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>
                    Estado
                  </th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead, index) => (
                  <tr
                    key={lead.id}
                    style={{
                      borderBottom: index < leads.length - 1 ? '1px solid #e5e7eb' : 'none',
                      backgroundColor: lead.status === 'NEW' ? '#eff6ff' : 'white',
                    }}
                  >
                    <td style={{ padding: '1rem', fontWeight: '600', color: '#111827' }}>
                      <a
                        href={`tel:${lead.phone}`}
                        style={{
                          color: '#3b82f6',
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                        }}
                      >
                        📞 {lead.phone}
                      </a>
                    </td>
                    <td style={{ padding: '1rem', color: '#6b7280', fontSize: '0.875rem' }}>
                      {sourceLabels[lead.source] || lead.source}
                    </td>
                    <td style={{ padding: '1rem', color: '#111827', fontSize: '0.875rem' }}>
                      {formatDate(lead.createdAt)}
                    </td>
                    <td style={{ padding: '1rem', color: '#6b7280', fontSize: '0.875rem' }}>
                      {formatTime(lead.createdAt)}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: '500',
                          backgroundColor: `${statusColors[lead.status]}20`,
                          color: statusColors[lead.status],
                        }}
                      >
                        {statusLabels[lead.status] || lead.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <select
                        value={lead.status}
                        onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                        disabled={updatingId === lead.id}
                        style={{
                          padding: '0.5rem 0.75rem',
                          borderRadius: '6px',
                          border: '1px solid #d1d5db',
                          fontSize: '0.875rem',
                          backgroundColor: 'white',
                          cursor: updatingId === lead.id ? 'wait' : 'pointer',
                          opacity: updatingId === lead.id ? 0.5 : 1,
                        }}
                      >
                        <option value="NEW">Nuevo</option>
                        <option value="CONTACTED">Contactado</option>
                        <option value="QUALIFIED">Cualificado</option>
                        <option value="CONVERTED">Convertido</option>
                        <option value="LOST">Perdido</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
