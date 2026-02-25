import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/agents/route';
import { DELETE } from '@/app/api/agents/[id]/route';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';

// Mock the dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    property: {
      updateMany: jest.fn(),
    },
  },
}));

jest.mock('@/lib/auth', () => ({
  hashPassword: jest.fn(),
}));

jest.mock('@/lib/auth-middleware', () => ({
  withAdminAuth: (handler: any) => handler,
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockHashPassword = hashPassword as jest.MockedFunction<typeof hashPassword>;

describe('/api/agents', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/agents', () => {
    it('should return list of agents successfully', async () => {
      const mockAgents = [
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'AGENT',
          createdAt: new Date('2024-01-01'),
        },
        {
          id: '2',
          name: 'Jane Admin',
          email: 'jane@example.com',
          role: 'ADMIN',
          createdAt: new Date('2024-01-02'),
        },
      ];

      mockPrisma.user.findMany.mockResolvedValue(mockAgents as any);

      const request = new NextRequest('http://localhost:3000/api/agents');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(2);
      expect(data.data[0]).toMatchObject({
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'AGENT',
        propertiesCount: 0,
      });
    });

    it('should handle database errors', async () => {
      mockPrisma.user.findMany.mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/agents');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('POST /api/agents', () => {
    const validAgentData = {
      name: 'New Agent',
      email: 'newagent@example.com',
      phone: '+355691234567',
      password: 'password123',
      role: 'AGENT',
    };

    it('should create agent successfully', async () => {
      const mockCreatedAgent = {
        id: '3',
        name: 'New Agent',
        email: 'newagent@example.com',
        role: 'AGENT',
        createdAt: new Date('2024-01-03'),
      };

      mockPrisma.user.findUnique.mockResolvedValue(null); // No existing user
      mockHashPassword.mockResolvedValue('hashed_password');
      mockPrisma.user.create.mockResolvedValue(mockCreatedAgent as any);

      const request = new NextRequest('http://localhost:3000/api/agents', {
        method: 'POST',
        body: JSON.stringify(validAgentData),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toMatchObject({
        id: '3',
        name: 'New Agent',
        email: 'newagent@example.com',
        role: 'AGENT',
      });
      expect(mockHashPassword).toHaveBeenCalledWith('password123');
    });

    it('should reject duplicate email', async () => {
      const existingUser = {
        id: '1',
        email: 'newagent@example.com',
        name: 'Existing User',
        role: 'AGENT',
      };

      mockPrisma.user.findUnique.mockResolvedValue(existingUser as any);

      const request = new NextRequest('http://localhost:3000/api/agents', {
        method: 'POST',
        body: JSON.stringify(validAgentData),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('DUPLICATE_EMAIL');
    });

    it('should validate required fields', async () => {
      const invalidData = {
        name: '',
        email: 'invalid-email',
        password: '123', // Too short
        role: 'INVALID_ROLE',
      };

      const request = new NextRequest('http://localhost:3000/api/agents', {
        method: 'POST',
        body: JSON.stringify(invalidData),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.details).toBeDefined();
    });

    it('should handle password hashing errors', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockHashPassword.mockRejectedValue(new Error('Failed to hash password'));

      const request = new NextRequest('http://localhost:3000/api/agents', {
        method: 'POST',
        body: JSON.stringify(validAgentData),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('PASSWORD_HASH_ERROR');
    });
  });

  describe('DELETE /api/agents/[id]', () => {
    it('should delete agent successfully', async () => {
      const mockAgent = {
        id: '1',
        name: 'Agent to Delete',
        email: 'delete@example.com',
        role: 'AGENT',
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockAgent as any);
      mockPrisma.user.delete.mockResolvedValue(mockAgent as any);

      const request = new NextRequest('http://localhost:3000/api/agents/1', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: { id: '1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Agent deleted successfully');
    });

    it('should prevent deletion of last admin', async () => {
      const mockAdmin = {
        id: '1',
        name: 'Last Admin',
        email: 'admin@example.com',
        role: 'ADMIN',
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockAdmin as any);
      mockPrisma.user.count.mockResolvedValue(1); // Only one admin

      const request = new NextRequest('http://localhost:3000/api/agents/1', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: { id: '1' } });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('LAST_ADMIN_DELETION');
    });

    it('should handle non-existent agent', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/agents/999', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: { id: '999' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('AGENT_NOT_FOUND');
    });

    it('should handle missing agent ID', async () => {
      const request = new NextRequest('http://localhost:3000/api/agents/', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: { id: '' } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('MISSING_ID');
    });

    it('should handle database deletion errors', async () => {
      const mockAgent = {
        id: '1',
        name: 'Agent to Delete',
        email: 'delete@example.com',
        role: 'AGENT',
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockAgent as any);
      mockPrisma.user.delete.mockRejectedValue(new Error('Foreign key constraint'));

      const request = new NextRequest('http://localhost:3000/api/agents/1', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: { id: '1' } });
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('FOREIGN_KEY_CONSTRAINT');
    });
  });
});