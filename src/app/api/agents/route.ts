import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateAgentData } from "@/lib/validation";
import { hashPassword } from "@/lib/auth";
import { withAdminAuth } from "@/lib/auth-middleware";

/*
 * Agents API
 *
 * This route handles listing and creating agent users.  It improves upon
 * the original implementation by calculating the number of properties
 * associated with each agent.  The `User` model in the Prisma schema has
 * a `properties` relation pointing to `Property` records via the
 * `ownerId` field, so counting the number of properties is as simple as
 * using Prisma's `_count` feature.  See the `schema.prisma` file for
 * details on the relationship.  If no properties are associated with
 * an agent, the count will be zero.
 */

// GET /api/agents
// Returns a list of agents (users) with their property counts
export const GET = withAdminAuth(async (request: NextRequest) => {
  try {
    // Fetch all users and include the count of their associated properties.
    // Using `_count` avoids multiple separate queries per user and leverages
    // Prisma's efficient aggregation under the hood.
    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        _count: {
          select: { properties: true },
        },
      },
    });

    // Map users into the response shape expected by the admin panel.  If
    // additional fields such as phone numbers are added to the `User`
    // model in the future, populate them here.  The `_count.properties`
    // field contains the number of Property records with `ownerId = user.id`.
    const agentsWithCounts = users.map((user) => ({
      id: user.id,
      name: user.name || '',
      email: user.email,
      phone: '', // Placeholder: extend the User schema to store phone numbers
      role: user.role as 'ADMIN' | 'AGENT',
      createdAt: user.createdAt.toISOString(),
      propertiesCount: user._count?.properties ?? 0,
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

// POST /api/agents
// Creates a new agent user.  This implementation mirrors the original code
// but is included here so that the file is self‑contained and can be
// extended easily.  It validates input, hashes the password, prevents
// duplicate emails, and returns the newly created agent without a
// password field.  See `validateAgentData` for input validation logic.
export const POST = withAdminAuth(async (request: NextRequest) => {
  try {
    const data = await request.json();

    // Validate and sanitize agent data
    const validationResult = validateAgentData(data);
    if (!validationResult.isValid) {
      const errorDetails: Record<string, string> = {};
      validationResult.errors.forEach((error) => {
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
    // Prepare response without password
    const responseData = {
      id: newAgent.id,
      name: newAgent.name || '',
      email: newAgent.email,
      phone: sanitizedData.phone || '',
      role: newAgent.role as 'ADMIN' | 'AGENT',
      createdAt: newAgent.createdAt.toISOString(),
    };
    return NextResponse.json({ success: true, data: responseData });
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