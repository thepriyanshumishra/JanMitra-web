/**
 * GET    /api/departments         — list all departments (public)
 * POST   /api/departments         — create department (system_admin only)
 * PATCH  /api/departments/[id]    — update department (system_admin only)
 * DELETE /api/departments/[id]    — delete department (system_admin only)
 */
import { NextResponse, type NextRequest } from "next/server";
import { adminDb, adminReady } from "@/lib/firebase-admin";
import { validateSession, requireRole } from "@/lib/auth-middleware";

// ── GET (public) ──────────────────────────────────────────────────
export async function GET() {
    if (!adminReady) {
        return NextResponse.json({ departments: [] });
    }
    try {
        const snap = await adminDb.collection("departments").orderBy("name", "asc").get();
        const departments = snap.docs.map((d) => d.data());
        return NextResponse.json({ departments });
    } catch (err) {
        console.error("[departments GET]", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// ── POST (system_admin) ───────────────────────────────────────────
export async function POST(req: NextRequest) {
    let session;
    try {
        session = await validateSession(req);
        requireRole(session, "system_admin");
    } catch (e) {
        if (e instanceof Response) return e;
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!adminReady) {
        return NextResponse.json({ error: "Admin SDK not configured" }, { status: 503 });
    }

    const { name, slug, description, slaHoursDefault = 168 } = await req.json();

    if (!name || !slug) {
        return NextResponse.json({ error: "name and slug are required" }, { status: 400 });
    }

    try {
        const now = new Date().toISOString();
        const dept = {
            id: slug,
            name,
            slug,
            description: description ?? "",
            slaHoursDefault,
            governanceHealth: "stable",
            createdAt: now,
        };
        await adminDb.collection("departments").doc(slug).set(dept);
        return NextResponse.json({ success: true, department: dept });
    } catch (err) {
        console.error("[departments POST]", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
