import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Test database connection with a simple query
    await prisma.$queryRaw`SELECT 1`;
    
    return NextResponse.json({
      status: "connected",
      timestamp: new Date().toISOString(),
      database: "postgresql"
    });
  } catch (error) {
    console.error("Database health check failed:", error);
    
    return NextResponse.json(
      {
        status: "disconnected",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}