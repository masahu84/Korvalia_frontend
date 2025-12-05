/**
 * Formulario completo para crear/editar propiedades
 * Refactorizado para usar exactamente los mismos campos que el backend
 */

import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { uploadMultipleImages, validateImageFile, fileToBase64 } from '../lib/upload';
import { useToast, ToastProvider } from './Toast';

// URL base del API para construir URLs de imágenes
const API_BASE = (import.meta as any).env?.PUBLIC_API_URL || 'http://localhost:4000';

// Función para obtener URL completa de imagen
function getFullImageUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  return `${API_BASE}${url.startsWith('/') ? '' : '/'}${url}`;
}

// Tipos que coinciden exactamente con el backend
type OperationType = 'RENT' | 'SALE';
type PropertyCategory = 'FLAT' | 'HOUSE' | 'PENTHOUSE' | 'DUPLEX' | 'LAND' | 'COMMERCIAL' | 'GARAGE' | 'ROOM' | 'OTHER';
type PropertyStatus = 'ACTIVE' | 'INACTIVE' | 'RESERVED' | 'SOLD' | 'RENTED';

interface City {
  id: number;
  name: string;
}

interface PropertyFormData {
  title: string;
  description: string;
  operation: OperationType;
  propertyType: PropertyCategory;
  price: number;
  currency: string;
  cityId: number;
  neighborhood: string;
  address: string;
  latitude: number | undefined;
  longitude: number | undefined;
  bedrooms: number | undefined;
  bathrooms: number | undefined;
  areaM2: number | undefined;
  builtYear: number | undefined;
  floor: number | undefined;
  hasElevator: boolean;
  hasParking: boolean;
  hasPool: boolean;
  hasTerrace: boolean;
  hasGarden: boolean;
  furnished: boolean;
  petsAllowed: boolean;
  energyRating: string;
  status: PropertyStatus;
  isFeatured: boolean;
  imageUrls: string[];
}

interface PropertyFormProps {
  propertyId?: number;
}

const PROPERTY_TYPES = [
  { value: 'FLAT', label: 'Piso / Apartamento' },
  { value: 'HOUSE', label: 'Casa / Chalet' },
  { value: 'PENTHOUSE', label: 'Ático' },
  { value: 'DUPLEX', label: 'Dúplex' },
  { value: 'LAND', label: 'Terreno / Parcela' },
  { value: 'COMMERCIAL', label: 'Local Comercial' },
  { value: 'GARAGE', label: 'Garaje' },
  { value: 'ROOM', label: 'Habitación' },
  { value: 'OTHER', label: 'Otros' },
];

const PROPERTY_STATUS = [
  { value: 'ACTIVE', label: 'Disponible' },
  { value: 'RESERVED', label: 'Reservado' },
  { value: 'RENTED', label: 'Alquilado' },
  { value: 'SOLD', label: 'Vendido' },
  { value: 'INACTIVE', label: 'Oculto' },
];

