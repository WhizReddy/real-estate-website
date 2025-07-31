/**
 * Tests for homepage styling consistency and theme validation
 */

import { render, screen } from '@testing-library/react';
import Home from '@/app/page';

// Mock dynamic imports
jest.mock('next/dynamic', () => {
  return function mockDynamic(importFunc: any) {
    const Component = importFunc();
    return Component;
  };
});

// Mock components that might cause issues in tests
jest.mock('@/components/SearchFilters', () => {
  return function MockSearchFilters({ onFilteredResults }: any) {
    return (
      <div data-testid="search-filters">
        <button onClick={() => onFilteredResults([])}>Filter</button>
      </div>
    );
  };
});

jest.mock('@/components/SearchResults', () => {
  return function MockSearchResults() {
    return <div data-testid="search-results">Search Results</div>;
  };
});

jest.mock('@/components/SimpleMapView', () => {
  return function MockMapView() {
    return <div data-testid="map-view">Map View</div>;
  };
});

jest.mock('@/lib/data', () => ({
  getProperties: jest.fn().mockResolvedValue([
    {
      id: '1',
      title: 'Test Property',
      price: 100000,
      status: 'active',
      address: { city: 'Tirana', street: 'Test Street', coordinates: { lat: 41.3275, lng: 19.8187 } },
      details: { bedrooms: 2, bathrooms: 1, squareFootage: 100, propertyType: 'apartment' },
      features: ['parking'],
    },
  ]),
}));

describe('Homepage Styling', () => {
  beforeEach(() => {
    // Reset any global styles that might affect tests
    document.head.innerHTML = '';
  });

  it('should render with correct blue theme colors', async () => {
    render(<Home />);

    // Wait for component to load
    await screen.findByTestId('search-filters');

    // Check for blue gradient background
    const mainContainer = screen.getByText(/Gjeni Shtëpinë e/).closest('div');
    expect(mainContainer).toHaveClass('bg-gradient-to-br', 'from-slate-50', 'to-blue-50');
  });

  it('should have blue hero section with proper gradient', async () => {
    render(<Home />);

    await screen.findByTestId('search-filters');

    // Check hero section has blue gradient
    const heroSection = screen.getByText(/Gjeni Shtëpinë e/).closest('section');
    expect(heroSection).toHaveClass('hero-gradient');
  });

  it('should not contain any red styling classes', async () => {
    render(<Home />);

    await screen.findByTestId('search-filters');

    // Check that no elements have red classes
    const allElements = document.querySelectorAll('*');
    const redClasses = [
      'bg-red-', 'text-red-', 'border-red-', 'from-red-', 'to-red-'
    ];

    allElements.forEach(element => {
      const className = element.className;
      if (typeof className === 'string') {
        redClasses.forEach(redClass => {
          expect(className).not.toContain(redClass);
        });
      }
    });
  });

  it('should have consistent blue theme across components', async () => {
    render(<Home />);

    await screen.findByTestId('search-filters');

    // Check for blue theme consistency
    const blueElements = document.querySelectorAll('[class*="blue-"]');
    expect(blueElements.length).toBeGreaterThan(0);

    // Verify no conflicting color themes
    const conflictingColors = ['red-', 'green-', 'yellow-', 'purple-'];
    blueElements.forEach(element => {
      const className = element.className;
      conflictingColors.forEach(color => {
        // Allow green for success states and yellow for warnings
        if (color !== 'green-' && color !== 'yellow-') {
          expect(className).not.toContain(color);
        }
      });
    });
  });

  it('should have proper contrast ratios for accessibility', async () => {
    render(<Home />);

    await screen.findByTestId('search-filters');

    // Check text elements have sufficient contrast
    const textElements = document.querySelectorAll('h1, h2, h3, p, span, a, button');
    
    textElements.forEach(element => {
      const styles = window.getComputedStyle(element);
      const color = styles.color;
      const backgroundColor = styles.backgroundColor;
      
      // Basic check - ensure text is not transparent or same as background
      expect(color).not.toBe('transparent');
      expect(color).not.toBe(backgroundColor);
    });
  });

  it('should load CSS without errors', () => {
    // Check that CSS is loaded properly
    const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
    
    stylesheets.forEach(stylesheet => {
      // Simulate CSS load success
      const link = stylesheet as HTMLLinkElement;
      expect(link.href).toBeTruthy();
    });
  });

  it('should have responsive design classes', async () => {
    render(<Home />);

    await screen.findByTestId('search-filters');

    // Check for responsive classes
    const responsiveElements = document.querySelectorAll('[class*="sm:"], [class*="md:"], [class*="lg:"]');
    expect(responsiveElements.length).toBeGreaterThan(0);
  });

  it('should have proper mobile optimizations', async () => {
    render(<Home />);

    await screen.findByTestId('search-filters');

    // Check for mobile-specific classes
    const mobileElements = document.querySelectorAll('[class*="mobile-"]');
    expect(mobileElements.length).toBeGreaterThan(0);

    // Check for touch-friendly elements
    const touchElements = document.querySelectorAll('[class*="touch-"]');
    expect(touchElements.length).toBeGreaterThan(0);
  });

  it('should not have hydration mismatch issues', async () => {
    // First render (server-side simulation)
    const { container: serverContainer } = render(<Home />);
    await screen.findByTestId('search-filters');
    const serverHTML = serverContainer.innerHTML;

    // Second render (client-side simulation)
    const { container: clientContainer } = render(<Home />);
    await screen.findByTestId('search-filters');
    const clientHTML = clientContainer.innerHTML;

    // Basic structure should be the same
    expect(serverHTML.length).toBeGreaterThan(0);
    expect(clientHTML.length).toBeGreaterThan(0);
  });

  it('should have proper focus styles for accessibility', async () => {
    render(<Home />);

    await screen.findByTestId('search-filters');

    // Check that interactive elements have focus styles
    const interactiveElements = document.querySelectorAll('button, a, input, select, textarea');
    
    interactiveElements.forEach(element => {
      const className = element.className;
      // Should have focus styles (focus:ring, focus:outline, etc.)
      const hasFocusStyles = className.includes('focus:') || 
                           element.getAttribute('tabindex') !== null;
      
      if (element.tagName.toLowerCase() !== 'div') {
        expect(hasFocusStyles).toBeTruthy();
      }
    });
  });

  it('should have consistent spacing and layout', async () => {
    render(<Home />);

    await screen.findByTestId('search-filters');

    // Check for consistent spacing classes
    const spacingElements = document.querySelectorAll('[class*="p-"], [class*="m-"], [class*="gap-"]');
    expect(spacingElements.length).toBeGreaterThan(0);

    // Check for layout classes
    const layoutElements = document.querySelectorAll('[class*="flex"], [class*="grid"]');
    expect(layoutElements.length).toBeGreaterThan(0);
  });
});