import { useState, useEffect } from 'react';
import { showGlobalLoader } from '../ui/GlobalLoader';

// Tipos para los datos de Emblematic
interface EmblematicMode {
  id: number;
  name: string;
}

interface AvailableCity {
  id?: number;
  name: string;
  count: number;
}

// Rangos de precio para VENTA
const SALE_PRICE_RANGES = [
  { label: 'Cualquier precio', value: '' },
  { label: '0€ - 100.000€', value: '0-100000' },
  { label: '100.000€ - 200.000€', value: '100000-200000' },
  { label: '200.000€ - 300.000€', value: '200000-300000' },
  { label: '300.000€ - 500.000€', value: '300000-500000' },
  { label: 'Más de 500.000€', value: '500000-' },
];

// Rangos de precio para ALQUILER
const RENT_PRICE_RANGES = [
  { label: 'Cualquier precio', value: '' },
  { label: '0€ - 500€/mes', value: '0-500' },
  { label: '500€ - 800€/mes', value: '500-800' },
  { label: '800€ - 1.200€/mes', value: '800-1200' },
  { label: '1.200€ - 2.000€/mes', value: '1200-2000' },
  { label: 'Más de 2.000€/mes', value: '2000-' },
];

export default function HeroSearch() {
  const [activeTab, setActiveTab] = useState<'RENT' | 'SALE'>('SALE');
  const [modes, setModes] = useState<EmblematicMode[]>([]);
  const [cities, setCities] = useState<AvailableCity[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  const API_BASE = (import.meta as any).env?.PUBLIC_API_URL || 'http://localhost:4000';

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtener modos y ciudades en paralelo
        const [modesRes, citiesRes] = await Promise.all([
          fetch(`${API_BASE}/api/emblematic/lists?lists[]=modes`),
          fetch(`${API_BASE}/api/emblematic/cities`)
        ]);

        if (modesRes.ok) {
          const modesData = await modesRes.json();
          if (modesData.success && modesData.data?.modes) {
            setModes(modesData.data.modes);
          }
        }

        if (citiesRes.ok) {
          const citiesData = await citiesRes.json();
          if (citiesData.success && citiesData.data) {
            setCities(citiesData.data);
          }
        }
      } catch (error) {
        console.error('Error fetching Emblematic data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [API_BASE]);

  const priceRanges = activeTab === 'RENT' ? RENT_PRICE_RANGES : SALE_PRICE_RANGES;

  // Encontrar el mode_id correspondiente a la operación seleccionada
  // Priorizar coincidencia exacta para evitar "Venta y alquiler" cuando se busca solo "Venta"
  const getModeId = (): string => {
    const modeName = activeTab === 'RENT' ? 'Alquiler' : 'Venta';
    // Primero buscar coincidencia exacta
    let mode = modes.find(m => m.name.toLowerCase() === modeName.toLowerCase());
    // Si no hay coincidencia exacta, buscar por inclusión (fallback)
    if (!mode) {
      mode = modes.find(m => m.name.toLowerCase().includes(modeName.toLowerCase()));
    }
    return mode ? String(mode.id) : '';
  };

  const handleSearch = () => {
    // Mostrar loader global antes de navegar
    showGlobalLoader();

    const params = new URLSearchParams();

    // Usar mode_id para el tipo de operación (Emblematic usa IDs)
    const modeId = getModeId();
    if (modeId) {
      params.set('mode_id', modeId);
    }

    // Ciudad (usar nombre de la ciudad)
    if (selectedCity) {
      params.set('city', selectedCity);
    }

    // Precio (dividir el rango en min y max)
    if (selectedPriceRange) {
      const [min, max] = selectedPriceRange.split('-');
      if (min) params.set('price_min', min);
      if (max) params.set('price_max', max);
    }

    window.location.href = `/inmuebles?${params.toString()}`;
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
                disabled={isLoading}
              >
                <option value="">Todas las ubicaciones</option>
                {cities.map((city) => (
                  <option key={city.name} value={city.name}>
                    {city.name} ({city.count})
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
