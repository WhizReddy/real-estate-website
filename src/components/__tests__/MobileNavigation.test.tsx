import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import MobileNavigation from '../MobileNavigation';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    pathname: '/',
  }),
  usePathname: () => '/',
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    nav: ({ children, ...props }: any) => <nav {...props}>{children}</nav>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

const mockNavigationItems = [
  { href: '/', label: 'Home', icon: 'Home' },
  { href: '/properties', label: 'Properties', icon: 'Building' },
  { href: '/map', label: 'Map', icon: 'Map' },
  { href: '/contact', label: 'Contact', icon: 'Phone' },
];

describe('MobileNavigation Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders mobile navigation toggle button', () => {
    render(<MobileNavigation items={mockNavigationItems} />);
    expect(screen.getByLabelText('Toggle navigation menu')).toBeInTheDocument();
  });

  it('opens navigation menu when toggle button is clicked', async () => {
    render(<MobileNavigation items={mockNavigationItems} />);
    
    const toggleButton = screen.getByLabelText('Toggle navigation menu');
    fireEvent.click(toggleButton);
    
    await waitFor(() => {
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });
  });

  it('renders all navigation items when menu is open', async () => {
    render(<MobileNavigation items={mockNavigationItems} />);
    
    const toggleButton = screen.getByLabelText('Toggle navigation menu');
    fireEvent.click(toggleButton);
    
    await waitFor(() => {
      mockNavigationItems.forEach(item => {
        expect(screen.getByText(item.label)).toBeInTheDocument();
      });
    });
  });

  it('closes menu when navigation item is clicked', async () => {
    render(<MobileNavigation items={mockNavigationItems} />);
    
    // Open menu
    const toggleButton = screen.getByLabelText('Toggle navigation menu');
    fireEvent.click(toggleButton);
    
    await waitFor(() => {
      const homeLink = screen.getByText('Home');
      fireEvent.click(homeLink);
    });
    
    // Menu should close
    await waitFor(() => {
      expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    });
  });

  it('closes menu when close button is clicked', async () => {
    render(<MobileNavigation items={mockNavigationItems} />);
    
    // Open menu
    const toggleButton = screen.getByLabelText('Toggle navigation menu');
    fireEvent.click(toggleButton);
    
    await waitFor(() => {
      const closeButton = screen.getByLabelText('Close navigation menu');
      fireEvent.click(closeButton);
    });
    
    // Menu should close
    await waitFor(() => {
      expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    });
  });

  it('closes menu when overlay is clicked', async () => {
    render(<MobileNavigation items={mockNavigationItems} />);
    
    // Open menu
    const toggleButton = screen.getByLabelText('Toggle navigation menu');
    fireEvent.click(toggleButton);
    
    await waitFor(() => {
      const overlay = screen.getByTestId('mobile-nav-overlay');
      fireEvent.click(overlay);
    });
    
    // Menu should close
    await waitFor(() => {
      expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    });
  });

  it('handles keyboard navigation', async () => {
    render(<MobileNavigation items={mockNavigationItems} />);
    
    const toggleButton = screen.getByLabelText('Toggle navigation menu');
    fireEvent.keyDown(toggleButton, { key: 'Enter' });
    
    await waitFor(() => {
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });
  });

  it('closes menu on Escape key press', async () => {
    render(<MobileNavigation items={mockNavigationItems} />);
    
    // Open menu
    const toggleButton = screen.getByLabelText('Toggle navigation menu');
    fireEvent.click(toggleButton);
    
    await waitFor(() => {
      fireEvent.keyDown(document, { key: 'Escape' });
    });
    
    // Menu should close
    await waitFor(() => {
      expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    });
  });

  it('highlights active navigation item', async () => {
    // Mock current pathname
    jest.doMock('next/navigation', () => ({
      useRouter: () => ({
        push: jest.fn(),
        back: jest.fn(),
        pathname: '/properties',
      }),
      usePathname: () => '/properties',
    }));
    
    render(<MobileNavigation items={mockNavigationItems} />);
    
    const toggleButton = screen.getByLabelText('Toggle navigation menu');
    fireEvent.click(toggleButton);
    
    await waitFor(() => {
      const propertiesLink = screen.getByText('Properties');
      expect(propertiesLink.closest('a')).toHaveClass('bg-blue-50', 'text-blue-600');
    });
  });

  it('applies correct ARIA attributes', async () => {
    render(<MobileNavigation items={mockNavigationItems} />);
    
    const toggleButton = screen.getByLabelText('Toggle navigation menu');
    expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
    
    fireEvent.click(toggleButton);
    
    await waitFor(() => {
      expect(toggleButton).toHaveAttribute('aria-expanded', 'true');
    });
  });

  it('handles touch events for mobile devices', async () => {
    render(<MobileNavigation items={mockNavigationItems} />);
    
    const toggleButton = screen.getByLabelText('Toggle navigation menu');
    fireEvent.touchStart(toggleButton);
    fireEvent.touchEnd(toggleButton);
    
    await waitFor(() => {
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });
  });

  it('prevents body scroll when menu is open', async () => {
    render(<MobileNavigation items={mockNavigationItems} />);
    
    const toggleButton = screen.getByLabelText('Toggle navigation menu');
    fireEvent.click(toggleButton);
    
    await waitFor(() => {
      expect(document.body).toHaveClass('overflow-hidden');
    });
  });

  it('restores body scroll when menu is closed', async () => {
    render(<MobileNavigation items={mockNavigationItems} />);
    
    const toggleButton = screen.getByLabelText('Toggle navigation menu');
    fireEvent.click(toggleButton);
    
    await waitFor(() => {
      const closeButton = screen.getByLabelText('Close navigation menu');
      fireEvent.click(closeButton);
    });
    
    await waitFor(() => {
      expect(document.body).not.toHaveClass('overflow-hidden');
    });
  });

  it('renders custom logo when provided', () => {
    const customLogo = <div data-testid="custom-logo">Custom Logo</div>;
    render(<MobileNavigation items={mockNavigationItems} logo={customLogo} />);
    
    expect(screen.getByTestId('custom-logo')).toBeInTheDocument();
  });

  it('handles empty navigation items', () => {
    render(<MobileNavigation items={[]} />);
    expect(screen.getByLabelText('Toggle navigation menu')).toBeInTheDocument();
  });
});