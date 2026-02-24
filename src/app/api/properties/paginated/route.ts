import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCachedData } from "@/lib/cache";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse pagination params with safe defaults
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '18')));
    const skip = (page - 1) * limit;

    const cacheKey = `properties-paginated-${page}-${limit}`;

    // Fetch properties and total count in parallel
    const [properties, total] = await getCachedData(
      cacheKey,
      () => Promise.all([
        prisma.property.findMany({
          where: {
            status: "ACTIVE"
          },
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            }
          },
          orderBy: [
            { isPinned: "desc" }, // Pinned properties first
            { createdAt: "desc" }
          ],
          skip,
          take: limit,
        }),
        prisma.property.count({
          where: { status: "ACTIVE" }
        })
      ]),
      60000 // Cache for 1 minute
    );

    const totalPages = Math.ceil(total / limit);
    const hasMore = page < totalPages;

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
      agent: property.owner ? {
        id: property.owner.id,
        name: property.owner.name || 'Real Estate Agent',
        email: property.owner.email,
        phone: '+355 69 123 4567',
      } : {
        id: 'default-agent',
        name: 'Real Estate Agent',
        email: 'agent@realestate-tirana.al',
        phone: '+355 69 123 4567',
      },
      createdAt: property.createdAt.toISOString(),
      updatedAt: property.updatedAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      properties: transformedProperties,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore,
      }
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
      }
    });
  } catch (error) {
    console.error("Error fetching paginated properties:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch properties",
        properties: [],
        pagination: {
          page: 1,
          limit: 18,
          total: 0,
          totalPages: 0,
          hasMore: false
        }
      },
      { status: 500 }
    );
  }
}
