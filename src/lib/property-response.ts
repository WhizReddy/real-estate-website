import { Property } from "@/types";

type PropertyOwner =
  | {
      id: string;
      name: string | null;
      email: string;
      role?: string | null;
      phone?: string | null;
      photo?: string | null;
    }
  | null
  | undefined;

export interface PropertyRecord {
  id: string;
  title: string;
  description: string;
  price: number;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  bedrooms: number;
  bathrooms: number;
  squareFootage: number;
  propertyType: string;
  yearBuilt: number | null;
  images: string | null;
  features: string | null;
  status: string;
  listingType: string;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
  owner?: PropertyOwner;
}

const DEFAULT_AGENT = {
  id: "default-agent",
  name: "Real Estate Agent",
  email: "agent@realestate-tirana.al",
};

function safeParseStringArray(value: string | null | undefined): string[] {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((item): item is string => typeof item === "string");
  } catch {
    return [];
  }
}

function normalizePropertyType(
  value: string
): Property["details"]["propertyType"] {
  const normalized = value.toLowerCase();

  switch (normalized) {
    case "house":
    case "condo":
    case "townhouse":
    case "apartment":
      return normalized;
    default:
      return "apartment";
  }
}

function normalizeStatus(value: string): Property["status"] {
  const normalized = value.toLowerCase();

  switch (normalized) {
    case "active":
    case "inactive":
    case "pending":
    case "sold":
      return normalized;
    default:
      return "active";
  }
}

function normalizeListingType(value: string): Property["listingType"] {
  return value.toLowerCase() === "rent" ? "rent" : "sale";
}

export function buildPropertyAgent(
  owner?: PropertyOwner
): NonNullable<Property["agent"]> {
  if (!owner) {
    return DEFAULT_AGENT;
  }

  return {
    id: owner.id,
    name: owner.name || DEFAULT_AGENT.name,
    email: owner.email,
    phone: owner.phone || undefined,
    photo: owner.photo || undefined,
    role: typeof owner.role === "string" ? owner.role.toLowerCase() : undefined,
  };
}

export function transformPropertyRecord(property: PropertyRecord): Property {
  return {
    id: property.id,
    title: property.title,
    description: property.description,
    price: property.price,
    address: {
      street: property.street,
      city: property.city,
      state: property.state,
      zipCode: property.zipCode,
      coordinates: {
        lat: property.latitude,
        lng: property.longitude,
      },
    },
    details: {
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      squareFootage: property.squareFootage,
      propertyType: normalizePropertyType(property.propertyType),
      yearBuilt: property.yearBuilt ?? undefined,
    },
    images: safeParseStringArray(property.images),
    features: safeParseStringArray(property.features),
    status: normalizeStatus(property.status),
    listingType: normalizeListingType(property.listingType),
    isPinned: property.isPinned,
    agent: buildPropertyAgent(property.owner),
    createdAt: property.createdAt.toISOString(),
    updatedAt: property.updatedAt.toISOString(),
  };
}
