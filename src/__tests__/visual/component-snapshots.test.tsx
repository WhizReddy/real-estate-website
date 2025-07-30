import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock Next.js components
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: any) => <img src={src} alt={alt} {...props} />,
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    pathname: '/',
  }),
  usePathname: () => '/',
}));

// Import components for snapshot testing
import PropertyCard from '../../components/PropertyCard';
import SearchFilters from '../../components/SearchFilters';
import MobileNavigation from '../../components/MobileNavigation';
import ResponsiveLayout from '../../components/ResponsiveLayout';

const mockProperty = {
  id: 1,
  title: 'Beautiful Modern Home',
  price: 850000,
  location: 'San Francisco, CA',
  coordinates: { lat: 37.7749, lng: -122.4194 },
  image: '/images/property-1.jpg',
  beds: 3,
  baths: 2,
  sqft: 2200,
  type: 'House',
  description: 'A stunning modern home with great views',
  features: ['Pool', 'Garage', 'Garden'],
  yearBuilt: 2020,
  status: 'active',
};

const mockNavigationItems = [
  { href: '/', label: 'Home', icon: 'Home' },
  { href: '/properties', label: 'Properties', icon: 'Building' },
  { href: '/map', label: 'Map', icon: 'Map' },
  { href: '/contact', label: 'Contact', icon: 'Phone' },
];

describe('Component Visual Regression Tests', () => {
  beforeEach(() => {
    // Mock window.matchMedia for responsive components
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  });

  describe('PropertyCard Component', () => {
    it('renders property card with all information', () => {
      const { container } = render(<PropertyCard property={mockProperty} />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders property card in loading state', () => {
      const { container } = render(<PropertyCard property={mockProperty} loading />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders property card with favorite state', () => {
      const { container } = render(
        <PropertyCard property={mockProperty} isFavorite />
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders property card in compact mode', () => {
      const { container } = render(
        <PropertyCard property={mockProperty} compact />
      );
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('SearchFilters Component', () => {
    it('renders search filters with default state', () => {
      const { container } = render(
        <SearchFilters onFiltersChange={jest.fn()} />
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders search filters with applied filters', () => {
      const appliedFilters = {
        minPrice: 500000,
        maxPrice: 1000000,
        type: 'house',
        beds: 3,
        baths: 2,
      };
      
      const { container } = render(
        <SearchFilters 
          onFiltersChange={jest.fn()} 
          initialFilters={appliedFilters}
        />
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders search filters in mobile layout', () => {
      // Mock mobile screen
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query.includes('max-width'),
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });

      const { container } = render(
        <SearchFilters onFiltersChange={jest.fn()} />
      );
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('MobileNavigation Component', () => {
    it('renders mobile navigation in closed state', () => {
      const { container } = render(
        <MobileNavigation items={mockNavigationItems} />
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders mobile navigation with custom logo', () => {
      const customLogo = <div className="text-xl font-bold">Custom Logo</div>;
      
      const { container } = render(
        <MobileNavigation items={mockNavigationItems} logo={customLogo} />
      );
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('ResponsiveLayout Component', () => {
    it('renders responsive layout with sidebar', () => {
      const sidebar = (
        <div className="p-4">
          <h3>Sidebar Content</h3>
          <ul>
            <li>Item 1</li>
            <li>Item 2</li>
          </ul>
        </div>
      );

      const { container } = render(
        <ResponsiveLayout sidebar={sidebar}>
          <div className="p-4">
            <h1>Main Content</h1>
            <p>This is the main content area.</p>
          </div>
        </ResponsiveLayout>
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders responsive layout without sidebar', () => {
      const { container } = render(
        <ResponsiveLayout>
          <div className="p-4">
            <h1>Full Width Content</h1>
            <p>This content takes the full width.</p>
          </div>
        </ResponsiveLayout>
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders responsive layout with header and footer', () => {
      const header = <header className="bg-blue-600 text-white p-4">Header</header>;
      const footer = <footer className="bg-gray-800 text-white p-4">Footer</footer>;

      const { container } = render(
        <ResponsiveLayout header={header} footer={footer}>
          <div className="p-4">Main Content</div>
        </ResponsiveLayout>
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders responsive layout in full width mode', () => {
      const { container } = render(
        <ResponsiveLayout fullWidth>
          <div className="p-4">Full Width Layout</div>
        </ResponsiveLayout>
      );
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('Responsive Breakpoints', () => {
    const breakpoints = [
      { name: 'mobile', query: '(max-width: 640px)' },
      { name: 'tablet', query: '(max-width: 768px)' },
      { name: 'desktop', query: '(min-width: 1024px)' },
    ];

    breakpoints.forEach(({ name, query }) => {
      it(`renders components correctly at ${name} breakpoint`, () => {
        Object.defineProperty(window, 'matchMedia', {
          writable: true,
          value: jest.fn().mockImplementation(q => ({
            matches: q === query,
            media: q,
            onchange: null,
            addListener: jest.fn(),
            removeListener: jest.fn(),
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
            dispatchEvent: jest.fn(),
          })),
        });

        const { container } = render(
          <ResponsiveLayout>
            <PropertyCard property={mockProperty} />
            <SearchFilters onFiltersChange={jest.fn()} />
          </ResponsiveLayout>
        );
        
        expect(container.firstChild).toMatchSnapshot(`responsive-layout-${name}`);
      });
    });
  });

  describe('Dark Mode Support', () => {
    beforeEach(() => {
      // Mock dark mode
      document.documentElement.classList.add('dark');
    });

    afterEach(() => {
      document.documentElement.classList.remove('dark');
    });

    it('renders components in dark mode', () => {
      const { container } = render(
        <div className="dark">
          <PropertyCard property={mockProperty} />
          <SearchFilters onFiltersChange={jest.fn()} />
        </div>
      );
      expect(container.firstChild).toMatchSnapshot('dark-mode');
    });
  });

  describe('High Contrast Mode', () => {
    beforeEach(() => {
      // Mock high contrast mode
      document.documentElement.classList.add('high-contrast');
    });

    afterEach(() => {
      document.documentElement.classList.remove('high-contrast');
    });

    it('renders components in high contrast mode', () => {
      const { container } = render(
        <div className="high-contrast">
          <PropertyCard property={mockProperty} />
          <SearchFilters onFiltersChange={jest.fn()} />
        </div>
      );
      expect(container.firstChild).toMatchSnapshot('high-contrast');
    });
  });
});