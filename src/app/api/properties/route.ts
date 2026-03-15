import { NextResponse } from "next/server";

import { clearCache } from "@/lib/cache";
import {
  AuthenticatedRequest,
  withAgentAuth,
} from "@/lib/auth-middleware";
import { transformPropertyRecord } from "@/lib/property-response";
import { prisma } from "@/lib/prisma";
import { validatePropertyData } from "@/lib/validation";

export const dynamic = "force-dynamic";

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

    const transformedProperties = properties.map(transformPropertyRecord);

    return NextResponse.json({ properties: transformedProperties });
  } catch (error) {
    console.error("Error fetching properties:", error);
    return NextResponse.json(
      { error: "Failed to fetch properties" },
      { status: 500 }
    );
  }
}

export const POST = withAgentAuth(async (request: AuthenticatedRequest) => {
  try {
    const ownerIdToUse = request.auth.user.isVirtual
      ? undefined
      : request.auth.user.id;
    const data = await request.json();

    const validationResult = validatePropertyData(data);

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
      ...(ownerIdToUse ? { ownerId: ownerIdToUse } : {}),
    };

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

    clearCache();

    return NextResponse.json({
      success: true,
      data: transformPropertyRecord(property),
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
});
