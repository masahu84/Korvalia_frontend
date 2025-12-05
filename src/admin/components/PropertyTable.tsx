/**
 * Tabla de propiedades con acciones
 * Actualizado para coincidir exactamente con el modelo del backend
 */

import { useState, useEffect } from 'react';
import { api } from '../lib/api';
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

type PropertyCategory = 'FLAT' | 'HOUSE' | 'PENTHOUSE' | 'DUPLEX' | 'LAND' | 'COMMERCIAL' | 'GARAGE' | 'ROOM' | 'OTHER';
type OperationType = 'RENT' | 'SALE';
type PropertyStatus = 'ACTIVE' | 'INACTIVE' | 'RESERVED' | 'SOLD' | 'RENTED';

interface PropertyImage {
  id: number;
  url: string;
  alt?: string;
  order: number;
  isPrimary?: boolean;
}

interface Property {
  id: number;
  title: string;
  operation: OperationType;
  propertyType: PropertyCategory;
  price: number;
  city: {
    id: number;
    name: string;
  };
  status: PropertyStatus;
  isFeatured: boolean;
  bedrooms?: number;
  bathrooms?: number;
  areaM2?: number;
  images: PropertyImage[];
}

const PROPERTY_TYPE_LABELS: Record<PropertyCategory, string> = {
  FLAT: 'Piso',
  HOUSE: 'Casa',
  PENTHOUSE: 'Ático',
  DUPLEX: 'Dúplex',
  LAND: 'Terreno',
  COMMERCIAL: 'Local',
  GARAGE: 'Garaje',
  ROOM: 'Habitación',
  OTHER: 'Otros',
};

const STATUS_LABELS: Record<PropertyStatus, string> = {
  ACTIVE: 'Disponible',
  INACTIVE: 'Oculto',
  RESERVED: 'Reservado',
  SOLD: 'Vendido',
  RENTED: 'Alquilado',
};

function PropertyTableInner() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { showLoading, updateToast } = useToast();

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/properties', { requiresAuth: false });

      // El backend devuelve { data: { properties, total, count } }
      if (response?.data?.properties && Array.isArray(response.data.properties)) {
        setProperties(response.data.properties);
      } else if (response?.properties && Array.isArray(response.properties)) {
        setProperties(response.properties);
      } else {
        setProperties([]);
      }
    } catch (err: any) {
      console.error('Error fetching properties:', err);
      setError('Error al cargar las propiedades. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`¿Estás seguro de eliminar la propiedad "${title}"?`)) {
      return;
    }

    const loadingId = showLoading('Eliminando propiedad...');

    try {
      await api.delete(`/properties/${id}`);
      setProperties(properties.filter((p) => p.id !== id));
      updateToast(loadingId, 'success', 'Propiedad eliminada correctamente');
    } catch (err: any) {
      updateToast(loadingId, 'error', err.message || 'Error al eliminar la propiedad');
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <p style={{ color: '#6b7280' }}>Cargando propiedades...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          backgroundColor: '#fee2e2',
          color: '#991b1b',
          padding: '1rem',
          borderRadius: '8px',
          borderLeft: '4px solid #dc2626',
        }}
      >
        {error}
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="admin-card">
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏠</p>
          <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
            No hay propiedades registradas
          </p>
          <a href="/admin/properties/new" className="admin-btn admin-btn-primary">
            ➕ Crear primera propiedad
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <div className="admin-flex-between">
          <div>
            <h2 className="admin-card-title">Propiedades</h2>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
              Total: {properties.length} propiedades
            </p>
          </div>
          <a href="/admin/properties/new" className="admin-btn admin-btn-primary">
            ➕ Nueva Propiedad
          </a>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Imagen</th>
              <th>Título</th>
              <th>Tipo</th>
              <th>Operación</th>
              <th>Precio</th>
              <th>Ciudad</th>
              <th>Detalles</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {properties.map((property) => (
              <tr key={property.id}>
                <td>
                  {property.images && property.images.length > 0 ? (
                    <img
                      src={getFullImageUrl(property.images.find(img => img.isPrimary)?.url || property.images[0].url)}
                      alt={property.images[0].alt || property.title}
                      style={{
                        width: '80px',
                        height: '60px',
                        objectFit: 'cover',
                        borderRadius: '6px',
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '80px',
                        height: '60px',
                        backgroundColor: '#f3f4f6',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.5rem',
                      }}
                    >
                      🏠
                    </div>
                  )}
                </td>
                <td>
                  <div style={{ fontWeight: '500', color: '#111827' }}>
                    {property.title}
                  </div>
                  {property.isFeatured && (
                    <span
                      style={{
                        fontSize: '0.75rem',
                        color: '#d97706',
                        marginTop: '0.25rem',
                        display: 'inline-block',
                      }}
                    >
                      ⭐ Destacada
                    </span>
                  )}
                </td>
                <td>
                  <span style={{ fontSize: '0.875rem', color: '#374151' }}>
                    {PROPERTY_TYPE_LABELS[property.propertyType]}
                  </span>
                </td>
                <td>
                  <span
                    className={
                      property.operation === 'RENT'
                        ? 'admin-badge admin-badge-success'
                        : 'admin-badge admin-badge-warning'
                    }
                  >
                    {property.operation === 'RENT' ? 'Alquiler' : 'Venta'}
                  </span>
                </td>
                <td style={{ fontWeight: '600', color: '#111827' }}>
                  {property.price.toLocaleString('es-ES')} €
                  {property.operation === 'RENT' && (
                    <span style={{ fontSize: '0.75rem', color: '#6b7280', display: 'block' }}>
                      /mes
                    </span>
                  )}
                </td>
                <td>{property.city?.name || '-'}</td>
                <td style={{ fontSize: '0.8125rem', color: '#6b7280' }}>
                  {property.bedrooms && `${property.bedrooms} hab`}
                  {property.bathrooms && ` • ${property.bathrooms} baños`}
                  {property.areaM2 && ` • ${property.areaM2}m²`}
                </td>
                <td>
                  <span
                    className={
                      property.status === 'ACTIVE'
                        ? 'admin-badge admin-badge-success'
                        : property.status === 'RESERVED'
                        ? 'admin-badge admin-badge-warning'
                        : property.status === 'SOLD' || property.status === 'RENTED'
                        ? 'admin-badge admin-badge-error'
                        : 'admin-badge'
                    }
                  >
                    {STATUS_LABELS[property.status]}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <a
                      href={`/admin/properties/${property.id}`}
                      style={{
                        padding: '0.375rem 0.75rem',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        borderRadius: '6px',
                        textDecoration: 'none',
                        fontSize: '0.8125rem',
                        fontWeight: '500',
                      }}
                    >
                      ✏️ Editar
                    </a>
                    <button
                      onClick={() => handleDelete(property.id, property.title)}
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
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Componente exportado que incluye el ToastProvider
export default function PropertyTable() {
  return (
    <ToastProvider>
      <PropertyTableInner />
    </ToastProvider>
  );
}
