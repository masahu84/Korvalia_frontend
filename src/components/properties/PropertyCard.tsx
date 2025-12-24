import React from "react";
import type { Property } from "../../types/property";
import { showGlobalLoader } from "../ui/GlobalLoader";

type PropertyCardProps = Property;

// Función para compartir propiedad
async function handleShare(
  e: React.MouseEvent,
  title: string,
  price: string,
  url: string
) {
  e.preventDefault();
  e.stopPropagation();

  const shareText = `${title} - ${price}\n\nMira esta propiedad en Korvalia:`;
  const fullUrl = `https://korvalia.es${url}`;

  if (navigator.share) {
    try {
      await navigator.share({
        title: title,
        text: shareText,
        url: fullUrl,
      });
    } catch (err) {
      console.log('Compartir cancelado');
    }
  } else {
    // Fallback: copiar al portapapeles
    const fullText = `${shareText}\n${fullUrl}`;
    try {
      await navigator.clipboard.writeText(fullText);
      // El feedback visual se maneja en el componente
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  }
}

// Traducciones para tipos de propiedad conocidos (enum local)
const propertyTypeTranslations: Record<string, string> = {
  FLAT: "Piso",
  HOUSE: "Casa",
  PENTHOUSE: "Ático",
  APARTMENT: "Apartamento",
  DUPLEX: "Dúplex",
  LAND: "Terreno",
  COMMERCIAL: "Local comercial",
  GARAGE: "Garaje",
  ROOM: "Habitación",
  OTHER: "Otro",
};

// Helper para obtener el nombre legible del tipo de propiedad
function getPropertyTypeName(type: string): string {
  // Si es un tipo conocido (enum), usar la traducción
  if (propertyTypeTranslations[type]) {
    return propertyTypeTranslations[type];
  }
  // Si no, devolver el tipo tal cual (ya viene en español del CRM)
  return type || "Inmueble";
}

// Imagen placeholder por defecto - imagen gris clara con texto
const PLACEHOLDER_IMAGE = "https://placehold.co/800x600/e5e7eb/9ca3af?text=Sin+imagen";

const PropertyCard: React.FC<PropertyCardProps> = ({
  title,
  price,
  city,
  neighborhood,
  operation,
  propertyType,
  areaM2,
  bedrooms,
  bathrooms,
  imageUrl,
  slug,
  isFeatured,
}) => {
  const [copied, setCopied] = React.useState(false);

  // Usar placeholder si no hay imagen
  const displayImage = imageUrl || PLACEHOLDER_IMAGE;

  const formattedAmount = new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
  }).format(price);

  const showLocation = neighborhood || city;

  // Si el slug ya empieza con /, es una URL completa (Emblematic), si no, agregar /propiedades/
  const propertyUrl = slug.startsWith('/') ? slug : `/propiedades/${slug}`;

  const handleClick = () => {
    showGlobalLoader();
  };

  const onShareClick = async (e: React.MouseEvent) => {
    await handleShare(e, title, formattedAmount, propertyUrl);
    // Mostrar feedback de copiado en desktop
    if (!navigator.share) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <a
      href={propertyUrl}
      onClick={handleClick}
      className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300"
    >
      {/* Imagen */}
      <div className="relative h-56 sm:h-60 overflow-hidden">
        <img
          src={displayImage}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {/* Badge de operación (Venta/Alquiler) */}
          <span className="inline-flex items-center rounded-md bg-[#39505d] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
            {operation === "SALE" || operation === "VENTA" ? "Venta" : "Alquiler"}
          </span>

          {/* Badge Destacada - solo si isFeatured es true */}
          {isFeatured && (
            <span className="inline-flex items-center gap-1 rounded-md bg-[#c3a77a] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Destacada
            </span>
          )}
        </div>

        {/* Botón compartir */}
        <button
          onClick={onShareClick}
          className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-md hover:scale-110 hover:shadow-lg active:scale-95 transition-all duration-200 z-10"
          aria-label="Compartir propiedad"
        >
          {copied ? (
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <polyline points="20 6 9 17 4 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-[#133b34]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <circle cx="18" cy="5" r="3"/>
              <circle cx="6" cy="12" r="3"/>
              <circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
          )}
        </button>
      </div>

      {/* Contenido */}
      <div className="px-5 pt-4 pb-5">
        {/* Precio */}
        <div className="mb-1">
          <div className="text-[22px] sm:text-2xl font-semibold text-slate-900">
            <span>{formattedAmount}</span>
            {(operation === "RENT" || operation === "ALQUILER") && <span className="ml-1 text-sm font-normal text-slate-500">/mes</span>}
          </div>
        </div>

        {/* Título */}
        <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-1 line-clamp-1">{title}</h3>

        {/* Línea de ubicación (tipo Figma: "calle x") */}
        <p className="text-sm text-slate-500 mb-4 line-clamp-1">
          {showLocation || getPropertyTypeName(propertyType)}
        </p>

        {/* Separador */}
        <div className="border-t border-slate-200 pt-3">
          <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-600">
            {bedrooms != null && (
              <div className="flex items-center gap-1">
                {/* icono cama */}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 12V7a2 2 0 012-2h4a2 2 0 012 2v5M4 12h16M4 17v-3m16 3v-3M4 17h16"
                  />
                </svg>
                <span>{bedrooms} hab</span>
              </div>
            )}

            {bathrooms != null && (
              <div className="flex items-center gap-1">
                {/* icono baño */}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 10V6a3 3 0 016 0v4m-7 4h8a4 4 0 014 4H3a4 4 0 014-4z"
                  />
                </svg>
                <span>{bathrooms} baños</span>
              </div>
            )}

            {areaM2 != null && (
              <div className="flex items-center gap-1">
                {/* icono metros */}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4h7m9 0h-7M4 4v7m0 9v-7m16 7v-7m0-9v7M4 20h7m9 0h-7"
                  />
                </svg>
                <span>{areaM2} m²</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </a>
  );
};

export default PropertyCard;
