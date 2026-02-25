/**
 * POST /api/admin/set-role
 * System admin only — sets a Firebase custom claim + Firestore role for a target user.
 *
 * Body: { targetUid: string, role: "citizen" | "officer" | "dept_admin" | "system_admin" }
 */
import { NextResponse, type NextRequest } from "next/server";
import { adminAuth, adminDb, adminReady } from "@/lib/firebase-admin";
import { validateSession, requireRole } from "@/lib/auth-middleware";

const VALID_ROLES = ["citizen", "officer", "dept_admin", "system_admin"] as const;

export async function POST(request: NextRequest) {
    if (!adminReady) {
        return NextResponse.json(
            { error: "Admin SDK not configured. Add FIREBASE_ADMIN_SERVICE_ACCOUNT_KEY." },
            { status: 503 }
        );
    }

    // Validate caller is system_admin
    let session;
    try {
        session = await validateSession(request);
        requireRole(session, "system_admin");
    } catch (e) {
        if (e instanceof Response) return e;
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { targetUid, role } = await request.json();

    if (!targetUid || !role) {
        return NextResponse.json({ error: "targetUid and role are required" }, { status: 400 });
    }

    if (!VALID_ROLES.includes(role as typeof VALID_ROLES[number])) {
        return NextResponse.json(
            { error: `Invalid role. Must be one of: ${VALID_ROLES.join(", ")}` },
            { status: 400 }
        );
    }

    try {
        // 1. Set Firebase custom claim
        await adminAuth.setCustomUserClaims(targetUid, { role });

        // 2. Mirror in Firestore so client-side reads are consistent
        await adminDb.collection("users").doc(targetUid).set({ role }, { merge: true });

        // 3. Revoke existing tokens to force re-login with new claims
        await adminAuth.revokeRefreshTokens(targetUid);

        return NextResponse.json({
            success: true,
            message: `Role '${role}' set for user ${targetUid}. Their session has been revoked — they must log in again.`,
        });
    } catch (err) {
        console.error("[set-role]", err);
        return NextResponse.json({ error: "Failed to set role" }, { status: 500 });
    }
}
