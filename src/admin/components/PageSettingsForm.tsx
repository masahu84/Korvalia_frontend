/**
 * Formulario genérico para gestionar configuración de páginas
 */

import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { useToast, ToastProvider } from './Toast';

interface PageSettingsFormProps {
  pageKey: 'home' | 'properties' | 'about' | 'contact';
  pageTitle: string;
  pageDescription?: string;
}

interface PageSettings {
  id: number;
  pageKey: string;
  title: string;
  subtitle: string;
  metaTitle: string;
  metaDescription: string;
  blocks: any;
}

function PageSettingsFormInner({ pageKey, pageTitle, pageDescription }: PageSettingsFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    metaTitle: '',
    metaDescription: '',
    blocks: '{}',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const toast = useToast();

  useEffect(() => {
    fetchPageSettings();
  }, [pageKey]);

  const fetchPageSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/pages/${pageKey}`, { requiresAuth: false });
      const data = response.data || {};

      setFormData({
        title: data.title || '',
        subtitle: data.subtitle || '',
        metaTitle: data.metaTitle || '',
        metaDescription: data.metaDescription || '',
        blocks: JSON.stringify(data.blocks || {}, null, 2),
      });
    } catch (err: any) {
      toast.error(err.message || 'Error al cargar la configuración');
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
    setSaving(true);

    try {
      // Validar el JSON de blocks
      let blocksData;
      try {
        blocksData = JSON.parse(formData.blocks);
      } catch {
        toast.error('El formato del JSON en "Configuración Avanzada" no es válido');
        setSaving(false);
        return;
      }

      toast.loading('Guardando configuración...');

      const dataToSend = {
        title: formData.title,
        subtitle: formData.subtitle,
        metaTitle: formData.metaTitle,
        metaDescription: formData.metaDescription,
        blocks: blocksData,
      };

      await api.put(`/pages/${pageKey}`, dataToSend);
      toast.success('Configuración guardada exitosamente');
    } catch (err: any) {
      toast.error(err.message || 'Error al guardar la configuración');
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
          {pageTitle}
        </h1>
        {pageDescription && (
          <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
            {pageDescription}
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="admin-card" style={{ marginBottom: '2rem' }}>
          <div className="admin-card-header">
            <h2 className="admin-card-title">Contenido de la Página</h2>
          </div>

          <div className="admin-form-group">
            <label className="admin-label">Título</label>
            <input
              type="text"
              name="title"
              className="admin-input"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Título principal de la página"
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-label">Subtítulo</label>
            <input
              type="text"
              name="subtitle"
              className="admin-input"
              value={formData.subtitle}
              onChange={handleInputChange}
              placeholder="Subtítulo o descripción breve"
            />
          </div>
        </div>

        <div className="admin-card" style={{ marginBottom: '2rem' }}>
          <div className="admin-card-header">
            <h2 className="admin-card-title">SEO & Metadatos</h2>
          </div>

          <div className="admin-form-group">
            <label className="admin-label">Meta Title</label>
            <input
              type="text"
              name="metaTitle"
              className="admin-input"
              value={formData.metaTitle}
              onChange={handleInputChange}
              placeholder="Título para SEO (aparece en Google)"
            />
            <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>
              Recomendado: entre 50-60 caracteres
            </p>
          </div>

          <div className="admin-form-group">
            <label className="admin-label">Meta Description</label>
            <textarea
              name="metaDescription"
              className="admin-textarea"
              value={formData.metaDescription}
              onChange={handleInputChange}
              rows={3}
              placeholder="Descripción para SEO (aparece en Google)"
            />
            <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>
              Recomendado: entre 150-160 caracteres
            </p>
          </div>
        </div>

        <div className="admin-card" style={{ marginBottom: '2rem' }}>
          <div className="admin-card-header">
            <h2 className="admin-card-title">Configuración Avanzada</h2>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
              JSON con configuración adicional de bloques y contenidos específicos de la página
            </p>
          </div>

          <div className="admin-form-group">
            <label className="admin-label">Bloques (JSON)</label>
            <textarea
              name="blocks"
              className="admin-textarea"
              value={formData.blocks}
              onChange={handleInputChange}
              rows={12}
              style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}
              placeholder='{&#10;  "feature1": "Valor",&#10;  "feature2": "Otro valor"&#10;}'
            />
            <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>
              Formato JSON válido. Aquí se pueden almacenar configuraciones adicionales que se usarán en el futuro.
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

// Componente exportado con ToastProvider
export default function PageSettingsForm({ pageKey, pageTitle, pageDescription }: PageSettingsFormProps) {
  return (
    <ToastProvider>
      <PageSettingsFormInner pageKey={pageKey} pageTitle={pageTitle} pageDescription={pageDescription} />
    </ToastProvider>
  );
}
