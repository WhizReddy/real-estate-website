import {
  sanitizeHtml,
  sanitizeString,
  isValidEmail,
  isValidPhone,
  isValidPrice,
  isValidCoordinates,
  isValidImageFile,
  sanitizePropertyData,
  sanitizeInquiryData,
} from '../security';

describe('Security utilities', () => {
  describe('sanitizeHtml', () => {
    it('should sanitize HTML characters', () => {
      const input = '<script>alert("xss")</script>';
      const result = sanitizeHtml(input);
      expect(result).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;');
    });

    it('should handle empty input', () => {
      expect(sanitizeHtml('')).toBe('');
      expect(sanitizeHtml(null as any)).toBe('');
    });
  });

  describe('sanitizeString', () => {
    it('should remove control characters', () => {
      const input = 'Hello\x00World\x1F';
      const result = sanitizeString(input);
      expect(result).toBe('HelloWorld');
    });

    it('should trim whitespace', () => {
      const input = '  Hello World  ';
      const result = sanitizeString(input);
      expect(result).toBe('Hello World');
    });
  });

  describe('isValidEmail', () => {
    it('should validate correct email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('@domain.com')).toBe(false);
    });
  });

  describe('isValidPhone', () => {
    it('should validate Albanian phone numbers', () => {
      expect(isValidPhone('+355 69 123 4567')).toBe(true);
      expect(isValidPhone('069 123 4567')).toBe(true);
      expect(isValidPhone('(069) 123-4567')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(isValidPhone('123')).toBe(false);
      expect(isValidPhone('abc')).toBe(false);
    });
  });

  describe('isValidPrice', () => {
    it('should validate reasonable prices', () => {
      expect(isValidPrice(100000)).toBe(true);
      expect(isValidPrice(50000)).toBe(true);
    });

    it('should reject invalid prices', () => {
      expect(isValidPrice(0)).toBe(false);
      expect(isValidPrice(-1000)).toBe(false);
      expect(isValidPrice(20000000)).toBe(false);
    });
  });

  describe('isValidCoordinates', () => {
    it('should validate correct coordinates', () => {
      expect(isValidCoordinates(41.3275, 19.8187)).toBe(true);
      expect(isValidCoordinates(0, 0)).toBe(true);
    });

    it('should reject invalid coordinates', () => {
      expect(isValidCoordinates(91, 0)).toBe(false);
      expect(isValidCoordinates(0, 181)).toBe(false);
      expect(isValidCoordinates(-91, 0)).toBe(false);
    });
  });

  describe('isValidImageFile', () => {
    it('should validate correct image files', () => {
      const validFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
      Object.defineProperty(validFile, 'size', { value: 1024 * 1024 }); // 1MB
      
      const result = isValidImageFile(validFile);
      expect(result.valid).toBe(true);
    });

    it('should reject invalid file types', () => {
      const invalidFile = new File([''], 'test.txt', { type: 'text/plain' });
      
      const result = isValidImageFile(invalidFile);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('nuk është i lejuar');
    });

    it('should reject files that are too large', () => {
      const largeFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
      Object.defineProperty(largeFile, 'size', { value: 10 * 1024 * 1024 }); // 10MB
      
      const result = isValidImageFile(largeFile);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('shumë i madh');
    });
  });

  describe('sanitizePropertyData', () => {
    it('should sanitize property data', () => {
      const input = {
        title: '<script>alert("xss")</script>',
        description: 'Normal description\x00',
        address: {
          street: 'Main Street\x1F',
          city: 'Tirana',
        },
        features: ['Feature 1\x00', 'Feature 2'],
      };

      const result = sanitizePropertyData(input);
      
      expect(result.title).toBe('alert("xss")');
      expect(result.description).toBe('Normal description');
      expect(result.address.street).toBe('Main Street');
      expect(result.features).toEqual(['Feature 1', 'Feature 2']);
    });
  });

  describe('sanitizeInquiryData', () => {
    it('should sanitize inquiry data', () => {
      const input = {
        name: 'John Doe\x00',
        email: 'john@example.com',
        phone: '+355 69 123 4567\x1F',
        message: 'Hello world\x00',
      };

      const result = sanitizeInquiryData(input);
      
      expect(result.name).toBe('John Doe');
      expect(result.email).toBe('john@example.com');
      expect(result.phone).toBe('+355 69 123 4567');
      expect(result.message).toBe('Hello world');
    });
  });
});