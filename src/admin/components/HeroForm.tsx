/**
 * Formulario para gestionar el Hero de la página principal
 */

import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { uploadImage, validateImageFile } from '../lib/upload';

interface HeroSettings {
  heroTitle: string;
  heroSubtitle: string;
  heroImages: string[];
}

export default function HeroForm() {
  const [settings, setSettings] = useState<HeroSettings>({
    heroTitle: '',
    heroSubtitle: '',
    heroImages: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadingImages, setUploadingImages] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/settings', { requiresAuth: false });
      const data = response.data || {};

      setSettings({
        heroTitle: data.heroTitle || '',
        heroSubtitle: data.heroSubtitle || '',
        heroImages: data.heroImages || [],
      });
    } catch (err: any) {
      setError(err.message || 'Error al cargar la configuración');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setError('');
    setUploadingImages(true);

    try {
      const newImages: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const validation = validateImageFile(file);

        if (!validation.valid) {
          setError(validation.error || 'Archivo no válido');
          continue;
        }

        const url = await uploadImage(file);
        newImages.push(url);
      }

      setSettings((prev) => ({
        ...prev,
        heroImages: [...prev.heroImages, ...newImages],
      }));

      setSuccess(`${newImages.length} imagen(es) subida(s) correctamente`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Error al subir las imágenes');
    } finally {
      setUploadingImages(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setSettings((prev) => ({
      ...prev,
      heroImages: prev.heroImages.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      await api.put('/settings', {
        heroTitle: settings.heroTitle,
        heroSubtitle: settings.heroSubtitle,
        heroImages: settings.heroImages,
      });

      setSuccess('Configuración del Hero guardada exitosamente');
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
    <div className="admin-card">
      <div className="admin-card-header">
        <h2 className="admin-card-title">Configuración del Hero</h2>
        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
          Personaliza el título, subtítulo e imágenes del slider principal de la web
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
        <div className="admin-form-group">
          <label className="admin-label">Título del Hero</label>
          <input
            type="text"
            className="admin-input"
            value={settings.heroTitle}
            onChange={(e) => setSettings({ ...settings, heroTitle: e.target.value })}
            placeholder="Ej: Encuentra tu hogar perfecto"
            required
          />
        </div>

        <div className="admin-form-group">
          <label className="admin-label">Subtítulo del Hero</label>
          <input
            type="text"
            className="admin-input"
            value={settings.heroSubtitle}
            onChange={(e) => setSettings({ ...settings, heroSubtitle: e.target.value })}
            placeholder="Ej: Las mejores propiedades en las mejores ubicaciones"
          />
        </div>

        <div className="admin-form-group">
          <label className="admin-label">Imágenes del Slider (1-5 imágenes)</label>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
              gap: '1rem',
              marginBottom: '1rem',
            }}
          >
            {settings.heroImages.map((image, index) => (
              <div
                key={index}
                style={{
                  position: 'relative',
                  aspectRatio: '16/9',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  border: '2px solid #e5e7eb',
                }}
              >
                <img
                  src={image}
                  alt={`Hero ${index + 1}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  style={{
                    position: 'absolute',
                    top: '0.5rem',
                    right: '0.5rem',
                    backgroundColor: '#dc2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    width: '28px',
                    height: '28px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1rem',
                  }}
                >
                  ✕
                </button>
              </div>
            ))}

            {settings.heroImages.length < 5 && (
              <label
                style={{
                  aspectRatio: '16/9',
                  border: '2px dashed #d1d5db',
                  borderRadius: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: uploadingImages ? 'not-allowed' : 'pointer',
                  backgroundColor: '#f9fafb',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (!uploadingImages) {
                    e.currentTarget.style.backgroundColor = '#f3f4f6';
                    e.currentTarget.style.borderColor = '#3b82f6';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                  e.currentTarget.style.borderColor = '#d1d5db';
                }}
              >
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  disabled={uploadingImages}
                  style={{ display: 'none' }}
                />
                <span style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                  {uploadingImages ? '⏳' : '📷'}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                  {uploadingImages ? 'Subiendo...' : 'Subir imagen'}
                </span>
              </label>
            )}
          </div>

          <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>
            Sube entre 1 y 5 imágenes. Formatos: JPG, PNG, WEBP. Máximo 5MB por imagen.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            type="submit"
            className="admin-btn admin-btn-primary"
            disabled={saving || uploadingImages}
          >
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>

          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            onClick={fetchSettings}
            disabled={saving || uploadingImages}
          >
            Recargar
          </button>
        </div>
      </form>
    </div>
  );
}
