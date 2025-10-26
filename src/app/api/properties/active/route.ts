import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const revalidate = 60; // Cache for 60 seconds

export async function GET() {
  try {
    const properties = await prisma.property.findMany({
      where: {
        status: "ACTIVE",
      },
      orderBy: [
        { isPinned: "desc" }, // Pinned properties first
        { createdAt: "desc" }, // Then by creation date
      ],
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

    return NextResponse.json({ 
      properties: transformedProperties,
      count: transformedProperties.length 
    });
  } catch (error) {
    console.error("Error fetching active properties:", error);
    return NextResponse.json(
      { error: "Failed to fetch active properties" },
      { status: 500 }
    );
  }
}