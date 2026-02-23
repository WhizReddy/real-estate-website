import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SearchFilters from '@/components/SearchFilters';
import { Property } from '@/types';

const mockProperties: Property[] = [
  {
    id: 'prop-1',
    title: 'Modern Apartment',
    description: 'Beautiful modern apartment',
    price: 150000,
    address: {
      street: 'Main St 123',
      city: 'Tirana',
      state: 'Tirana',
      zipCode: '1001',
      coordinates: { lat: 41.3275, lng: 19.8187 }
    },
    details: {
      bedrooms: 2,
      bathrooms: 1,
      squareFootage: 85,
      propertyType: 'apartment',
      yearBuilt: 2020
    },
    images: ['/test1.jpg'],
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
  },
  {
    id: 'prop-2',
    title: 'Family House',
    description: 'Spacious family house',
    price: 250000,
    address: {
      street: 'Oak Ave 456',
      city: 'Durres',
      state: 'Durres',
      zipCode: '2001',
      coordinates: { lat: 41.3247, lng: 19.4564 }
    },
    details: {
      bedrooms: 4,
      bathrooms: 2,
      squareFootage: 150,
      propertyType: 'house',
      yearBuilt: 2018
    },
    images: ['/test2.jpg'],
    features: ['garden', 'garage'],
    status: 'active',
    listingType: 'sale',
    isPinned: true,
    agent: {
      id: 'agent-2',
      name: 'Jane Smith',
      email: 'jane@test.com',
      phone: '+1234567891'
    },
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z'
  }
];

describe('SearchFilters', () => {
  const mockOnFilteredResults = jest.fn();

  beforeEach(() => {
    mockOnFilteredResults.mockClear();
  });

  it('renders search input correctly', () => {
    render(
      <SearchFilters
        properties={mockProperties}
        onFilteredResults={mockOnFilteredResults}
      />
    );

    expect(screen.getByPlaceholderText('Kërkoni pasuri...')).toBeInTheDocument();
  });

  it('filters properties by search term', async () => {
    render(
      <SearchFilters
        properties={mockProperties}
        onFilteredResults={mockOnFilteredResults}
      />
    );

    const searchInput = screen.getByPlaceholderText('Kërkoni pasuri...');
    fireEvent.change(searchInput, { target: { value: 'modern' } });

    await waitFor(() => {
      expect(mockOnFilteredResults).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ title: 'Modern Apartment' })
        ])
      );
    }, { timeout: 500 });
  });

  it('expands advanced filters when button is clicked', () => {
    render(
      <SearchFilters
        properties={mockProperties}
        onFilteredResults={mockOnFilteredResults}
      />
    );

    const expandButton = screen.getByText('Filtrat e Avancuara');
    fireEvent.click(expandButton);

    expect(screen.getByText('Çmimi (€)')).toBeInTheDocument();
    expect(screen.getAllByText('Lokacioni')[0]).toBeInTheDocument();
  });

  it('filters by price range', async () => {
    render(
      <SearchFilters
        properties={mockProperties}
        onFilteredResults={mockOnFilteredResults}
      />
    );

    // Expand filters
    fireEvent.click(screen.getByText('Filtrat e Avancuara'));

    // Set price range
    const minPriceInput = screen.getByPlaceholderText('Min');
    const maxPriceInput = screen.getByPlaceholderText('Max');

    fireEvent.change(minPriceInput, { target: { value: '200000' } });
    fireEvent.change(maxPriceInput, { target: { value: '300000' } });

    await waitFor(() => {
      expect(mockOnFilteredResults).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ title: 'Family House' })
        ])
      );
    }, { timeout: 500 });
  });

  it('filters by location', async () => {
    render(
      <SearchFilters
        properties={mockProperties}
        onFilteredResults={mockOnFilteredResults}
      />
    );

    // Expand filters
    fireEvent.click(screen.getByText('Filtrat e Avancuara'));

    // Select location
    const locationSelect = screen.getByDisplayValue('Të gjitha qytetet');
    fireEvent.change(locationSelect, { target: { value: 'Tirana' } });

    await waitFor(() => {
      expect(mockOnFilteredResults).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ address: expect.objectContaining({ city: 'Tirana' }) })
        ])
      );
    }, { timeout: 500 });
  });

  it('filters by property type', async () => {
    render(
      <SearchFilters
        properties={mockProperties}
        onFilteredResults={mockOnFilteredResults}
      />
    );

    // Expand filters
    fireEvent.click(screen.getByText('Filtrat e Avancuara'));

    // Select apartment type
    const apartmentCheckbox = screen.getByLabelText('Apartament');
    fireEvent.click(apartmentCheckbox);

    await waitFor(() => {
      expect(mockOnFilteredResults).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            details: expect.objectContaining({ propertyType: 'apartment' })
          })
        ])
      );
    }, { timeout: 500 });
  });

  it('sorts properties correctly', async () => {
    render(
      <SearchFilters
        properties={mockProperties}
        onFilteredResults={mockOnFilteredResults}
      />
    );

    // Select price sorting
    const sortSelect = screen.getByDisplayValue('Renditja');
    fireEvent.change(sortSelect, { target: { value: 'price' } });

    await waitFor(() => {
      const lastCall = mockOnFilteredResults.mock.calls[mockOnFilteredResults.mock.calls.length - 1];
      const sortedProperties = lastCall[0];
      expect(sortedProperties[0].price).toBeGreaterThanOrEqual(sortedProperties[1].price);
    }, { timeout: 500 });
  });

  it('clears all filters when clear button is clicked', async () => {
    render(
      <SearchFilters
        properties={mockProperties}
        onFilteredResults={mockOnFilteredResults}
      />
    );

    // Add some filters
    const searchInput = screen.getByPlaceholderText('Kërkoni pasuri...');
    fireEvent.change(searchInput, { target: { value: 'test' } });

    // Wait for filters to be applied
    await waitFor(() => {
      expect(mockOnFilteredResults).toHaveBeenCalled();
    });

    // Clear filters
    const clearButton = screen.getByText('Pastro Filtrat');
    fireEvent.click(clearButton);

    // Check that search input is cleared
    expect(searchInput).toHaveValue('');

    await waitFor(() => {
      expect(mockOnFilteredResults).toHaveBeenCalledWith(mockProperties);
    }, { timeout: 500 });
  });

  it('handles multiple filter combinations', async () => {
    render(
      <SearchFilters
        properties={mockProperties}
        onFilteredResults={mockOnFilteredResults}
      />
    );

    // Expand filters
    fireEvent.click(screen.getByText('Filtrat e Avancuara'));

    // Apply multiple filters
    const searchInput = screen.getByPlaceholderText('Kërkoni pasuri...');
    fireEvent.change(searchInput, { target: { value: 'house' } });

    const locationSelect = screen.getByDisplayValue('Të gjitha qytetet');
    fireEvent.change(locationSelect, { target: { value: 'Durres' } });

    await waitFor(() => {
      expect(mockOnFilteredResults).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            title: 'Family House',
            address: expect.objectContaining({ city: 'Durres' })
          })
        ])
      );
    }, { timeout: 500 });
  });
});