import { formatPrice, formatAddress, formatDate } from '@/lib/utils';

describe('Utility Functions', () => {
  describe('formatPrice', () => {
    it('formats prices correctly in euros', () => {
      expect(formatPrice(150000)).toBe('€150,000');
      expect(formatPrice(1200)).toBe('€1,200');
      expect(formatPrice(50)).toBe('€50');
    });

    it('handles zero and negative prices', () => {
      expect(formatPrice(0)).toBe('€0');
      expect(formatPrice(-1000)).toBe('€-1,000');
    });

    it('handles large numbers', () => {
      expect(formatPrice(1000000)).toBe('€1,000,000');
      expect(formatPrice(2500000)).toBe('€2,500,000');
    });
  });

  describe('formatAddress', () => {
    const mockAddress = {
      street: 'Main Street 123',
      city: 'Tirana',
      state: 'Tirana',
      zipCode: '1001',
      coordinates: { lat: 41.3275, lng: 19.8187 }
    };

    it('formats address correctly', () => {
      expect(formatAddress(mockAddress)).toBe('Main Street 123, Tirana');
    });

    it('handles missing street', () => {
      const addressWithoutStreet = { ...mockAddress, street: '' };
      expect(formatAddress(addressWithoutStreet)).toBe('Tirana');
    });

    it('handles missing city', () => {
      const addressWithoutCity = { ...mockAddress, city: '' };
      expect(formatAddress(addressWithoutCity)).toBe('Main Street 123');
    });

    it('handles both missing street and city', () => {
      const emptyAddress = { ...mockAddress, street: '', city: '' };
      expect(formatAddress(emptyAddress)).toBe('');
    });
  });

  describe('formatDate', () => {
    it('formats ISO date strings correctly', () => {
      const date = '2024-01-15T10:00:00.000Z';
      const formatted = formatDate(date);
      expect(formatted).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/); // MM/DD/YYYY or DD/MM/YYYY format
    });

    it('handles Date objects', () => {
      const date = new Date('2024-01-15T10:00:00.000Z');
      const formatted = formatDate(date);
      expect(formatted).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
    });

    it('handles invalid dates gracefully', () => {
      expect(formatDate('invalid-date')).toBe('Invalid Date');
      expect(formatDate('')).toBe('Invalid Date');
    });

    it('formats with custom locale', () => {
      const date = '2024-01-15T10:00:00.000Z';
      const formatted = formatDate(date, 'en-US');
      expect(formatted).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
    });
  });
});