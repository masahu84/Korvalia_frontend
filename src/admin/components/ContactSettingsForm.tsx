/**
 * Formulario de configuración para la página de Contacto
 * Solo gestiona la imagen del hero (sin título)
 */

import { useState, useEffect, useRef } from 'react';
import { api } from '../lib/api';
import { uploadImage, validateImageFile } from '../lib/upload';
import { useToast, ToastProvider } from './Toast';

const API_BASE = import.meta.env.PUBLIC_API_URL || 'http://localhost:4000';

function getImageUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return url.startsWith('/') ? `${API_BASE}${url}` : `${API_BASE}/${url}`;
}

function ContactSettingsFormInner() {
  const [heroImage, setHeroImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  useEffect(() => {
    fetchPageSettings();
  }, []);

  const fetchPageSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/pages/contact', { requiresAuth: false });
      const data = response.data || {};
      const blocks = data.blocks || {};

      setHeroImage(blocks.heroImage || '');
    } catch (err: any) {
      toast.error(err.message || 'Error al cargar la configuración');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast.error(validation.error || 'Error en validación');
      return;
    }

    try {
      setUploading(true);
      toast.loading('Subiendo imagen...');
      const url = await uploadImage(file);
      setHeroImage(url);
      toast.success('Imagen subida correctamente');
    } catch (err: any) {
      toast.error(err.message || 'Error al subir la imagen');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = () => {
    setHeroImage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    toast.loading('Guardando configuración...');

    try {
      const dataToSend = {
        title: '',
        subtitle: '',
        metaTitle: 'Contacto | Korvalia',
        metaDescription: '¿Tienes alguna pregunta? Contacta con nosotros y te ayudaremos a encontrar tu hogar ideal.',
        blocks: {
          heroImage: heroImage,
        },
      };

      await api.put('/pages/contact', dataToSend);
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
      <form onSubmit={handleSubmit}>
        <div className="admin-card" style={{ marginBottom: '2rem' }}>
          <div className="admin-card-header">
            <h2 className="admin-card-title">Imagen del Hero</h2>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
              La imagen que aparece junto al formulario de contacto
            </p>
          </div>

          <div className="admin-form-group">
            {heroImage ? (
              <div style={{ position: 'relative', marginBottom: '1rem' }}>
                <img
                  src={getImageUrl(heroImage)}
                  alt="Imagen del hero"
                  style={{
                    width: '100%',
                    maxHeight: '400px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                  }}
                />
                <button
                  type="button"
                  onClick={removeImage}
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    background: '#dc2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                  }}
                >
                  ×
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: '2px dashed #d1d5db',
                  borderRadius: '8px',
                  padding: '3rem',
                  textAlign: 'center',
                  cursor: 'pointer',
                  marginBottom: '1rem',
                }}
              >
                <p style={{ color: '#6b7280', margin: 0 }}>
                  {uploading ? 'Subiendo...' : 'Haz clic para subir la imagen del hero'}
                </p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />

            {!heroImage && (
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? 'Subiendo...' : 'Seleccionar imagen'}
              </button>
            )}
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
export default function ContactSettingsForm() {
  return (
    <ToastProvider>
      <ContactSettingsFormInner />
    </ToastProvider>
  );
}
