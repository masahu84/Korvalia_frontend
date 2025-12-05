import { useState, useEffect, type FormEvent } from 'react';
import { get, put } from '../../lib/api';

const API_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:4000';

interface Settings {
  heroTitle: string;
  heroSubtitle: string;
  heroImageUrl?: string;
  phone?: string;
  email?: string;
  address?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  whatsappNumber?: string;
}

export function SettingsForm() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [formData, setFormData] = useState<Settings>({
    heroTitle: '',
    heroSubtitle: '',
    phone: '',
    email: '',
    address: '',
    instagramUrl: '',
    facebookUrl: '',
    whatsappNumber: '',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    const response = await get<Settings>('/settings');

    if (response.success && response.data) {
      setFormData(response.data);
      if (response.data.heroImageUrl) {
        setImagePreview(`${API_URL}${response.data.heroImageUrl}`);
      }
    }

    setLoading(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const data = new FormData();

    // Agregar todos los campos
    Object.entries(formData).forEach(([key, value]) => {
      if (value && key !== 'heroImageUrl') {
        data.append(key, value);
      }
    });

    // Agregar imagen si hay una nueva
    if (imageFile) {
      data.append('image', imageFile);
    }

    const response = await put('/settings', data);

    if (response.success) {
      alert('Configuración actualizada correctamente');
      loadSettings();
    } else {
      alert('Error al actualizar: ' + response.error);
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      {/* Hero Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Sección Hero</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título Principal *
            </label>
            <input
              type="text"
              required
              value={formData.heroTitle}
              onChange={(e) => setFormData({ ...formData, heroTitle: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Encuentra la propiedad de tus sueños"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subtítulo *
            </label>
            <input
              type="text"
              required
              value={formData.heroSubtitle}
              onChange={(e) => setFormData({ ...formData, heroSubtitle: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Las mejores propiedades en las mejores ubicaciones"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Imagen de Fondo
            </label>

            {imagePreview && (
              <div className="mb-4">
                <img
                  src={imagePreview}
                  alt="Hero preview"
                  className="w-full h-48 object-cover rounded-lg border border-gray-200"
                />
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
        </div>
      </div>

      {/* Información de Contacto */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Información de Contacto</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
            <input
              type="tel"
              value={formData.phone || ''}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="+34 123 456 789"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="contacto@korvalia.com"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Dirección</label>
            <input
              type="text"
              value={formData.address || ''}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Calle Principal 123, Madrid"
            />
          </div>
        </div>
      </div>

      {/* Redes Sociales */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Redes Sociales</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Instagram</label>
            <input
              type="url"
              value={formData.instagramUrl || ''}
              onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="https://instagram.com/korvalia"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Facebook</label>
            <input
              type="url"
              value={formData.facebookUrl || ''}
              onChange={(e) => setFormData({ ...formData, facebookUrl: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="https://facebook.com/korvalia"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp</label>
            <input
              type="tel"
              value={formData.whatsappNumber || ''}
              onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="+34 123 456 789"
            />
          </div>
        </div>
      </div>

      {/* Botones */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
        >
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>
    </form>
  );
}
