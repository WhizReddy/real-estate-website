// Comprehensive property data validation and sanitization

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  sanitizedData?: any;
}

// HTML sanitization to prevent XSS
export function sanitizeHtml(input: string): string {
  if (!input) return '';
  
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
}

// Sanitize and validate text input
export function sanitizeText(input: string, maxLength: number = 1000): string {
  if (!input) return '';
  
  return sanitizeHtml(input)
    .substring(0, maxLength)
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim();
}

// Validate and sanitize email
export function validateEmail(email: string): { isValid: boolean; sanitized: string } {
  const sanitized = email.toLowerCase().trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  return {
    isValid: emailRegex.test(sanitized),
    sanitized,
  };
}

// Validate and sanitize phone number
export function validatePhone(phone: string): { isValid: boolean; sanitized: string } {
  const sanitized = phone.replace(/\D/g, ''); // Remove non-digits
  const phoneRegex = /^\d{8,15}$/; // 8-15 digits
  
  return {
    isValid: phoneRegex.test(sanitized),
    sanitized,
  };
}

// Validate coordinates
export function validateCoordinates(lat: number, lng: number): boolean {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    lat >= -90 && lat <= 90 &&
    lng >= -180 && lng <= 180 &&
    !isNaN(lat) && !isNaN(lng)
  );
}

// Validate URL
export function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Validate property type
export function validatePropertyType(type: string): boolean {
  const validTypes = ['apartment', 'house', 'condo', 'townhouse'];
  return validTypes.includes(type.toLowerCase());
}

// Validate status
export function validateStatus(status: string): boolean {
  const validStatuses = ['active', 'inactive', 'pending', 'sold'];
  return validStatuses.includes(status.toLowerCase());
}

// Validate listing type
export function validateListingType(type: string): boolean {
  const validTypes = ['sale', 'rent'];
  return validTypes.includes(type.toLowerCase());
}

