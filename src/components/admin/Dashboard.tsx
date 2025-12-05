import { useState, useEffect } from 'react';
import { get } from '../../lib/api';

interface Property {
  id: number;
  title: string;
  operation: string;
  price: number;
  isFeatured: boolean;
  createdAt: string;
}

interface Stats {
  total: number;
  forSale: number;
  forRent: number;
  featured: number;
}

export function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    total: 0,
    forSale: 0,
    forRent: 0,
    featured: 0,
  });
  const [recentProperties, setRecentProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);

    // Cargar todas las propiedades
    const response = await get<{ properties: Property[] }>('/properties');

    if (response.success && response.data) {
      const properties = response.data.properties;

      // Calcular estadísticas
      setStats({
        total: properties.length,
        forSale: properties.filter((p) => p.operation === 'SALE').length,
        forRent: properties.filter((p) => p.operation === 'RENT').length,
        featured: properties.filter((p) => p.isFeatured).length,
      });

      // Últimas 5 propiedades
      setRecentProperties(
        properties
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5)
      );
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Propiedades</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <span className="text-2xl">🏠</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">En Venta</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.forSale}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <span className="text-2xl">💰</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">En Alquiler</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.forRent}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <span className="text-2xl">🔑</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Destacadas</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.featured}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <span className="text-2xl">⭐</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/admin/properties/new"
            className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group"
          >
            <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200">
              <span className="text-xl">➕</span>
            </div>
            <div>
              <p className="font-medium text-gray-900">Nueva Propiedad</p>
              <p className="text-sm text-gray-600">Agregar propiedad al catálogo</p>
            </div>
          </a>

          <a
            href="/admin/cities"
            className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all group"
          >
            <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200">
              <span className="text-xl">🏙️</span>
            </div>
            <div>
              <p className="font-medium text-gray-900">Gestionar Ciudades</p>
              <p className="text-sm text-gray-600">Agregar o editar ciudades</p>
            </div>
          </a>

          <a
            href="/admin/settings"
            className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all group"
          >
            <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200">
              <span className="text-xl">⚙️</span>
            </div>
            <div>
              <p className="font-medium text-gray-900">Configuración</p>
              <p className="text-sm text-gray-600">Ajustes del sitio web</p>
            </div>
          </a>
        </div>
      </div>

      {/* Recent Properties */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Últimas Propiedades</h3>
          <a href="/admin/properties" className="text-sm text-blue-600 hover:text-blue-700">
            Ver todas →
          </a>
        </div>

        {recentProperties.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No hay propiedades aún</p>
        ) : (
          <div className="space-y-3">
            {recentProperties.map((property) => (
              <div
                key={property.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div>
                  <p className="font-medium text-gray-900">{property.title}</p>
                  <p className="text-sm text-gray-600">
                    {property.operation === 'SALE' ? 'Venta' : 'Alquiler'} •{' '}
                    {property.price.toLocaleString()} €
                    {property.isFeatured && ' • ⭐ Destacada'}
                  </p>
                </div>

                <a
                  href={`/admin/properties/${property.id}`}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Editar →
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
