import { NextResponse } from "next/server";

const SESSION_COOKIE = "jm_session";
const SESSION_DURATION = 60 * 60 * 24 * 7; // 7 days

// POST /api/auth/session — set session cookie after Firebase login
export async function POST(request: Request) {
    try {
        const { idToken } = await request.json();
        if (!idToken) {
            return NextResponse.json({ error: "No token provided" }, { status: 400 });
        }

        // In production: verify idToken with Firebase Admin SDK and create a session cookie.
        // For MVP, we store the idToken directly in an httpOnly cookie.
        // This is secure enough for development; swap out for Admin SDK sessionCookie in prod.
        const response = NextResponse.json({ status: "ok" });
        response.cookies.set(SESSION_COOKIE, idToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: SESSION_DURATION,
            path: "/",
        });
        return response;
    } catch {
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}

// DELETE /api/auth/session — clear session on sign out
export async function DELETE() {
    const response = NextResponse.json({ status: "ok" });
    response.cookies.set(SESSION_COOKIE, "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 0,
        path: "/",
    });
    return response;
}

// GET /api/auth/session — check session status
export async function GET(request: Request) {
    const cookie = request.headers.get("cookie") ?? "";
    const hasSession = cookie.includes(SESSION_COOKIE + "=");
    return NextResponse.json({ authenticated: hasSession });
}
