import { NextRequest, NextResponse } from "next/server";
import { transformPropertyRecord } from "@/lib/property-response";
import { prisma } from "@/lib/prisma";
import { resolveAuthenticatedDbUser } from "@/lib/serverAuth";

export async function GET(request: NextRequest) {
  try {
    // Try to resolve user via NextAuth, then fall back to custom adminSession cookie
    const { user: dbUser } = await resolveAuthenticatedDbUser(request);

    if (!dbUser) {
      // Gracefully return empty list for unknown user to avoid 404s on dashboards
      return NextResponse.json({ success: true, data: [], userRole: null });
    }

    // Role check (case-insensitive) — rely ONLY on resolved DB user, ignore any stale NextAuth session
    const isAdmin = (dbUser.role || '').toUpperCase() === 'ADMIN';

    // Admin: all properties; Agent: only their own
    const properties = await prisma.property.findMany({
      where: isAdmin ? undefined : { ownerId: dbUser.id },
      orderBy: { createdAt: 'desc' },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    const transformedProperties = properties.map(transformPropertyRecord);

    return NextResponse.json({
      success: true,
      data: transformedProperties,
      userRole: dbUser.role
    });

  } catch (error) {
    console.error("Error fetching user properties:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch properties",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 }
    );
  }
}
