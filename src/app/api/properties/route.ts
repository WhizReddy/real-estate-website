import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const properties = await prisma.property.findMany({
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

    const property = await prisma.property.create({
      data: {
        title: data.title,
        description: data.description,
        price: data.price,
        street: data.street,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode || "",
        latitude: data.latitude,
        longitude: data.longitude,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        squareFootage: data.squareFootage,
        propertyType: data.propertyType.toUpperCase(),
        yearBuilt: data.yearBuilt,
        images: JSON.stringify(data.images || []),
        features: JSON.stringify(data.features || []),
        status: data.status ? data.status.toUpperCase() : "ACTIVE",
        listingType: data.listingType.toUpperCase(),
        isPinned: data.isPinned || false,
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
      createdAt: property.createdAt.toISOString(),
      updatedAt: property.updatedAt.toISOString(),
    };

    return NextResponse.json(transformedProperty);
  } catch (error) {
    console.error("Error creating property:", error);
    return NextResponse.json(
      { error: "Failed to create property" },
      { status: 500 }
    );
  }
}
