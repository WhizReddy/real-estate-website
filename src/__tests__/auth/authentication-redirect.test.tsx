/**
 * Tests for authentication redirect logic
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import SignInPage from '@/app/auth/signin/page';

// Mock next-auth
jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
  getSession: jest.fn(),
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock performance monitor
jest.mock('@/lib/performance-monitor', () => ({
  trackAuthFlow: jest.fn(),
}));

const mockSignIn = signIn as jest.MockedFunction<typeof signIn>;
const mockGetSession = getSession as jest.MockedFunction<typeof getSession>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

describe('Authentication Redirect Logic', () => {
  const mockPush = jest.fn();
  const mockRouter = {
    push: mockPush,
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue(mockRouter);
  });

  it('should redirect admin users to admin dashboard', async () => {
    // Mock successful sign-in
    mockSignIn.mockResolvedValue({
      ok: true,
      error: null,
      status: 200,
      url: null,
    });

    // Mock admin session
    mockGetSession.mockResolvedValue({
      user: {
        id: '1',
        email: 'admin@test.com',
        name: 'Admin User',
        role: 'admin',
      },
      expires: '2024-12-31',
    });

    render(<SignInPage />);

    // Fill in form
    const emailInput = screen.getByPlaceholderText('Enter your email');
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'admin@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    // Wait for redirect
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/admin/dashboard');
    });
  });

  it('should redirect agent users to admin dashboard', async () => {
    mockSignIn.mockResolvedValue({
      ok: true,
      error: null,
      status: 200,
      url: null,
    });

    mockGetSession.mockResolvedValue({
      user: {
        id: '2',
        email: 'agent@test.com',
        name: 'Agent User',
        role: 'agent',
      },
      expires: '2024-12-31',
    });

    render(<SignInPage />);

    const emailInput = screen.getByPlaceholderText('Enter your email');
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'agent@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/admin/dashboard');
    });
  });

  it('should redirect regular users to homepage', async () => {
    mockSignIn.mockResolvedValue({
      ok: true,
      error: null,
      status: 200,
      url: null,
    });

    mockGetSession.mockResolvedValue({
      user: {
        id: '3',
        email: 'user@test.com',
        name: 'Regular User',
        role: 'user',
      },
      expires: '2024-12-31',
    });

    render(<SignInPage />);

    const emailInput = screen.getByPlaceholderText('Enter your email');
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'user@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  it('should handle sign-in errors gracefully', async () => {
    mockSignIn.mockResolvedValue({
      ok: false,
      error: 'CredentialsSignin',
      status: 401,
      url: null,
    });

    render(<SignInPage />);

    const emailInput = screen.getByPlaceholderText('Enter your email');
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'wrong@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
    });

    expect(mockPush).not.toHaveBeenCalled();
  });

  it('should handle session retrieval failures with retry logic', async () => {
    mockSignIn.mockResolvedValue({
      ok: true,
      error: null,
      status: 200,
      url: null,
    });

    // Mock session failure then success
    mockGetSession
      .mockResolvedValueOnce(null) // First call fails
      .mockResolvedValueOnce(null) // Second call fails
      .mockResolvedValue({ // Third call succeeds
        user: {
          id: '1',
          email: 'admin@test.com',
          name: 'Admin User',
          role: 'admin',
        },
        expires: '2024-12-31',
      });

    render(<SignInPage />);

    const emailInput = screen.getByPlaceholderText('Enter your email');
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'admin@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/admin/dashboard');
    }, { timeout: 3000 });

    // Should have called getSession multiple times due to retry logic
    expect(mockGetSession).toHaveBeenCalledTimes(3);
  });

  it('should show error when session cannot be established after retries', async () => {
    mockSignIn.mockResolvedValue({
      ok: true,
      error: null,
      status: 200,
      url: null,
    });

    // Mock session always failing
    mockGetSession.mockResolvedValue(null);

    render(<SignInPage />);

    const emailInput = screen.getByPlaceholderText('Enter your email');
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'admin@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Failed to establish session. Please try again.')).toBeInTheDocument();
    }, { timeout: 3000 });

    expect(mockPush).not.toHaveBeenCalled();
  });

  it('should use window.location as fallback if router fails', async () => {
    // Mock router.push to throw an error
    mockPush.mockImplementation(() => {
      throw new Error('Router failed');
    });

    mockSignIn.mockResolvedValue({
      ok: true,
      error: null,
      status: 200,
      url: null,
    });

    mockGetSession.mockResolvedValue({
      user: {
        id: '1',
        email: 'admin@test.com',
        name: 'Admin User',
        role: 'admin',
      },
      expires: '2024-12-31',
    });

    // Mock window.location
    const mockLocation = {
      href: '',
    };
    Object.defineProperty(window, 'location', {
      value: mockLocation,
      writable: true,
    });

    render(<SignInPage />);

    const emailInput = screen.getByPlaceholderText('Enter your email');
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'admin@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLocation.href).toBe('/admin/dashboard');
    });
  });
});