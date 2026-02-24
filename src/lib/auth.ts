import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// Password hashing utilities
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Demo mode - allow quick testing without database
        if (credentials.email === "demo@admin.com" && credentials.password === "demo123") {
          return {
            id: "demo-admin",
            email: "demo@admin.com",
            name: "Demo Admin",
            role: "admin",
          };
        }

        try {
          // Find user in database
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email
            }
          });

          if (!user || !user.password) {
            return null;
          }

          // Verify password
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            return null;
          }

          const normalizedRole = typeof user.role === 'string'
            ? user.role.toLowerCase()
            : 'agent';

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: normalizedRole,
          };
        } catch (error) {
          console.error("Authentication error:", error);

          // Fallback demo credentials if database is not available
          if (credentials.email === "admin@example.com" && credentials.password === "admin123") {
            return {
              id: "fallback-admin",
              email: "admin@example.com",
              name: "Fallback Admin",
              role: "admin",
            };
          }

          return null;
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const normalizedRole = typeof user.role === 'string'
          ? user.role.toLowerCase()
          : undefined;
        if (normalizedRole) {
          token.role = normalizedRole;
        }
      } else if (typeof token.role === 'string') {
        token.role = token.role.toLowerCase();
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub ?? session.user.id;
        const normalizedRole = typeof token.role === 'string'
          ? token.role.toLowerCase()
          : session.user.role;
        session.user.role = normalizedRole;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET || 'dev-secret-change-in-production-minimum-32-chars',
  debug: process.env.NODE_ENV === 'development',
};