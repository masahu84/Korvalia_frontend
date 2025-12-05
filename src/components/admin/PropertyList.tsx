import { useState, useEffect } from 'react';
import { get, del } from '../../lib/api';

interface Property {
  id: number;
  title: string;
  slug: string;
  operation: string;
  propertyType: string;
  price: number;
  currency: string;
  city: { name: string };
  bedrooms?: number;
  bathrooms?: number;
  status: string;
  isFeatured: boolean;
  images: { url: string }[];
  createdAt: string;
}

const API_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:4000';

export function PropertyList() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    setLoading(true);
    const response = await get<{ properties: Property[] }>('/properties');

    if (response.success && response.data) {
      setProperties(response.data.properties);
    }

    setLoading(false);
  };

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`¿Estás seguro de eliminar "${title}"?`)) return;

    const response = await del(`/properties/${id}`);

    if (response.success) {
      setProperties(properties.filter((p) => p.id !== id));
      alert('Propiedad eliminada correctamente');
    } else {
      alert('Error al eliminar la propiedad');
    }
  };

  const filteredProperties = properties.filter((p) =>
    p.title.toLowerCase().includes(filter.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Propiedades ({filteredProperties.length})
          </h3>
          <p className="text-sm text-gray-600 mt-1">Gestiona todas las propiedades</p>
        </div>

        <a
          href="/admin/properties/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          + Nueva Propiedad
        </a>
      </div>

      {/* Filter */}
      <input
        type="text"
        placeholder="Buscar propiedad..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />

      {/* List */}
      {filteredProperties.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500">No hay propiedades</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredProperties.map((property) => (
            <div
              key={property.id}
              className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex gap-4">
                {/* Image */}
                <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  {property.images[0] ? (
                    <img
                      src={`${API_URL}${property.images[0].url}`}
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      🏠
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900">{property.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {property.city.name} • {property.operation}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-blue-600">
                        {property.price.toLocaleString()} {property.currency}
                      </p>
                      {property.bedrooms || property.bathrooms ? (
                        <p className="text-sm text-gray-500 mt-1">
                          {property.bedrooms}H • {property.bathrooms}B
                        </p>
                      ) : null}
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex gap-2 mt-3">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${
                        property.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {property.status}
                    </span>

                    {property.isFeatured && (
                      <span className="px-2 py-1 text-xs font-medium rounded bg-yellow-100 text-yellow-700">
                        ⭐ Destacada
                      </span>
                    )}

                    <span className="px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-700">
                      {property.propertyType}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-4">
                    <a
                      href={`/admin/properties/${property.id}`}
                      className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    >
                      ✏️ Editar
                    </a>

                    <button
                      onClick={() => handleDelete(property.id, property.title)}
                      className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
