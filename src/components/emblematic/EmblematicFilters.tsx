/**
 * Componente de filtros para propiedades de Emblematic
 * Permite búsqueda y filtrado usando los datos del CRM Emblematic
 */

import { useState, useEffect } from 'react';
import { showGlobalLoader } from '../ui/GlobalLoader';
import '../properties/PropertyFilters.css';

interface Mode {
  id: number;
  name: string;
}

interface Type {
  id: number;
  name: string;
}

interface Subtype {
  id: number;
  name: string;
  type_id: string;
}

export interface EmblematicFilterValues {
  q?: string;
  mode_id?: string;
  type_id?: string;
  subtype_id?: string;
  price_min?: string;
  price_max?: string;
  rooms?: string;
}

export default function EmblematicFilters() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<EmblematicFilterValues>({});
  const [modes, setModes] = useState<Mode[]>([]);
  const [types, setTypes] = useState<Type[]>([]);
  const [subtypes, setSubtypes] = useState<Subtype[]>([]);

  // Leer parámetros de la URL al cargar y cargar listas
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initialFilters: EmblematicFilterValues = {};

    const searchParam = params.get('q');
    if (searchParam) {
      setSearchQuery(searchParam);
      initialFilters.q = searchParam;
    }

    const mode_id = params.get('mode_id');
    if (mode_id) initialFilters.mode_id = mode_id;

    const type_id = params.get('type_id');
    if (type_id) initialFilters.type_id = type_id;

    const subtype_id = params.get('subtype_id');
    if (subtype_id) initialFilters.subtype_id = subtype_id;

    const price_min = params.get('price_min');
    if (price_min) initialFilters.price_min = price_min;

    const price_max = params.get('price_max');
    if (price_max) initialFilters.price_max = price_max;

    const rooms = params.get('rooms');
    if (rooms) initialFilters.rooms = rooms;

    setFilters(initialFilters);

    // Cargar listas desde la API de Emblematic
    const API_BASE = import.meta.env.PUBLIC_API_URL || 'http://localhost:4000';
    fetch(`${API_BASE}/api/emblematic/lists?lists[]=modes&lists[]=types&lists[]=subtypes`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setModes(data.data.modes || []);
          setTypes(data.data.types || []);
          setSubtypes(data.data.subtypes || []);
        }
      })
      .catch(err => console.error('Error cargando listas Emblematic:', err));
  }, []);

  // Construir URL con filtros
  const buildURL = (newFilters: EmblematicFilterValues): string => {
    const params = new URLSearchParams();

    if (newFilters.q) params.set('q', newFilters.q);
    if (newFilters.mode_id) params.set('mode_id', newFilters.mode_id);
    if (newFilters.type_id) params.set('type_id', newFilters.type_id);
    if (newFilters.subtype_id) params.set('subtype_id', newFilters.subtype_id);
    if (newFilters.price_min) params.set('price_min', newFilters.price_min);
    if (newFilters.price_max) params.set('price_max', newFilters.price_max);
    if (newFilters.rooms) params.set('rooms', newFilters.rooms);

    params.set('page', '1');

    return `/inmuebles?${params.toString()}#properties-grid`;
  };

  // Manejar búsqueda
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    showGlobalLoader();
    const newFilters = { ...filters, q: searchQuery || undefined };
    window.location.href = buildURL(newFilters);
  };

  // Manejar cambio en input de búsqueda
  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Manejar cambio de filtro
  const handleFilterChange = (filterName: keyof EmblematicFilterValues, value: string) => {
    showGlobalLoader();
    const newFilters = { ...filters, [filterName]: value || undefined };
    if (filterName !== 'q') {
      newFilters.q = searchQuery || undefined;
    }
    window.location.href = buildURL(newFilters);
  };

  // Manejar cambio de rango de precio
  const handlePriceRange = (range: string) => {
    showGlobalLoader();
    if (!range) {
      const newFilters = { ...filters, price_min: undefined, price_max: undefined };
      window.location.href = buildURL(newFilters);
      return;
    }
    const [min, max] = range.split('-');
    const newFilters = { ...filters, price_min: min, price_max: max };
    window.location.href = buildURL(newFilters);
  };

  // Obtener valor actual del rango de precio
  const getCurrentPriceRange = (): string => {
    if (filters.price_min && filters.price_max) {
      return `${filters.price_min}-${filters.price_max}`;
    }
    return '';
  };

  const hasActiveFilters = filters.mode_id || filters.type_id || filters.subtype_id ||
                           filters.price_min || filters.price_max || filters.rooms || filters.q;

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
              name="mode_id"
              className="filter-select"
              value={filters.mode_id || ''}
              onChange={(e) => handleFilterChange('mode_id', e.target.value)}
            >
              <option value="">Todas las operaciones</option>
              {modes.map((mode) => (
                <option key={mode.id} value={mode.id}>
                  {mode.name}
                </option>
              ))}
            </select>

            {/* Tipo de inmueble */}
            <select
              name="subtype_id"
              className="filter-select"
              value={filters.subtype_id || ''}
              onChange={(e) => handleFilterChange('subtype_id', e.target.value)}
            >
              <option value="">Tipo de inmueble...</option>
              {subtypes.map((subtype) => (
                <option key={subtype.id} value={subtype.id}>
                  {subtype.name}
                </option>
              ))}
            </select>

            {/* Precio */}
            <select
              name="price"
              className="filter-select"
              value={getCurrentPriceRange()}
              onChange={(e) => handlePriceRange(e.target.value)}
            >
              <option value="">Precio...</option>
              <option value="0-100000">0€ - 100.000€</option>
              <option value="100000-200000">100.000€ - 200.000€</option>
              <option value="200000-300000">200.000€ - 300.000€</option>
              <option value="300000-500000">300.000€ - 500.000€</option>
              <option value="500000-999999999">Más de 500.000€</option>
            </select>
          </div>

          <div className="filter-row">
            {/* Habitaciones */}
            <select
              name="rooms"
              className="filter-select"
              value={filters.rooms || ''}
              onChange={(e) => handleFilterChange('rooms', e.target.value)}
            >
              <option value="">Habitaciones...</option>
              <option value="1">1+ habitación</option>
              <option value="2">2+ habitaciones</option>
              <option value="3">3+ habitaciones</option>
              <option value="4">4+ habitaciones</option>
              <option value="5">5+ habitaciones</option>
            </select>

            {/* Espacio vacío para mantener el grid */}
            <div></div>

            {/* Limpiar filtros */}
            {hasActiveFilters && (
              <button
                type="button"
                className="clear-filters-btn"
                onClick={() => window.location.href = '/inmuebles#properties-grid'}
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
