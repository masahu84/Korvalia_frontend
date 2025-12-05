import React from "react";
import PropertyCard from "./PropertyCard";
import type { Property } from "../../types/property";

interface PropertyGridProps {
  properties: Property[];
}

const PropertyGrid: React.FC<PropertyGridProps> = ({ properties }) => {
  if (properties.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No se encontraron propiedades</h3>
        <p className="text-gray-600">Intenta ajustar los filtros de búsqueda</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
      {properties.map((property) => (
        <PropertyCard key={property.id} {...property} />
      ))}
    </div>
  );
};

export default PropertyGrid;