function PropertyFormInner({ propertyId }: PropertyFormProps) {
  const [formData, setFormData] = useState<PropertyFormData>({
    title: '',
    description: '',
    operation: 'RENT',
    propertyType: 'FLAT',
    price: 0,
    currency: 'EUR',
    cityId: 0,
    neighborhood: '',
    address: '',
    latitude: undefined,
    longitude: undefined,
    bedrooms: undefined,
    bathrooms: undefined,
    areaM2: undefined,
    builtYear: undefined,
    floor: undefined,
    hasElevator: false,
    hasParking: false,
    hasPool: false,
    hasTerrace: false,
    hasGarden: false,
    furnished: false,
    petsAllowed: false,
    energyRating: '',
    status: 'ACTIVE',
    isFeatured: false,
    imageUrls: [],
  });

  const [cities, setCities] = useState<City[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [primaryImageIndex, setPrimaryImageIndex] = useState(0);
  const [loading, setLoading] = useState(!!propertyId);
  const [saving, setSaving] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const { showToast, showLoading, hideLoading, updateToast } = useToast();

  useEffect(() => {
    fetchCities();
    if (propertyId) {
      fetchProperty();
    }
  }, [propertyId]);

  const fetchCities = async () => {
    try {
      const response = await api.get('/cities', { requiresAuth: false });
      setCities(response.data || []);
    } catch (err: any) {
      showToast('error', 'Error al cargar las ciudades');
    }
  };

  const fetchProperty = async () => {
    try {
      setLoading(true);
      console.log(`[PropertyForm] Cargando propiedad con ID: ${propertyId}`);

      const response = await api.get(`/properties/${propertyId}`, { requiresAuth: false });
      console.log('[PropertyForm] Respuesta del servidor:', response);

      const property = response.data;
      console.log('[PropertyForm] Datos de la propiedad:', property);

      // Extraer URLs de las imágenes (relativas para el backend, completas para preview)
      const imageUrls = property.images?.map((img: any) => img.url) || [];

      // Encontrar el índice de la imagen principal
      const primaryIdx = property.images?.findIndex((img: any) => img.isPrimary) ?? 0;
      setPrimaryImageIndex(primaryIdx >= 0 ? primaryIdx : 0);

      setFormData({
        title: property.title || '',
        description: property.description || '',
        operation: property.operation || 'RENT',
        propertyType: property.propertyType || 'FLAT',
        price: property.price || 0,
        currency: property.currency || 'EUR',
        cityId: property.cityId || 0,
        neighborhood: property.neighborhood || '',
        address: property.address || '',
        latitude: property.latitude,
        longitude: property.longitude,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        areaM2: property.areaM2,
        builtYear: property.builtYear,
        floor: property.floor,
        hasElevator: property.hasElevator || false,
        hasParking: property.hasParking || false,
        hasPool: property.hasPool || false,
        hasTerrace: property.hasTerrace || false,
        hasGarden: property.hasGarden || false,
        furnished: property.furnished || false,
        petsAllowed: property.petsAllowed || false,
        energyRating: property.energyRating || '',
        status: property.status || 'ACTIVE',
        isFeatured: property.isFeatured || false,
        imageUrls: imageUrls, // URLs relativas para enviar al backend
      });

      // Para los previews, usar URLs completas
      setImagePreviews(imageUrls.map((url: string) => getFullImageUrl(url)));
      console.log('[PropertyForm] Formulario cargado correctamente');
    } catch (err: any) {
      console.error('[PropertyForm] Error al cargar propiedad:', err);
      showToast('error', err.message || 'Error al cargar la propiedad');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
    } else if (type === 'number') {
      setFormData({ ...formData, [name]: value === '' ? undefined : Number(value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    const loadingId = showLoading('Subiendo imágenes...');

    try {
      const validFiles: File[] = [];
      const previews: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const validation = validateImageFile(file);

        if (!validation.valid) {
          showToast('warning', validation.error || 'Archivo no válido');
          continue;
        }

        validFiles.push(file);
        const preview = await fileToBase64(file);
        previews.push(preview);
      }

      if (validFiles.length === 0) {
        hideLoading(loadingId);
        setUploadingImages(false);
        return;
      }

      const urls = await uploadMultipleImages(validFiles);

      setFormData((prev) => ({
        ...prev,
        imageUrls: [...prev.imageUrls, ...urls],
      }));

      setImagePreviews((prev) => [...prev, ...previews]);
      updateToast(loadingId, 'success', `${urls.length} imagen(es) subida(s) correctamente`);
    } catch (err: any) {
      updateToast(loadingId, 'error', err.message || 'Error al subir las imágenes');
    } finally {
      setUploadingImages(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, i) => i !== index),
    }));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));

    // Ajustar el índice de la imagen principal si es necesario
    if (index === primaryImageIndex) {
      // Si se elimina la principal, la nueva principal es la primera (índice 0)
      setPrimaryImageIndex(0);
    } else if (index < primaryImageIndex) {
      // Si se elimina una imagen antes de la principal, ajustar el índice
      setPrimaryImageIndex((prev) => prev - 1);
    }
  };

  const handleSetPrimaryImage = (index: number) => {
    setPrimaryImageIndex(index);
    showToast('info', 'Imagen principal actualizada');
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.title || formData.title.trim().length === 0) {
      errors.title = 'El título es requerido';
    }

    if (!formData.description || formData.description.trim().length === 0) {
      errors.description = 'La descripción es requerida';
    }

    if (!formData.address || formData.address.trim().length === 0) {
      errors.address = 'La dirección es requerida';
    }

    if (!formData.price || formData.price <= 0) {
      errors.price = 'El precio debe ser mayor a 0';
    }

    if (!formData.cityId || formData.cityId === 0) {
      errors.cityId = 'Debes seleccionar una ciudad';
    }

    if (formData.imageUrls.length === 0) {
      errors.images = 'Debes subir al menos una imagen';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});

    if (!validateForm()) {
      showToast('warning', 'Por favor, completa todos los campos requeridos');
      return;
    }

    setSaving(true);
    const loadingId = showLoading(propertyId ? 'Actualizando propiedad...' : 'Creando propiedad...');

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        operation: formData.operation,
        propertyType: formData.propertyType,
        price: Number(formData.price),
        currency: formData.currency,
        cityId: Number(formData.cityId),
        neighborhood: formData.neighborhood || undefined,
        address: formData.address,
        latitude: formData.latitude,
        longitude: formData.longitude,
        bedrooms: formData.bedrooms,
        bathrooms: formData.bathrooms,
        areaM2: formData.areaM2,
        builtYear: formData.builtYear,
        floor: formData.floor,
        hasElevator: formData.hasElevator,
        hasParking: formData.hasParking,
        hasPool: formData.hasPool,
        hasTerrace: formData.hasTerrace,
        hasGarden: formData.hasGarden,
        furnished: formData.furnished,
        petsAllowed: formData.petsAllowed,
        energyRating: formData.energyRating || undefined,
        status: formData.status,
        isFeatured: formData.isFeatured,
        imageUrls: formData.imageUrls,
        primaryImageIndex: primaryImageIndex,
      };

      if (propertyId) {
        await api.put(`/properties/${propertyId}`, payload);
        updateToast(loadingId, 'success', 'Propiedad actualizada correctamente');
      } else {
        await api.post('/properties', payload);
        updateToast(loadingId, 'success', 'Propiedad creada correctamente');
      }

      setTimeout(() => {
        window.location.href = '/admin/properties';
      }, 1500);
    } catch (err: any) {
      if (err.response?.data?.details && typeof err.response.data.details === 'object') {
        const backendErrors = err.response.data.details;
        const { stack, ...validationErrs } = backendErrors;
        setValidationErrors(validationErrs);
        updateToast(loadingId, 'error', err.response.data.error || 'Error de validación');
      } else {
        updateToast(loadingId, 'error', err.message || 'Error al guardar la propiedad');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <p style={{ color: '#6b7280' }}>Cargando propiedad...</p>
      </div>
    );
  }

  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <h2 className="admin-card-title">
          {propertyId ? 'Editar Propiedad' : 'Nueva Propiedad'}
        </h2>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Información básica */}
        <div className="admin-form-group">
          <label className="admin-label">Título *</label>
          <input
            type="text"
            name="title"
            className="admin-input"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Ej: Piso céntrico con 3 habitaciones"
            required
            style={validationErrors.title ? { borderColor: '#dc2626' } : {}}
          />
          {validationErrors.title && (
            <p style={{ color: '#dc2626', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              {validationErrors.title}
            </p>
          )}
        </div>

        <div className="admin-form-group">
          <label className="admin-label">Dirección *</label>
          <input
            type="text"
            name="address"
            className="admin-input"
            value={formData.address}
            onChange={handleInputChange}
            placeholder="Ej: Calle Mayor, 123"
            required
            style={validationErrors.address ? { borderColor: '#dc2626' } : {}}
          />
          {validationErrors.address && (
            <p style={{ color: '#dc2626', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              {validationErrors.address}
            </p>
          )}
        </div>

        <div className="admin-grid admin-grid-2">
          <div className="admin-form-group">
            <label className="admin-label">Operación *</label>
            <select
              name="operation"
              className="admin-select"
              value={formData.operation}
              onChange={handleInputChange}
              required
            >
              <option value="RENT">Alquiler</option>
              <option value="SALE">Venta</option>
            </select>
          </div>

          <div className="admin-form-group">
            <label className="admin-label">Tipo de Propiedad *</label>
            <select
              name="propertyType"
              className="admin-select"
              value={formData.propertyType}
              onChange={handleInputChange}
              required
            >
              {PROPERTY_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="admin-grid admin-grid-2">
          <div className="admin-form-group">
            <label className="admin-label">Precio (€) *</label>
            <input
              type="number"
              name="price"
              className="admin-input"
              value={formData.price || ''}
              onChange={handleInputChange}
              min="0"
              required
              style={validationErrors.price ? { borderColor: '#dc2626' } : {}}
            />
            {validationErrors.price && (
              <p style={{ color: '#dc2626', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                {validationErrors.price}
              </p>
            )}
          </div>

          <div className="admin-form-group">
            <label className="admin-label">Ciudad *</label>
            <select
              name="cityId"
              className="admin-select"
              value={formData.cityId}
              onChange={handleInputChange}
              required
              style={validationErrors.cityId ? { borderColor: '#dc2626' } : {}}
            >
              <option value="0">Seleccionar ciudad</option>
              {cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </select>
            {validationErrors.cityId && (
              <p style={{ color: '#dc2626', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                {validationErrors.cityId}
              </p>
            )}
          </div>
        </div>

        <div className="admin-form-group">
          <label className="admin-label">Barrio (opcional)</label>
          <input
            type="text"
            name="neighborhood"
            className="admin-input"
            value={formData.neighborhood}
            onChange={handleInputChange}
            placeholder="Ej: Centro"
          />
        </div>

        {/* Características */}
        <div className="admin-grid admin-grid-3">
          <div className="admin-form-group">
            <label className="admin-label">Habitaciones</label>
            <input
              type="number"
              name="bedrooms"
              className="admin-input"
              value={formData.bedrooms || ''}
              onChange={handleInputChange}
              min="0"
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-label">Baños</label>
            <input
              type="number"
              name="bathrooms"
              className="admin-input"
              value={formData.bathrooms || ''}
              onChange={handleInputChange}
              min="0"
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-label">Superficie (m²)</label>
            <input
              type="number"
              name="areaM2"
              className="admin-input"
              value={formData.areaM2 || ''}
              onChange={handleInputChange}
              min="0"
            />
          </div>
        </div>

        <div className="admin-grid admin-grid-2">
          <div className="admin-form-group">
            <label className="admin-label">Año de construcción</label>
            <input
              type="number"
              name="builtYear"
              className="admin-input"
              value={formData.builtYear || ''}
              onChange={handleInputChange}
              min="1900"
              max={new Date().getFullYear()}
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-label">Planta</label>
            <input
              type="number"
              name="floor"
              className="admin-input"
              value={formData.floor || ''}
              onChange={handleInputChange}
            />
          </div>
        </div>

        {/* Descripción */}
        <div className="admin-form-group">
          <label className="admin-label">Descripción *</label>
          <textarea
            name="description"
            className="admin-textarea"
            value={formData.description}
            onChange={handleInputChange}
            rows={6}
            placeholder="Describe la propiedad detalladamente..."
            required
            style={validationErrors.description ? { borderColor: '#dc2626' } : {}}
          />
          {validationErrors.description && (
            <p style={{ color: '#dc2626', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              {validationErrors.description}
            </p>
          )}
        </div>

        {/* Amenidades */}
        <div className="admin-form-group">
          <label className="admin-label">Comodidades</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.625rem',
                borderRadius: '6px',
                border: formData.hasElevator ? '2px solid #3b82f6' : '1px solid #d1d5db',
                backgroundColor: formData.hasElevator ? '#eff6ff' : 'white',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                name="hasElevator"
                checked={formData.hasElevator}
                onChange={handleInputChange}
                style={{ cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>🛗 Ascensor</span>
            </label>

            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.625rem',
                borderRadius: '6px',
                border: formData.hasParking ? '2px solid #3b82f6' : '1px solid #d1d5db',
                backgroundColor: formData.hasParking ? '#eff6ff' : 'white',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                name="hasParking"
                checked={formData.hasParking}
                onChange={handleInputChange}
                style={{ cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>🚗 Garaje</span>
            </label>

            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.625rem',
                borderRadius: '6px',
                border: formData.hasPool ? '2px solid #3b82f6' : '1px solid #d1d5db',
                backgroundColor: formData.hasPool ? '#eff6ff' : 'white',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                name="hasPool"
                checked={formData.hasPool}
                onChange={handleInputChange}
                style={{ cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>🏊 Piscina</span>
            </label>

            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.625rem',
                borderRadius: '6px',
                border: formData.hasTerrace ? '2px solid #3b82f6' : '1px solid #d1d5db',
                backgroundColor: formData.hasTerrace ? '#eff6ff' : 'white',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                name="hasTerrace"
                checked={formData.hasTerrace}
                onChange={handleInputChange}
                style={{ cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>🌿 Terraza</span>
            </label>

            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.625rem',
                borderRadius: '6px',
                border: formData.hasGarden ? '2px solid #3b82f6' : '1px solid #d1d5db',
                backgroundColor: formData.hasGarden ? '#eff6ff' : 'white',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                name="hasGarden"
                checked={formData.hasGarden}
                onChange={handleInputChange}
                style={{ cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>🌳 Jardín</span>
            </label>

            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.625rem',
                borderRadius: '6px',
                border: formData.furnished ? '2px solid #3b82f6' : '1px solid #d1d5db',
                backgroundColor: formData.furnished ? '#eff6ff' : 'white',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                name="furnished"
                checked={formData.furnished}
                onChange={handleInputChange}
                style={{ cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>🪑 Amueblado</span>
            </label>

            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.625rem',
                borderRadius: '6px',
                border: formData.petsAllowed ? '2px solid #3b82f6' : '1px solid #d1d5db',
                backgroundColor: formData.petsAllowed ? '#eff6ff' : 'white',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                name="petsAllowed"
                checked={formData.petsAllowed}
                onChange={handleInputChange}
                style={{ cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>🐕 Se admiten mascotas</span>
            </label>
          </div>
        </div>

        {/* Coordenadas */}
        <div className="admin-grid admin-grid-2">
          <div className="admin-form-group">
            <label className="admin-label">Latitud (opcional)</label>
            <input
              type="number"
              name="latitude"
              className="admin-input"
              value={formData.latitude || ''}
              onChange={handleInputChange}
              step="0.000001"
              placeholder="Ej: 40.416775"
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-label">Longitud (opcional)</label>
            <input
              type="number"
              name="longitude"
              className="admin-input"
              value={formData.longitude || ''}
              onChange={handleInputChange}
              step="0.000001"
              placeholder="Ej: -3.703790"
            />
          </div>
        </div>

        {/* Estado y calificación energética */}
        <div className="admin-grid admin-grid-2">
          <div className="admin-form-group">
            <label className="admin-label">Estado</label>
            <select
              name="status"
              className="admin-select"
              value={formData.status}
              onChange={handleInputChange}
            >
              {PROPERTY_STATUS.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          <div className="admin-form-group">
            <label className="admin-label">Calificación Energética</label>
            <input
              type="text"
              name="energyRating"
              className="admin-input"
              value={formData.energyRating}
              onChange={handleInputChange}
              placeholder="Ej: A, B, C..."
              maxLength={2}
            />
          </div>
        </div>

        {/* Destacado */}
        <div className="admin-form-group">
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              cursor: 'pointer',
            }}
          >
            <input
              type="checkbox"
              name="isFeatured"
              checked={formData.isFeatured}
              onChange={handleInputChange}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <span style={{ fontWeight: '500', fontSize: '0.875rem' }}>
              ⭐ Marcar como propiedad destacada
            </span>
          </label>
        </div>

        {/* Imágenes */}
        <div className="admin-form-group">
          <label className="admin-label">Imágenes *</label>
          {validationErrors.images && (
            <p style={{ color: '#dc2626', fontSize: '0.875rem', marginTop: '0.25rem', marginBottom: '0.5rem' }}>
              {validationErrors.images}
            </p>
          )}

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
              gap: '1rem',
              marginBottom: '1rem',
            }}
          >
            {imagePreviews.map((image, index) => (
              <div
                key={index}
                style={{
                  position: 'relative',
                  aspectRatio: '4/3',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  border: '2px solid #e5e7eb',
                }}
              >
                <img
                  src={image}
                  alt={`Imagen ${index + 1}`}
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
                  }}
                >
                  ✕
                </button>
                {/* Botón para establecer como principal */}
                {index === primaryImageIndex ? (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '0.5rem',
                      left: '0.5rem',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                    }}
                  >
                    Principal
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSetPrimaryImage(index)}
                    style={{
                      position: 'absolute',
                      bottom: '0.5rem',
                      left: '0.5rem',
                      backgroundColor: 'rgba(0,0,0,0.6)',
                      color: 'white',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.7rem',
                      fontWeight: '500',
                      border: 'none',
                      cursor: 'pointer',
                      opacity: 0.8,
                      transition: 'opacity 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}
                  >
                    Hacer principal
                  </button>
                )}
              </div>
            ))}

            <label
              style={{
                aspectRatio: '4/3',
                border: '2px dashed #d1d5db',
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: uploadingImages ? 'not-allowed' : 'pointer',
                backgroundColor: '#f9fafb',
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
                {uploadingImages ? 'Subiendo...' : 'Subir imágenes'}
              </span>
            </label>
          </div>

          <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>
            Sube al menos una imagen. Haz clic en "Hacer principal" para elegir la imagen destacada.
          </p>
        </div>

        {/* Botones */}
        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <button
            type="submit"
            className="admin-btn admin-btn-primary"
            disabled={saving || uploadingImages}
          >
            {saving ? 'Guardando...' : propertyId ? 'Actualizar Propiedad' : 'Crear Propiedad'}
          </button>

          <a
            href="/admin/properties"
            className="admin-btn admin-btn-secondary"
            style={{ display: 'inline-flex' }}
          >
            Cancelar
          </a>
        </div>
      </form>
    </div>
  );
}

// Componente exportado que incluye el ToastProvider
export default function PropertyForm({ propertyId }: PropertyFormProps) {
  return (
    <ToastProvider>
      <PropertyFormInner propertyId={propertyId} />
    </ToastProvider>
  );
}
