/**
 * Security utilities for input sanitization and validation
 */

/**
 * Sanitize HTML input to prevent XSS attacks
 */
export function sanitizeHtml(input: string): string {
  if (!input) return '';

  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Sanitize string input by removing potentially dangerous characters
 */
export function sanitizeString(input: string): string {
  if (!input) return '';

  // Remove null bytes and control characters
  return input.replace(/[\x00-\x1F\x7F]/g, '').trim();
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
  return emailRegex.test(email);
}

/**
 * Validate phone number format (Albanian format)
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[\+]?[0-9\s\-\(\)]{8,}$/;
  return phoneRegex.test(phone);
}

/**
 * Validate price input
 */
export function isValidPrice(price: number): boolean {
  return typeof price === 'number' && price > 0 && price < 10000000;
}

/**
 * Validate coordinates
 */
export function isValidCoordinates(lat: number, lng: number): boolean {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    lat >= -90 && lat <= 90 &&
    lng >= -180 && lng <= 180
  );
}

/**
 * Validate file upload
 */
export function isValidImageFile(file: File): { valid: boolean; error?: string } {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Lloji i skedarit nuk është i lejuar. Përdorni JPEG, PNG ose WebP.' };
  }

  if (file.size > maxSize) {
    return { valid: false, error: 'Skedari është shumë i madh. Maksimumi është 5MB.' };
  }

  return { valid: true };
}

/**
 * Rate limiting helper (simple in-memory implementation)
 */
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests: number = 10, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(identifier) || [];

    // Remove old requests outside the window
    const validRequests = requests.filter(time => now - time < this.windowMs);

    if (validRequests.length >= this.maxRequests) {
      return false;
    }

    validRequests.push(now);
    this.requests.set(identifier, validRequests);

    return true;
  }
}

export const contactFormLimiter = new RateLimiter(5, 300000); // 5 requests per 5 minutes
export const loginLimiter = new RateLimiter(3, 900000); // 3 attempts per 15 minutes

/**
 * Generate secure session token
 */
export function generateSessionToken(): string {
  const array = new Uint8Array(32);
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(array);
  } else {
    // Fallback for server-side
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Hash password (simple implementation - in production use bcrypt)
 */
export function hashPassword(password: string): string {
  // This is a simple hash for demo purposes
  // In production, use bcrypt or similar
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString();
}

/**
 * Verify password against hash
 */
export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

/**
 * Sanitize property data before saving
 */
export function sanitizePropertyData(data: any): any {
  return {
    ...data,
    title: sanitizeHtml(sanitizeString(data.title)),
    description: sanitizeHtml(sanitizeString(data.description)),
    address: {
      ...data.address,
      street: sanitizeString(data.address?.street || ''),
      city: sanitizeString(data.address?.city || ''),
      state: sanitizeString(data.address?.state || ''),
      zipCode: sanitizeString(data.address?.zipCode || ''),
    },
    features: Array.isArray(data.features)
      ? data.features.map((feature: string) => sanitizeString(feature))
      : [],
  };
}

/**
 * Sanitize contact inquiry data
 */
export function sanitizeInquiryData(data: any): any {
  return {
    ...data,
    name: sanitizeHtml(sanitizeString(data.name)),
    email: sanitizeHtml(sanitizeString(data.email)),
    phone: data.phone ? sanitizeHtml(sanitizeString(data.phone)) : undefined,
    message: sanitizeHtml(sanitizeString(data.message)),
  };
}