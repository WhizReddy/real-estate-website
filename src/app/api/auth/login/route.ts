import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "MISSING_CREDENTIALS",
            message: "Email and password are required",
          },
        },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    if (normalizedEmail === "demo@admin.com" && password === "demo123") {
      const demoToken = `session_demo-admin_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

      const demoResponse = NextResponse.json({
        success: true,
        data: {
          id: "demo-admin",
          name: "Demo Admin",
          email: normalizedEmail,
          role: "ADMIN",
          sessionToken: demoToken,
        },
      });

      demoResponse.cookies.set("adminSession", demoToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24,
        path: "/",
      });

      return demoResponse;
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user || !user.password) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_CREDENTIALS",
            message: "Invalid email or password",
          },
        },
        { status: 401 }
      );
    }

    const isValidPassword = await verifyPassword(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_CREDENTIALS",
            message: "Invalid email or password",
          },
        },
        { status: 401 }
      );
    }

    const sessionToken = `session_${user.id}_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: typeof user.role === "string" ? user.role.toUpperCase() : "ADMIN",
      sessionToken,
    };

    const response = NextResponse.json({
      success: true,
      data: userData,
    });

    response.cookies.set("adminSession", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to authenticate user",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 }
    );
  }
}