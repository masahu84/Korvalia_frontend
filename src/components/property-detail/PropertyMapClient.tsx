import React from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface PropertyMapClientProps {
  lat?: number;
  lng?: number;
  title?: string;
  city?: string;
  neighborhood?: string;
}

// Crear icono personalizado para el marcador
const createPropertyIcon = () => {
  const size = 40;
  return L.divIcon({
    className: "custom-property-marker",
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background: #133b34;
        border: 4px solid white;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 4px 15px rgba(0,0,0,0.35);
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
    popupAnchor: [0, -size + 5],
  });
};

// Componente para controlar el mapa
const MapController: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();

  React.useEffect(() => {
    map.setView(center, 16);
  }, [center, map]);

  return null;
};

const PropertyMapClient: React.FC<PropertyMapClientProps> = ({
  lat = 36.7755,
  lng = -6.3515,
  title = "Ubicación de la propiedad",
  city = "",
  neighborhood = "",
}) => {
  const center: [number, number] = [lat, lng];

  // Tipos any para evitar problemas de tipos con Leaflet
  const AnyMapContainer = MapContainer as any;
  const AnyTileLayer = TileLayer as any;
  const AnyMarker = Marker as any;

  return (
    <AnyMapContainer
      center={center}
      zoom={16}
      scrollWheelZoom={true}
      className="property-map-leaflet"
      zoomControl={true}
      style={{ height: "100%", minHeight: "350px", width: "100%" }}
    >
      <AnyTileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />

      <MapController center={center} />

      <AnyMarker position={center} icon={createPropertyIcon()}>
        <Popup className="property-detail-popup" maxWidth={280}>
          <div className="property-map-popup">
            <div className="popup-icon">
              <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            </div>
            <div className="popup-text">
              <p className="popup-title">{title}</p>
              <p className="popup-location">
                {neighborhood && <span>{neighborhood}, </span>}
                {city}
              </p>
            </div>
          </div>
        </Popup>
      </AnyMarker>
    </AnyMapContainer>
  );
};

export default PropertyMapClient;
