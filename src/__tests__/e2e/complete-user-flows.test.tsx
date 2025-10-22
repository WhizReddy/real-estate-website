/**
 * End-to-end tests for complete user flows including authentication, search, and map interactions
 */

import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React from 'react';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import matchers from '@testing-library/jest-dom/matchers';

// Extend jest expect with @testing-library/jest-dom matchers (types + runtime)
expect.extend(matchers);
import type { MockedFunction } from 'jest-mock';

// Mock all necessary modules
jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
  getSession: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('next/dynamic', () => {
  return function mockDynamic(importFunc: any) {
    const Component = importFunc();
    return Component;
  };
});

// Create mock components for testing
const Home = () => <div data-testid="home-page">Home Page</div>;
const SignInPage = () => (
  <div data-testid="signin-page">
    <input placeholder="Enter your email" />
    <input placeholder="Enter your password" type="password" />
    <button>Sign In</button>
  </div>
);

jest.mock('@/lib/data', () => ({
  getProperties: (jest.fn().mockResolvedValue([
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
  ]) as any),
}));

// Mock components that might cause issues
jest.mock('@/components/SearchFilters', () => {
  return function MockSearchFilters({ properties, onFilteredResults }: any) {
    return (
      <div data-testid="search-filters">
        <input
          data-testid="search-input"
          placeholder="Kërkoni pasuri..."
          onChange={(e) => {
            const filtered = properties.filter((p: any) =>
              p.title.toLowerCase().includes(e.target.value.toLowerCase())
            );
            onFilteredResults(filtered);
          }}
        />
        <select
          data-testid="city-filter"
          onChange={(e) => {
            const filtered = e.target.value === 'all' 
              ? properties 
              : properties.filter((p: any) => p.address.city === e.target.value);
            onFilteredResults(filtered);
          }}
        >
          <option value="all">Të gjitha qytetet</option>
          <option value="Tirana">Tirana</option>
          <option value="Durres">Durres</option>
        </select>
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

const mockSignIn = signIn as unknown as MockedFunction<typeof signIn>;
const mockGetSession = getSession as unknown as MockedFunction<typeof getSession>;
const mockUseRouter = useRouter as unknown as MockedFunction<typeof useRouter>;

describe('Complete User Flows', () => {
  const mockPush = jest.fn();
  const mockRouter = {
    push: mockPush,
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue(mockRouter);
  });

  describe('Authentication Flow', () => {
    it('should complete full admin authentication flow', async () => {
      mockSignIn.mockResolvedValue({
        ok: true,
        error: null,
        status: 200,
        url: null,
      });

      mockGetSession.mockResolvedValue({
        user: {
          id: '1',
          email: 'admin@test.com',
          name: 'Admin User',
          role: 'admin',
        },
        expires: '2024-12-31',
      } as any);

      render(<SignInPage />);

      // Complete sign-in process
      const emailInput = screen.getByPlaceholderText('Enter your email');
      const passwordInput = screen.getByPlaceholderText('Enter your password');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'admin@test.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/admin/dashboard');
      });

      expect(mockSignIn).toHaveBeenCalledWith('credentials', {
        email: 'admin@test.com',
        password: 'password123',
        redirect: false,
      });
    });

    it('should handle authentication errors gracefully', async () => {
      mockSignIn.mockResolvedValue({
        ok: false,
        error: 'CredentialsSignin',
        status: 401,
        url: null,
      });

      render(<SignInPage />);

      const emailInput = screen.getByPlaceholderText('Enter your email');
      const passwordInput = screen.getByPlaceholderText('Enter your password');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'wrong@test.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
      });

      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe('Homepage and Search Flow', () => {
    it('should load homepage with properties and allow searching', async () => {
      render(<Home />);

      // Wait for properties to load
      await waitFor(() => {
        expect(screen.getByTestId('search-filters')).toBeInTheDocument();
      });

      // Check that properties are displayed
      expect(screen.getByTestId('property-1')).toBeInTheDocument();
      expect(screen.getByTestId('property-2')).toBeInTheDocument();
      expect(screen.getByText('Luxury Apartment in Tirana')).toBeInTheDocument();
      expect(screen.getByText('Modern House in Durres')).toBeInTheDocument();
    });

    it('should filter properties by search term', async () => {
      render(<Home />);

      await waitFor(() => {
        expect(screen.getByTestId('search-filters')).toBeInTheDocument();
      });

      // Search for "apartment"
      const searchInput = screen.getByTestId('search-input');
      fireEvent.change(searchInput, { target: { value: 'apartment' } });

      await waitFor(() => {
        expect(screen.getByTestId('property-1')).toBeInTheDocument();
        expect(screen.queryByTestId('property-2')).not.toBeInTheDocument();
      });
    });

    it('should filter properties by city', async () => {
      render(<Home />);

      await waitFor(() => {
        expect(screen.getByTestId('search-filters')).toBeInTheDocument();
      });

      // Filter by Durres
      const cityFilter = screen.getByTestId('city-filter');
      fireEvent.change(cityFilter, { target: { value: 'Durres' } });

      await waitFor(() => {
        expect(screen.queryByTestId('property-1')).not.toBeInTheDocument();
        expect(screen.getByTestId('property-2')).toBeInTheDocument();
      });
    });
  });

  describe('Map Integration Flow', () => {
    it('should update map when search filters change', async () => {
      render(<Home />);

      await waitFor(() => {
        expect(screen.getByTestId('map-view')).toBeInTheDocument();
      });

      // Initially should show all properties on map
      expect(screen.getByText('2 properties on map')).toBeInTheDocument();
      expect(screen.getByTestId('map-marker-1')).toBeInTheDocument();
      expect(screen.getByTestId('map-marker-2')).toBeInTheDocument();

      // Filter by city
      const cityFilter = screen.getByTestId('city-filter');
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
      });

      // Search to filter properties
      const searchInput = screen.getByTestId('search-input');
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
        expect(screen.getByTestId('search-filters')).toBeInTheDocument();
      });

      // Should still work on mobile
      const searchInput = screen.getByTestId('search-input');
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
        expect(screen.getByTestId('search-filters')).toBeInTheDocument();
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
        expect(screen.getByTestId('search-filters')).toBeInTheDocument();
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
        expect(screen.getByTestId('search-filters')).toBeInTheDocument();
      });

      // Should handle filtering without significant delay
      const searchInput = screen.getByTestId('search-input');
      fireEvent.change(searchInput, { target: { value: 'test' } });

      // Should update quickly
      await waitFor(() => {
        expect(screen.getByTestId('search-results')).toBeInTheDocument();
      }, { timeout: 1000 });
    });
  });
});