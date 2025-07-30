import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import PropertyCard from '@/components/PropertyCard';
import { Property } from '@/types';

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

describe('PropertyCard', () => {
  it('renders property information correctly', () => {
    render(<PropertyCard property={mockProperty} />);
    
    expect(screen.getByText('Test Property')).toBeInTheDocument();
    expect(screen.getByText('A beautiful test property')).toBeInTheDocument();
    expect(screen.getByText('€150,000')).toBeInTheDocument();
    expect(screen.getByText('Test Street 123, Test City')).toBeInTheDocument();
  });

  it('displays property details correctly', () => {
    render(<PropertyCard property={mockProperty} />);
    
    expect(screen.getByText('2')).toBeInTheDocument(); // bedrooms
    expect(screen.getByText('1')).toBeInTheDocument(); // bathrooms
    expect(screen.getByText('85m²')).toBeInTheDocument(); // square footage
  });

  it('shows agent information', () => {
    render(<PropertyCard property={mockProperty} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Real Estate Agent')).toBeInTheDocument();
  });

  it('renders property type and listing type badges', () => {
    render(<PropertyCard property={mockProperty} />);
    
    expect(screen.getByText('Apartament')).toBeInTheDocument();
    expect(screen.getByText('Për Shitje')).toBeInTheDocument();
  });

  it('shows pinned badge when property is pinned', () => {
    const pinnedProperty = { ...mockProperty, isPinned: true };
    render(<PropertyCard property={pinnedProperty} />);
    
    expect(screen.getByText('I Zgjedhur')).toBeInTheDocument();
  });

  it('handles agent contact clicks', () => {
    // Mock window.location
    delete (window as any).location;
    window.location = { href: '' } as any;

    render(<PropertyCard property={mockProperty} />);
    
    const phoneLink = screen.getByTitle('Call agent');
    const emailLink = screen.getByTitle('Email agent');
    
    fireEvent.click(phoneLink);
    expect(window.location.href).toBe('tel:+1234567890');
    
    fireEvent.click(emailLink);
    expect(window.location.href).toBe('mailto:john@test.com');
  });

  it('renders fallback when no image is provided', () => {
    const propertyWithoutImage = { ...mockProperty, images: [] };
    render(<PropertyCard property={propertyWithoutImage} />);
    
    expect(screen.getByText('Nuk ka imazh')).toBeInTheDocument();
  });

  it('applies correct CSS classes for hover effects', () => {
    const { container } = render(<PropertyCard property={mockProperty} />);
    
    const card = container.querySelector('.group');
    expect(card).toHaveClass('hover:shadow-2xl', 'transition-all', 'duration-500');
  });
});