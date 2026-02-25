/**
 * PATCH  /api/departments/[id]  — update department
 * DELETE /api/departments/[id]  — delete department
 */
import { NextResponse, type NextRequest } from "next/server";
import { adminDb, adminReady } from "@/lib/firebase-admin";
import { validateSession, requireRole } from "@/lib/auth-middleware";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
    const { id } = await params;

    let session;
    try {
        session = await validateSession(req);
        requireRole(session, "system_admin");
    } catch (e) {
        if (e instanceof Response) return e;
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!adminReady) return NextResponse.json({ error: "Admin SDK not configured" }, { status: 503 });

    const updates = await req.json();
    delete updates.id; // Prevent ID overwrite

    try {
        await adminDb.collection("departments").doc(id).update({ ...updates, updatedAt: new Date().toISOString() });
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("[departments PATCH]", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: Params) {
    const { id } = await params;

    let session;
    try {
        session = await validateSession(req);
        requireRole(session, "system_admin");
    } catch (e) {
        if (e instanceof Response) return e;
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!adminReady) return NextResponse.json({ error: "Admin SDK not configured" }, { status: 503 });

    try {
        await adminDb.collection("departments").doc(id).delete();
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("[departments DELETE]", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
