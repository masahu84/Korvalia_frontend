/**
 * Componente Dashboard con estadísticas
 */

import { useState, useEffect } from 'react';
import { api } from '../lib/api';

interface Stats {
  totalProperties: number;
  rentProperties: number;
  saleProperties: number;
  featuredProperties: number;
  totalCities: number;
  lastProperty?: {
    id: number;
    title: string;
    operation: string;
    createdAt: string;
  };
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    totalProperties: 0,
    rentProperties: 0,
    saleProperties: 0,
    featuredProperties: 0,
    totalCities: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);

      // Cargar propiedades y ciudades en paralelo
      const [propertiesRes, citiesRes] = await Promise.all([
        api.get('/properties'),
        api.get('/cities').catch(() => ({ data: [] })),
      ]);

      // La API devuelve { success, data: { properties: [...] } }
      const properties = propertiesRes.data?.properties || propertiesRes.data || [];
      const cities = Array.isArray(citiesRes.data) ? citiesRes.data : [];

      const calculatedStats: Stats = {
        totalProperties: properties.length,
        rentProperties: properties.filter((p: any) => p.operation === 'ALQUILER' || p.operation === 'RENT').length,
        saleProperties: properties.filter((p: any) => p.operation === 'VENTA' || p.operation === 'SALE').length,
        featuredProperties: properties.filter((p: any) => p.featured || p.isFeatured).length,
        totalCities: cities.length,
        lastProperty: properties.length > 0 ? properties[0] : undefined,
      };

      setStats(calculatedStats);
    } catch (err: any) {
      setError(err.message || 'Error al cargar las estadísticas');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <p style={{ color: '#6b7280' }}>Cargando estadísticas...</p>
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

  return (
    <div>
      <div className="admin-grid admin-grid-4" style={{ marginBottom: '2rem' }}>
        <div className="admin-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                Total Propiedades
              </p>
              <p style={{ fontSize: '2rem', fontWeight: '700', color: '#111827' }}>
                {stats.totalProperties}
              </p>
            </div>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: '#dbeafe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
              }}
            >
              🏠
            </div>
          </div>
        </div>

        <div className="admin-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                Alquileres
              </p>
              <p style={{ fontSize: '2rem', fontWeight: '700', color: '#111827' }}>
                {stats.rentProperties}
              </p>
            </div>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: '#d1fae5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
              }}
            >
              🔑
            </div>
          </div>
        </div>

        <div className="admin-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                Ventas
              </p>
              <p style={{ fontSize: '2rem', fontWeight: '700', color: '#111827' }}>
                {stats.saleProperties}
              </p>
            </div>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: '#fef3c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
              }}
            >
              💰
            </div>
          </div>
        </div>

        <div className="admin-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                Ciudades
              </p>
              <p style={{ fontSize: '2rem', fontWeight: '700', color: '#111827' }}>
                {stats.totalCities}
              </p>
            </div>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: '#e0e7ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
              }}
            >
              📍
            </div>
          </div>
        </div>
      </div>

      <div className="admin-grid admin-grid-2">
        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">Propiedades Destacadas</h2>
          </div>
          <div>
            <p style={{ fontSize: '3rem', fontWeight: '700', color: '#3b82f6', textAlign: 'center' }}>
              {stats.featuredProperties}
            </p>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', textAlign: 'center' }}>
              propiedades marcadas como destacadas
            </p>
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">Última Propiedad</h2>
          </div>
          {stats.lastProperty ? (
            <div>
              <p style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', marginBottom: '0.5rem' }}>
                {stats.lastProperty.title}
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span
                  className={
                    stats.lastProperty.operation === 'ALQUILER'
                      ? 'admin-badge admin-badge-success'
                      : 'admin-badge admin-badge-warning'
                  }
                >
                  {stats.lastProperty.operation}
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                Creada el {new Date(stats.lastProperty.createdAt).toLocaleDateString('es-ES')}
              </p>
              <a
                href={`/admin/properties/${stats.lastProperty.id}`}
                className="admin-btn admin-btn-primary"
                style={{ marginTop: '1rem', display: 'inline-flex' }}
              >
                Ver propiedad
              </a>
            </div>
          ) : (
            <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem 0' }}>
              No hay propiedades aún
            </p>
          )}
        </div>
      </div>

      <div className="admin-card" style={{ marginTop: '2rem' }}>
        <div className="admin-card-header">
          <h2 className="admin-card-title">Acciones Rápidas</h2>
        </div>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <a href="/admin/properties/new" className="admin-btn admin-btn-primary">
            + Nueva Propiedad
          </a>
          <a href="/admin/properties" className="admin-btn admin-btn-secondary">
            Ver propiedades
          </a>
          <a href="/admin/properties/cities" className="admin-btn admin-btn-secondary">
            Gestionar ciudades
          </a>
          <a href="/admin/settings/home" className="admin-btn admin-btn-secondary">
            Configurar Home
          </a>
          <a href="/admin/company" className="admin-btn admin-btn-secondary">
            Datos empresa
          </a>
        </div>
      </div>
    </div>
  );
}
