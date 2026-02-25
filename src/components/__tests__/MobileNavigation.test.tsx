import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import MobileNavigation from '../MobileNavigation';
import { usePathname } from 'next/navigation';

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(() => '/'),
}));

describe('MobileNavigation Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders mobile menu button', () => {
    render(<MobileNavigation />);
    expect(screen.getByRole('button', { name: /open menu|close menu/i })).toBeInTheDocument();
  });

  it('opens menu and shows navigation items', () => {
    render(<MobileNavigation />);

    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();

    // Open menu
    fireEvent.click(screen.getByRole('button', { name: /open menu/i }));

    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(screen.getByText('Ballina')).toBeInTheDocument();
    expect(screen.getByText('Pasuritë')).toBeInTheDocument();
    expect(screen.getByText('Kontakti')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('highlights the active link', () => {
    (usePathname as jest.Mock).mockReturnValue('/properties');
    render(<MobileNavigation />);

    // Open menu
    fireEvent.click(screen.getByRole('button', { name: /open menu/i }));

    const propertiesLink = screen.getByText('Pasuritë').closest('a');
    expect(propertiesLink).toHaveClass('bg-blue-50', 'text-blue-700');
  });

  it('closes menu when backdrop is clicked', () => {
    render(<MobileNavigation />);

    // Open menu
    fireEvent.click(screen.getByRole('button', { name: /open menu/i }));
    expect(screen.getByRole('navigation')).toBeInTheDocument();

    // Click backdrop (first div inside the overlay with bg-black/50)
    // We can just find the backdrop by class name or by clicking the parent/sibling
    const backdrop = document.querySelector('.bg-black\\/50') as Element;
    fireEvent.click(backdrop);

    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });
});