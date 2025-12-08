import { useState, useEffect } from 'react';

interface City {
  id: number;
  name: string;
  slug: string;
}

// Rangos de precio para VENTA (mismo formato que PropertyFilters: "min-max")
const SALE_PRICE_RANGES = [
  { label: 'Cualquier precio', value: '' },
  { label: '0€ - 100.000€', value: '0-100000' },
  { label: '100.000€ - 200.000€', value: '100000-200000' },
  { label: '200.000€ - 300.000€', value: '200000-300000' },
  { label: 'Más de 300.000€', value: '300000-999999' },
];

// Rangos de precio para ALQUILER
const RENT_PRICE_RANGES = [
  { label: 'Cualquier precio', value: '' },
  { label: '0€ - 400€/mes', value: '0-400' },
  { label: '400€ - 600€/mes', value: '400-600' },
  { label: '600€ - 800€/mes', value: '600-800' },
  { label: '800€ - 1.000€/mes', value: '800-1000' },
  { label: '1.000€ - 1.500€/mes', value: '1000-1500' },
  { label: 'Más de 1.500€/mes', value: '1500-99999' },
];

export default function HeroSearch() {
  const [activeTab, setActiveTab] = useState<'RENT' | 'SALE'>('RENT');
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('');
  const [isLoadingCities, setIsLoadingCities] = useState(true);

  const API_BASE = import.meta.env.PUBLIC_API_URL || 'http://localhost:4000';

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/cities`);
        if (response.ok) {
          const data = await response.json();
          setCities(data.data || []);
        }
      } catch (error) {
        console.error('Error fetching cities:', error);
      } finally {
        setIsLoadingCities(false);
      }
    };

    fetchCities();
  }, []);

  const priceRanges = activeTab === 'RENT' ? RENT_PRICE_RANGES : SALE_PRICE_RANGES;

  const handleSearch = () => {
    const params = new URLSearchParams();

    params.set('operation', activeTab);

    if (selectedCity) {
      params.set('city', selectedCity);
    }

    if (selectedPriceRange) {
      params.set('price', selectedPriceRange);
    }

    window.location.href = `/propiedades?${params.toString()}#properties-grid`;
  };

  return (
    <div className="w-full max-w-3xl">
      {/* Tabs - solo las pestañas visibles */}
      <div className="flex w-fit">
        <button
          onClick={() => {
            setActiveTab('RENT');
            setSelectedPriceRange('');
          }}
          className={`px-6 py-3 text-sm font-medium transition-all rounded-t-lg ${
            activeTab === 'RENT'
              ? 'text-gray-900 bg-white'
              : 'text-white/80 bg-white/20 hover:bg-white/30 hover:text-white'
          }`}
        >
          Alquilar
        </button>
        <button
          onClick={() => {
            setActiveTab('SALE');
            setSelectedPriceRange('');
          }}
          className={`px-6 py-3 text-sm font-medium transition-all rounded-t-lg ${
            activeTab === 'SALE'
              ? 'text-gray-900 bg-white'
              : 'text-white/80 bg-white/20 hover:bg-white/30 hover:text-white'
          }`}
        >
          Comprar
        </button>
      </div>

      {/* Search Fields - contenedor blanco separado */}
      <div className="bg-white rounded-b-xl rounded-tr-xl shadow-2xl p-5">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Ubicación */}
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-500 mb-1.5 px-1">
              Ubicación
            </label>
            <div className="relative">
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent appearance-none cursor-pointer"
                disabled={isLoadingCities}
              >
                <option value="">Todas las ubicaciones</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.slug}>
                    {city.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Precio */}
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-500 mb-1.5 px-1">
              Precio
            </label>
            <div className="relative">
              <select
                value={selectedPriceRange}
                onChange={(e) => setSelectedPriceRange(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent appearance-none cursor-pointer"
              >
                {priceRanges.map((range) => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Botón Buscar */}
          <div className="flex items-end">
            <button
              onClick={handleSearch}
              className="w-full md:w-auto px-8 py-3 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              style={{ backgroundColor: '#39505d' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2d3f4a'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#39505d'}
            >
              Buscar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
