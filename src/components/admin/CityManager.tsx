import { useState, useEffect, type FormEvent } from 'react';
import { get, post, del } from '../../lib/api';

interface City {
  id: number;
  name: string;
  slug: string;
  province?: string;
  _count?: {
    properties: number;
  };
}

export function CityManager() {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    province: '',
  });

  useEffect(() => {
    loadCities();
  }, []);

  const loadCities = async () => {
    setLoading(true);
    const response = await get<City[]>('/cities');

    if (response.success && response.data) {
      setCities(response.data);
    }

    setLoading(false);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const response = await post('/cities', formData);

    if (response.success) {
      alert('Ciudad creada correctamente');
      setFormData({ name: '', province: '' });
      setShowForm(false);
      loadCities();
    } else {
      alert('Error al crear la ciudad: ' + response.error);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`¿Estás seguro de eliminar "${name}"?`)) return;

    const response = await del(`/cities/${id}`);

    if (response.success) {
      setCities(cities.filter((c) => c.id !== id));
      alert('Ciudad eliminada correctamente');
    } else {
      alert('Error: ' + response.error);
    }
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Ciudades ({cities.length})</h3>
          <p className="text-sm text-gray-600 mt-1">Gestiona las ciudades disponibles</p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          {showForm ? 'Cancelar' : '+ Nueva Ciudad'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="font-semibold text-gray-900 mb-4">Nueva Ciudad</h4>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Madrid"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Provincia (opcional)
              </label>
              <input
                type="text"
                value={formData.province}
                onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Madrid"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Crear Ciudad
            </button>
          </form>
        </div>
      )}

      {/* List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ciudad
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Provincia
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Propiedades
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {cities.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                  No hay ciudades registradas
                </td>
              </tr>
            ) : (
              cities.map((city) => (
                <tr key={city.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{city.name}</div>
                    <div className="text-sm text-gray-500">{city.slug}</div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {city.province || '-'}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {city._count?.properties || 0}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <button
                      onClick={() => handleDelete(city.id, city.name)}
                      className="text-red-600 hover:text-red-800 font-medium"
                      disabled={(city._count?.properties || 0) > 0}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          ℹ️ No puedes eliminar una ciudad que tenga propiedades asociadas.
        </p>
      </div>
    </div>
  );
}
