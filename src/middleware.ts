import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
    const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
    });

    const { pathname } = request.nextUrl;

    // Define protected routes
    const protectedRoutes = [
        "/dashboard",
        "/products",
        "/receipts",
        "/deliveries",
        "/settings",
        "/profile",
        "/api/dashboard",
    ];

    // Check if the current path is a protected route
    const isProtectedRoute = protectedRoutes.some((route) =>
        pathname.startsWith(route)
    );

    // Redirect to login if accessing protected route without authentication
    if (isProtectedRoute && !token) {
        const url = new URL("/auth/login", request.url);
        url.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(url);
    }

    // Redirect to dashboard if authenticated user tries to access auth pages
    if (token && pathname.startsWith("/auth")) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/products/:path*",
        "/receipts/:path*",
        "/deliveries/:path*",
        "/settings/:path*",
        "/profile/:path*",
        "/auth/:path*",
        "/api/dashboard/:path*",
    ],
};
