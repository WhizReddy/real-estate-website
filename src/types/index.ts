export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  details: {
    bedrooms: number;
    bathrooms: number;
    squareFootage: number;
    propertyType: "house" | "condo" | "townhouse" | "apartment";
    yearBuilt?: number;
  };
  images: string[];
  features: string[];
  status: "active" | "inactive" | "pending" | "sold";
  listingType: "sale" | "rent"; // Për Shitje ose Me Qira
  isPinned: boolean; // Pin to main page
  agent?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    photo?: string;
    role?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Agent {
  id: string;
  name: string;
  email: string;
  phone: string;
  photo?: string;
  bio?: string;
  specialties: string[];
  createdAt: string;
}

export interface ContactInquiry {
  id: string;
  propertyId: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  createdAt: string;
}
