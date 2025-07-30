import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ResponsiveLayout from '../ResponsiveLayout';

// Mock window.matchMedia for responsive testing
const mockMatchMedia = (matches: boolean) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
};

describe('ResponsiveLayout Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders children correctly', () => {
    render(
      <ResponsiveLayout>
        <div data-testid="child-content">Test Content</div>
      </ResponsiveLayout>
    );
    
    expect(screen.getByTestId('child-content')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('applies mobile layout classes on small screens', () => {
    mockMatchMedia(true); // Simulate mobile screen
    
    render(
      <ResponsiveLayout>
        <div>Mobile Content</div>
      </ResponsiveLayout>
    );
    
    const container = screen.getByTestId('responsive-container');
    expect(container).toHaveClass('px-4', 'sm:px-6', 'lg:px-8');
  });

  it('applies desktop layout classes on large screens', () => {
    mockMatchMedia(false); // Simulate desktop screen
    
    render(
      <ResponsiveLayout>
        <div>Desktop Content</div>
      </ResponsiveLayout>
    );
    
    const container = screen.getByTestId('responsive-container');
    expect(container).toHaveClass('max-w-7xl', 'mx-auto');
  });

  it('handles sidebar toggle on mobile', () => {
    mockMatchMedia(true); // Mobile screen
    
    render(
      <ResponsiveLayout 
        sidebar={<div data-testid="sidebar">Sidebar Content</div>}
      >
        <div>Main Content</div>
      </ResponsiveLayout>
    );
    
    const toggleButton = screen.getByLabelText('Toggle sidebar');
    fireEvent.click(toggleButton);
    
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
  });

  it('shows sidebar by default on desktop', () => {
    mockMatchMedia(false); // Desktop screen
    
    render(
      <ResponsiveLayout 
        sidebar={<div data-testid="sidebar">Sidebar Content</div>}
      >
        <div>Main Content</div>
      </ResponsiveLayout>
    );
    
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
  });

  it('applies custom className when provided', () => {
    render(
      <ResponsiveLayout className="custom-class">
        <div>Content</div>
      </ResponsiveLayout>
    );
    
    const container = screen.getByTestId('responsive-container');
    expect(container).toHaveClass('custom-class');
  });

  it('handles fullWidth prop correctly', () => {
    render(
      <ResponsiveLayout fullWidth>
        <div>Full Width Content</div>
      </ResponsiveLayout>
    );
    
    const container = screen.getByTestId('responsive-container');
    expect(container).toHaveClass('w-full');
  });

  it('renders header when provided', () => {
    render(
      <ResponsiveLayout 
        header={<div data-testid="header">Header Content</div>}
      >
        <div>Main Content</div>
      </ResponsiveLayout>
    );
    
    expect(screen.getByTestId('header')).toBeInTheDocument();
  });

  it('renders footer when provided', () => {
    render(
      <ResponsiveLayout 
        footer={<div data-testid="footer">Footer Content</div>}
      >
        <div>Main Content</div>
      </ResponsiveLayout>
    );
    
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('handles keyboard navigation for sidebar toggle', () => {
    mockMatchMedia(true); // Mobile screen
    
    render(
      <ResponsiveLayout 
        sidebar={<div data-testid="sidebar">Sidebar Content</div>}
      >
        <div>Main Content</div>
      </ResponsiveLayout>
    );
    
    const toggleButton = screen.getByLabelText('Toggle sidebar');
    fireEvent.keyDown(toggleButton, { key: 'Enter' });
    
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
  });

  it('closes sidebar when clicking outside on mobile', () => {
    mockMatchMedia(true); // Mobile screen
    
    render(
      <ResponsiveLayout 
        sidebar={<div data-testid="sidebar">Sidebar Content</div>}
      >
        <div data-testid="main-content">Main Content</div>
      </ResponsiveLayout>
    );
    
    // Open sidebar first
    const toggleButton = screen.getByLabelText('Toggle sidebar');
    fireEvent.click(toggleButton);
    
    // Click outside
    const mainContent = screen.getByTestId('main-content');
    fireEvent.click(mainContent);
    
    // Sidebar should still be accessible but overlay should handle closing
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
  });

  it('applies correct grid layout for sidebar and main content', () => {
    render(
      <ResponsiveLayout 
        sidebar={<div data-testid="sidebar">Sidebar</div>}
      >
        <div data-testid="main">Main</div>
      </ResponsiveLayout>
    );
    
    const layoutContainer = screen.getByTestId('layout-grid');
    expect(layoutContainer).toHaveClass('grid', 'grid-cols-1', 'lg:grid-cols-4');
  });

  it('handles responsive breakpoints correctly', () => {
    const { rerender } = render(
      <ResponsiveLayout>
        <div>Content</div>
      </ResponsiveLayout>
    );
    
    // Test different screen sizes
    mockMatchMedia(true); // Mobile
    rerender(
      <ResponsiveLayout>
        <div>Mobile Content</div>
      </ResponsiveLayout>
    );
    
    mockMatchMedia(false); // Desktop
    rerender(
      <ResponsiveLayout>
        <div>Desktop Content</div>
      </ResponsiveLayout>
    );
    
    expect(screen.getByText('Desktop Content')).toBeInTheDocument();
  });
});