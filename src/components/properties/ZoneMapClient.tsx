import React, { useState, useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Tipos
interface PropertyMarker {
  id: number;
  title: string;
  slug: string;
  price: number;
  operation: "SALE" | "RENT";
  propertyType: string;
  neighborhood?: string;
  city?: string;
  citySlug?: string;
  bedrooms?: number;
  bathrooms?: number;
  areaM2?: number;
  latitude: number;
  longitude: number;
  imageUrl?: string;
}

interface City {
  id: number;
  name: string;
  slug: string;
}

interface ZoneMapClientProps {
  apiBase?: string;
}

// Barrios de Sanlúcar para el filtro
const BARRIOS = [
  { id: "all", name: "Todos los barrios" },
  { id: "barrio-bajo", name: "Barrio Bajo" },
  { id: "barrio-alto", name: "Barrio Alto" },
  { id: "la-jara", name: "La Jara" },
  { id: "martin-miguel", name: "Martín Miguel" },
  { id: "el-pino", name: "El Pino" },
];

// Coordenadas centro de Sanlúcar
const SANLUCAR_CENTER: [number, number] = [36.7755, -6.3515];

// Placeholder para propiedades sin imagen
const PLACEHOLDER_IMAGE = "https://placehold.co/800x600/e5e7eb/9ca3af?text=Sin+imagen";

// Crear icono personalizado para los marcadores
const createCustomIcon = (operation: "SALE" | "RENT") => {
  const color = operation === "SALE" ? "#133b34" : "#d97706";
  const size = 32;

  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 3px 10px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <svg
          style="transform: rotate(45deg); width: ${size * 0.5}px; height: ${size * 0.5}px;"
          fill="white"
          viewBox="0 0 24 24"
        >
          <path d="M12 3L4 9v12h16V9l-8-6zm0 2.5L18 10v9H6v-9l6-4.5z"/>
          <path d="M10 14h4v5h-4z"/>
        </svg>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
};

// Componente para recentrar el mapa
const MapController: React.FC<{
  center: [number, number];
  zoom: number;
  properties: PropertyMarker[];
}> = ({ center, zoom, properties }) => {
  const map = useMap();

  useEffect(() => {
    if (properties.length > 0) {
      const bounds = L.latLngBounds(
        properties.map(p => [p.latitude, p.longitude] as [number, number])
      );
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    } else {
      map.setView(center, zoom);
    }
  }, [center, zoom, properties, map]);

  return null;
};

// Formatear precio
const formatPrice = (price: number, operation: "SALE" | "RENT"): string => {
  if (operation === "RENT") {
    return `${price.toLocaleString("es-ES")}€/mes`;
  }
  return `${price.toLocaleString("es-ES")}€`;
};

// Traducir tipo de propiedad
const translatePropertyType = (type: string): string => {
  const types: Record<string, string> = {
    FLAT: "Piso",
    APARTMENT: "Apartamento",
    HOUSE: "Casa",
    PENTHOUSE: "Ático",
    DUPLEX: "Dúplex",
    COMMERCIAL: "Local",
    GARAGE: "Garaje",
    LAND: "Terreno",
    OTHER: "Otro",
  };
  return types[type] || type;
};

const ZoneMapClient: React.FC<ZoneMapClientProps> = ({ apiBase }) => {
  const [properties, setProperties] = useState<PropertyMarker[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [selectedBarrio, setSelectedBarrio] = useState<string>("all");
  const [operationFilter, setOperationFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = apiBase || (typeof window !== 'undefined'
    ? (import.meta as any).env?.PUBLIC_API_URL
    : null) || "http://localhost:4000";

  // Cargar propiedades y ciudades desde la API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Cargar propiedades y ciudades en paralelo
        const [propertiesRes, citiesRes] = await Promise.all([
          fetch(`${API_BASE}/api/properties?status=ACTIVE&limit=100`),
          fetch(`${API_BASE}/api/cities`)
        ]);

        if (!propertiesRes.ok) {
          throw new Error("Error al cargar propiedades");
        }

        const propertiesData = await propertiesRes.json();
        const properties = propertiesData.data?.properties || propertiesData.properties || propertiesData.data || [];

        // Filtrar solo propiedades con coordenadas válidas
        const validProperties: PropertyMarker[] = properties
          .filter((p: any) => p.latitude && p.longitude)
          .map((p: any) => ({
            id: p.id,
            title: p.title,
            slug: p.slug,
            price: p.price,
            operation: p.operation,
            propertyType: p.propertyType,
            neighborhood: p.neighborhood,
            city: p.city?.name || p.city || "",
            citySlug: p.city?.slug || "",
            bedrooms: p.bedrooms,
            bathrooms: p.bathrooms,
            areaM2: p.areaM2,
            latitude: p.latitude,
            longitude: p.longitude,
            imageUrl: p.images?.[0]?.url
              ? (p.images[0].url.startsWith("http") ? p.images[0].url : `${API_BASE}${p.images[0].url}`)
              : PLACEHOLDER_IMAGE,
          }));

        setProperties(validProperties);

        // Cargar ciudades
        if (citiesRes.ok) {
          const citiesData = await citiesRes.json();
          if (citiesData.success && citiesData.data) {
            setCities(citiesData.data);
          }
        }

        setError(null);
      } catch (err) {
        console.error("Error fetching data for map:", err);
        setError("No se pudieron cargar las propiedades");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [API_BASE]);

  // Filtrar propiedades según selección
  const filteredProperties = useMemo(() => {
    return properties.filter(p => {
      // Filtro por ciudad
      if (selectedCity !== "all") {
        if (p.citySlug !== selectedCity) {
          return false;
        }
      }

      // Filtro por barrio
      if (selectedBarrio !== "all") {
        const normalizedNeighborhood = p.neighborhood?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-") || "";
        const normalizedFilter = selectedBarrio.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        if (!normalizedNeighborhood.includes(normalizedFilter.replace("barrio-", ""))) {
          return false;
        }
      }

      // Filtro por operación
      if (operationFilter !== "all") {
        if (p.operation !== operationFilter) {
          return false;
        }
      }

      return true;
    });
  }, [properties, selectedCity, selectedBarrio, operationFilter]);

  // Calcular centro del mapa basado en propiedades filtradas
  const mapCenter = useMemo((): [number, number] => {
    if (filteredProperties.length === 0) return SANLUCAR_CENTER;

    const avgLat = filteredProperties.reduce((sum, p) => sum + p.latitude, 0) / filteredProperties.length;
    const avgLng = filteredProperties.reduce((sum, p) => sum + p.longitude, 0) / filteredProperties.length;

    return [avgLat, avgLng];
  }, [filteredProperties]);

  // Tipos any para evitar problemas de tipos con Leaflet
  const AnyMapContainer = MapContainer as any;
  const AnyTileLayer = TileLayer as any;
  const AnyMarker = Marker as any;

  if (loading) {
    return (
      <div className="zone-map-client">
        <div className="zone-map-loading">
          <div className="loading-spinner"></div>
          <p>Cargando mapa...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="zone-map-client">
        <div className="zone-map-error">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="zone-map-client">
      {/* Filtros */}
      <div className="zone-map-filters">
        {/* Filtro por ciudad */}
        <div className="filter-group">
          <label htmlFor="city-select" className="zone-map-label">
            Ciudad:
          </label>
          <select
            id="city-select"
            className="zone-map-select"
            value={selectedCity}
            onChange={(e) => {
              setSelectedCity(e.target.value);
              setSelectedBarrio("all"); // Reset barrio al cambiar ciudad
            }}
          >
            <option value="all">Todas las ciudades</option>
            {cities.map((city) => (
              <option key={city.id} value={city.slug}>
                {city.name}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro por barrio/zona */}
        <div className="filter-group">
          <label htmlFor="barrio-select" className="zone-map-label">
            Zona:
          </label>
          <select
            id="barrio-select"
            className="zone-map-select"
            value={selectedBarrio}
            onChange={(e) => setSelectedBarrio(e.target.value)}
          >
            {BARRIOS.map((barrio) => (
              <option key={barrio.id} value={barrio.id}>
                {barrio.name}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro por operación */}
        <div className="filter-group">
          <label htmlFor="operation-select" className="zone-map-label">
            Operación:
          </label>
          <select
            id="operation-select"
            className="zone-map-select"
            value={operationFilter}
            onChange={(e) => setOperationFilter(e.target.value)}
          >
            <option value="all">Todas</option>
            <option value="SALE">Venta</option>
            <option value="RENT">Alquiler</option>
          </select>
        </div>

        <div className="properties-count">
          <span className="count-badge">{filteredProperties.length}</span>
          <span className="count-text">
            {filteredProperties.length === 1 ? "propiedad" : "propiedades"}
          </span>
        </div>
      </div>

      {/* Leyenda */}
      <div className="zone-map-legend">
        <div className="legend-item">
          <span className="legend-marker sale"></span>
          <span>Venta</span>
        </div>
        <div className="legend-item">
          <span className="legend-marker rent"></span>
          <span>Alquiler</span>
        </div>
      </div>

      {/* Mapa */}
      <div className="zone-map-wrapper">
        <AnyMapContainer
          center={mapCenter}
          zoom={14}
          scrollWheelZoom={true}
          className="zone-map-leaflet"
          zoomControl={true}
        >
          <AnyTileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />

          <MapController
            center={mapCenter}
            zoom={14}
            properties={filteredProperties}
          />

          {filteredProperties.map((property) => (
            <AnyMarker
              key={property.id}
              position={[property.latitude, property.longitude]}
              icon={createCustomIcon(property.operation)}
            >
              <Popup className="property-popup" maxWidth={280} minWidth={250}>
                <div className="popup-content">
                  {property.imageUrl && (
                    <div className="popup-image">
                      <img
                        src={property.imageUrl}
                        alt={property.title}
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <span className={`popup-badge ${property.operation.toLowerCase()}`}>
                        {property.operation === "SALE" ? "Venta" : "Alquiler"}
                      </span>
                    </div>
                  )}
                  <div className="popup-info">
                    <h4 className="popup-title">{property.title}</h4>
                    <p className="popup-price">{formatPrice(property.price, property.operation)}</p>
                    <div className="popup-details">
                      <span className="popup-type">{translatePropertyType(property.propertyType)}</span>
                      {property.city && (
                        <span className="popup-city">{property.city}</span>
                      )}
                      {property.neighborhood && (
                        <span className="popup-neighborhood">{property.neighborhood}</span>
                      )}
                    </div>
                    <div className="popup-features">
                      {property.bedrooms && (
                        <span className="feature">
                          <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3zm12-6h-8v7H3V5H1v15h2v-3h18v3h2v-9c0-2.21-1.79-4-4-4z"/>
                          </svg>
                          {property.bedrooms}
                        </span>
                      )}
                      {property.bathrooms && (
                        <span className="feature">
                          <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M7 7c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2m13 10v4h-2v-4c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v4H4v-4c0-2.21 1.79-4 4-4h8c2.21 0 4 1.79 4 4m-7-8c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2z"/>
                          </svg>
                          {property.bathrooms}
                        </span>
                      )}
                      {property.areaM2 && (
                        <span className="feature">
                          <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 19H5V5h14v14zM3 3v18h18V3H3z"/>
                          </svg>
                          {property.areaM2}m²
                        </span>
                      )}
                    </div>
                    <a href={`/propiedades/${property.slug}`} className="popup-link">
                      Ver detalles
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8-8-8z"/>
                      </svg>
                    </a>
                  </div>
                </div>
              </Popup>
            </AnyMarker>
          ))}
        </AnyMapContainer>
      </div>

      {/* Mensaje si no hay propiedades */}
      {filteredProperties.length === 0 && (
        <div className="zone-map-empty">
          <p>No hay propiedades en esta zona con los filtros seleccionados</p>
        </div>
      )}
    </div>
  );
};

export default ZoneMapClient;
