import { NextRequest, NextResponse } from "next/server";
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
      orderBy: { createdAt: 'desc' }
    });

    // Transform properties to match the expected format
    const transformedProperties = properties.map(property => ({
      id: property.id,
      title: property.title,
      description: property.description,
      price: property.price,
      address: {
        street: property.street,
        city: property.city,
        state: property.state,
        zipCode: property.zipCode,
        coordinates: {
          lat: property.latitude,
          lng: property.longitude
        }
      },
      details: {
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        squareFootage: property.squareFootage,
        propertyType: property.propertyType.toLowerCase() as "house" | "condo" | "townhouse" | "apartment",
        yearBuilt: property.yearBuilt
      },
      images: JSON.parse(property.images),
      features: JSON.parse(property.features),
      status: property.status.toLowerCase() as "active" | "inactive" | "pending" | "sold",
      listingType: property.listingType.toLowerCase() as "sale" | "rent",
      isPinned: property.isPinned,
      agent: {
        id: dbUser.id,
        name: dbUser.name || 'Unknown Agent',
        email: dbUser.email,
        phone: '', // Not stored in user table
        photo: undefined
      },
      createdAt: property.createdAt.toISOString(),
      updatedAt: property.updatedAt.toISOString()
    }));

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