import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateAgentData } from "@/lib/validation";
import { hashPassword } from "@/lib/auth";
import { withAdminAuth } from "@/lib/auth-middleware";

export const GET = withAdminAuth(async (request: NextRequest) => {
  try {
    // Get all users (agents) with their property counts
    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    // Get property counts for each user
    // Note: This assumes properties will have a userId field in the future
    // For now, we'll return 0 for all agents since properties don't have user association yet
    const agentsWithCounts = users.map((user) => ({
      id: user.id,
      name: user.name || '',
      email: user.email,
      phone: '', // Add phone field to schema if needed
      role: user.role as 'ADMIN' | 'AGENT',
      createdAt: user.createdAt.toISOString(),
      propertiesCount: 0, // TODO: Calculate actual property count when user-property relation is added
    }));

    return NextResponse.json({
      success: true,
      data: agentsWithCounts,
    });
  } catch (error) {
    console.error("Error fetching agents:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch agents",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
});

export const POST = withAdminAuth(async (request: NextRequest) => {
  try {
    const data = await request.json();

    // Validate and sanitize agent data
    const validationResult = validateAgentData(data);

    if (!validationResult.isValid) {
      const errorDetails: Record<string, string> = {};
      validationResult.errors.forEach(error => {
        errorDetails[error.field] = error.message;
      });

      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid input data",
            details: errorDetails,
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const sanitizedData = validationResult.sanitizedData!;

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: sanitizedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "DUPLICATE_EMAIL",
            message: "An agent with this email already exists",
            details: { email: "Email address is already in use" },
          },
          timestamp: new Date().toISOString(),
        },
        { status: 409 }
      );
    }

    // Hash the password
    const hashedPassword = await hashPassword(sanitizedData.password);

    // Create the agent in the database
    const newAgent = await prisma.user.create({
      data: {
        name: sanitizedData.name,
        email: sanitizedData.email,
        password: hashedPassword,
        role: sanitizedData.role,
      },
    });

    // Return the created agent (without password)
    const responseData = {
      id: newAgent.id,
      name: newAgent.name || '',
      email: newAgent.email,
      phone: sanitizedData.phone || '',
      role: newAgent.role as 'ADMIN' | 'AGENT',
      createdAt: newAgent.createdAt.toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    console.error("Error creating agent:", error);
    
    // Handle specific database errors
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "DUPLICATE_EMAIL",
              message: "An agent with this email already exists",
              details: { email: "Email address is already in use" },
            },
            timestamp: new Date().toISOString(),
          },
          { status: 409 }
        );
      }
      
      if (error.message.includes('Foreign key constraint')) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "INVALID_REFERENCE",
              message: "Invalid reference to related data",
              details: error.message,
            },
            timestamp: new Date().toISOString(),
          },
          { status: 400 }
        );
      }

      if (error.message.includes('Failed to hash password')) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "PASSWORD_HASH_ERROR",
              message: "Failed to process password",
              details: "Password hashing failed",
            },
            timestamp: new Date().toISOString(),
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to create agent",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
});