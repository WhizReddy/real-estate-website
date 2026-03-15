import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCachedData } from "@/lib/cache";
import { transformPropertyRecord } from "@/lib/property-response";

export const dynamic = 'force-dynamic';
export const revalidate = 60; // Cache for 60 seconds

export async function GET() {
  try {
    const properties = await getCachedData(
      'properties-active-all',
      () => prisma.property.findMany({
        where: {
          status: "ACTIVE",
        },
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
        orderBy: [
          { isPinned: "desc" }, // Pinned properties first
          { createdAt: "desc" }, // Then by creation date
        ],
      }),
      60000
    );

    // Transform the data to match the expected format
    const transformedProperties = properties.map(transformPropertyRecord);

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
