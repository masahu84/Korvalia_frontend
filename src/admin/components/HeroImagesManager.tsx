/**
 * Gestor de imágenes del Hero
 * Permite subir, ordenar, activar/desactivar y eliminar imágenes
 */

import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { useToast, ToastProvider } from './Toast';

interface HeroImage {
  id: number;
  url: string;
  order: number;
  active: boolean;
  createdAt: string;
}

interface HeroImagesManagerProps {
  pageKey?: 'home' | 'properties' | 'about' | 'contact';
}

function HeroImagesManagerInner({ pageKey = 'home' }: HeroImagesManagerProps) {
  const [images, setImages] = useState<HeroImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const toast = useToast();

  useEffect(() => {
    fetchImages();
  }, [pageKey]);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/hero-images?pageKey=${pageKey}`);
      setImages(response.data || []);
    } catch (err: any) {
      console.error('Error al cargar imágenes del hero:', err);
      toast.error('Error al cargar las imágenes');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImages(true);

    try {
      // Validaciones básicas
      const validFiles: File[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Validar tipo
        if (!file.type.startsWith('image/')) {
          toast.error(`El archivo ${file.name} no es una imagen válida`);
          continue;
        }

        // Validar tamaño (10MB)
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
          toast.error(`El archivo ${file.name} excede el tamaño máximo de 10MB`);
          continue;
        }

        // Validar extensión
        const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
        const extension = file.name.split('.').pop()?.toLowerCase();
        if (!extension || !allowedExtensions.includes(extension)) {
          toast.error(`El archivo ${file.name} no tiene una extensión permitida`);
          continue;
        }

        validFiles.push(file);
      }

      if (validFiles.length === 0) {
        setUploadingImages(false);
        return;
      }

      toast.loading('Subiendo imágenes...');

      // Subir cada archivo al endpoint /api/hero-images/upload
      const uploadPromises = validFiles.map(async (file) => {
        const formData = new FormData();
        formData.append('image', file);
        formData.append('pageKey', pageKey);

        return api.post('/hero-images/upload', formData);
      });

      await Promise.all(uploadPromises);

      toast.dismiss();
      toast.success(`${validFiles.length} imagen(es) subida(s) correctamente`);

      // Recargar imágenes
      await fetchImages();

      // Limpiar input
      e.target.value = '';
    } catch (err: any) {
      console.error('Error al subir imágenes:', err);
      toast.dismiss();
      toast.error(err.response?.data?.error || err.message || 'Error al subir las imágenes');
    } finally {
      setUploadingImages(false);
    }
  };

  const handleToggleActive = async (id: number, currentActive: boolean) => {
    try {
      await api.put(`/hero-images/${id}`, { active: !currentActive });
      setImages(images.map((img) => (img.id === id ? { ...img, active: !currentActive } : img)));
      toast.success('Estado actualizado');
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.message || 'Error al actualizar el estado');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar esta imagen del hero?')) {
      return;
    }

    toast.loading('Eliminando imagen...');

    try {
      await api.delete(`/hero-images/${id}`);
      setImages(images.filter((img) => img.id !== id));
      toast.dismiss();
      toast.success('Imagen eliminada');
    } catch (err: any) {
      toast.dismiss();
      toast.error(err.response?.data?.error || err.message || 'Error al eliminar la imagen');
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newImages = [...images];
    const draggedImage = newImages[draggedIndex];
    newImages.splice(draggedIndex, 1);
    newImages.splice(index, 0, draggedImage);

    setImages(newImages);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleSaveOrder = async () => {
    setSaving(true);
    toast.loading('Guardando orden...');

    try {
      // Actualizar el orden de todas las imágenes
      const updates = images.map((img, index) => ({
        id: img.id,
        order: index,
      }));

      await api.put('/hero-images/bulk', { updates });
      toast.dismiss();
      toast.success('Orden guardado correctamente');
    } catch (err: any) {
      toast.dismiss();
      toast.error(err.response?.data?.error || err.message || 'Error al guardar el orden');
    } finally {
      setSaving(false);
    }
  };

  // Función helper para construir la URL completa de la imagen
  const getImageUrl = (url: string): string => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    const baseUrl = import.meta.env.PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:4000';
    return url.startsWith('/') ? `${baseUrl}${url}` : `${baseUrl}/${url}`;
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <p style={{ color: '#6b7280' }}>Cargando imágenes del hero...</p>
      </div>
    );
  }

  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <div className="admin-flex-between">
          <div>
            <h2 className="admin-card-title">Imágenes del Hero</h2>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
              Gestiona las imágenes que aparecen en la portada de tu sitio web
            </p>
          </div>
        </div>
      </div>

      {/* Subir nuevas imágenes */}
      <div style={{ marginBottom: '2rem' }}>
        <label className="admin-label">Subir Nuevas Imágenes</label>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            multiple
            onChange={handleImageUpload}
            disabled={uploadingImages}
            className="admin-input"
            style={{ flex: 1 }}
          />
          {uploadingImages && <span style={{ color: '#6b7280' }}>Subiendo...</span>}
        </div>
        <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>
          Formatos permitidos: JPG, PNG, WEBP. Tamaño máximo: 10MB. Recomendado: 1920x1080px o superior.
        </p>
      </div>

      {/* Lista de imágenes */}
      {images.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>🖼️</p>
          <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
            No hay imágenes en el hero. Sube algunas para comenzar.
          </p>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: '1.5rem' }}>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
              Arrastra las imágenes para reordenarlas. Las imágenes se mostrarán en este orden en el sitio web.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: '1rem',
              marginBottom: '1.5rem',
            }}
          >
            {images.map((image, index) => (
              <div
                key={image.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                style={{
                  position: 'relative',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: image.active ? '2px solid #10b981' : '2px solid #e5e7eb',
                  backgroundColor: '#f9fafb',
                  cursor: 'move',
                  opacity: draggedIndex === index ? 0.5 : 1,
                  transition: 'opacity 0.2s',
                }}
              >
                {/* Imagen */}
                <div style={{ position: 'relative', aspectRatio: '16/9' }}>
                  <img
                    src={getImageUrl(image.url)}
                    alt={`Hero ${index + 1}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                    onError={(e) => {
                      console.error('Error al cargar imagen:', image.url);
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />

                  {/* Badge de orden */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '0.5rem',
                      left: '0.5rem',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                    }}
                  >
                    #{index + 1}
                  </div>

                  {/* Estado */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '0.5rem',
                      right: '0.5rem',
                    }}
                  >
                    <button
                      onClick={() => handleToggleActive(image.id, image.active)}
                      style={{
                        padding: '0.375rem 0.75rem',
                        backgroundColor: image.active ? '#10b981' : '#6b7280',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        cursor: 'pointer',
                      }}
                    >
                      {image.active ? 'Activa' : 'Inactiva'}
                    </button>
                  </div>
                </div>

                {/* Botones */}
                <div style={{ padding: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: '#6b7280', fontFamily: 'monospace' }}>
                    {image.url.split('/').pop()}
                  </span>
                  <button
                    onClick={() => handleDelete(image.id)}
                    style={{
                      padding: '0.375rem 0.75rem',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '0.8125rem',
                      fontWeight: '500',
                      cursor: 'pointer',
                    }}
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Botón para guardar orden */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <button
              onClick={handleSaveOrder}
              disabled={saving}
              className="admin-btn admin-btn-primary"
            >
              {saving ? 'Guardando...' : '💾 Guardar Orden'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// Componente exportado con ToastProvider
export default function HeroImagesManager({ pageKey = 'home' }: HeroImagesManagerProps) {
  return (
    <ToastProvider>
      <HeroImagesManagerInner pageKey={pageKey} />
    </ToastProvider>
  );
}
