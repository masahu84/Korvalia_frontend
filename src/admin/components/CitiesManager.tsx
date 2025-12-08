/**
 * Gestor de ciudades para el panel de administración
 */

import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { useToast, ToastProvider } from './Toast';

interface City {
  id: number;
  name: string;
  slug: string;
  province?: string;
  active: boolean;
  latitude?: number;
  longitude?: number;
  _count?: {
    properties: number;
  };
}

function CitiesManagerInner() {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCity, setEditingCity] = useState<City | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const toast = useToast();

  // Estado del formulario
  const [formData, setFormData] = useState({
    name: '',
    province: '',
    active: true,
    latitude: '',
    longitude: '',
  });

  useEffect(() => {
    fetchCities();
  }, []);

  const fetchCities = async () => {
    try {
      setLoading(true);
      const response = await api.get('/cities', { requiresAuth: false });
      setCities(response.data || []);
    } catch (err: any) {
      toast.error(err.message || 'Error al cargar las ciudades');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('El nombre es obligatorio');
      return;
    }

    toast.loading(editingCity ? 'Actualizando ciudad...' : 'Creando ciudad...');

    try {
      const dataToSend: any = {
        name: formData.name.trim(),
        province: formData.province.trim() || undefined,
        active: formData.active,
      };

      if (formData.latitude) {
        dataToSend.latitude = parseFloat(formData.latitude);
      }

      if (formData.longitude) {
        dataToSend.longitude = parseFloat(formData.longitude);
      }

      if (editingCity) {
        await api.put(`/cities/${editingCity.id}`, dataToSend);
        toast.dismiss();
        toast.success('Ciudad actualizada exitosamente');
      } else {
        await api.post('/cities', dataToSend);
        toast.dismiss();
        toast.success('Ciudad creada exitosamente');
      }

      fetchCities();
      handleCancel();
    } catch (err: any) {
      toast.dismiss();
      toast.error(err.message || 'Error al guardar la ciudad');
    }
  };

  const handleEdit = (city: City) => {
    setEditingCity(city);
    setFormData({
      name: city.name,
      province: city.province || '',
      active: city.active,
      latitude: city.latitude?.toString() || '',
      longitude: city.longitude?.toString() || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar esta ciudad? Esta acción no se puede deshacer.')) {
      return;
    }

    toast.loading('Eliminando ciudad...');

    try {
      await api.delete(`/cities/${id}`);
      toast.dismiss();
      toast.success('Ciudad eliminada exitosamente');
      fetchCities();
    } catch (err: any) {
      toast.dismiss();
      toast.error(err.message || 'Error al eliminar la ciudad');
    }
  };

  const handleCancel = () => {
    setEditingCity(null);
    setShowForm(false);
    setFormData({
      name: '',
      province: '',
      active: true,
      latitude: '',
      longitude: '',
    });
  };

  const filteredCities = cities.filter(city =>
    city.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    city.province?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <p style={{ color: '#6b7280' }}>Cargando ciudades...</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h1 style={{ fontSize: '1.875rem', fontWeight: '700', color: '#111827' }}>
            Gestión de Ciudades
          </h1>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="admin-btn admin-btn-primary"
            >
              + Nueva Ciudad
            </button>
          )}
        </div>
        <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
          Gestiona las ciudades donde la inmobiliaria tiene propiedades
        </p>
      </div>

      {showForm && (
        <div className="admin-card" style={{ marginBottom: '2rem' }}>
          <div className="admin-card-header">
            <h2 className="admin-card-title">
              {editingCity ? 'Editar Ciudad' : 'Nueva Ciudad'}
            </h2>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="admin-grid admin-grid-2">
              <div className="admin-form-group">
                <label className="admin-label">Nombre *</label>
                <input
                  type="text"
                  name="name"
                  className="admin-input"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Madrid"
                  required
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Provincia</label>
                <input
                  type="text"
                  name="province"
                  className="admin-input"
                  value={formData.province}
                  onChange={handleInputChange}
                  placeholder="Madrid"
                />
              </div>
            </div>

            <div className="admin-grid admin-grid-2">
              <div className="admin-form-group">
                <label className="admin-label">Latitud</label>
                <input
                  type="number"
                  step="any"
                  name="latitude"
                  className="admin-input"
                  value={formData.latitude}
                  onChange={handleInputChange}
                  placeholder="40.4168"
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Longitud</label>
                <input
                  type="number"
                  step="any"
                  name="longitude"
                  className="admin-input"
                  value={formData.longitude}
                  onChange={handleInputChange}
                  placeholder="-3.7038"
                />
              </div>
            </div>

            <div className="admin-form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  name="active"
                  checked={formData.active}
                  onChange={handleInputChange}
                />
                <span>Ciudad activa</span>
              </label>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button type="submit" className="admin-btn admin-btn-primary">
                {editingCity ? 'Actualizar' : 'Crear'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="admin-btn admin-btn-secondary"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="admin-card">
        <div className="admin-card-header">
          <h2 className="admin-card-title">Listado de Ciudades ({filteredCities.length})</h2>
          <div style={{ marginTop: '1rem' }}>
            <input
              type="text"
              placeholder="Buscar ciudad..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                maxWidth: '400px',
                padding: '0.5rem 1rem',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '0.875rem',
              }}
            />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Slug</th>
                <th>Provincia</th>
                <th>Estado</th>
                <th>Propiedades</th>
                <th>Coordenadas</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredCities.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                    No hay ciudades registradas
                  </td>
                </tr>
              ) : (
                filteredCities.map((city) => (
                  <tr key={city.id}>
                    <td style={{ fontWeight: '500' }}>{city.name}</td>
                    <td style={{ color: '#6b7280', fontSize: '0.875rem' }}>{city.slug}</td>
                    <td>{city.province || '-'}</td>
                    <td>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: '500',
                          backgroundColor: city.active ? '#d1fae5' : '#fee2e2',
                          color: city.active ? '#065f46' : '#991b1b',
                        }}
                      >
                        {city.active ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td>
                      <span style={{ color: '#6b7280' }}>
                        {city._count?.properties || 0}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                      {city.latitude && city.longitude
                        ? `${city.latitude.toFixed(4)}, ${city.longitude.toFixed(4)}`
                        : '-'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleEdit(city)}
                          className="admin-btn-icon"
                          title="Editar"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(city.id)}
                          className="admin-btn-icon"
                          title="Eliminar"
                          disabled={city._count && city._count.properties > 0}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Componente exportado con ToastProvider
export default function CitiesManager() {
  return (
    <ToastProvider>
      <CitiesManagerInner />
    </ToastProvider>
  );
}
