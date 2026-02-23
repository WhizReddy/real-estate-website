import { getProperties, getActiveProperties, getPinnedProperties, getProperty } from '@/lib/data';

// Mock fetch
global.fetch = jest.fn();

describe('Data Functions', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  describe('getProperties', () => {
    it('fetches properties from API successfully', async () => {
      const mockProperties = [
        { id: '1', title: 'Test Property 1', status: 'active' },
        { id: '2', title: 'Test Property 2', status: 'sold' }
      ];

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ properties: mockProperties })
      });

      const result = await getProperties();
      expect(result).toEqual(mockProperties);
      expect(fetch).toHaveBeenCalledWith('/api/properties', { cache: 'no-store' });
    });

    it('throws error when API fails', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

      await expect(getProperties()).rejects.toThrow('API Error');
    });

    it('throws error when API returns non-OK response', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });

      await expect(getProperties()).rejects.toThrow('Failed to fetch properties: 500');
    });
  });

  describe('getActiveProperties', () => {
    it('filters only active properties', async () => {
      const mockProperties = [
        { id: '1', title: 'Active Property', status: 'active' }
      ];

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ properties: mockProperties })
      });

      const result = await getActiveProperties();
      expect(result).toHaveLength(1);
      expect(result[0].status).toBe('active');
    });
  });

  describe('getPinnedProperties', () => {
    it('filters only pinned active properties', async () => {
      const mockProperties = [
        { id: '1', title: 'Pinned Active', status: 'active', isPinned: true },
        { id: '2', title: 'Not Pinned Active', status: 'active', isPinned: false }
      ];

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ properties: mockProperties })
      });

      const result = await getPinnedProperties();
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
      expect(result[0].isPinned).toBe(true);
      expect(result[0].status).toBe('active');
    });
  });

  describe('getProperty', () => {
    it('fetches single property from API successfully', async () => {
      const mockProperty = { id: '1', title: 'Test Property' };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockProperty
      });

      const result = await getProperty('1');
      expect(result).toEqual(mockProperty);
      expect(fetch).toHaveBeenCalledWith('/api/properties/1', { cache: 'no-store' });
    });

    it('returns null when property not found', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404
      });

      const result = await getProperty('nonexistent');
      expect(result).toBeNull();
    });

    it('throws error when API fails', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

      await expect(getProperty('prop-001')).rejects.toThrow('API Error');
    });
  });
});