import { Property, ContactInquiry } from '@/types';
import sampleProperties from '@/data/sample-properties.json';
import { sendInquiryEmail, sendConfirmationEmail } from './email';

// Database-backed functions with proper API integration
const API_BASE_URL = typeof window !== 'undefined' 
  ? '' // Client-side: use relative URLs
  : process.env.NEXTAUTH_URL || 'http://localhost:3000'; // Server-side: use full URL

export async function getProperties(): Promise<Property[]> {
  try {
    // Always try to fetch from API first
    const response = await fetch(`${API_BASE_URL}/api/properties`, {
      cache: 'no-store', // Always get fresh data
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.properties || [];
    } else {
      console.warn('API response not OK:', response.status, response.statusText);
    }
  } catch (error) {
    console.warn('Failed to fetch from API, falling back to sample data:', error);
  }
  
  // Fallback to sample properties only if API fails
  return sampleProperties as Property[];
}

export async function getActiveProperties(): Promise<Property[]> {
  const properties = await getProperties();
  return properties.filter(property => property.status === 'active');
}

export async function getPinnedProperties(): Promise<Property[]> {
  const activeProperties = await getActiveProperties();
  return activeProperties.filter(property => property.isPinned);
}

export async function getProperty(id: string): Promise<Property | null> {
  try {
    // Try to fetch from API first
    const response = await fetch(`${API_BASE_URL}/api/properties/${id}`, {
      cache: 'no-store',
    });
    
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.warn('Failed to fetch property from API, falling back to sample data:', error);
  }
  
  // Fallback to sample properties for development
  const properties = await getProperties();
  return properties.find(property => property.id === id) || null;
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
}): Promise<Property[]> {
  const properties = await getProperties();
  
  return properties.filter(property => {
    if (filters.minPrice && property.price < filters.minPrice) return false;
    if (filters.maxPrice && property.price > filters.maxPrice) return false;
    if (filters.bedrooms && property.details.bedrooms < filters.bedrooms) return false;
    if (filters.bathrooms && property.details.bathrooms < filters.bathrooms) return false;
    if (filters.propertyType && property.details.propertyType !== filters.propertyType) return false;
    if (filters.city && !property.address.city.toLowerCase().includes(filters.city.toLowerCase())) return false;
    
    return true;
  });
}

export async function saveProperty(property: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>): Promise<Property> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/properties`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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
        listingType: property.listingType.toUpperCase(),
        isPinned: property.isPinned,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to save property');
    }

    return await response.json();
  } catch (error) {
    console.error('Error saving property:', error);
    throw new Error('Failed to save property');
  }
}

export async function updateProperty(id: string, updates: Partial<Property>): Promise<Property> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/properties/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
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
    // Try to save to database via API first
    const response = await fetch(`${API_BASE_URL}/api/inquiries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(inquiry),
    });

    if (response.ok) {
      console.log('✅ Inquiry saved to database successfully');
      
      // Send emails
      const [agentEmailSent, confirmationEmailSent] = await Promise.allSettled([
        sendInquiryEmail(inquiry),
        sendConfirmationEmail(inquiry)
      ]);
      
      // Log email results
      if (agentEmailSent.status === 'fulfilled' && agentEmailSent.value) {
        console.log('✅ Agent notification email sent successfully');
      } else {
        console.warn('⚠️ Failed to send agent notification email');
      }
      
      if (confirmationEmailSent.status === 'fulfilled' && confirmationEmailSent.value) {
        console.log('✅ Customer confirmation email sent successfully');
      } else {
        console.warn('⚠️ Failed to send customer confirmation email');
      }
      
      return;
    }
  } catch (error) {
    console.warn('Failed to save inquiry to database, falling back to localStorage:', error);
  }
  
  // Fallback to localStorage for development
  try {
    if (typeof window !== 'undefined') {
      const existingInquiries = localStorage.getItem('inquiries');
      const inquiries = existingInquiries ? JSON.parse(existingInquiries) : [];
      inquiries.push(inquiry);
      localStorage.setItem('inquiries', JSON.stringify(inquiries));
      console.log('✅ Inquiry saved to localStorage as fallback');
    }
    
    // Send emails even with fallback
    const [agentEmailSent, confirmationEmailSent] = await Promise.allSettled([
      sendInquiryEmail(inquiry),
      sendConfirmationEmail(inquiry)
    ]);
    
    // Log email results
    if (agentEmailSent.status === 'fulfilled' && agentEmailSent.value) {
      console.log('✅ Agent notification email sent successfully');
    } else {
      console.warn('⚠️ Failed to send agent notification email');
    }
    
    if (confirmationEmailSent.status === 'fulfilled' && confirmationEmailSent.value) {
      console.log('✅ Customer confirmation email sent successfully');
    } else {
      console.warn('⚠️ Failed to send customer confirmation email');
    }
    
  } catch (error) {
    console.error('Error saving inquiry:', error);
    throw new Error('Failed to save inquiry');
  }
}

export async function getInquiries(): Promise<ContactInquiry[]> {
  // In a real app, this would fetch from a database
  try {
    if (typeof window !== 'undefined') {
      const existingInquiries = localStorage.getItem('inquiries');
      return existingInquiries ? JSON.parse(existingInquiries) : [];
    }
    return [];
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    return [];
  }
}

export async function getInquiriesForProperty(propertyId: string): Promise<ContactInquiry[]> {
  const allInquiries = await getInquiries();
  return allInquiries.filter(inquiry => inquiry.propertyId === propertyId);
}

