import { NextResponse, type NextRequest } from "next/server";
import { adminAuth, adminDb, adminReady } from "@/lib/firebase-admin";
import { SESSION_COOKIE } from "@/lib/auth-middleware";

// Session duration: 5 days
const SESSION_DURATION_MS = 60 * 60 * 24 * 5 * 1000;
const SESSION_DURATION_SECS = 60 * 60 * 24 * 5;

// ── POST /api/auth/session — create secure session cookie ──────────
export async function POST(request: Request) {
    try {
        const { idToken } = await request.json();
        if (!idToken) {
            return NextResponse.json({ error: "No token provided" }, { status: 400 });
        }

        const response = NextResponse.json({ status: "ok" });

        if (adminReady) {
            // ── Production path: verify token then issue Firebase session cookie ──
            let uid: string;
            try {
                const decoded = await adminAuth.verifyIdToken(idToken);
                uid = decoded.uid;
            } catch {
                return NextResponse.json({ error: "Invalid ID token" }, { status: 401 });
            }

            const sessionCookie = await adminAuth.createSessionCookie(idToken, {
                expiresIn: SESSION_DURATION_MS,
            });

            // Sync Firestore role → custom claim (runs once per login)
            try {
                const userDoc = await adminDb.collection("users").doc(uid).get();
                if (userDoc.exists) {
                    const data = userDoc.data()!;
                    if (data.role) {
                        await adminAuth.setCustomUserClaims(uid, { role: data.role });
                    }
                }
            } catch { /* non-fatal */ }

            response.cookies.set(SESSION_COOKIE, sessionCookie, {
                httpOnly: true,
                secure: true,
                sameSite: "lax",
                maxAge: SESSION_DURATION_SECS,
                path: "/",
            });
        } else {
            // ── Fallback for local dev without Admin SDK ──────────────────────
            response.cookies.set(SESSION_COOKIE, idToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: SESSION_DURATION_SECS,
                path: "/",
            });
        }

        return response;
    } catch {
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}

// ── DELETE /api/auth/session — revoke session ─────────────────────
export async function DELETE(request: Request) {
    const response = NextResponse.json({ status: "ok" });

    // Try to revoke all refresh tokens for the user
    if (adminReady) {
        try {
            const cookieHeader = request.headers.get("cookie") ?? "";
            const match = cookieHeader.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`));
            if (match?.[1]) {
                const decoded = await adminAuth.verifySessionCookie(match[1]);
                await adminAuth.revokeRefreshTokens(decoded.uid);
            }
        } catch { /* best-effort */ }
    }

    response.cookies.set(SESSION_COOKIE, "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 0,
        path: "/",
    });
    return response;
}

// ── GET /api/auth/session — verify session status ─────────────────
export async function GET(request: NextRequest) {
    const cookie = request.cookies.get(SESSION_COOKIE)?.value;
    if (!cookie) return NextResponse.json({ authenticated: false });

    if (adminReady) {
        try {
            const decoded = await adminAuth.verifySessionCookie(cookie, true);
            return NextResponse.json({
                authenticated: true,
                uid: decoded.uid,
                role: (decoded as Record<string, unknown>).role,
            });
        } catch {
            try {
                const decoded = await adminAuth.verifyIdToken(cookie);
                return NextResponse.json({ authenticated: true, uid: decoded.uid });
            } catch {
                return NextResponse.json({ authenticated: false });
            }
        }
    }

    // Dev fallback: any cookie value is considered authenticated
    return NextResponse.json({ authenticated: !!cookie });
}
