import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { axe, toHaveNoViolations } from 'jest-axe';
import PropertyCard from '@/components/PropertyCard';
import SearchFilters from '@/components/SearchFilters';
import { Property } from '@/types';

expect.extend(toHaveNoViolations);

// Mock Next.js components
jest.mock('next/image', () => {
  return function MockImage({ src, alt, ...props }: any) {
    return <img src={src} alt={alt} {...props} />;
  };
});

jest.mock('next/link', () => {
  return function MockLink({ children, href, ...props }: any) {
    return <a href={href} {...props}>{children}</a>;
  };
});

const mockProperty: Property = {
  id: 'test-property-1',
  title: 'Test Property',
  description: 'A beautiful test property',
  price: 150000,
  address: {
    street: 'Test Street 123',
    city: 'Test City',
    state: 'Test State',
    zipCode: '12345',
    coordinates: { lat: 41.3275, lng: 19.8187 }
  },
  details: {
    bedrooms: 2,
    bathrooms: 1,
    squareFootage: 85,
    propertyType: 'apartment',
    yearBuilt: 2020
  },
  images: ['/test-image.jpg'],
  features: ['parking', 'balcony'],
  status: 'active',
  listingType: 'sale',
  isPinned: false,
  agent: {
    id: 'agent-1',
    name: 'John Doe',
    email: 'john@test.com',
    phone: '+1234567890'
  },
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z'
};

describe('Accessibility Tests', () => {
  describe('PropertyCard Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(<PropertyCard property={mockProperty} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has proper heading structure', () => {
      render(<PropertyCard property={mockProperty} />);
      
      // Property title should be a heading
      const heading = screen.getByRole('heading', { name: /test property/i });
      expect(heading).toBeInTheDocument();
    });

    it('has proper link accessibility', () => {
      render(<PropertyCard property={mockProperty} />);
      
      // Main property link should be accessible
      const propertyLink = screen.getByRole('link');
      expect(propertyLink).toHaveAttribute('href', '/properties/test-property-1');
    });

    it('has proper button accessibility for agent contact', () => {
      render(<PropertyCard property={mockProperty} />);
      
      // Agent contact buttons should have proper titles
      const phoneButton = screen.getByTitle('Call agent');
      const emailButton = screen.getByTitle('Email agent');
      
      expect(phoneButton).toBeInTheDocument();
      expect(emailButton).toBeInTheDocument();
    });

    it('has proper image alt text', () => {
      render(<PropertyCard property={mockProperty} />);
      
      const image = screen.getByAltText('Test Property');
      expect(image).toBeInTheDocument();
    });
  });

  describe('SearchFilters Accessibility', () => {
    const mockOnFilteredResults = jest.fn();

    it('should not have accessibility violations', async () => {
      const { container } = render(
        <SearchFilters 
          properties={[mockProperty]} 
          onFilteredResults={mockOnFilteredResults} 
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has proper form labels', () => {
      render(
        <SearchFilters 
          properties={[mockProperty]} 
          onFilteredResults={mockOnFilteredResults} 
        />
      );
      
      // Search input should have proper labeling
      const searchInput = screen.getByRole('textbox', { name: /search properties/i });
      expect(searchInput).toBeInTheDocument();
    });

    it('has proper button accessibility', () => {
      render(
        <SearchFilters 
          properties={[mockProperty]} 
          onFilteredResults={mockOnFilteredResults} 
        />
      );
      
      // Advanced filters button should have proper ARIA attributes
      const expandButton = screen.getByRole('button', { name: /advanced filters/i });
      expect(expandButton).toHaveAttribute('aria-expanded', 'false');
      expect(expandButton).toHaveAttribute('aria-controls', 'advanced-filters');
    });

    it('has proper select accessibility', () => {
      render(
        <SearchFilters 
          properties={[mockProperty]} 
          onFilteredResults={mockOnFilteredResults} 
        />
      );
      
      // Sort select should be accessible
      const sortSelect = screen.getByDisplayValue('Renditja');
      expect(sortSelect).toBeInTheDocument();
      expect(sortSelect.tagName).toBe('SELECT');
    });

    it('has proper checkbox accessibility', () => {
      render(
        <SearchFilters 
          properties={[mockProperty]} 
          onFilteredResults={mockOnFilteredResults} 
        />
      );
      
      // Expand filters to show checkboxes
      const expandButton = screen.getByRole('button', { name: /advanced filters/i });
      expandButton.click();
      
      // Property type checkboxes should be accessible
      const apartmentCheckbox = screen.getByRole('checkbox', { name: /apartament/i });
      expect(apartmentCheckbox).toBeInTheDocument();
    });

    it('has proper region labeling for advanced filters', () => {
      render(
        <SearchFilters 
          properties={[mockProperty]} 
          onFilteredResults={mockOnFilteredResults} 
        />
      );
      
      // Expand filters
      const expandButton = screen.getByRole('button', { name: /advanced filters/i });
      expandButton.click();
      
      // Advanced filters region should be properly labeled
      const filtersRegion = screen.getByRole('region', { name: /advanced search filters/i });
      expect(filtersRegion).toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation', () => {
    it('PropertyCard is keyboard accessible', () => {
      render(<PropertyCard property={mockProperty} />);
      
      const propertyLink = screen.getByRole('link');
      expect(propertyLink).toBeInTheDocument();
      
      // Link should be focusable
      propertyLink.focus();
      expect(propertyLink).toHaveFocus();
    });

    it('SearchFilters controls are keyboard accessible', () => {
      render(
        <SearchFilters 
          properties={[mockProperty]} 
          onFilteredResults={jest.fn()} 
        />
      );
      
      const searchInput = screen.getByRole('textbox');
      const expandButton = screen.getByRole('button');
      
      // Elements should be focusable
      searchInput.focus();
      expect(searchInput).toHaveFocus();
      
      expandButton.focus();
      expect(expandButton).toHaveFocus();
    });
  });

  describe('Screen Reader Support', () => {
    it('provides proper context for property information', () => {
      render(<PropertyCard property={mockProperty} />);
      
      // Important information should be accessible to screen readers
      expect(screen.getByText('Test Property')).toBeInTheDocument();
      expect(screen.getByText('€150,000')).toBeInTheDocument();
      expect(screen.getByText('Test Street 123, Test City')).toBeInTheDocument();
    });

    it('provides proper context for search filters', () => {
      render(
        <SearchFilters 
          properties={[mockProperty]} 
          onFilteredResults={jest.fn()} 
        />
      );
      
      // Search input should have proper labeling for screen readers
      const searchInput = screen.getByLabelText(/search properties/i);
      expect(searchInput).toBeInTheDocument();
    });
  });
});