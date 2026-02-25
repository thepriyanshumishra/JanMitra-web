/**
 * POST /api/grievances/[id]/support — add a support signal
 * Prevents duplicate: one citizen can support a given complaint once.
 */
import { NextResponse, type NextRequest } from "next/server";
import { adminDb, adminReady } from "@/lib/firebase-admin";
import { validateSession } from "@/lib/auth-middleware";
import { FieldValue } from "firebase-admin/firestore";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
    const { id: grievanceId } = await params;

    let session;
    try {
        session = await validateSession(req);
    } catch (e) {
        if (e instanceof Response) return e;
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!adminReady) {
        return NextResponse.json({ error: "Admin SDK not configured" }, { status: 503 });
    }

    // Composite key prevents duplicate votes
    const signalId = `${grievanceId}_${session.uid}`;

    try {
        const existing = await adminDb.collection("supportSignals").doc(signalId).get();
        if (existing.exists) {
            return NextResponse.json({ error: "You have already supported this complaint" }, { status: 409 });
        }

        const now = new Date().toISOString();

        const batch = adminDb.batch();
        // Create support signal
        batch.create(adminDb.collection("supportSignals").doc(signalId), {
            id: signalId,
            grievanceId,
            citizenId: session.uid,
            createdAt: now,
        });
        // Increment counter on the grievance
        batch.update(adminDb.collection("grievances").doc(grievanceId), {
            supportCount: FieldValue.increment(1),
            updatedAt: now,
        });
        await batch.commit();

        return NextResponse.json({ success: true, signalId });
    } catch (err) {
        console.error("[support POST]", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// DELETE — undo support
export async function DELETE(req: NextRequest, { params }: Params) {
    const { id: grievanceId } = await params;

    let session;
    try {
        session = await validateSession(req);
    } catch (e) {
        if (e instanceof Response) return e;
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!adminReady) return NextResponse.json({ error: "Admin SDK not configured" }, { status: 503 });

    const signalId = `${grievanceId}_${session.uid}`;

    try {
        const batch = adminDb.batch();
        batch.delete(adminDb.collection("supportSignals").doc(signalId));
        batch.update(adminDb.collection("grievances").doc(grievanceId), {
            supportCount: FieldValue.increment(-1),
            updatedAt: new Date().toISOString(),
        });
        await batch.commit();
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("[support DELETE]", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
