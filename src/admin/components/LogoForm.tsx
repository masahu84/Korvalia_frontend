/**
 * Formulario para gestionar el logo de la web
 */

import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { uploadImage, validateImageFile, fileToBase64 } from '../lib/upload';

export default function LogoForm() {
  const [currentLogo, setCurrentLogo] = useState('');
  const [previewLogo, setPreviewLogo] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchCurrentLogo();
  }, []);

  const fetchCurrentLogo = async () => {
    try {
      setLoading(true);
      const response = await api.get('/settings', { requiresAuth: false });
      const logoUrl = response.data?.logoUrl || '/uploads/logo/logo.png';
      setCurrentLogo(logoUrl);
      setPreviewLogo(logoUrl);
    } catch (err: any) {
      setError(err.message || 'Error al cargar el logo actual');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Archivo no válido');
      return;
    }

    // Previsualizar imagen
    try {
      const preview = await fileToBase64(file);
      setPreviewLogo(preview);
    } catch (err) {
      setError('Error al previsualizar la imagen');
    }
  };

  const handleUpload = async () => {
    const fileInput = document.getElementById('logo-input') as HTMLInputElement;
    const file = fileInput?.files?.[0];

    if (!file) {
      setError('Por favor, selecciona una imagen');
      return;
    }

    setError('');
    setSuccess('');
    setUploading(true);

    try {
      const logoUrl = await uploadImage(file);

      // Actualizar el logo en settings
      await api.put('/settings', {
        logoUrl,
      });

      setCurrentLogo(logoUrl);
      setPreviewLogo(logoUrl);
      setSuccess('Logo actualizado correctamente');

      // Limpiar el input
      fileInput.value = '';

      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Error al subir el logo');
      setPreviewLogo(currentLogo);
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setPreviewLogo(currentLogo);
    setError('');
    const fileInput = document.getElementById('logo-input') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <p style={{ color: '#6b7280' }}>Cargando logo...</p>
      </div>
    );
  }

  const hasChanges = previewLogo !== currentLogo;

  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <h2 className="admin-card-title">Gestión del Logo</h2>
        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
          Sube y actualiza el logo que aparece en el header de la web pública
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div>
          <h3
            style={{
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '1rem',
            }}
          >
            Logo Actual
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
            <img
              src={currentLogo}
              alt="Logo actual"
              style={{
                maxWidth: '100%',
                maxHeight: '150px',
                objectFit: 'contain',
              }}
            />
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
            {hasChanges ? 'Vista Previa' : 'Subir Nuevo Logo'}
          </h3>
          <div
            style={{
              border: hasChanges ? '2px solid #3b82f6' : '2px dashed #d1d5db',
              borderRadius: '8px',
              padding: '2rem',
              backgroundColor: hasChanges ? '#eff6ff' : '#f9fafb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '200px',
            }}
          >
            {previewLogo && previewLogo !== '/uploads/logo/logo.png' ? (
              <img
                src={previewLogo}
                alt="Vista previa"
                style={{
                  maxWidth: '100%',
                  maxHeight: '150px',
                  objectFit: 'contain',
                }}
              />
            ) : (
              <div style={{ textAlign: 'center', color: '#6b7280' }}>
                <p style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🎨</p>
                <p style={{ fontSize: '0.875rem' }}>Selecciona un logo para previsualizar</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <label className="admin-label">Seleccionar nuevo logo</label>
        <input
          id="logo-input"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading}
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '0.875rem',
          }}
        />
        <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>
          Formatos soportados: PNG, JPG, WEBP, SVG. Tamaño máximo: 5MB. Recomendado: fondo
          transparente.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
        <button
          onClick={handleUpload}
          className="admin-btn admin-btn-primary"
          disabled={uploading || !hasChanges}
        >
          {uploading ? 'Subiendo...' : 'Actualizar Logo'}
        </button>

        {hasChanges && (
          <button
            onClick={handleCancel}
            className="admin-btn admin-btn-secondary"
            disabled={uploading}
          >
            Cancelar
          </button>
        )}
      </div>
    </div>
  );
}
