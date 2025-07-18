import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SearchFilters from '../SearchFilters';
import { Property } from '@/types';

const mockProperties: Property[] = [
  {
    id: '1',
    title: 'Beautiful House in Tirana',
    description: 'A lovely family home',
    price: 150000,
    address: {
      street: 'Rruga e Durrësit',
      city: 'Tiranë',
      state: 'Tiranë',
      zipCode: '1001',
      coordinates: { lat: 41.3275, lng: 19.8187 }
    },
    details: {
      bedrooms: 3,
      bathrooms: 2,
      squareFootage: 120,
      propertyType: 'house'
    },
    images: [],
    features: ['parking', 'garden'],
    status: 'active',
    listingType: 'sale',
    isPinned: false,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  },
  {
    id: '2',
    title: 'Modern Apartment',
    description: 'City center apartment',
    price: 80000,
    address: {
      street: 'Rruga Myslym Shyri',
      city: 'Tiranë',
      state: 'Tiranë',
      zipCode: '1001',
      coordinates: { lat: 41.3275, lng: 19.8187 }
    },
    details: {
      bedrooms: 2,
      bathrooms: 1,
      squareFootage: 80,
      propertyType: 'apartment'
    },
    images: [],
    features: ['balcony'],
    status: 'active',
    listingType: 'rent',
    isPinned: false,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  }
];

describe('SearchFilters', () => {
  const mockOnFilteredResults = jest.fn();

  beforeEach(() => {
    mockOnFilteredResults.mockClear();
  });

  it('renders search input', () => {
    render(
      <SearchFilters 
        properties={mockProperties} 
        onFilteredResults={mockOnFilteredResults} 
      />
    );
    
    expect(screen.getByPlaceholderText(/Kërkoni sipas titullit/)).toBeInTheDocument();
  });

  it('filters properties by search term', async () => {
    render(
      <SearchFilters 
        properties={mockProperties} 
        onFilteredResults={mockOnFilteredResults} 
      />
    );
    
    const searchInput = screen.getByPlaceholderText(/Kërkoni sipas titullit/);
    fireEvent.change(searchInput, { target: { value: 'Beautiful' } });
    
    await waitFor(() => {
      expect(mockOnFilteredResults).toHaveBeenCalledWith([mockProperties[0]]);
    });
  });

  it('shows advanced filters when expanded', () => {
    render(
      <SearchFilters 
        properties={mockProperties} 
        onFilteredResults={mockOnFilteredResults} 
      />
    );
    
    const filterButton = screen.getByText('Filtrat e Avancuara');
    fireEvent.click(filterButton);
    
    expect(screen.getByText('Çmimi (€)')).toBeInTheDocument();
    expect(screen.getByText('Lokacioni')).toBeInTheDocument();
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
    const propertyTypeSelect = screen.getByDisplayValue('Të gjitha llojet');
    fireEvent.change(propertyTypeSelect, { target: { value: 'apartment' } });
    
    await waitFor(() => {
      expect(mockOnFilteredResults).toHaveBeenCalledWith([mockProperties[1]]);
    });
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
    
    // Set max price to 100000
    const maxPriceInput = screen.getByPlaceholderText('Max');
    fireEvent.change(maxPriceInput, { target: { value: '100000' } });
    
    await waitFor(() => {
      expect(mockOnFilteredResults).toHaveBeenCalledWith([mockProperties[1]]);
    });
  });

  it('clears all filters', async () => {
    render(
      <SearchFilters 
        properties={mockProperties} 
        onFilteredResults={mockOnFilteredResults} 
      />
    );
    
    // Add a search term
    const searchInput = screen.getByPlaceholderText(/Kërkoni sipas titullit/);
    fireEvent.change(searchInput, { target: { value: 'Beautiful' } });
    
    // Clear filters
    const clearButton = screen.getByText('Pastro Filtrat');
    fireEvent.click(clearButton);
    
    await waitFor(() => {
      expect(mockOnFilteredResults).toHaveBeenCalledWith(mockProperties);
    });
  });
});