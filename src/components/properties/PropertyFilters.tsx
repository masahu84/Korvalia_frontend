/**
 * Componente de filtros para propiedades
 * Permite búsqueda y filtrado por tipo, ciudad, precio, zona, área y extras
 */

import { useState, useEffect } from 'react';
import './PropertyFilters.css';

interface City {
  id: number;
  name: string;
  slug: string;
}

export interface FilterValues {
  q?: string;
  operation?: string;
  propertyType?: string;
  city?: string;
  price?: string;
  area?: string;
}

export default function PropertyFilters() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterValues>({});
  const [cities, setCities] = useState<City[]>([]);

  // Leer parámetros de la URL al cargar y cargar ciudades
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initialFilters: FilterValues = {};

    const searchParam = params.get('q');
    if (searchParam) {
      setSearchQuery(searchParam);
      initialFilters.q = searchParam;
    }

    const operation = params.get('operation');
    if (operation) initialFilters.operation = operation;

    const propertyType = params.get('propertyType');
    if (propertyType) initialFilters.propertyType = propertyType;

    const city = params.get('city');
    if (city) initialFilters.city = city;

    const price = params.get('price');
    if (price) initialFilters.price = price;

    const area = params.get('area');
    if (area) initialFilters.area = area;

    setFilters(initialFilters);

    // Cargar ciudades desde la API
    const API_BASE = import.meta.env.PUBLIC_API_URL || 'http://localhost:4000';
    fetch(`${API_BASE}/api/cities`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setCities(data.data);
        }
      })
      .catch(err => console.error('Error cargando ciudades:', err));
  }, []);

  // Construir URL con filtros
  const buildURL = (newFilters: FilterValues): string => {
    const params = new URLSearchParams();

    if (newFilters.q) params.set('q', newFilters.q);
    if (newFilters.operation) params.set('operation', newFilters.operation);
    if (newFilters.propertyType) params.set('propertyType', newFilters.propertyType);
    if (newFilters.city) params.set('city', newFilters.city);
    if (newFilters.price) params.set('price', newFilters.price);
    if (newFilters.area) params.set('area', newFilters.area);

    params.set('page', '1');

    return `/propiedades?${params.toString()}#properties-grid`;
  };

  // Manejar búsqueda
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const newFilters = { ...filters, q: searchQuery || undefined };
    window.location.href = buildURL(newFilters);
  };

  // Manejar cambio en input de búsqueda
  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Manejar cambio de filtro
  const handleFilterChange = (filterName: keyof FilterValues, value: string) => {
    const newFilters = { ...filters, [filterName]: value || undefined };
    // Si se limpia la búsqueda del input, también limpiarla de los filtros
    if (filterName !== 'q') {
      newFilters.q = searchQuery || undefined;
    }
    window.location.href = buildURL(newFilters);
  };

  return (
    <section className="property-filters">
      <div className="container">
        <h2 className="section-title">Encuentra tu vivienda</h2>
        <p className="section-subtitle">Busca y filtra entre todas nuestras propiedades</p>

        {/* Buscador */}
        <div className="search-wrapper">
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-input-wrapper">
              <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z"></path>
              </svg>
              <input
                type="search"
                placeholder="Buscar propiedades por título, ciudad, barrio..."
                className="search-input"
                value={searchQuery}
                onChange={handleSearchInput}
              />
            </div>
            <button type="submit" className="search-button">
              Buscar
            </button>
          </form>
        </div>

        {/* Filtros */}
        <div className="filters-grid">
          <div className="filter-row filter-row-labels">
            <label className="filter-label">Tipo de operación</label>
            <label className="filter-label">Filtros principales</label>
            <label className="filter-label"></label>
          </div>

          <div className="filter-row">
            {/* Operación */}
            <select
              name="operation"
              className="filter-select"
              value={filters.operation || ''}
              onChange={(e) => handleFilterChange('operation', e.target.value)}
            >
              <option value="">Todas las operaciones</option>
              <option value="SALE">Venta</option>
              <option value="RENT">Alquiler</option>
            </select>

            {/* Tipo de inmueble */}
            <select
              name="propertyType"
              className="filter-select"
              value={filters.propertyType || ''}
              onChange={(e) => handleFilterChange('propertyType', e.target.value)}
            >
              <option value="">Tipo de inmueble...</option>
              <option value="HOUSE">Casa</option>
              <option value="APARTMENT">Piso</option>
              <option value="DUPLEX">Dúplex</option>
              <option value="PENTHOUSE">Ático</option>
              <option value="FLAT">Apartamento</option>
            </select>

            {/* Precio */}
            <select
              name="price"
              className="filter-select"
              value={filters.price || ''}
              onChange={(e) => handleFilterChange('price', e.target.value)}
            >
              <option value="">Precio...</option>
              <option value="0-100000">0€ - 100.000€</option>
              <option value="100000-200000">100.000€ - 200.000€</option>
              <option value="200000-300000">200.000€ - 300.000€</option>
              <option value="300000-999999">Más de 300.000€</option>
            </select>
          </div>

          <div className="filter-row">
            {/* Ciudad */}
            <select
              name="city"
              className="filter-select"
              value={filters.city || ''}
              onChange={(e) => handleFilterChange('city', e.target.value)}
            >
              <option value="">Todas las ciudades</option>
              {cities.map((city) => (
                <option key={city.id} value={city.slug}>
                  {city.name}
                </option>
              ))}
            </select>

            {/* Rango (m2) */}
            <select
              name="area"
              className="filter-select"
              value={filters.area || ''}
              onChange={(e) => handleFilterChange('area', e.target.value)}
            >
              <option value="">Rango (m²)...</option>
              <option value="0-50">0 - 50 m²</option>
              <option value="50-100">50 - 100 m²</option>
              <option value="100-150">100 - 150 m²</option>
              <option value="150-9999">Más de 150 m²</option>
            </select>

            {/* Limpiar filtros */}
            {(filters.operation || filters.propertyType || filters.price || filters.city || filters.area || filters.q) && (
              <button
                type="button"
                className="clear-filters-btn"
                onClick={() => window.location.href = '/propiedades#properties-grid'}
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
