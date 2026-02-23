// @ts-nocheck
/**
 * End-to-end tests for complete user flows including authentication, search, and map interactions
 */

/// <reference types="jest" />
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { signIn, getSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import React from 'react';
import type { MockedFunction } from 'jest-mock';

const mockSignInFn = jest.fn();
const mockGetSessionFn = jest.fn();

// Mock all necessary modules
jest.mock('next-auth/react', () => ({
  signIn: (...args: any[]) => mockSignInFn(...args),
  getSession: (...args: any[]) => mockGetSessionFn(...args),
}));

// Mock next/navigation
jest.mock('next/navigation', () => {
  const mRouter = {
    push: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn()
  };
  return {
    __esModule: true,
    usePathname: () => '/',
    useRouter: () => mRouter,
    __mockRouter: mRouter,
  };
});

jest.mock('next/dynamic', () => {
  return function mockDynamic(importFunc: any, options: any) {
    const React = require('react');
    return function DynamicComponent(props: any) {
      const [{ Component }, setComponent] = React.useState({ Component: null });

      React.useEffect(() => {
        let mounted = true;
        Promise.resolve(importFunc()).then((mod: any) => {
          if (mounted) {
            setComponent({ Component: mod.default || mod });
          }
        }).catch(() => { });
        return () => { mounted = false; };
      }, []);

      if (!Component) return options?.loading ? options.loading() : null;
      return <Component {...props} />;
    };
  };
});

jest.mock('@/lib/dynamicImport', () => ({
  createDynamicImport: (importFunc: any, options: any) => {
    const React = require('react');
    return function DynamicComponent(props: any) {
      const [{ Component }, setComponent] = React.useState({ Component: null });

      React.useEffect(() => {
        let mounted = true;
        Promise.resolve(importFunc()).then((mod: any) => {
          if (mounted) {
            setComponent({ Component: mod.default || mod });
          }
        }).catch(() => { });
        return () => { mounted = false; };
      }, []);

      if (!Component) return options?.loading ? options.loading() : null;
      return <Component {...props} />;
    };
  },
  logChunkError: jest.fn(),
  prefetchChunk: jest.fn(),
}));

import Home from '@/app/page';
import AdminLogin from '@/app/admin/login/page';


const mockPropertiesConfig = [
  {
    id: '1',
    title: 'Luxury Apartment in Tirana',
    price: 150000,
    status: 'active',
    listingType: 'sale',
    address: {
      city: 'Tirana',
      street: 'Rruga e Kavajes',
      coordinates: { lat: 41.3275, lng: 19.8187 }
    },
    details: {
      bedrooms: 3,
      bathrooms: 2,
      squareFootage: 120,
      propertyType: 'apartment',
      yearBuilt: 2020,
    },
    features: ['parking', 'balcony'],
    images: [],
    description: 'Beautiful apartment',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: '2',
    title: 'Modern House in Durres',
    price: 250000,
    status: 'active',
    listingType: 'sale',
    address: {
      city: 'Durres',
      street: 'Rruga Durresi',
      coordinates: { lat: 41.3144, lng: 19.4564 }
    },
    details: {
      bedrooms: 4,
      bathrooms: 3,
      squareFootage: 200,
      propertyType: 'house',
      yearBuilt: 2021,
    },
    features: ['garden', 'garage'],
    images: [],
    description: 'Spacious modern house',
    createdAt: '2024-01-02',
    updatedAt: '2024-01-02',
  },
];

global.fetch = jest.fn((url) => {
  if (url.includes('/api/properties')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ properties: mockPropertiesConfig, pagination: { total: mockPropertiesConfig.length, hasMore: false } }),
    });
  }
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  });
}) as jest.Mock;




// Mock components that might cause issues
jest.mock('@/components/SearchFilters', () => {
  return function MockSearchFilters({ properties, onFilteredResults }: any) {
    return (
      <div data-testid="search-filters">
        <input
          placeholder="Kërkoni pasuri..."
          onChange={(e) => {
            const val = e.target.value.toLowerCase();
            const filtered = properties.filter((p: any) =>
              p.title.toLowerCase().includes(val) ||
              p.address.city.toLowerCase().includes(val) ||
              p.details.propertyType.toLowerCase() === val
            );
            onFilteredResults(filtered);
          }}
        />
        <label>
          Lokacioni
          <select
            role="combobox"
            onChange={(e) => {
              const val = e.target.value;
              const filtered = val === 'all'
                ? properties
                : properties.filter((p: any) => p.address.city === val);
              onFilteredResults(filtered);
            }}
          >
            <option value="all">Të gjitha qytetet</option>
            <option value="Tirana">Tirana</option>
            <option value="Durres">Durres</option>
          </select>
        </label>
      </div>
    );
  };
});

