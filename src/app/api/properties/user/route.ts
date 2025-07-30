import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Get session using NextAuth
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const userRole = session.user.role;

    // Get user to verify they exist
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

    if (user.role === 'admin' || userRole === 'admin') {
      // Admins can see all properties
      properties = await prisma.property.findMany({
        // Temporarily removed owner relation until ownerId column is added
        // include: {
        //   owner: true, // Include agent/owner information
        // },
        orderBy: {
          createdAt: 'desc'
        }
      });
    } else {
      // Agents see properties assigned to them based on a consistent algorithm
      // This simulates property ownership until we implement the full ownership system
      const allProperties = await prisma.property.findMany({
        // Temporarily removed owner relation until ownerId column is added
        // include: {
        //   owner: true, // Include agent/owner information
        // },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      // Get all agents to determine property assignment
      const allAgents = await prisma.user.findMany({
        where: { role: 'agent' },
        orderBy: { createdAt: 'asc' }
      });
      
      // Assign properties to agents in round-robin fashion based on property creation order
      properties = allProperties.filter((property, index) => {
        if (allAgents.length === 0) return false;
        const assignedAgentIndex = index % allAgents.length;
        const assignedAgent = allAgents[assignedAgentIndex];
        return assignedAgent.id === userId;
      });
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