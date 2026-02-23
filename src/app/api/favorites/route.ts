import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

/**
 * GET /api/favorites
 * Returns the list of properties favorited by the current user.
 */
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const favorites = await prisma.favorite.findMany({
            where: { userId: session.user.id },
            include: {
                property: true
            },
            orderBy: { createdAt: "desc" }
        });

        // Transform properties similar to /api/properties if needed
        // For now, returning the raw objects
        return NextResponse.json({ favorites });
    } catch (error) {
        console.error("Error fetching favorites:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

/**
 * POST /api/favorites
 * Toggles a property as favorite for the current user.
 */
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { propertyId } = await request.json();
        if (!propertyId) {
            return NextResponse.json({ error: "Property ID is required" }, { status: 400 });
        }

        const userId = session.user.id;

        // Check if it already exists
        const existing = await prisma.favorite.findUnique({
            where: {
                userId_propertyId: {
                    userId,
                    propertyId
                }
            }
        });

        if (existing) {
            // Remove it (toggle off)
            await prisma.favorite.delete({
                where: { id: existing.id }
            });
            return NextResponse.json({ favorited: false });
        } else {
            // Add it (toggle on)
            await prisma.favorite.create({
                data: {
                    userId,
                    propertyId
                }
            });
            return NextResponse.json({ favorited: true });
        }
    } catch (error) {
        console.error("Error toggling favorite:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
