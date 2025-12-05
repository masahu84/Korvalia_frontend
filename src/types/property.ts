export type OperationType = "RENT" | "SALE";

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
  | "APARTMENT";

export interface Property {
  id: number;
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
