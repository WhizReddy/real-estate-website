import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ResponsiveLayout, {
  ResponsiveGrid,
  ResponsiveContainer,
  ResponsiveText,
  ResponsiveButton,
  ResponsiveCard,
} from '../ResponsiveLayout';

describe('ResponsiveLayout Component', () => {
  it('renders children correctly', () => {
    render(
      <ResponsiveLayout>
        <div data-testid="child-content">Test Content</div>
      </ResponsiveLayout>
    );
    expect(screen.getByTestId('child-content')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('applies default layout classes', () => {
    const { container } = render(
      <ResponsiveLayout>
        <div>Content</div>
      </ResponsiveLayout>
    );
    expect(container.firstChild).toHaveClass('min-h-screen', 'bg-white');
  });

  it('handles variants correctly', () => {
    const { container: fullMapContainer } = render(
      <ResponsiveLayout variant="fullmap">
        <div>Content</div>
      </ResponsiveLayout>
    );
    expect(fullMapContainer.firstChild).toHaveClass('h-screen', 'flex', 'flex-col', 'bg-gray-50');

    const { container: adminContainer } = render(
      <ResponsiveLayout variant="admin">
        <div>Content</div>
      </ResponsiveLayout>
    );
    expect(adminContainer.firstChild).toHaveClass('min-h-screen', 'bg-gray-100');
  });
});

describe('ResponsiveGrid Component', () => {
  it('renders correctly with default cols', () => {
    const { container } = render(
      <ResponsiveGrid>
        <div>Item</div>
      </ResponsiveGrid>
    );
    expect(container.firstChild).toHaveClass('grid', 'grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3', 'gap-6');
  });
});

describe('ResponsiveContainer Component', () => {
  it('applies size classes correctly', () => {
    const { container } = render(
      <ResponsiveContainer size="sm">
        <div>Item</div>
      </ResponsiveContainer>
    );
    expect(container.firstChild).toHaveClass('max-w-2xl');
  });

  it('applies padding classes correctly', () => {
    const { container } = render(
      <ResponsiveContainer padding="none">
        <div>Item</div>
      </ResponsiveContainer>
    );
    expect(container.firstChild).not.toHaveClass('px-4', 'sm:px-6');
  });
});

describe('ResponsiveText Component', () => {
  it('renders as correct HTML element based on variant', () => {
    render(<ResponsiveText variant="h1">Heading 1</ResponsiveText>);
    const h1 = screen.getByText('Heading 1');
    expect(h1.tagName).toBe('H1');
    expect(h1).toHaveClass('text-3xl', 'font-bold');
  });
});

describe('ResponsiveButton Component', () => {
  it('renders with appropriate variant classes', () => {
    render(<ResponsiveButton variant="secondary">Secondary Btn</ResponsiveButton>);
    expect(screen.getByText('Secondary Btn')).toHaveClass('bg-gray-600', 'text-white');
  });

  it('handles fullWidth prop', () => {
    render(<ResponsiveButton fullWidth>Wide</ResponsiveButton>);
    expect(screen.getByText('Wide')).toHaveClass('w-full');
  });
});

describe('ResponsiveCard Component', () => {
  it('applies padding and shadow classes', () => {
    const { container } = render(<ResponsiveCard padding="lg" shadow="sm">Card</ResponsiveCard>);
    expect(container.firstChild).toHaveClass('p-6', 'sm:p-8', 'shadow-sm');
  });
});