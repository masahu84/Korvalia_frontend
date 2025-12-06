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

// Opciones de elementos por página
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

function PropertyTableInner() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalProperties, setTotalProperties] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const toast = useToast();

  // Calcular total de páginas
  const totalPages = Math.ceil(totalProperties / pageSize);

  useEffect(() => {
    fetchProperties();
  }, [currentPage, pageSize]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError('');

      const offset = (currentPage - 1) * pageSize;
      const response = await api.get(`/properties?limit=${pageSize}&offset=${offset}`, { requiresAuth: false });

      // El backend devuelve { data: { properties, total, count } }
      if (response?.data?.properties && Array.isArray(response.data.properties)) {
        setProperties(response.data.properties);
        setTotalProperties(response.data.total || response.data.properties.length);
      } else if (response?.properties && Array.isArray(response.properties)) {
        setProperties(response.properties);
        setTotalProperties(response.total || response.properties.length);
      } else {
        setProperties([]);
        setTotalProperties(0);
      }
    } catch (err: any) {
      console.error('Error fetching properties:', err);
      setError('Error al cargar las propiedades. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Cambiar página
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Cambiar tamaño de página
  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1); // Volver a la primera página
  };

  // Filtrar propiedades por búsqueda (cliente)
  const filteredProperties = searchTerm
    ? properties.filter(p =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.city?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : properties;

  // Generar array de páginas a mostrar
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages + 2) {
      // Mostrar todas las páginas si hay pocas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Siempre mostrar primera página
      pages.push(1);

      if (currentPage > 3) {
        pages.push('...');
      }

      // Páginas alrededor de la actual
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }

      // Siempre mostrar última página
      pages.push(totalPages);
    }

    return pages;
  };

  // Calcular rango de elementos mostrados
  const startItem = totalProperties === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalProperties);

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`¿Estás seguro de eliminar la propiedad "${title}"?`)) {
      return;
    }

    toast.loading('Eliminando propiedad...');

    try {
      await api.delete(`/properties/${id}`);
      toast.success('Propiedad eliminada correctamente');

      // Actualizar el total y recargar
      const newTotal = totalProperties - 1;
      setTotalProperties(newTotal);

      // Si la página actual queda vacía, ir a la anterior
      const newTotalPages = Math.ceil(newTotal / pageSize);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      } else {
        fetchProperties();
      }
    } catch (err: any) {
      toast.error(err.message || 'Error al eliminar la propiedad');
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
        <div className="admin-flex-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 className="admin-card-title">Propiedades</h2>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
              <strong>{totalProperties}</strong> propiedades en total
            </p>
          </div>
          <a href="/admin/properties/new" className="admin-btn admin-btn-primary">
            + Nueva Propiedad
          </a>
        </div>

        {/* Barra de controles: búsqueda y selector de página */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          {/* Búsqueda */}
          <div style={{ flex: '1', minWidth: '200px', maxWidth: '400px' }}>
            <input
              type="text"
              placeholder="Buscar por título o ciudad..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.625rem 1rem',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '0.875rem',
              }}
            />
          </div>

          {/* Selector de elementos por página */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              Mostrar:
            </label>
            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              style={{
                padding: '0.5rem 0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '0.875rem',
                backgroundColor: 'white',
                cursor: 'pointer',
              }}
            >
              {PAGE_SIZE_OPTIONS.map(size => (
                <option key={size} value={size}>{size} por página</option>
              ))}
            </select>
          </div>
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
            {filteredProperties.map((property) => (
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

      {/* Paginación */}
      {totalPages > 0 && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1rem 1.5rem',
          borderTop: '1px solid #e5e7eb',
          backgroundColor: '#f9fafb',
          flexWrap: 'wrap',
          gap: '1rem',
        }}>
          {/* Info de resultados */}
          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            Mostrando <strong>{startItem}</strong> - <strong>{endItem}</strong> de <strong>{totalProperties}</strong> propiedades
          </div>

          {/* Controles de paginación */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            {/* Botón Primera página */}
            <button
              onClick={() => goToPage(1)}
              disabled={currentPage === 1}
              style={{
                padding: '0.5rem 0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                backgroundColor: currentPage === 1 ? '#f3f4f6' : 'white',
                color: currentPage === 1 ? '#9ca3af' : '#374151',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem',
              }}
              title="Primera página"
            >
              ««
            </button>

            {/* Botón Anterior */}
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              style={{
                padding: '0.5rem 0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                backgroundColor: currentPage === 1 ? '#f3f4f6' : 'white',
                color: currentPage === 1 ? '#9ca3af' : '#374151',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem',
              }}
              title="Página anterior"
            >
              «
            </button>

            {/* Números de página */}
            {getPageNumbers().map((page, index) => (
              typeof page === 'number' ? (
                <button
                  key={index}
                  onClick={() => goToPage(page)}
                  style={{
                    padding: '0.5rem 0.875rem',
                    border: page === currentPage ? '1px solid #3b82f6' : '1px solid #d1d5db',
                    borderRadius: '6px',
                    backgroundColor: page === currentPage ? '#3b82f6' : 'white',
                    color: page === currentPage ? 'white' : '#374151',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: page === currentPage ? '600' : '400',
                    minWidth: '40px',
                  }}
                >
                  {page}
                </button>
              ) : (
                <span
                  key={index}
                  style={{
                    padding: '0.5rem 0.5rem',
                    color: '#9ca3af',
                    fontSize: '0.875rem',
                  }}
                >
                  {page}
                </span>
              )
            ))}

            {/* Botón Siguiente */}
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              style={{
                padding: '0.5rem 0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                backgroundColor: currentPage === totalPages ? '#f3f4f6' : 'white',
                color: currentPage === totalPages ? '#9ca3af' : '#374151',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem',
              }}
              title="Página siguiente"
            >
              »
            </button>

            {/* Botón Última página */}
            <button
              onClick={() => goToPage(totalPages)}
              disabled={currentPage === totalPages}
              style={{
                padding: '0.5rem 0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                backgroundColor: currentPage === totalPages ? '#f3f4f6' : 'white',
                color: currentPage === totalPages ? '#9ca3af' : '#374151',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem',
              }}
              title="Última página"
            >
              »»
            </button>
          </div>

          {/* Ir a página específica */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              Ir a:
            </label>
            <input
              type="number"
              min={1}
              max={totalPages}
              value={currentPage}
              onChange={(e) => {
                const page = parseInt(e.target.value);
                if (!isNaN(page)) goToPage(page);
              }}
              style={{
                width: '60px',
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '0.875rem',
                textAlign: 'center',
              }}
            />
            <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              de {totalPages}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// Componente exportado con ToastProvider
export default function PropertyTable() {
  return (
    <ToastProvider>
      <PropertyTableInner />
    </ToastProvider>
  );
}
