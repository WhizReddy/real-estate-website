import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract search parameters
    const searchTerm = searchParams.get('search') || '';
    const minPrice = searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice')!) : undefined;
    const maxPrice = searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!) : undefined;
    const propertyType = searchParams.get('propertyType') || '';
    const listingType = searchParams.get('listingType') || '';
    const bedrooms = searchParams.get('bedrooms') ? parseInt(searchParams.get('bedrooms')!) : undefined;
    const bathrooms = searchParams.get('bathrooms') ? parseInt(searchParams.get('bathrooms')!) : undefined;
    const city = searchParams.get('city') || '';
    const status = searchParams.get('status') || 'active';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');

    // Build where clause
    const where: any = {
      status: status.toUpperCase(),
    };

    // Add search term filter
    if (searchTerm) {
      where.OR = [
        { title: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
        { street: { contains: searchTerm, mode: 'insensitive' } },
        { city: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    // Add price filters
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    // Add property type filter
    if (propertyType) {
      where.propertyType = propertyType.toUpperCase();
    }

    // Add listing type filter
    if (listingType) {
      where.listingType = listingType.toUpperCase();
    }

    // Add bedrooms filter
    if (bedrooms !== undefined) {
      where.bedrooms = bedrooms;
    }

    // Add bathrooms filter
    if (bathrooms !== undefined) {
      where.bathrooms = { gte: bathrooms };
    }

    // Add city filter
    if (city) {
      where.city = { contains: city, mode: 'insensitive' };
    }

    // Build order by clause
    const orderBy: any = {};
    if (sortBy === 'price') {
      orderBy.price = sortOrder;
    } else if (sortBy === 'createdAt') {
      orderBy.createdAt = sortOrder;
    } else if (sortBy === 'squareFootage') {
      orderBy.squareFootage = sortOrder;
    } else {
      orderBy.createdAt = 'desc';
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute queries
    const [properties, totalCount] = await Promise.all([
      prisma.property.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      prisma.property.count({ where }),
    ]);

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

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      properties: transformedProperties,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage,
        hasPrevPage,
        limit,
      },
      filters: {
        searchTerm,
        minPrice,
        maxPrice,
        propertyType,
        listingType,
        bedrooms,
        bathrooms,
        city,
        status,
        sortBy,
        sortOrder,
      },
    });
  } catch (error) {
    console.error("Error searching properties:", error);
    return NextResponse.json(
      { error: "Failed to search properties" },
      { status: 500 }
    );
  }
}