/**
 * Formulario de configuración para la página de Propiedades
 * Versión simplificada que solo gestiona el título del Hero
 */

import { useState, useEffect } from 'react';
import { api } from '../lib/api';

export default function PropertiesSettingsForm() {
  const [formData, setFormData] = useState({
    title: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchPageSettings();
  }, []);

  const fetchPageSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/pages/properties', { requiresAuth: false });
      const data = response.data || {};

      setFormData({
        title: data.title || 'Propiedades en venta en Sanlúcar de Barrameda',
      });
    } catch (err: any) {
      setError(err.message || 'Error al cargar la configuración');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const dataToSend = {
        title: formData.title,
        subtitle: '',
        metaTitle: formData.title + ' | Korvalia',
        metaDescription: 'Descubre todas nuestras propiedades disponibles en Sanlúcar de Barrameda.',
        blocks: {},
      };

      await api.put('/pages/properties', dataToSend);
      setSuccess('Configuración guardada exitosamente');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <p style={{ color: '#6b7280' }}>Cargando configuración...</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: '700', color: '#111827', marginBottom: '0.5rem' }}>
          Configuración de la Página de Propiedades
        </h1>
        <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
          Gestiona el título del Hero y las imágenes de fondo
        </p>
      </div>

      {error && (
        <div
          style={{
            backgroundColor: '#fee2e2',
            color: '#991b1b',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            borderLeft: '4px solid #dc2626',
          }}
        >
          {error}
        </div>
      )}

      {success && (
        <div
          style={{
            backgroundColor: '#d1fae5',
            color: '#065f46',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            borderLeft: '4px solid #10b981',
          }}
        >
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="admin-card" style={{ marginBottom: '2rem' }}>
          <div className="admin-card-header">
            <h2 className="admin-card-title">Contenido del Hero</h2>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
              Configura el título que aparece en la sección Hero de la página de propiedades
            </p>
          </div>

          <div className="admin-form-group">
            <label className="admin-label">Título del Hero</label>
            <input
              type="text"
              name="title"
              className="admin-input"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Propiedades en venta en Sanlúcar de Barrameda"
            />
            <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>
              Este título aparece en la parte superior de la página de propiedades
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            type="submit"
            className="admin-btn admin-btn-primary"
            disabled={saving}
          >
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>

          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            onClick={fetchPageSettings}
            disabled={saving}
          >
            Recargar
          </button>
        </div>
      </form>
    </div>
  );
}
