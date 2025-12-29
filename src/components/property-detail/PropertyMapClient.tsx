import React from "react";
import { MapContainer, TileLayer, Circle, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

interface PropertyMapClientProps {
  lat?: number;
  lng?: number;
  title?: string;
  city?: string;
  neighborhood?: string;
}

// Función para añadir un desplazamiento aleatorio a las coordenadas (privacidad)
// Desplaza entre 100-300 metros en dirección aleatoria
const addRandomOffset = (lat: number, lng: number): [number, number] => {
  // Radio aleatorio entre 100 y 300 metros
  const radiusMeters = 100 + Math.random() * 200;
  // Ángulo aleatorio
  const angle = Math.random() * 2 * Math.PI;

  // Conversión aproximada: 1 grado de latitud ≈ 111,000 metros
  const latOffset = (radiusMeters * Math.cos(angle)) / 111000;
  // 1 grado de longitud varía según la latitud
  const lngOffset = (radiusMeters * Math.sin(angle)) / (111000 * Math.cos(lat * Math.PI / 180));

  return [lat + latOffset, lng + lngOffset];
};

// Componente para controlar el mapa
const MapController: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();

  React.useEffect(() => {
    // Zoom 14 para mostrar área más amplia (ubicación aproximada)
    map.setView(center, 14);
  }, [center, map]);

  return null;
};

const PropertyMapClient: React.FC<PropertyMapClientProps> = ({
  lat = 36.7755,
  lng = -6.3515,
  title = "Ubicación aproximada",
  city = "",
  neighborhood = "",
}) => {
  // Usar React.useMemo para que el offset sea consistente durante el render
  const offsetCenter = React.useMemo(() => addRandomOffset(lat, lng), [lat, lng]);

  // Tipos any para evitar problemas de tipos con Leaflet
  const AnyMapContainer = MapContainer as any;
  const AnyTileLayer = TileLayer as any;
  const AnyCircle = Circle as any;

  return (
    <AnyMapContainer
      center={offsetCenter}
      zoom={14}
      scrollWheelZoom={true}
      className="property-map-leaflet"
      zoomControl={true}
      style={{ height: "100%", minHeight: "350px", width: "100%" }}
    >
      <AnyTileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />

      <MapController center={offsetCenter} />

      {/* Círculo de zona aproximada (radio 400 metros) */}
      <AnyCircle
        center={offsetCenter}
        radius={400}
        pathOptions={{
          color: '#133b34',
          fillColor: '#133b34',
          fillOpacity: 0.15,
          weight: 2,
        }}
      >
        <Popup className="property-detail-popup" maxWidth={280}>
          <div className="property-map-popup">
            <div className="popup-icon">
              <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            </div>
            <div className="popup-text">
              <p className="popup-title">Ubicación aproximada</p>
              <p className="popup-location">
                {neighborhood && <span>{neighborhood}, </span>}
                {city}
              </p>
            </div>
          </div>
        </Popup>
      </AnyCircle>
    </AnyMapContainer>
  );
};

export default PropertyMapClient;
