import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
// Note: prisma is imported lazily inside authorize to avoid instantiating
// PrismaClient at module import time (which can cause issues during Next.js
// build/prerender when environment variables or runtime aren't available).
import { verifyPassword } from "@/lib/auth";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                try {
                    // Lazy-import prisma to avoid creating PrismaClient during build
                    const { prisma } = await import("@/lib/prisma");

                    // Find user by email
                    const user = await prisma.user.findUnique({
                        where: { email: credentials.email },
                    });

                    if (!user) {
                        return null;
                    }

                    // Verify password
                    const isPasswordValid = await verifyPassword(
                        credentials.password,
                        user.password
                    );

                    if (!isPasswordValid) {
                        return null;
                    }

                    // Check if user is active
                    if (!user.isActive) {
                        return null;
                    }

                    // Return user object
                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name || user.email,
                        role: user.role,
                    };
                } catch (error) {
                    console.error("Error during authentication:", error);
                    return null;
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;
            }
            return session;
        },
    },
    pages: {
        signIn: "/auth/login",
        error: "/auth/error",
    },
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    secret: process.env.NEXTAUTH_SECRET,
};