// Comprehensive property data validation
export function validatePropertyData(data: any): ValidationResult {
  const errors: ValidationError[] = [];
  const sanitizedData: any = {};

  // Title validation and sanitization
  if (!data.title || typeof data.title !== 'string') {
    errors.push({
      field: 'title',
      message: 'Title is required and must be a string',
      code: 'REQUIRED_FIELD',
    });
  } else {
    const sanitizedTitle = sanitizeText(data.title, 200);
    if (sanitizedTitle.length < 5) {
      errors.push({
        field: 'title',
        message: 'Title must be at least 5 characters long',
        code: 'MIN_LENGTH',
      });
    } else {
      sanitizedData.title = sanitizedTitle;
    }
  }

  // Description validation and sanitization
  if (!data.description || typeof data.description !== 'string') {
    errors.push({
      field: 'description',
      message: 'Description is required and must be a string',
      code: 'REQUIRED_FIELD',
    });
  } else {
    const sanitizedDescription = sanitizeText(data.description, 2000);
    if (sanitizedDescription.length < 20) {
      errors.push({
        field: 'description',
        message: 'Description must be at least 20 characters long',
        code: 'MIN_LENGTH',
      });
    } else {
      sanitizedData.description = sanitizedDescription;
    }
  }

  // Price validation
  if (!data.price || typeof data.price !== 'number' || data.price <= 0) {
    errors.push({
      field: 'price',
      message: 'Price is required and must be a positive number',
      code: 'INVALID_NUMBER',
    });
  } else if (data.price > 10000000) {
    errors.push({
      field: 'price',
      message: 'Price cannot exceed 10,000,000',
      code: 'MAX_VALUE',
    });
  } else {
    sanitizedData.price = Math.round(data.price * 100) / 100; // Round to 2 decimal places
  }

  // Street validation and sanitization
  if (!data.street || typeof data.street !== 'string') {
    errors.push({
      field: 'street',
      message: 'Street address is required',
      code: 'REQUIRED_FIELD',
    });
  } else {
    const sanitizedStreet = sanitizeText(data.street, 200);
    if (sanitizedStreet.length < 5) {
      errors.push({
        field: 'street',
        message: 'Street address must be at least 5 characters long',
        code: 'MIN_LENGTH',
      });
    } else {
      sanitizedData.street = sanitizedStreet;
    }
  }

  // City validation and sanitization
  if (!data.city || typeof data.city !== 'string') {
    errors.push({
      field: 'city',
      message: 'City is required',
      code: 'REQUIRED_FIELD',
    });
  } else {
    const sanitizedCity = sanitizeText(data.city, 100);
    if (sanitizedCity.length < 2) {
      errors.push({
        field: 'city',
        message: 'City must be at least 2 characters long',
        code: 'MIN_LENGTH',
      });
    } else {
      sanitizedData.city = sanitizedCity;
    }
  }

  // State validation and sanitization
  if (!data.state || typeof data.state !== 'string') {
    errors.push({
      field: 'state',
      message: 'State is required',
      code: 'REQUIRED_FIELD',
    });
  } else {
    sanitizedData.state = sanitizeText(data.state, 100);
  }

  // Zip code sanitization (optional)
  if (data.zipCode) {
    sanitizedData.zipCode = sanitizeText(data.zipCode.toString(), 20);
  } else {
    sanitizedData.zipCode = '';
  }

  // Coordinates validation
  if (data.latitude === undefined || data.latitude === null || 
      data.longitude === undefined || data.longitude === null) {
    errors.push({
      field: 'coordinates',
      message: 'Latitude and longitude are required',
      code: 'REQUIRED_FIELD',
    });
  } else if (!validateCoordinates(data.latitude, data.longitude)) {
    errors.push({
      field: 'coordinates',
      message: 'Invalid coordinates provided',
      code: 'INVALID_COORDINATES',
    });
  } else {
    sanitizedData.latitude = Number(data.latitude);
    sanitizedData.longitude = Number(data.longitude);
  }

  // Bedrooms validation
  if (data.bedrooms !== undefined && data.bedrooms !== null) {
    const bedrooms = Number(data.bedrooms);
    if (isNaN(bedrooms) || bedrooms < 0 || bedrooms > 20) {
      errors.push({
        field: 'bedrooms',
        message: 'Bedrooms must be a number between 0 and 20',
        code: 'INVALID_NUMBER',
      });
    } else {
      sanitizedData.bedrooms = Math.floor(bedrooms);
    }
  } else {
    sanitizedData.bedrooms = 0;
  }

  // Bathrooms validation
  if (!data.bathrooms || typeof data.bathrooms !== 'number' || data.bathrooms <= 0) {
    errors.push({
      field: 'bathrooms',
      message: 'Number of bathrooms is required and must be greater than 0',
      code: 'REQUIRED_FIELD',
    });
  } else if (data.bathrooms > 20) {
    errors.push({
      field: 'bathrooms',
      message: 'Number of bathrooms cannot exceed 20',
      code: 'MAX_VALUE',
    });
  } else {
    sanitizedData.bathrooms = Number(data.bathrooms);
  }

  // Square footage validation
  if (!data.squareFootage || typeof data.squareFootage !== 'number' || data.squareFootage <= 0) {
    errors.push({
      field: 'squareFootage',
      message: 'Square footage is required and must be greater than 0',
      code: 'REQUIRED_FIELD',
    });
  } else if (data.squareFootage > 50000) {
    errors.push({
      field: 'squareFootage',
      message: 'Square footage cannot exceed 50,000',
      code: 'MAX_VALUE',
    });
  } else {
    sanitizedData.squareFootage = Math.round(Number(data.squareFootage));
  }

  // Property type validation
  if (!data.propertyType || !validatePropertyType(data.propertyType)) {
    errors.push({
      field: 'propertyType',
      message: 'Valid property type is required (apartment, house, condo, townhouse)',
      code: 'INVALID_ENUM',
    });
  } else {
    sanitizedData.propertyType = data.propertyType.toLowerCase();
  }

  // Year built validation
  if (data.yearBuilt !== undefined && data.yearBuilt !== null) {
    const yearBuilt = Number(data.yearBuilt);
    const currentYear = new Date().getFullYear();
    if (isNaN(yearBuilt) || yearBuilt < 1800 || yearBuilt > currentYear + 5) {
      errors.push({
        field: 'yearBuilt',
        message: `Year built must be between 1800 and ${currentYear + 5}`,
        code: 'INVALID_YEAR',
      });
    } else {
      sanitizedData.yearBuilt = Math.floor(yearBuilt);
    }
  }

  // Images validation
  if (!Array.isArray(data.images)) {
    errors.push({
      field: 'images',
      message: 'Images must be an array',
      code: 'INVALID_TYPE',
    });
  } else if (data.images.length === 0) {
    errors.push({
      field: 'images',
      message: 'At least one image is required',
      code: 'REQUIRED_FIELD',
    });
  } else if (data.images.length > 20) {
    errors.push({
      field: 'images',
      message: 'Maximum 20 images allowed',
      code: 'MAX_ITEMS',
    });
  } else {
    const validImages = data.images.filter((img: any) => {
      return typeof img === 'string' && (img.startsWith('http') || img.startsWith('data:'));
    });
    
    if (validImages.length === 0) {
      errors.push({
        field: 'images',
        message: 'At least one valid image URL is required',
        code: 'INVALID_FORMAT',
      });
    } else {
      sanitizedData.images = validImages.slice(0, 20); // Limit to 20 images
    }
  }

  // Features validation
  if (!Array.isArray(data.features)) {
    sanitizedData.features = [];
  } else {
    const sanitizedFeatures = data.features
      .filter((feature: any) => typeof feature === 'string' && feature.trim().length > 0)
      .map((feature: string) => sanitizeText(feature, 100))
      .slice(0, 50); // Limit to 50 features
    
    sanitizedData.features = sanitizedFeatures;
  }

  // Status validation
  if (data.status && !validateStatus(data.status)) {
    errors.push({
      field: 'status',
      message: 'Invalid status (active, inactive, pending, sold)',
      code: 'INVALID_ENUM',
    });
  } else {
    sanitizedData.status = (data.status || 'active').toLowerCase();
  }

  // Listing type validation
  if (data.listingType && !validateListingType(data.listingType)) {
    errors.push({
      field: 'listingType',
      message: 'Invalid listing type (sale, rent)',
      code: 'INVALID_ENUM',
    });
  } else {
    sanitizedData.listingType = (data.listingType || 'sale').toLowerCase();
  }

  // isPinned validation
  sanitizedData.isPinned = Boolean(data.isPinned);

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData: errors.length === 0 ? sanitizedData : undefined,
  };
}

