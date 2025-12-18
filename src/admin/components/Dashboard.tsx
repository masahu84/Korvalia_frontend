/**
 * Componente Dashboard con estadísticas
 * NOTA: Las propiedades ahora se gestionan desde Emblematic CRM
 */

import { useState, useEffect } from 'react';

// URL base de la API
const API_BASE = (typeof window !== 'undefined' && (window as any).__ENV__?.PUBLIC_API_URL) || 'http://localhost:4000';

interface Stats {
  totalProperties: number;
  rentProperties: number;
  saleProperties: number;
  featuredProperties: number;
  totalCities: number;
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

      // Cargar estadísticas de Emblematic (propiedades) y ciudades
      const [emblematicRes, citiesRes] = await Promise.all([
        fetch(`${API_BASE}/api/emblematic/properties?page=1`).then(r => r.json()).catch(() => ({ success: false })),
        fetch(`${API_BASE}/api/emblematic/cities`).then(r => r.json()).catch(() => ({ success: false, data: [] })),
      ]);

      // Contar propiedades por tipo de operación desde Emblematic
      const totalProperties = emblematicRes.success ? (emblematicRes.data?.pagination?.total || emblematicRes.data?.properties?.length || 0) : 0;
      const cities = citiesRes.success ? (citiesRes.data || []) : [];

      // Para obtener las propiedades por tipo, hacemos llamadas adicionales
      const [rentRes, saleRes, featuredRes] = await Promise.all([
        fetch(`${API_BASE}/api/emblematic/properties?mode_id=2&page=1`).then(r => r.json()).catch(() => ({ success: false })),
        fetch(`${API_BASE}/api/emblematic/properties?mode_id=1&page=1`).then(r => r.json()).catch(() => ({ success: false })),
        fetch(`${API_BASE}/api/emblematic/featured`).then(r => r.json()).catch(() => ({ success: false, data: [] })),
      ]);

      const calculatedStats: Stats = {
        totalProperties,
        rentProperties: rentRes.success ? (rentRes.data?.pagination?.total || rentRes.data?.properties?.length || 0) : 0,
        saleProperties: saleRes.success ? (saleRes.data?.pagination?.total || saleRes.data?.properties?.length || 0) : 0,
        featuredProperties: featuredRes.success ? (featuredRes.data?.length || 0) : 0,
        totalCities: cities.length,
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
              propiedades marcadas como destacadas en Emblematic
            </p>
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">Gestión de Propiedades</h2>
          </div>
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '12px',
                backgroundColor: '#dbeafe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                margin: '0 auto 1rem',
              }}
            >
              🏢
            </div>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
              Las propiedades se gestionan desde Emblematic CRM
            </p>
            <a
              href="https://app.emblematic.com"
              target="_blank"
              rel="noopener noreferrer"
              className="admin-btn admin-btn-primary"
              style={{ display: 'inline-flex' }}
            >
              Ir a Emblematic
            </a>
          </div>
        </div>
      </div>

      <div className="admin-card" style={{ marginTop: '2rem' }}>
        <div className="admin-card-header">
          <h2 className="admin-card-title">Acciones Rápidas</h2>
        </div>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {/* OCULTO: Gestión local de propiedades - Descomentar si se deja de usar Emblematic
          <a href="/admin/properties/new" className="admin-btn admin-btn-primary">
            + Nueva Propiedad
          </a>
          <a href="/admin/properties" className="admin-btn admin-btn-secondary">
            Ver propiedades
          </a>
          <a href="/admin/properties/cities" className="admin-btn admin-btn-secondary">
            Gestionar ciudades
          </a>
          */}
          <a href="/admin/settings/home" className="admin-btn admin-btn-primary">
            Configurar Home
          </a>
          <a href="/admin/settings/properties" className="admin-btn admin-btn-secondary">
            Configurar página propiedades
          </a>
          <a href="/admin/company" className="admin-btn admin-btn-secondary">
            Datos empresa
          </a>
          <a href="/admin/chat" className="admin-btn admin-btn-secondary">
            Chat y Leads
          </a>
        </div>
      </div>
    </div>
  );
}
