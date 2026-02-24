import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { validatePropertyData } from "@/lib/validation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { resolveAuthenticatedDbUser } from "@/lib/serverAuth";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const properties = await prisma.property.findMany({
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
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform the data to match the expected format
    const transformedProperties = properties.map((property) => {
      const owner = property.owner;

      return {
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
            lng: property.longitude,
          },
        },
        details: {
          bedrooms: property.bedrooms,
          bathrooms: property.bathrooms,
          squareFootage: property.squareFootage,
          propertyType: property.propertyType.toLowerCase(),
          yearBuilt: property.yearBuilt,
        },
        images: JSON.parse(property.images || "[]"),
        features: JSON.parse(property.features || "[]"),
        status: property.status.toLowerCase(),
        listingType: property.listingType.toLowerCase(),
        isPinned: property.isPinned,
        agent: owner
          ? {
            id: owner.id,
            name: owner.name ?? 'Agjent i Pasurive',
            email: owner.email,
            role: owner.role.toLowerCase(),
          }
          : {
            id: 'default-agent',
            name: 'Real Estate Agent',
            email: 'agent@realestate-tirana.al',
            role: 'agent',
          },
        createdAt: property.createdAt.toISOString(),
        updatedAt: property.updatedAt.toISOString(),
      };
    });

    return NextResponse.json({ properties: transformedProperties });
  } catch (error) {
    console.error("Error fetching properties:", error);
    return NextResponse.json(
      { error: "Failed to fetch properties" },
      { status: 500 }
    );
  }
}


export async function POST(request: NextRequest) {
  try {
    // Resolve authenticated user (NextAuth session or custom cookie)
    const { user: dbUser } = await resolveAuthenticatedDbUser(request);
    const session = await getServerSession(authOptions);
    console.log('🔐 Session during property creation:', {
      hasSession: !!session,
      userId: session?.user?.id,
      userEmail: session?.user?.email,
      userRole: session?.user?.role,
      resolvedDbUserId: dbUser?.id,
    });

    const ownerIdToUse: string | undefined = dbUser?.id;
    const data = await request.json();

    // Use comprehensive validation and sanitization
    const validationResult = validatePropertyData(data);

    if (!validationResult.isValid) {
      console.warn('❌ Validation errors during property creation:', validationResult.errors);
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

    // Use sanitized data for database insertion
    const sanitizedData = {
      title: validationResult.sanitizedData.title,
      description: validationResult.sanitizedData.description,
      price: validationResult.sanitizedData.price,
      street: validationResult.sanitizedData.street,
      city: validationResult.sanitizedData.city,
      state: validationResult.sanitizedData.state,
      zipCode: validationResult.sanitizedData.zipCode,
      latitude: validationResult.sanitizedData.latitude,
      longitude: validationResult.sanitizedData.longitude,
      bedrooms: validationResult.sanitizedData.bedrooms,
      bathrooms: validationResult.sanitizedData.bathrooms,
      squareFootage: validationResult.sanitizedData.squareFootage,
      propertyType: validationResult.sanitizedData.propertyType.toUpperCase(),
      yearBuilt: validationResult.sanitizedData.yearBuilt,
      images: JSON.stringify(validationResult.sanitizedData.images),
      features: JSON.stringify(validationResult.sanitizedData.features),
      status: validationResult.sanitizedData.status.toUpperCase(),
      listingType: validationResult.sanitizedData.listingType.toUpperCase(),
      isPinned: validationResult.sanitizedData.isPinned,
      // If user is logged in AND maps to a real DB user, associate property with agent/user
      ...(ownerIdToUse ? { ownerId: ownerIdToUse } : {}),
    };

    // For logging, safely read ownerId if present on the object
    const logOwnerId = (sanitizedData as { ownerId?: string }).ownerId;
    console.log('📝 Creating property with data:', {
      hasOwnerId: !!logOwnerId,
      ownerId: logOwnerId,
      title: sanitizedData.title,
    });

    const property = await prisma.property.create({
      data: sanitizedData,
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

    // Transform the response to match expected format
    const transformedProperty = {
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
          lng: property.longitude,
        },
      },
      details: {
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        squareFootage: property.squareFootage,
        propertyType: property.propertyType.toLowerCase(),
        yearBuilt: property.yearBuilt,
      },
      images: JSON.parse(property.images || "[]"),
      features: JSON.parse(property.features || "[]"),
      status: property.status.toLowerCase(),
      listingType: property.listingType.toLowerCase(),
      isPinned: property.isPinned,
      agent: property.owner
        ? {
          id: property.owner.id,
          name: property.owner.name ?? 'Agjent i Pasurive',
          email: property.owner.email,
          role: property.owner.role.toLowerCase(),
        }
        : {
          id: 'default-agent',
          name: 'Real Estate Agent',
          email: 'agent@realestate-tirana.al',
          role: 'agent',
        },
      createdAt: property.createdAt.toISOString(),
      updatedAt: property.updatedAt.toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: transformedProperty,
    });
  } catch (error) {
    console.error("Error creating property:", error);

    // Handle specific database errors
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "DUPLICATE_ENTRY",
              message: "A property with similar details already exists",
              details: error.message,
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
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to create property",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
