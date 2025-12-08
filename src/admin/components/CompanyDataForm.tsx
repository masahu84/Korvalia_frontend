/**
 * Formulario para gestionar los datos de la empresa (footer y contacto)
 */

import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { uploadImage, validateImageFile, fileToBase64 } from '../lib/upload';
import { useToast, ToastProvider } from './Toast';

interface CompanyData {
  companyName: string;
  slogan: string;
  phone: string;
  email: string;
  address: string;
  schedule: string;
  aboutUs: string;
  instagramUrl: string;
  facebookUrl: string;
  linkedinUrl: string;
  whatsappNumber: string;
  logoUrl: string;
}

function CompanyDataFormInner() {
  const [formData, setFormData] = useState<CompanyData>({
    companyName: '',
    slogan: '',
    phone: '',
    email: '',
    address: '',
    schedule: '',
    aboutUs: '',
    instagramUrl: '',
    facebookUrl: '',
    linkedinUrl: '',
    whatsappNumber: '',
    logoUrl: '',
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const toast = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const getImageUrl = (url: string | null): string => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    const API_BASE = import.meta.env.PUBLIC_API_URL || 'http://localhost:4000';
    return url.startsWith('/') ? `${API_BASE}${url}` : `${API_BASE}/${url}`;
  };

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/settings', { requiresAuth: false });
      const data = response.data || {};

      const logoUrl = data.logoUrl || '';
      setFormData({
        companyName: data.companyName || '',
        slogan: data.slogan || '',
        phone: data.phone || '',
        email: data.email || '',
        address: data.address || '',
        schedule: data.schedule || '',
        aboutUs: data.aboutUs || '',
        instagramUrl: data.instagramUrl || '',
        facebookUrl: data.facebookUrl || '',
        linkedinUrl: data.linkedinUrl || '',
        whatsappNumber: data.whatsappNumber || '',
        logoUrl: logoUrl,
      });
      // Construir URL completa para preview
      setLogoPreview(logoUrl ? getImageUrl(logoUrl) : '');
    } catch (err: any) {
      toast.error(err.message || 'Error al cargar los datos');
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

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast.error(validation.error || 'Archivo no válido');
      return;
    }

    setLogoFile(file);

    try {
      const preview = await fileToBase64(file);
      setLogoPreview(preview);
    } catch (err) {
      toast.error('Error al previsualizar la imagen');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    toast.loading('Guardando datos de la empresa...');

    try {
      let dataToSend = { ...formData };

      // Si hay un nuevo logo, subirlo primero
      if (logoFile) {
        const logoUrl = await uploadImage(logoFile);
        dataToSend.logoUrl = logoUrl;
      }

      await api.put('/settings', dataToSend);
      toast.dismiss();
      toast.success('Datos de la empresa guardados exitosamente');

      // Actualizar el estado con el nuevo logo
      if (logoFile) {
        setFormData(dataToSend);
        setLogoFile(null);
      }
    } catch (err: any) {
      toast.dismiss();
      toast.error(err.message || 'Error al guardar los datos');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <p style={{ color: '#6b7280' }}>Cargando datos...</p>
      </div>
    );
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        {/* Información básica */}
        <div className="admin-card" style={{ marginBottom: '2rem' }}>
          <div className="admin-card-header">
            <h2 className="admin-card-title">Información Básica</h2>
          </div>

          <div className="admin-form-group">
            <label className="admin-label">Nombre de la Empresa</label>
            <input
              type="text"
              name="companyName"
              className="admin-input"
              value={formData.companyName}
              onChange={handleInputChange}
              placeholder="Ej: Korvalia Inmobiliaria"
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-label">Eslogan / Claim</label>
            <input
              type="text"
              name="slogan"
              className="admin-input"
              value={formData.slogan}
              onChange={handleInputChange}
              placeholder="Ej: Tu hogar perfecto te espera"
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-label">Sobre Nosotros</label>
            <textarea
              name="aboutUs"
              className="admin-textarea"
              value={formData.aboutUs}
              onChange={handleInputChange}
              rows={4}
              placeholder="Descripción breve de la empresa..."
            />
          </div>
        </div>

        {/* Datos de contacto */}
        <div className="admin-card" style={{ marginBottom: '2rem' }}>
          <div className="admin-card-header">
            <h2 className="admin-card-title">Datos de Contacto</h2>
          </div>

          <div className="admin-grid admin-grid-2">
            <div className="admin-form-group">
              <label className="admin-label">Teléfono</label>
              <input
                type="tel"
                name="phone"
                className="admin-input"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Ej: +34 123 456 789"
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-label">Email</label>
              <input
                type="email"
                name="email"
                className="admin-input"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Ej: info@korvalia.com"
              />
            </div>
          </div>

          <div className="admin-form-group">
            <label className="admin-label">Dirección</label>
            <input
              type="text"
              name="address"
              className="admin-input"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Ej: Calle Principal 123, Madrid"
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-label">Horario de Atención</label>
            <input
              type="text"
              name="schedule"
              className="admin-input"
              value={formData.schedule}
              onChange={handleInputChange}
              placeholder="Ej: Lunes a Viernes de 9:00 a 18:00"
            />
          </div>
        </div>

        {/* Redes sociales */}
        <div className="admin-card" style={{ marginBottom: '2rem' }}>
          <div className="admin-card-header">
            <h2 className="admin-card-title">Redes Sociales</h2>
          </div>

          <div className="admin-form-group">
            <label className="admin-label">Instagram</label>
            <input
              type="url"
              name="instagramUrl"
              className="admin-input"
              value={formData.instagramUrl}
              onChange={handleInputChange}
              placeholder="https://instagram.com/tuempresa"
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-label">Facebook</label>
            <input
              type="url"
              name="facebookUrl"
              className="admin-input"
              value={formData.facebookUrl}
              onChange={handleInputChange}
              placeholder="https://facebook.com/tuempresa"
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-label">LinkedIn</label>
            <input
              type="url"
              name="linkedinUrl"
              className="admin-input"
              value={formData.linkedinUrl}
              onChange={handleInputChange}
              placeholder="https://linkedin.com/company/tuempresa"
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-label">WhatsApp (número)</label>
            <input
              type="tel"
              name="whatsappNumber"
              className="admin-input"
              value={formData.whatsappNumber}
              onChange={handleInputChange}
              placeholder="Ej: +34123456789"
            />
            <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>
              Número de WhatsApp sin espacios ni guiones
            </p>
          </div>
        </div>

        {/* Logo */}
        <div className="admin-card" style={{ marginBottom: '2rem' }}>
          <div className="admin-card-header">
            <h2 className="admin-card-title">Logo de la Empresa</h2>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
              Logo que aparece en el header de la web pública
            </p>
          </div>

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
                  minHeight: '150px',
                }}
              >
                {formData.logoUrl ? (
                  <img
                    src={getImageUrl(formData.logoUrl)}
                    alt="Logo actual"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '120px',
                      objectFit: 'contain',
                    }}
                  />
                ) : (
                  <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Sin logo</p>
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
                {logoFile ? 'Vista Previa' : 'Subir Nuevo Logo'}
              </h3>
              <div
                style={{
                  border: logoFile ? '2px solid #3b82f6' : '2px dashed #d1d5db',
                  borderRadius: '8px',
                  padding: '2rem',
                  backgroundColor: logoFile ? '#eff6ff' : '#f9fafb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '150px',
                }}
              >
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Vista previa"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '120px',
                      objectFit: 'contain',
                    }}
                  />
                ) : (
                  <div style={{ textAlign: 'center', color: '#6b7280' }}>
                    <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎨</p>
                    <p style={{ fontSize: '0.875rem' }}>Selecciona un logo</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="admin-form-group">
            <label className="admin-label">Seleccionar nuevo logo</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
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
              Formatos soportados: PNG, JPG, WEBP, SVG. Tamaño máximo: 5MB. Recomendado: fondo transparente.
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
            onClick={fetchSettings}
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
export default function CompanyDataForm() {
  return (
    <ToastProvider>
      <CompanyDataFormInner />
    </ToastProvider>
  );
}
