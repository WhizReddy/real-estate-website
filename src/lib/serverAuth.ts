import { getServerSession } from "next-auth/next";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

/**
 * Resolve the currently authenticated database user.
 * Supports both NextAuth sessions and the custom adminSession cookie used by the admin login.
 */
export async function resolveAuthenticatedDbUser(req: NextRequest) {
  // 1) Try NextAuth session first
  try {
    const session = await getServerSession(authOptions);
    if (session?.user) {
      const byId = session.user.id
        ? await prisma.user.findUnique({ where: { id: session.user.id } })
        : null;
      if (byId) {
        return { user: byId, source: "nextauth" as const };
      }
      const byEmail = session.user.email
        ? await prisma.user.findUnique({ where: { email: session.user.email } })
        : null;
      if (byEmail) {
        return { user: byEmail, source: "nextauth" as const };
      }
    }
  } catch {
    // ignore and fallback
  }

  // 2) Fallback to custom cookie set by /api/auth/login
  try {
    const sessionCookie = req.cookies.get("adminSession")?.value;
    if (sessionCookie) {
      // Expected format: session_<userId>_<timestamp>_<random>
      const match = sessionCookie.match(/^session_([^_]+)_/);
  const userIdFromCookie = match?.[1];
      if (userIdFromCookie) {
        const user = await prisma.user.findUnique({ where: { id: userIdFromCookie } });
        if (user) {
          return { user, source: "cookie" as const };
        }
      }
    }
  } catch {
    // ignore
  }

  return { user: null, source: null };
}
