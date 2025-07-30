import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validatePropertyData } from "@/lib/validation";

export async function GET() {
  try {
    const properties = await prisma.property.findMany({
      // Temporarily removed owner relation until ownerId column is added
      // include: {
      //   owner: true, // Include agent/owner information
      // },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform the data to match the expected format
    const transformedProperties = properties.map((property) => ({
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
      agent: {
        id: 'default-agent',
        name: 'Real Estate Agent',
        email: 'agent@realestate-tirana.al',
        phone: '+355 69 123 4567',
      },
      createdAt: property.createdAt.toISOString(),
      updatedAt: property.updatedAt.toISOString(),
    }));

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
    const data = await request.json();

    // Use comprehensive validation and sanitization
    const validationResult = validatePropertyData(data);

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
    };

    const property = await prisma.property.create({
      data: sanitizedData,
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
