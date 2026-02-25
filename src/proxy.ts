import { NextResponse, type NextRequest } from "next/server";

// Role → allowed path prefixes
const ROLE_ROUTES: Record<string, string[]> = {
    citizen: ["/dashboard", "/submit", "/complaints"],
    officer: ["/officer"],
    dept_admin: ["/admin/dept"],
    system_admin: ["/admin"],
};

// Paths accessible only when logged OUT
const AUTH_PATHS = ["/login", "/signup", "/otp"];

// Paths accessible by anyone (no auth needed)
const PUBLIC_PATHS = ["/", "/transparency", "/departments", "/about", "/privacy"];

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Always allow public paths & Next.js internals
    if (
        PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/")) ||
        pathname.startsWith("/_next") ||
        pathname.startsWith("/api/") ||
        pathname.includes(".")
    ) {
        return NextResponse.next();
    }

    const sessionCookie = request.cookies.get("jm_session")?.value;

    // Not authenticated → redirect to login (except for auth pages)
    if (!sessionCookie) {
        if (AUTH_PATHS.some((p) => pathname.startsWith(p))) {
            return NextResponse.next();
        }
        return NextResponse.redirect(new URL(`/login?next=${pathname}`, request.url));
    }

    // Already authenticated → redirect away from auth pages
    if (AUTH_PATHS.some((p) => pathname.startsWith(p))) {
        // We'll let the client-side handle role-based redirect
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Parse role from session cookie (simple JWT-like claim stored server-side)
    // Full Firebase Admin token verification is done in API routes.
    // Middleware just checks route prefix accessibility.

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|icons/).*)",
    ],
};