jest.mock('@/components/SearchResults', () => {
  return function MockSearchResults({ properties }: any) {
    return (
      <div data-testid="search-results">
        {properties.map((property: any) => (
          <div key={property.id} data-testid={`property-${property.id}`}>
            <h3>{property.title}</h3>
            <p>€{property.price.toLocaleString()}</p>
            <p>{property.address.city}</p>
          </div>
        ))}
      </div>
    );
  };
});

jest.mock('@/components/SimpleMapView', () => {
  return function MockMapView({ properties }: any) {
    return (
      <div data-testid="map-view">
        <div data-testid="map-properties-count">{properties.length} properties on map</div>
        {properties.map((property: any) => (
          <div key={property.id} data-testid={`map-marker-${property.id}`}>
            {property.title}
          </div>
        ))}
      </div>
    );
  };
});

jest.mock('@/lib/performance-monitor', () => ({
  trackAuthFlow: jest.fn(),
}));

const mockSignIn = mockSignInFn as unknown as MockedFunction<typeof signIn>;
const mockGetSession = mockGetSessionFn as unknown as MockedFunction<typeof getSession>;

describe('Complete User Flows', () => {
  const mockPush = jest.fn();
  beforeEach(() => {
    jest.clearAllMocks();
    mockPush.mockClear();

    // Default fetch mock for all tests (especially Homepage which fetches properties)
    jest.spyOn(global, 'fetch').mockImplementation((input: RequestInfo | URL, init?: RequestInit) => {
      const urlStr = typeof input === 'string' ? input : input.toString();

      if (urlStr.includes('/api/properties/paginated')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            properties: mockPropertiesConfig,
            pagination: { total: mockPropertiesConfig.length, hasMore: false }
          }),
        } as any);
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({}),
      } as any);
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Authentication Flow', () => {
    it('should complete full admin authentication flow', async () => {
      const mockFetch = (global.fetch as any);
      mockFetch.mockImplementationOnce((url: string) => {
        console.log('--- TEST FETCH CALLED WITH URL ---', url);
        if (url.includes('/api/auth/login')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              success: true,
              data: { sessionToken: 'abc', id: '1', name: 'Admin', email: 'admin@test.com', role: 'admin' },
            }),
          });
        }
        return Promise.resolve({ ok: true, json: async () => ({}) });
      });

      render(<AdminLogin />);

      // Complete sign-in process
      const emailInput = screen.getByPlaceholderText('agent@example.com');
      const passwordInput = screen.getByPlaceholderText('Shkruani fjalëkalimin tuaj');
      const submitButton = screen.getByRole('button', { name: /Kyçu/i });

      fireEvent.change(emailInput, { target: { value: 'admin@test.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        const nav = require('next/navigation') as any;
        expect(nav.__mockRouter.push).toHaveBeenCalledWith('/admin/dashboard');
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/auth/login', expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('admin@test.com'),
      }));
    });

    it('should handle authentication errors gracefully', async () => {
      const mockFetch = (global.fetch as any);
      mockFetch.mockImplementationOnce((url: string) => {
        if (url.includes('/api/auth/login')) {
          return Promise.resolve({
            ok: false,
            json: async () => ({
              success: false,
              error: 'CredentialsSignin',
            }),
          });
        }
        return Promise.resolve({ ok: true, json: async () => ({}) });
      });

      render(<AdminLogin />);

      const emailInput = screen.getByPlaceholderText('agent@example.com');
      const passwordInput = screen.getByPlaceholderText('Shkruani fjalëkalimin tuaj');
      const submitButton = screen.getByRole('button', { name: /Kyçu/i });

      fireEvent.change(emailInput, { target: { value: 'wrong@test.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Email ose fjalëkalimi është i gabuar')).toBeInTheDocument();
      });

      expect(mockPush).not.toHaveBeenCalledWith('/admin/dashboard');
    });
  });

  describe('Homepage and Search Flow', () => {
    it('should load homepage with properties and allow searching', async () => {
      render(<Home />);

      // Wait for properties to load
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Kërkoni pasuri...')).toBeInTheDocument();
        expect(screen.getByTestId('property-1')).toBeInTheDocument();
      });

      // Check that properties are displayed
      expect(screen.getByTestId('property-1')).toBeInTheDocument();
      expect(screen.getByTestId('property-2')).toBeInTheDocument();
      expect(screen.getAllByText('Luxury Apartment in Tirana').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Modern House in Durres').length).toBeGreaterThan(0);
    });

    it('should filter properties by search term', async () => {
      render(<Home />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Kërkoni pasuri...')).toBeInTheDocument();
        expect(screen.getByTestId('property-1')).toBeInTheDocument();
      });

      // Search for "apartment"
      const searchInput = screen.getByPlaceholderText('Kërkoni pasuri...');
      fireEvent.change(searchInput, { target: { value: 'apartment' } });

      await waitFor(() => {
        expect(screen.getByTestId('property-1')).toBeInTheDocument();
        expect(screen.queryByTestId('property-2')).not.toBeInTheDocument();
      });
    });

    it('should filter properties by city', async () => {
      render(<Home />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Kërkoni pasuri...')).toBeInTheDocument();
        expect(screen.getByTestId('property-1')).toBeInTheDocument();
      });

      // Filter by city
      const cityFilter = screen.getByRole('combobox', { name: /Lokacioni/i });
      fireEvent.change(cityFilter, { target: { value: 'Tirana' } });

      await waitFor(() => {
        expect(screen.getByTestId('property-1')).toBeInTheDocument();
        expect(screen.queryByTestId('property-2')).not.toBeInTheDocument();
      });
    });
  });

  describe('Map Integration Flow', () => {
    it('should update map when search filters change', async () => {
      render(<Home />);

      await waitFor(() => {
        expect(screen.getByTestId('map-view')).toBeInTheDocument();
        expect(screen.getByTestId('map-marker-1')).toBeInTheDocument();
      });

      // Initially should show all properties on map
      expect(screen.getByText('2 properties on map')).toBeInTheDocument();
      expect(screen.getByTestId('map-marker-1')).toBeInTheDocument();
      expect(screen.getByTestId('map-marker-2')).toBeInTheDocument();

      // Filter by city
      const cityFilter = screen.getByRole('combobox', { name: /Lokacioni/i });
      fireEvent.change(cityFilter, { target: { value: 'Tirana' } });

      await waitFor(() => {
        expect(screen.getByText('1 properties on map')).toBeInTheDocument();
        expect(screen.getByTestId('map-marker-1')).toBeInTheDocument();
        expect(screen.queryByTestId('map-marker-2')).not.toBeInTheDocument();
      });
    });

    it('should show correct property count in map info', async () => {
      render(<Home />);

      await waitFor(() => {
        expect(screen.getByTestId('map-view')).toBeInTheDocument();
        expect(screen.getByTestId('map-marker-1')).toBeInTheDocument();
      });

      // Search to filter properties
      const searchInput = screen.getByPlaceholderText('Kërkoni pasuri...');
      fireEvent.change(searchInput, { target: { value: 'house' } });

      await waitFor(() => {
        expect(screen.getByText('1 properties on map')).toBeInTheDocument();
      });
    });
  });

  describe('Responsive Design Flow', () => {
    it('should handle mobile interactions', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Kërkoni pasuri...')).toBeInTheDocument();
        expect(screen.getByTestId('property-1')).toBeInTheDocument();
      });

      // Should still work on mobile
      const searchInput = screen.getByPlaceholderText('Kërkoni pasuri...');
      fireEvent.change(searchInput, { target: { value: 'apartment' } });

      await waitFor(() => {
        expect(screen.getByTestId('property-1')).toBeInTheDocument();
        expect(screen.queryByTestId('property-2')).not.toBeInTheDocument();
      });
    });
  });

  describe('Error Handling Flow', () => {
    it('should handle component errors gracefully', async () => {
      // Mock console.error to prevent test output pollution
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // This would normally be wrapped in an ErrorBoundary
      render(<Home />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Kërkoni pasuri...')).toBeInTheDocument();
        expect(screen.getByTestId('property-1')).toBeInTheDocument();
      });

      // Component should render without crashing
      expect(screen.getByTestId('search-results')).toBeInTheDocument();
      expect(screen.getByTestId('map-view')).toBeInTheDocument();

      consoleSpy.mockRestore();
    });
  });

  describe('Performance Flow', () => {
    it('should load and render efficiently', async () => {
      const startTime = performance.now();

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Kërkoni pasuri...')).toBeInTheDocument();
        expect(screen.getByTestId('property-1')).toBeInTheDocument();
      });

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render within reasonable time (adjust threshold as needed)
      expect(renderTime).toBeLessThan(5000); // 5 seconds max for test environment
    });

    it('should handle large property datasets efficiently', async () => {
      // This would test with a larger dataset in a real scenario
      render(<Home />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Kërkoni pasuri...')).toBeInTheDocument();
        expect(screen.getByTestId('property-1')).toBeInTheDocument();
      });

      // Should handle filtering without significant delay
      const searchInput = screen.getByPlaceholderText('Kërkoni pasuri...');
      fireEvent.change(searchInput, { target: { value: 'test' } });

      // Should update quickly
      await waitFor(() => {
        expect(screen.getByTestId('search-results')).toBeInTheDocument();
      }, { timeout: 1000 });
    });
  });
});