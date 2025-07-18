// Form validation utilities

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

export interface PropertyFormData {
  title: string;
  description: string;
  price: number;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  details: {
    bedrooms: number;
    bathrooms: number;
    squareFootage: number;
    propertyType: string;
    yearBuilt?: number;
  };
  features: string[];
  listingType: string;
}

// Email validation
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Phone validation (Albanian format)
export function validatePhone(phone: string): boolean {
  if (!phone) return true; // Phone is optional
  const phoneRegex = /^(\+355|0)?[6-9]\d{7,8}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

// Price validation
export function validatePrice(price: number): boolean {
  return price > 0 && price <= 10000000; // Max 10M euros
}

// Contact form validation
export function validateContactForm(data: ContactFormData): ValidationResult {
  const errors: string[] = [];

  // Name validation
  if (!data.name || data.name.trim().length < 2) {
    errors.push('Emri duhet të ketë të paktën 2 karaktere');
  }
  if (data.name && data.name.length > 100) {
    errors.push('Emri nuk mund të jetë më i gjatë se 100 karaktere');
  }

  // Email validation
  if (!data.email) {
    errors.push('Email-i është i detyrueshëm');
  } else if (!validateEmail(data.email)) {
    errors.push('Ju lutemi shkruani një email të vlefshëm');
  }

  // Phone validation
  if (data.phone && !validatePhone(data.phone)) {
    errors.push('Numri i telefonit nuk është i vlefshëm');
  }

  // Message validation
  if (!data.message || data.message.trim().length < 10) {
    errors.push('Mesazhi duhet të ketë të paktën 10 karaktere');
  }
  if (data.message && data.message.length > 1000) {
    errors.push('Mesazhi nuk mund të jetë më i gjatë se 1000 karaktere');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Property form validation
export function validatePropertyForm(data: PropertyFormData): ValidationResult {
  const errors: string[] = [];

  // Title validation
  if (!data.title || data.title.trim().length < 5) {
    errors.push('Titulli duhet të ketë të paktën 5 karaktere');
  }
  if (data.title && data.title.length > 200) {
    errors.push('Titulli nuk mund të jetë më i gjatë se 200 karaktere');
  }

  // Description validation
  if (!data.description || data.description.trim().length < 20) {
    errors.push('Përshkrimi duhet të ketë të paktën 20 karaktere');
  }
  if (data.description && data.description.length > 2000) {
    errors.push('Përshkrimi nuk mund të jetë më i gjatë se 2000 karaktere');
  }

  // Price validation
  if (!validatePrice(data.price)) {
    errors.push('Çmimi duhet të jetë midis 1 dhe 10,000,000 euro');
  }

  // Address validation
  if (!data.address.street || data.address.street.trim().length < 5) {
    errors.push('Adresa duhet të ketë të paktën 5 karaktere');
  }
  if (!data.address.city || data.address.city.trim().length < 2) {
    errors.push('Qyteti është i detyrueshëm');
  }
  if (!data.address.state || data.address.state.trim().length < 2) {
    errors.push('Shteti/Rajoni është i detyrueshëm');
  }
  if (!data.address.zipCode || data.address.zipCode.trim().length < 4) {
    errors.push('Kodi postar duhet të ketë të paktën 4 karaktere');
  }

  // Property details validation
  if (data.details.bedrooms < 0 || data.details.bedrooms > 20) {
    errors.push('Numri i dhomave të gjumit duhet të jetë midis 0 dhe 20');
  }
  if (data.details.bathrooms < 0 || data.details.bathrooms > 10) {
    errors.push('Numri i banjove duhet të jetë midis 0 dhe 10');
  }
  if (data.details.squareFootage < 10 || data.details.squareFootage > 10000) {
    errors.push('Sipërfaqja duhet të jetë midis 10 dhe 10,000 m²');
  }
  if (!data.details.propertyType) {
    errors.push('Lloji i pasurisë është i detyrueshëm');
  }
  if (data.details.yearBuilt && (data.details.yearBuilt < 1800 || data.details.yearBuilt > new Date().getFullYear() + 2)) {
    errors.push('Viti i ndërtimit nuk është i vlefshëm');
  }

  // Listing type validation
  if (!data.listingType || !['sale', 'rent'].includes(data.listingType)) {
    errors.push('Lloji i shitjes është i detyrueshëm');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Sanitize input to prevent XSS
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove < and > characters
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

// Sanitize object with string values
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized = { ...obj };
  
  for (const key in sanitized) {
    if (typeof sanitized[key] === 'string') {
      sanitized[key] = sanitizeInput(sanitized[key]);
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeObject(sanitized[key]);
    }
  }
  
  return sanitized;
}