// Client-side validation for form fields
export function validateFormField(fieldName: string, value: any): ValidationError | null {
  switch (fieldName) {
    case 'title':
      if (!value || typeof value !== 'string') {
        return { field: 'title', message: 'Title is required', code: 'REQUIRED_FIELD' };
      }
      if (value.trim().length < 5) {
        return { field: 'title', message: 'Title must be at least 5 characters', code: 'MIN_LENGTH' };
      }
      if (value.length > 200) {
        return { field: 'title', message: 'Title cannot exceed 200 characters', code: 'MAX_LENGTH' };
      }
      break;

    case 'description':
      if (!value || typeof value !== 'string') {
        return { field: 'description', message: 'Description is required', code: 'REQUIRED_FIELD' };
      }
      if (value.trim().length < 20) {
        return { field: 'description', message: 'Description must be at least 20 characters', code: 'MIN_LENGTH' };
      }
      if (value.length > 2000) {
        return { field: 'description', message: 'Description cannot exceed 2000 characters', code: 'MAX_LENGTH' };
      }
      break;

    case 'price':
      const price = Number(value);
      if (isNaN(price) || price <= 0) {
        return { field: 'price', message: 'Price must be a positive number', code: 'INVALID_NUMBER' };
      }
      if (price > 10000000) {
        return { field: 'price', message: 'Price cannot exceed 10,000,000', code: 'MAX_VALUE' };
      }
      break;

    case 'bathrooms':
      const bathrooms = Number(value);
      if (isNaN(bathrooms) || bathrooms <= 0) {
        return { field: 'bathrooms', message: 'Number of bathrooms must be greater than 0', code: 'INVALID_NUMBER' };
      }
      if (bathrooms > 20) {
        return { field: 'bathrooms', message: 'Number of bathrooms cannot exceed 20', code: 'MAX_VALUE' };
      }
      break;

    case 'squareFootage':
      const sqft = Number(value);
      if (isNaN(sqft) || sqft <= 0) {
        return { field: 'squareFootage', message: 'Square footage must be greater than 0', code: 'INVALID_NUMBER' };
      }
      if (sqft > 50000) {
        return { field: 'squareFootage', message: 'Square footage cannot exceed 50,000', code: 'MAX_VALUE' };
      }
      break;

    default:
      break;
  }

  return null;
}