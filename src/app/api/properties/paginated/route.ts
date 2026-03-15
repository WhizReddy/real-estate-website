import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCachedData } from "@/lib/cache";
import { transformPropertyRecord } from "@/lib/property-response";

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
    const transformedProperties = properties.map(transformPropertyRecord);

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
