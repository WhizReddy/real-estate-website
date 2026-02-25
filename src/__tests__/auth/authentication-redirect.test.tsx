/**
 * Tests for authentication login logic
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import AdminLogin from '@/app/admin/login/page';
import '@testing-library/jest-dom';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

describe('Admin Login Component', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({
      push: mockPush,
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    } as any);

    // Clear localStorage
    window.localStorage.clear();
  });

  it('renders login form correctly', () => {
    render(<AdminLogin />);

    expect(screen.getByText('Hyrje për Agjentë')).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Fjalëkalimi/i)).toBeInTheDocument();
  });

  it('handles successful login and redirects to dashboard', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: {
            sessionToken: 'test-token',
            id: '1',
            name: 'Admin User',
            email: 'admin@test.com',
            role: 'admin'
          }
        }),
      })
    ) as jest.Mock;

    render(<AdminLogin />);

    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'admin@test.com' } });
    fireEvent.change(screen.getByLabelText(/Fjalëkalimi/i), { target: { value: 'password123' } });

    const submitBtn = screen.getByRole('button', { name: /Kyçu/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/admin/dashboard');
    });

    expect(window.localStorage.getItem('adminSession')).toBe('test-token');
    expect(JSON.parse(window.localStorage.getItem('userData') || '{}')).toMatchObject({
      role: 'admin',
      email: 'admin@test.com'
    });
  });

  it('displays error message on invalid credentials', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          success: false,
          error: 'Invalid credentials'
        }),
      })
    ) as jest.Mock;

    render(<AdminLogin />);

    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'admin@test.com' } });
    fireEvent.change(screen.getByLabelText(/Fjalëkalimi/i), { target: { value: 'wrongpass' } });

    fireEvent.click(screen.getByRole('button', { name: /Kyçu/i }));

    await waitFor(() => {
      expect(screen.getByText('Email ose fjalëkalimi është i gabuar')).toBeInTheDocument();
    });

    expect(mockPush).not.toHaveBeenCalled();
  });

  it('displays generic error message on network failure', async () => {
    global.fetch = jest.fn(() => Promise.reject(new Error('Network Error'))) as jest.Mock;

    render(<AdminLogin />);

    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'admin@test.com' } });
    fireEvent.change(screen.getByLabelText(/Fjalëkalimi/i), { target: { value: 'password' } });

    fireEvent.click(screen.getByRole('button', { name: /Kyçu/i }));

    await waitFor(() => {
      expect(screen.getByText('Ka ndodhur një gabim gjatë kyçjes. Ju lutem provoni përsëri.')).toBeInTheDocument();
    });

    expect(mockPush).not.toHaveBeenCalled();
  });
});