/**
 * Formulario especializado para la configuración de la página Home
 * Incluye: título, subtítulo y testimonial (sin SEO)
 */

import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { uploadImage, validateImageFile, fileToBase64 } from '../lib/upload';
import { useToast, ToastProvider } from './Toast';

interface HomeSettings {
  id: number;
  pageKey: string;
  title: string;
  subtitle: string;
  testimonialName: string;
  testimonialRole: string;
  testimonialText: string;
  testimonialImage: string;
}

function HomeSettingsFormInner() {
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    testimonialName: 'Merche Silva',
    testimonialRole: 'La persona detrás de Korvalia',
    testimonialText: 'Con más de 20 años de experiencia en el sector inmobiliario, mi objetivo es hacer que cada cliente encuentre no solo una propiedad, sino su verdadero hogar.\n\nCreo firmemente que cada casa tiene una historia y cada persona merece encontrar el lugar perfecto donde escribir la suya.\n\nEn Korvalia, trabajamos con dedicación, transparencia y un compromiso genuino con tu satisfacción.',
    testimonialImage: '',
  });

  const [testimonialFile, setTestimonialFile] = useState<File | null>(null);
  const [testimonialPreview, setTestimonialPreview] = useState<string>('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const toast = useToast();

  useEffect(() => {
    fetchPageSettings();
  }, []);

  const getImageUrl = (url: string | null): string => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    const API_BASE = import.meta.env.PUBLIC_API_URL || 'http://localhost:4000';
    return url.startsWith('/') ? `${API_BASE}${url}` : `${API_BASE}/${url}`;
  };

  const fetchPageSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/pages/home', { requiresAuth: false });
      const data = response.data || {};

      const testimonialImage = data.testimonialImage || '';
      setFormData({
        title: data.title || '',
        subtitle: data.subtitle || '',
        testimonialName: data.testimonialName || 'Merche Silva',
        testimonialRole: data.testimonialRole || 'La persona detrás de Korvalia',
        testimonialText: data.testimonialText || 'Con más de 20 años de experiencia en el sector inmobiliario, mi objetivo es hacer que cada cliente encuentre no solo una propiedad, sino su verdadero hogar.\n\nCreo firmemente que cada casa tiene una historia y cada persona merece encontrar el lugar perfecto donde escribir la suya.\n\nEn Korvalia, trabajamos con dedicación, transparencia y un compromiso genuino con tu satisfacción.',
        testimonialImage: testimonialImage,
      });

      // Construir URL completa para preview
      setTestimonialPreview(testimonialImage ? getImageUrl(testimonialImage) : '');
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

  const handleTestimonialImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast.error(validation.error || 'Archivo no válido');
      return;
    }

    setTestimonialFile(file);

    try {
      const preview = await fileToBase64(file);
      setTestimonialPreview(preview);
    } catch (err) {
      toast.error('Error al previsualizar la imagen');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    toast.loading('Guardando configuración...');

    try {
      let dataToSend = { ...formData };

      // Si hay una nueva imagen del testimonial, subirla primero
      if (testimonialFile) {
        const imageUrl = await uploadImage(testimonialFile);
        dataToSend.testimonialImage = imageUrl;
      }

      await api.put('/pages/home', dataToSend);
      toast.dismiss();
      toast.success('Configuración de Home guardada exitosamente');

      // Actualizar el estado con la nueva imagen
      if (testimonialFile) {
        setFormData(dataToSend);
        setTestimonialFile(null);
      }
    } catch (err: any) {
      toast.dismiss();
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
          Configuración de la Página Home
        </h1>
        <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
          Gestiona el contenido principal y el testimonial de la página de inicio
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Contenido de la Página */}
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

        {/* Sección Testimonial */}
        <div className="admin-card" style={{ marginBottom: '2rem' }}>
          <div className="admin-card-header">
            <h2 className="admin-card-title">Testimonial</h2>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
              Configura la sección del testimonial que aparece en la página principal
            </p>
          </div>

          <div className="admin-form-group">
            <label className="admin-label">Nombre</label>
            <input
              type="text"
              name="testimonialName"
              className="admin-input"
              value={formData.testimonialName}
              onChange={handleInputChange}
              placeholder="Ej: Merche Silva"
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-label">Rol / Cargo</label>
            <input
              type="text"
              name="testimonialRole"
              className="admin-input"
              value={formData.testimonialRole}
              onChange={handleInputChange}
              placeholder="Ej: La persona detrás de Korvalia"
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-label">Texto del Testimonial</label>
            <textarea
              name="testimonialText"
              className="admin-textarea"
              value={formData.testimonialText}
              onChange={handleInputChange}
              rows={8}
              placeholder="Escribe el texto del testimonial..."
            />
            <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>
              Puedes usar saltos de línea para separar párrafos
            </p>
          </div>

          {/* Imagen del Testimonial */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '1.5rem' }}>
            <div>
              <h3
                style={{
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '1rem',
                }}
              >
                Imagen Actual
              </h3>
              <div
                style={{
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '2rem',
                  backgroundColor: '#f9fafb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '200px',
                }}
              >
                {formData.testimonialImage ? (
                  <img
                    src={getImageUrl(formData.testimonialImage)}
                    alt="Imagen actual del testimonial"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '180px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                    }}
                  />
                ) : (
                  <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Sin imagen</p>
                )}
              </div>
            </div>

            <div>
              <h3
                style={{
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '1rem',
                }}
              >
                {testimonialFile ? 'Vista Previa' : 'Subir Nueva Imagen'}
              </h3>
              <div
                style={{
                  border: testimonialFile ? '2px solid #3b82f6' : '2px dashed #d1d5db',
                  borderRadius: '8px',
                  padding: '2rem',
                  backgroundColor: testimonialFile ? '#eff6ff' : '#f9fafb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '200px',
                }}
              >
                {testimonialPreview ? (
                  <img
                    src={testimonialPreview}
                    alt="Vista previa"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '180px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                    }}
                  />
                ) : (
                  <div style={{ textAlign: 'center', color: '#6b7280' }}>
                    <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📷</p>
                    <p style={{ fontSize: '0.875rem' }}>Selecciona una imagen</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="admin-form-group">
            <label className="admin-label">Seleccionar nueva imagen</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleTestimonialImageChange}
              disabled={saving}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '0.875rem',
              }}
            />
            <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>
              Formatos soportados: PNG, JPG, WEBP. Tamaño máximo: 5MB.
            </p>
          </div>
        </div>

        {/* Botones */}
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
export default function HomeSettingsForm() {
  return (
    <ToastProvider>
      <HomeSettingsFormInner />
    </ToastProvider>
  );
}
