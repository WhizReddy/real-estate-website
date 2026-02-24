import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdminAuth } from "@/lib/auth-middleware";

/*
 * Single Agent API
 *
 * Provides operations for retrieving or deleting a specific agent (user) by ID.
 * This implementation enhances the original by cleaning up related property data
 * before deleting an agent and by calculating the number of properties owned
 * by the agent when fetching their details.  The `Property` model has an
 * optional `ownerId` field referencing the `User` model; when an agent is
 * deleted we set `ownerId` to null on all associated properties to avoid
 * orphaned references.
 */

// DELETE /api/agents/[id]
export const DELETE = withAdminAuth(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id: agentId } = await params;
    if (!agentId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "MISSING_ID",
            message: "Agent ID is required",
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Check if the agent exists
    const existingAgent = await prisma.user.findUnique({
      where: { id: agentId },
    });
    if (!existingAgent) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "AGENT_NOT_FOUND",
            message: "Agent not found",
          },
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    // Prevent deletion of the last administrator
    if (existingAgent.role === 'ADMIN') {
      const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
      if (adminCount <= 1) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "LAST_ADMIN_DELETION",
              message: "Cannot delete the last administrator",
              details: "At least one administrator must remain in the system",
            },
            timestamp: new Date().toISOString(),
          },
          { status: 403 }
        );
      }
    }

    // Clean up property ownership before deleting the agent.  Any property
    // currently owned by this user will have its `ownerId` set to null.
    await prisma.property.updateMany({
      where: { ownerId: agentId },
      data: { ownerId: null },
    });

    // Delete the agent record
    await prisma.user.delete({ where: { id: agentId } });

    return NextResponse.json({
      success: true,
      message: "Agent deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting agent:", error);
    // Handle specific database errors
    if (error instanceof Error) {
      if (error.message.includes('Foreign key constraint')) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "FOREIGN_KEY_CONSTRAINT",
              message: "Cannot delete agent with associated data",
              details: "This agent has associated properties or other data that must be handled first",
            },
            timestamp: new Date().toISOString(),
          },
          { status: 409 }
        );
      }
      if (error.message.includes('Record to delete does not exist')) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "AGENT_NOT_FOUND",
              message: "Agent not found",
            },
            timestamp: new Date().toISOString(),
          },
          { status: 404 }
        );
      }
    }
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to delete agent",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
});

// GET /api/agents/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: agentId } = await params;
    if (!agentId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "MISSING_ID",
            message: "Agent ID is required",
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }
    // Fetch the agent along with a count of their properties
    const agent = await prisma.user.findUnique({
      where: { id: agentId },
      include: { _count: { select: { properties: true } } },
    });
    if (!agent) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "AGENT_NOT_FOUND",
            message: "Agent not found",
          },
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }
    // Build response data without password
    const responseData = {
      id: agent.id,
      name: agent.name || '',
      email: agent.email,
      phone: '', // Placeholder: extend the User schema to store phone numbers
      role: agent.role as 'ADMIN' | 'AGENT',
      createdAt: agent.createdAt.toISOString(),
      propertiesCount: agent._count?.properties ?? 0,
    };
    return NextResponse.json({ success: true, data: responseData });
  } catch (error) {
    console.error("Error fetching agent:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch agent",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}