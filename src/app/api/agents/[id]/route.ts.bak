import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdminAuth } from "@/lib/auth-middleware";

export const DELETE = withAdminAuth(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const agentId = params.id;

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

    // Check if this is the last admin - prevent deletion if so
    if (existingAgent.role === 'ADMIN') {
      const adminCount = await prisma.user.count({
        where: { role: 'ADMIN' },
      });

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

    // TODO: Handle related data cleanup when user-property relationship is implemented
    // For now, we'll just delete the user since properties don't have user association yet
    
    // Delete the agent
    await prisma.user.delete({
      where: { id: agentId },
    });

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
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const agentId = params.id;

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

    // Get the specific agent
    const agent = await prisma.user.findUnique({
      where: { id: agentId },
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

    // Return agent data (without password)
    const responseData = {
      id: agent.id,
      name: agent.name || '',
      email: agent.email,
      phone: '', // Add phone field to schema if needed
      role: agent.role as 'ADMIN' | 'AGENT',
      createdAt: agent.createdAt.toISOString(),
      propertiesCount: 0, // TODO: Calculate actual property count when user-property relation is added
    };

    return NextResponse.json({
      success: true,
      data: responseData,
    });
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