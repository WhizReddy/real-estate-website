import { NextRequest, NextResponse } from "next/server";

import { createErrorResponse } from "./error-handler";
import { resolveAuthenticatedDbUser } from "./serverAuth";

type AppRole = "ADMIN" | "AGENT" | "USER";

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: AppRole;
  isVirtual?: boolean;
}

export type AuthenticatedRequest = NextRequest & {
  auth: {
    user: AuthenticatedUser;
  };
};

function normalizeRole(role?: string | null): AppRole {
  const normalized = role?.toUpperCase();

  if (normalized === "ADMIN" || normalized === "AGENT" || normalized === "USER") {
    return normalized;
  }

  return "USER";
}

function getDemoSessionUser(request: NextRequest): AuthenticatedUser | null {
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  const sessionCookie = request.cookies.get("adminSession")?.value;
  if (!sessionCookie) {
    return null;
  }

  if (sessionCookie.startsWith("session_demo-admin_")) {
    return {
      id: "demo-admin",
      email: "demo@admin.com",
      name: "Demo Admin",
      role: "ADMIN",
      isVirtual: true,
    };
  }

  if (sessionCookie.startsWith("session_fallback-admin_")) {
    return {
      id: "fallback-admin",
      email: "admin@example.com",
      name: "Fallback Admin",
      role: "ADMIN",
      isVirtual: true,
    };
  }

  return null;
}

export async function getAuthenticatedUser(
  request: NextRequest
): Promise<AuthenticatedUser | null> {
  const { user } = await resolveAuthenticatedDbUser(request);

  if (user) {
    return {
      id: user.id,
      email: user.email,
      name: user.name || "Authenticated User",
      role: normalizeRole(user.role),
    };
  }

  return getDemoSessionUser(request);
}

function withRoles<T extends unknown[]>(
  allowedRoles: AppRole[],
  handler: (request: AuthenticatedRequest, ...args: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    const user = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json(
        createErrorResponse(
          "UNAUTHORIZED",
          "Authentication required",
          "Please log in to access this resource"
        ),
        { status: 401 }
      );
    }

    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json(
        createErrorResponse(
          "FORBIDDEN",
          "Insufficient permissions",
          "You do not have sufficient permissions for this action"
        ),
        { status: 403 }
      );
    }

    const authenticatedRequest = request as AuthenticatedRequest;
    authenticatedRequest.auth = { user };

    return handler(authenticatedRequest, ...args);
  };
}

export function withAuth<T extends unknown[]>(
  handler: (request: AuthenticatedRequest, ...args: T) => Promise<NextResponse>
) {
  return withRoles(["ADMIN", "AGENT", "USER"], handler);
}

export function withAgentAuth<T extends unknown[]>(
  handler: (request: AuthenticatedRequest, ...args: T) => Promise<NextResponse>
) {
  return withRoles(["ADMIN", "AGENT"], handler);
}

export function withAdminAuth<T extends unknown[]>(
  handler: (request: AuthenticatedRequest, ...args: T) => Promise<NextResponse>
) {
  return withRoles(["ADMIN"], handler);
}

export async function getUserSession(request: NextRequest): Promise<{
  userId?: string;
  role?: AppRole;
  isAdmin?: boolean;
}> {
  const user = await getAuthenticatedUser(request);

  if (!user) {
    return {};
  }

  return {
    userId: user.id,
    role: user.role,
    isAdmin: user.role === "ADMIN",
  };
}
