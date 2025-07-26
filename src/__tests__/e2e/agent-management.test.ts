/**
 * End-to-End Tests for Agent Management
 * These tests simulate the complete user flow for managing agents
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import AgentsPage from '@/app/admin/agents/page';
import NewAgent from '@/app/admin/agents/new/page';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Mock fetch
global.fetch = jest.fn();

const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
};

describe('Agent Management E2E Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    mockLocalStorage.getItem.mockReturnValue('authenticated');
    (global.fetch as jest.Mock).mockClear();
  });

  describe('Agent List Page', () => {
    it('should load and display agents from API', async () => {
      const mockAgents = [
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'AGENT',
          createdAt: '2024-01-01T00:00:00Z',
          propertiesCount: 5,
        },
        {
          id: '2',
          name: 'Jane Admin',
          email: 'jane@example.com',
          role: 'ADMIN',
          createdAt: '2024-01-02T00:00:00Z',
          propertiesCount: 10,
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockAgents,
        }),
      });

      render(<AgentsPage />);

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      // Check if agents are displayed
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Admin')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
      expect(screen.getByText('jane@example.com')).toBeInTheDocument();

      // Check stats
      expect(screen.getByText('2')).toBeInTheDocument(); // Total agents
      expect(screen.getByText('1')).toBeInTheDocument(); // Admin count
      expect(screen.getByText('1')).toBeInTheDocument(); // Agent count
    });

    it('should handle API errors gracefully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Failed to fetch agents',
          },
        }),
      });

      // Mock alert
      window.alert = jest.fn();

      render(<AgentsPage />);

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith(
          expect.stringContaining('Gabim i brendshëm')
        );
      });
    });

    it('should delete agent successfully', async () => {
      const mockAgents = [
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'AGENT',
          createdAt: '2024-01-01T00:00:00Z',
          propertiesCount: 5,
        },
      ];

      // Mock initial load
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockAgents,
        }),
      });

      render(<AgentsPage />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      // Click delete button
      const deleteButton = screen.getByTitle('Fshi');
      fireEvent.click(deleteButton);

      // Confirm deletion
      await waitFor(() => {
        expect(screen.getByText('Konfirmo Fshirjen')).toBeInTheDocument();
      });

      // Mock delete API call
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          message: 'Agent deleted successfully',
        }),
      });

      window.alert = jest.fn();

      const confirmButton = screen.getByText('Fshi');
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/agents/1', {
          method: 'DELETE',
        });
        expect(window.alert).toHaveBeenCalledWith('Agjenti u fshi me sukses!');
      });
    });

    it('should prevent deletion of admin users', async () => {
      const mockAgents = [
        {
          id: '1',
          name: 'Admin User',
          email: 'admin@example.com',
          role: 'ADMIN',
          createdAt: '2024-01-01T00:00:00Z',
          propertiesCount: 0,
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockAgents,
        }),
      });

      render(<AgentsPage />);

      await waitFor(() => {
        expect(screen.getByText('Admin User')).toBeInTheDocument();
      });

      // Admin users should not have delete button
      expect(screen.queryByTitle('Fshi')).not.toBeInTheDocument();
    });
  });

  describe('Agent Creation Page', () => {
    it('should create agent successfully', async () => {
      render(<NewAgent />);

      // Fill out the form
      fireEvent.change(screen.getByPlaceholderText('p.sh. Arben Kelmendi'), {
        target: { value: 'New Agent' },
      });
      fireEvent.change(screen.getByPlaceholderText('agent@realestate-tirana.al'), {
        target: { value: 'newagent@example.com' },
      });
      fireEvent.change(screen.getByPlaceholderText('+355 69 123 4567'), {
        target: { value: '+355691234567' },
      });
      fireEvent.change(screen.getByPlaceholderText('••••••••'), {
        target: { value: 'password123' },
      });
      
      // Find confirm password field by its label
      const confirmPasswordInputs = screen.getAllByPlaceholderText('••••••••');
      fireEvent.change(confirmPasswordInputs[1], {
        target: { value: 'password123' },
      });

      // Mock successful creation
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            id: '3',
            name: 'New Agent',
            email: 'newagent@example.com',
            role: 'AGENT',
            createdAt: '2024-01-03T00:00:00Z',
          },
        }),
      });

      window.alert = jest.fn();

      // Submit form
      const submitButton = screen.getByText('Krijo Agjentin');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/agents', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: 'New Agent',
            email: 'newagent@example.com',
            phone: '+355691234567',
            password: 'password123',
            role: 'AGENT',
          }),
        });
        expect(window.alert).toHaveBeenCalledWith('Agjenti u krijua me sukses!');
        expect(mockRouter.push).toHaveBeenCalledWith('/admin/agents');
      });
    });

    it('should validate password confirmation', async () => {
      render(<NewAgent />);

      // Fill out form with mismatched passwords
      fireEvent.change(screen.getByPlaceholderText('p.sh. Arben Kelmendi'), {
        target: { value: 'New Agent' },
      });
      fireEvent.change(screen.getByPlaceholderText('agent@realestate-tirana.al'), {
        target: { value: 'newagent@example.com' },
      });
      fireEvent.change(screen.getByPlaceholderText('••••••••'), {
        target: { value: 'password123' },
      });
      
      const confirmPasswordInputs = screen.getAllByPlaceholderText('••••••••');
      fireEvent.change(confirmPasswordInputs[1], {
        target: { value: 'differentpassword' },
      });

      window.alert = jest.fn();

      // Submit form
      const submitButton = screen.getByText('Krijo Agjentin');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith('Fjalëkalimet nuk përputhen!');
        expect(global.fetch).not.toHaveBeenCalled();
      });
    });

    it('should handle validation errors from API', async () => {
      render(<NewAgent />);

      // Fill out form with invalid data
      fireEvent.change(screen.getByPlaceholderText('p.sh. Arben Kelmendi'), {
        target: { value: 'A' }, // Too short
      });
      fireEvent.change(screen.getByPlaceholderText('agent@realestate-tirana.al'), {
        target: { value: 'invalid-email' },
      });
      fireEvent.change(screen.getByPlaceholderText('••••••••'), {
        target: { value: '123' }, // Too short
      });
      
      const confirmPasswordInputs = screen.getAllByPlaceholderText('••••••••');
      fireEvent.change(confirmPasswordInputs[1], {
        target: { value: '123' },
      });

      // Mock validation error response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input data',
            details: {
              name: 'Name must be at least 2 characters long',
              email: 'Invalid email format',
              password: 'Password must be at least 6 characters long',
            },
          },
        }),
      });

      window.alert = jest.fn();

      // Submit form
      const submitButton = screen.getByText('Krijo Agjentin');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith(
          expect.stringContaining('Gabime në validim')
        );
      });
    });

    it('should handle duplicate email error', async () => {
      render(<NewAgent />);

      // Fill out form
      fireEvent.change(screen.getByPlaceholderText('p.sh. Arben Kelmendi'), {
        target: { value: 'New Agent' },
      });
      fireEvent.change(screen.getByPlaceholderText('agent@realestate-tirana.al'), {
        target: { value: 'existing@example.com' },
      });
      fireEvent.change(screen.getByPlaceholderText('••••••••'), {
        target: { value: 'password123' },
      });
      
      const confirmPasswordInputs = screen.getAllByPlaceholderText('••••••••');
      fireEvent.change(confirmPasswordInputs[1], {
        target: { value: 'password123' },
      });

      // Mock duplicate email error
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          success: false,
          error: {
            code: 'DUPLICATE_EMAIL',
            message: 'An agent with this email already exists',
          },
        }),
      });

      window.alert = jest.fn();

      // Submit form
      const submitButton = screen.getByText('Krijo Agjentin');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith(
          'Ky email është tashmë në përdorim. Ju lutem përdorni një email tjetër.'
        );
      });
    });
  });

  describe('Authentication Flow', () => {
    it('should redirect to login if not authenticated', () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      render(<AgentsPage />);

      expect(mockRouter.push).toHaveBeenCalledWith('/admin/login');
    });

    it('should stay on page if authenticated', () => {
      mockLocalStorage.getItem.mockReturnValue('authenticated');

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: [],
        }),
      });

      render(<AgentsPage />);

      expect(mockRouter.push).not.toHaveBeenCalledWith('/admin/login');
    });
  });
});