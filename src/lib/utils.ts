import { Property } from '@/types';

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('sq-AL', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatSquareFootage(sqft: number): string {
  return new Intl.NumberFormat('sq-AL').format(sqft) + ' m²';
}

export function formatAddress(address: Property['address']): string {
  return `${address.street}, ${address.city}`;
}

export function validateProperty(property: Partial<Property>): string[] {
  const errors: string[] = [];

  if (!property.title?.trim()) {
    errors.push('Title is required');
  }

  if (!property.description?.trim()) {
    errors.push('Description is required');
  }

  if (!property.price || property.price <= 0) {
    errors.push('Valid price is required');
  }

  if (!property.address?.street?.trim()) {
    errors.push('Street address is required');
  }

  if (!property.address?.city?.trim()) {
    errors.push('City is required');
  }

  if (!property.address?.state?.trim()) {
    errors.push('State is required');
  }

  if (!property.address?.zipCode?.trim()) {
    errors.push('ZIP code is required');
  }

  if (!property.details?.bedrooms || property.details.bedrooms < 0) {
    errors.push('Valid number of bedrooms is required');
  }

  if (!property.details?.bathrooms || property.details.bathrooms < 0) {
    errors.push('Valid number of bathrooms is required');
  }

  if (!property.details?.squareFootage || property.details.squareFootage <= 0) {
    errors.push('Valid square footage is required');
  }

  if (!property.images?.length) {
    errors.push('At least one image is required');
  }

  return errors;
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function getCurrentTimestamp(): string {
  return new Date().toISOString();
}

export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat('sq-AL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
}

export function formatDateShort(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat('sq-AL', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(dateObj);
}