import "server-only";
import { Property, ContactInquiry } from '@/types';
import { sendInquiryEmail, sendConfirmationEmail } from './email';

// Database-backed functions with proper API integration
const API_BASE_URL = typeof window !== 'undefined' 
  ? '' // Client-side: use relative URLs
  : process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : process.env.NEXTAUTH_URL || 'http://localhost:3000'; // Server-side: use full URL

export async function getProperties(): Promise<Property[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/properties`, {
      cache: 'no-store',
    });
    if (response.ok) {
      const data = await response.json();
      return data.properties || [];
    } else {
      console.error('Failed to fetch properties:', response.status);
      throw new Error(`Failed to fetch properties: ${response.status}`);
    }
  } catch (error) {
    console.error('Failed to fetch properties from database:', error);
    throw error;
  }
}

export async function getActiveProperties(): Promise<Property[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/properties/active`, {
      cache: 'no-store',
    });
    if (response.ok) {
      const data = await response.json();
      return data.properties || [];
    } else {
      console.error('Failed to fetch active properties:', response.status);
      throw new Error(`Failed to fetch active properties: ${response.status}`);
    }
  } catch (error) {
    console.error('Failed to fetch active properties from database:', error);
    throw error;
  }
}

export async function getPinnedProperties(): Promise<Property[]> {
  const activeProperties = await getActiveProperties();
  return activeProperties.filter(property => property.isPinned);
}

export async function getProperty(id: string): Promise<Property | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/properties/${id}`, {
      cache: 'no-store',
    });
    if (response.ok) {
      return await response.json();
    } else if (response.status === 404) {
      return null;
    } else {
      throw new Error(`Failed to fetch property: ${response.status}`);
    }
  } catch (error) {
    console.error('Failed to fetch property from database:', error);
    throw error;
  }
}

export async function getPropertiesByStatus(status: Property['status']): Promise<Property[]> {
  const properties = await getProperties();
  return properties.filter(property => property.status === status);
}

export async function getPropertiesByType(listingType: 'sale' | 'rent'): Promise<Property[]> {
  const activeProperties = await getActiveProperties();
  return activeProperties.filter(property => property.listingType === listingType);
}

export async function searchProperties(filters: {
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  propertyType?: Property['details']['propertyType'];
  city?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  page?: number;
  limit?: number;
}): Promise<Property[]> {
  try {
    const params = new URLSearchParams();
    if (filters.minPrice) params.append('minPrice', filters.minPrice.toString());
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
    if (filters.bedrooms) params.append('bedrooms', filters.bedrooms.toString());
    if (filters.bathrooms) params.append('bathrooms', filters.bathrooms.toString());
    if (filters.propertyType) params.append('propertyType', filters.propertyType);
    if (filters.city) params.append('city', filters.city);
    if (filters.search) params.append('search', filters.search);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const response = await fetch(`${API_BASE_URL}/api/properties/search?${params.toString()}`, {
      cache: 'no-store',
    });
    if (response.ok) {
      const data = await response.json();
      return data.properties || [];
    } else {
      console.error('Failed to search properties:', response.status);
      throw new Error(`Failed to search properties: ${response.status}`);
    }
  } catch (error) {
    console.error('Failed to search properties from database:', error);
    throw error;
  }
}

export async function saveProperty(property: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>): Promise<Property> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/properties`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: property.title,
        description: property.description,
        price: property.price,
        street: property.address.street,
        city: property.address.city,
        state: property.address.state,
        zipCode: property.address.zipCode,
        latitude: property.address.coordinates.lat,
        longitude: property.address.coordinates.lng,
        bedrooms: property.details.bedrooms,
        bathrooms: property.details.bathrooms,
        squareFootage: property.details.squareFootage,
        propertyType: property.details.propertyType.toUpperCase(),
        yearBuilt: property.details.yearBuilt,
        images: property.images,
        features: property.features,
        status: property.status,
        listingType: property.listingType.toUpperCase(),
        isPinned: property.isPinned,
      }),
    });

    const result = await response.json();
    if (!response.ok) {
      if (result.error?.code === 'VALIDATION_ERROR') {
        const errorMessages = Object.values(result.error.details).join(', ');
        throw new Error(`Validation failed: ${errorMessages}`);
      }
      throw new Error(result.error?.message || 'Failed to save property');
    }
    return result.data;
  } catch (error) {
    console.error('Error saving property:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to save property');
  }
}

export async function updateProperty(id: string, updates: Partial<Property>): Promise<Property> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/properties/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!response.ok) {
      throw new Error('Failed to update property');
    }
    return await response.json();
  } catch (error) {
    console.error('Error updating property:', error);
    throw new Error('Failed to update property');
  }
}

export async function deleteProperty(id: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/properties/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete property');
    }
  } catch (error) {
    console.error('Error deleting property:', error);
    throw new Error('Failed to delete property');
  }
}

export async function saveInquiry(inquiry: ContactInquiry): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/inquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inquiry),
    });
    if (response.ok) {
      // Send emails in parallel (best-effort)
      await Promise.allSettled([
        sendInquiryEmail(inquiry),
        sendConfirmationEmail(inquiry),
      ]);
      return;
    } else {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to save inquiry');
    }
  } catch (error) {
    console.error('Error saving inquiry:', error);
    throw error;
  }
}

export async function getInquiries(): Promise<ContactInquiry[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/inquiries`, {
      cache: 'no-store',
    });
    if (response.ok) {
      const data = await response.json();
      return data.inquiries || [];
    } else {
      console.error('Failed to fetch inquiries:', response.status);
      throw new Error(`Failed to fetch inquiries: ${response.status}`);
    }
  } catch (error) {
    console.error('Failed to fetch inquiries from database:', error);
    throw error;
  }
}

export async function getInquiriesForProperty(propertyId: string): Promise<ContactInquiry[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/inquiries?propertyId=${propertyId}`, {
      cache: 'no-store',
    });
    if (response.ok) {
      const data = await response.json();
      return data.inquiries || [];
    } else {
      console.error('Failed to fetch inquiries for property:', response.status);
      throw new Error(`Failed to fetch inquiries for property: ${response.status}`);
    }
  } catch (error) {
    console.error('Failed to fetch inquiries for property from database:', error);
    throw error;
  }
}

