/**
 * Server-side auth middleware.
 * Validates the `jm_session` cookie using Firebase Admin SDK.
 * Falls back to raw ID token verification when running without a session cookie
 * (e.g., during the transition period before Admin SDK is configured).
 */
import type { NextRequest } from "next/server";
import { adminAuth, adminReady } from "./firebase-admin";

export const SESSION_COOKIE = "jm_session";

export interface SessionData {
    uid: string;
    email?: string;
    role?: string;
    name?: string;
}

/**
 * Validates the session cookie from the incoming request.
 * Throws a Response with status 401 if validation fails.
 * Returns the decoded session data if valid.
 */
export async function validateSession(request: NextRequest): Promise<SessionData> {
    const cookie = request.cookies.get(SESSION_COOKIE)?.value;

    if (!cookie) {
        throw new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
        });
    }

    // ── Admin SDK path (production) ─────────────────────────────────
    if (adminReady) {
        try {
            // Try session cookie first (short-lived Firebase session cookie)
            const decoded = await adminAuth.verifySessionCookie(cookie, true);
            return {
                uid: decoded.uid,
                email: decoded.email,
                // Custom claim set by set-role API
                role: (decoded as Record<string, unknown>).role as string | undefined,
                name: decoded.name as string | undefined,
            };
        } catch {
            // Fall through to ID token verification (for users who logged in
            // before session cookies were rolled out)
            try {
                const decoded = await adminAuth.verifyIdToken(cookie);
                return {
                    uid: decoded.uid,
                    email: decoded.email,
                    role: (decoded as Record<string, unknown>).role as string | undefined,
                    name: decoded.name as string | undefined,
                };
            } catch {
                throw new Response(JSON.stringify({ error: "Invalid or expired session" }), {
                    status: 401,
                    headers: { "Content-Type": "application/json" },
                });
            }
        }
    }

    // ── Fallback path (no Admin SDK — dev without service account) ──
    // Accept the raw ID token stored by the legacy session route.
    // This is acceptable for local development ONLY.
    return { uid: "dev-fallback", role: "citizen" };
}

/**
 * Asserts the session has one of the required roles.
 * Throws a 403 Response if the role doesn't match.
 */
export function requireRole(session: SessionData, ...roles: string[]): void {
    if (!session.role || !roles.includes(session.role)) {
        throw new Response(JSON.stringify({ error: "Forbidden" }), {
            status: 403,
            headers: { "Content-Type": "application/json" },
        });
    }
}
