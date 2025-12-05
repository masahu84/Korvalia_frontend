import { useState, useEffect, type FormEvent } from 'react';
import { get, post, put } from '../../lib/api';
import { UploadImage } from './UploadImage';

interface City {
  id: number;
  name: string;
}

interface PropertyFormProps {
  propertyId?: number;
}

export function PropertyForm({ propertyId }: PropertyFormProps) {
  const [cities, setCities] = useState<City[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    operation: 'SALE',
    propertyType: 'FLAT',
    price: '',
    cityId: '',
    address: '',
    bedrooms: '',
    bathrooms: '',
    areaM2: '',
    hasElevator: false,
    hasParking: false,
    hasPool: false,
    hasTerrace: false,
    hasGarden: false,
    furnished: false,
    petsAllowed: false,
    isFeatured: false,
    status: 'ACTIVE',
  });

  useEffect(() => {
    loadCities();
    if (propertyId) {
      loadProperty();
    }
  }, [propertyId]);

  const loadCities = async () => {
    const response = await get<City[]>('/cities');
    if (response.success && response.data) {
      setCities(response.data);
    }
  };

  const loadProperty = async () => {
    if (!propertyId) return;

    const response = await get(`/properties/${propertyId}`);
    if (response.success && response.data) {
      const property = response.data;
      setFormData({
        title: property.title || '',
        description: property.description || '',
        operation: property.operation || 'SALE',
        propertyType: property.propertyType || 'FLAT',
        price: property.price?.toString() || '',
        cityId: property.cityId?.toString() || '',
        address: property.address || '',
        bedrooms: property.bedrooms?.toString() || '',
        bathrooms: property.bathrooms?.toString() || '',
        areaM2: property.areaM2?.toString() || '',
        hasElevator: property.hasElevator || false,
        hasParking: property.hasParking || false,
        hasPool: property.hasPool || false,
        hasTerrace: property.hasTerrace || false,
        hasGarden: property.hasGarden || false,
        furnished: property.furnished || false,
        petsAllowed: property.petsAllowed || false,
        isFeatured: property.isFeatured || false,
        status: property.status || 'ACTIVE',
      });
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();

    // Agregar campos del formulario
    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, typeof value === 'boolean' ? String(value) : value);
    });

    // Agregar imágenes
    files.forEach((file) => {
      data.append('images', file);
    });

    const response = propertyId
      ? await put(`/properties/${propertyId}`, data)
      : await post('/properties', data);

    if (response.success) {
      alert(propertyId ? 'Propiedad actualizada' : 'Propiedad creada');
      window.location.href = '/admin/properties';
    } else {
      alert('Error: ' + response.error);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      {/* Información Básica */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Básica</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Título *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Descripción *</label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Operación *</label>
            <select
              required
              value={formData.operation}
              onChange={(e) => setFormData({ ...formData, operation: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="SALE">Venta</option>
              <option value="RENT">Alquiler</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo *</label>
            <select
              required
              value={formData.propertyType}
              onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="FLAT">Piso</option>
              <option value="HOUSE">Casa</option>
              <option value="PENTHOUSE">Ático</option>
              <option value="DUPLEX">Dúplex</option>
              <option value="LAND">Terreno</option>
              <option value="COMMERCIAL">Local Comercial</option>
              <option value="GARAGE">Garaje</option>
              <option value="ROOM">Habitación</option>
              <option value="OTHER">Otro</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Precio (€) *</label>
            <input
              type="number"
              required
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ciudad *</label>
            <select
              required
              value={formData.cityId}
              onChange={(e) => setFormData({ ...formData, cityId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar ciudad</option>
              {cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Dirección *</label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Características */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Características</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Habitaciones</label>
            <input
              type="number"
              value={formData.bedrooms}
              onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Baños</label>
            <input
              type="number"
              value={formData.bathrooms}
              onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Superficie (m²)</label>
            <input
              type="number"
              value={formData.areaM2}
              onChange={(e) => setFormData({ ...formData, areaM2: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Amenidades */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { key: 'hasElevator', label: 'Ascensor' },
            { key: 'hasParking', label: 'Parking' },
            { key: 'hasPool', label: 'Piscina' },
            { key: 'hasTerrace', label: 'Terraza' },
            { key: 'hasGarden', label: 'Jardín' },
            { key: 'furnished', label: 'Amueblado' },
            { key: 'petsAllowed', label: 'Mascotas' },
            { key: 'isFeatured', label: 'Destacada' },
          ].map((amenity) => (
            <label key={amenity.key} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData[amenity.key as keyof typeof formData] as boolean}
                onChange={(e) => setFormData({ ...formData, [amenity.key]: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{amenity.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Imágenes */}
      {!propertyId && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Imágenes</h3>
          <UploadImage multiple={true} onFilesChange={setFiles} />
        </div>
      )}

      {/* Botones */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
        >
          {loading ? 'Guardando...' : propertyId ? 'Actualizar Propiedad' : 'Crear Propiedad'}
        </button>

        <a
          href="/admin/properties"
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
        >
          Cancelar
        </a>
      </div>
    </form>
  );
}
