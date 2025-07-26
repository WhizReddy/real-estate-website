import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Get session token from cookie or header
    const sessionToken = request.cookies.get('adminSession')?.value || 
                         request.headers.get('authorization')?.replace('Bearer ', '');

    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "No session token" } },
        { status: 401 }
      );
    }

    // Extract user ID from session token (simple implementation)
    // In production, you'd use proper JWT or session store
    const userIdMatch = sessionToken.match(/session_([^_]+)_/);
    if (!userIdMatch) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_SESSION", message: "Invalid session token" } },
        { status: 401 }
      );
    }

    const userId = userIdMatch[1];

    // Get user to check role
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: "USER_NOT_FOUND", message: "User not found" } },
        { status: 404 }
      );
    }

    let properties;

    if (user.role === 'ADMIN') {
      // Admins can see all properties
      properties = await prisma.property.findMany({
        orderBy: {
          createdAt: 'desc'
        }
      });
    } else {
      // For now, agents can see all properties too (until we implement ownership)
      // In a real system, you'd filter by ownerId or agent assignment
      properties = await prisma.property.findMany({
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      // Limit to first few properties for agents as a demo
      properties = properties.slice(0, Math.ceil(properties.length / 2));
    }

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
        id: user.id,
        name: user.name || 'Unknown Agent',
        email: user.email,
        phone: '', // Not stored in user table
        photo: undefined
      },
      createdAt: property.createdAt.toISOString(),
      updatedAt: property.updatedAt.toISOString()
    }));

    return NextResponse.json({
      success: true,
      data: transformedProperties,
      userRole: user.role
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