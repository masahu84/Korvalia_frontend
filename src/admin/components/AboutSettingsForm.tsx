/**
 * Formulario de configuración para la página Sobre Korvalia
 * Gestiona: título del Hero, sección La Visión, y galería de imágenes
 */

import { useState, useEffect, useRef } from 'react';
import { api } from '../lib/api';
import { uploadImage, validateImageFile } from '../lib/upload';
import { useToast, ToastProvider } from './Toast';

interface VisionData {
  title: string;
  subtitle: string;
  content: string;
}

interface ShowcaseData {
  mainImage: string;
  galleryImages: string[];
}

interface FormData {
  title: string;
  vision: VisionData;
  showcase: ShowcaseData;
}

const API_BASE = import.meta.env.PUBLIC_API_URL || 'http://localhost:4000';

function getImageUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return url.startsWith('/') ? `${API_BASE}${url}` : `${API_BASE}/${url}`;
}

function AboutSettingsFormInner() {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    vision: {
      title: 'La visión',
      subtitle: 'La persona detrás de Korvalia',
      content: '',
    },
    showcase: {
      mainImage: '',
      galleryImages: [],
    },
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingMain, setUploadingMain] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  const mainImageRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const toast = useToast();

  useEffect(() => {
    fetchPageSettings();
  }, []);

  const fetchPageSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/pages/about', { requiresAuth: false });
      const data = response.data || {};
      const blocks = data.blocks || {};

      setFormData({
        title: data.title || 'Te ayudamos a buscar tu nuevo hogar',
        vision: {
          title: blocks.vision?.title || 'La visión',
          subtitle: blocks.vision?.subtitle || 'La persona detrás de Korvalia',
          content: blocks.vision?.content || '',
        },
        showcase: {
          mainImage: blocks.showcase?.mainImage || '',
          galleryImages: blocks.showcase?.galleryImages || [],
        },
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

  const handleVisionChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      vision: { ...formData.vision, [name]: value },
    });
  };

  const handleMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast.error(validation.error || 'Error en validación');
      return;
    }

    try {
      setUploadingMain(true);
      toast.loading('Subiendo imagen...');
      const url = await uploadImage(file);
      setFormData({
        ...formData,
        showcase: { ...formData.showcase, mainImage: url },
      });
      toast.success('Imagen subida correctamente');
    } catch (err: any) {
      toast.error(err.message || 'Error al subir la imagen');
    } finally {
      setUploadingMain(false);
      if (mainImageRef.current) mainImageRef.current.value = '';
    }
  };

  const handleGalleryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Máximo 6 imágenes en galería
    const currentCount = formData.showcase.galleryImages.length;
    const remainingSlots = 6 - currentCount;

    if (remainingSlots <= 0) {
      toast.error('Ya tienes 6 imágenes en la galería. Elimina alguna para añadir más.');
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots);

    try {
      setUploadingGallery(true);
      toast.loading('Subiendo imágenes...');

      const newUrls: string[] = [];
      for (const file of filesToUpload) {
        const validation = validateImageFile(file);
        if (!validation.valid) {
          toast.warning(validation.error || 'Error en validación');
          continue;
        }
        const url = await uploadImage(file);
        newUrls.push(url);
      }

      setFormData({
        ...formData,
        showcase: {
          ...formData.showcase,
          galleryImages: [...formData.showcase.galleryImages, ...newUrls],
        },
      });
      toast.success(`${newUrls.length} imagen(es) subida(s) correctamente`);
    } catch (err: any) {
      toast.error(err.message || 'Error al subir las imágenes');
    } finally {
      setUploadingGallery(false);
      if (galleryInputRef.current) galleryInputRef.current.value = '';
    }
  };

  const removeGalleryImage = (index: number) => {
    const newImages = formData.showcase.galleryImages.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      showcase: { ...formData.showcase, galleryImages: newImages },
    });
  };

  const removeMainImage = () => {
    setFormData({
      ...formData,
      showcase: { ...formData.showcase, mainImage: '' },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    toast.loading('Guardando configuración...');

    try {
      const dataToSend = {
        title: formData.title,
        subtitle: '',
        metaTitle: 'Sobre Nosotros | Korvalia',
        metaDescription: 'Conoce la historia de Korvalia, nuestra filosofía y el equipo que hace posible tu sueño de encontrar el hogar perfecto.',
        blocks: {
          vision: formData.vision,
          showcase: formData.showcase,
        },
      };

      await api.put('/pages/about', dataToSend);
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
        {/* Título del Hero */}
        <div className="admin-card" style={{ marginBottom: '2rem' }}>
          <div className="admin-card-header">
            <h2 className="admin-card-title">Título del Hero</h2>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
              El título que aparece sobre las imágenes del Hero
            </p>
          </div>

          <div className="admin-form-group">
            <label className="admin-label">Título</label>
            <input
              type="text"
              name="title"
              className="admin-input"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Te ayudamos a buscar tu nuevo hogar"
            />
          </div>
        </div>

        {/* Sección La Visión */}
        <div className="admin-card" style={{ marginBottom: '2rem' }}>
          <div className="admin-card-header">
            <h2 className="admin-card-title">Sección "La Visión"</h2>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
              Configura el contenido de la sección La Visión
            </p>
          </div>

          <div className="admin-form-group">
            <label className="admin-label">Título de la sección</label>
            <input
              type="text"
              name="title"
              className="admin-input"
              value={formData.vision.title}
              onChange={handleVisionChange}
              placeholder="La visión"
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-label">Subtítulo</label>
            <input
              type="text"
              name="subtitle"
              className="admin-input"
              value={formData.vision.subtitle}
              onChange={handleVisionChange}
              placeholder="La persona detrás de Korvalia"
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-label">Contenido</label>
            <textarea
              name="content"
              className="admin-input"
              value={formData.vision.content}
              onChange={handleVisionChange}
              placeholder="Escribe el contenido de la sección. Puedes usar saltos de línea para separar párrafos."
              rows={8}
              style={{ resize: 'vertical' }}
            />
            <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>
              El texto se mostrará respetando los saltos de línea que escribas
            </p>
          </div>
        </div>

        {/* Galería de imágenes */}
        <div className="admin-card" style={{ marginBottom: '2rem' }}>
          <div className="admin-card-header">
            <h2 className="admin-card-title">Galería de Imágenes</h2>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
              Imagen principal grande y galería de 6 imágenes pequeñas
            </p>
          </div>

          {/* Imagen principal */}
          <div className="admin-form-group">
            <label className="admin-label">Imagen Principal</label>
            <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.5rem' }}>
              Esta imagen aparece en grande arriba de la galería
            </p>

            {formData.showcase.mainImage ? (
              <div style={{ position: 'relative', marginBottom: '1rem' }}>
                <img
                  src={getImageUrl(formData.showcase.mainImage)}
                  alt="Imagen principal"
                  style={{
                    width: '100%',
                    maxHeight: '300px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                  }}
                />
                <button
                  type="button"
                  onClick={removeMainImage}
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
                onClick={() => mainImageRef.current?.click()}
                style={{
                  border: '2px dashed #d1d5db',
                  borderRadius: '8px',
                  padding: '2rem',
                  textAlign: 'center',
                  cursor: 'pointer',
                  marginBottom: '1rem',
                }}
              >
                <p style={{ color: '#6b7280', margin: 0 }}>
                  {uploadingMain ? 'Subiendo...' : 'Haz clic para subir la imagen principal'}
                </p>
              </div>
            )}

            <input
              ref={mainImageRef}
              type="file"
              accept="image/*"
              onChange={handleMainImageUpload}
              style={{ display: 'none' }}
            />

            {!formData.showcase.mainImage && (
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={() => mainImageRef.current?.click()}
                disabled={uploadingMain}
                style={{ marginTop: '0.5rem' }}
              >
                {uploadingMain ? 'Subiendo...' : 'Seleccionar imagen'}
              </button>
            )}
          </div>

          {/* Galería de 6 imágenes */}
          <div className="admin-form-group" style={{ marginTop: '2rem' }}>
            <label className="admin-label">
              Galería de Casas ({formData.showcase.galleryImages.length}/6)
            </label>
            <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.5rem' }}>
              Hasta 6 imágenes que aparecen debajo de la imagen principal
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '1rem',
                marginBottom: '1rem',
              }}
            >
              {formData.showcase.galleryImages.map((img, index) => (
                <div key={index} style={{ position: 'relative' }}>
                  <img
                    src={getImageUrl(img)}
                    alt={`Galería ${index + 1}`}
                    style={{
                      width: '100%',
                      height: '100px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => removeGalleryImage(index)}
                    style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      background: '#dc2626',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: '24px',
                      height: '24px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}

              {formData.showcase.galleryImages.length < 6 && (
                <div
                  onClick={() => galleryInputRef.current?.click()}
                  style={{
                    border: '2px dashed #d1d5db',
                    borderRadius: '8px',
                    height: '100px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <span style={{ color: '#6b7280', fontSize: '24px' }}>+</span>
                </div>
              )}
            </div>

            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleGalleryImageUpload}
              style={{ display: 'none' }}
            />

            {formData.showcase.galleryImages.length < 6 && (
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={() => galleryInputRef.current?.click()}
                disabled={uploadingGallery}
              >
                {uploadingGallery ? 'Subiendo...' : 'Añadir imágenes a la galería'}
              </button>
            )}
          </div>
        </div>

        {/* Botones de acción */}
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
export default function AboutSettingsForm() {
  return (
    <ToastProvider>
      <AboutSettingsFormInner />
    </ToastProvider>
  );
}
