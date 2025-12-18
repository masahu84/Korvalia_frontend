// Tipos de operación: soporta tanto valores locales como del CRM
export type OperationType = "RENT" | "SALE" | "ALQUILER" | "VENTA";

// Tipos de propiedad: soporta tanto valores locales (enum) como del CRM (texto libre)
export type PropertyType =
  | "FLAT"
  | "HOUSE"
  | "PENTHOUSE"
  | "DUPLEX"
  | "LAND"
  | "COMMERCIAL"
  | "GARAGE"
  | "ROOM"
  | "OTHER"
  | "APARTMENT"
  | string; // Permite tipos de texto libre del CRM (ej: "Piso", "Casa", etc.)

export interface Property {
  id: number | string; // string para referencias de Emblematic
  title: string;
  slug: string;
  price: number;
  city: string;
  neighborhood?: string | null;
  operation: OperationType;
  propertyType: PropertyType;
  areaM2?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  imageUrl: string;
  isFeatured?: boolean;
}
