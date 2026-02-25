/**
 * GET   /api/grievances/[id]  — fetch a single grievance
 * PATCH /api/grievances/[id]  — officer/admin status update (writes event)
 */
import { NextResponse, type NextRequest } from "next/server";
import { adminDb, adminReady } from "@/lib/firebase-admin";
import { validateSession } from "@/lib/auth-middleware";
import { FieldValue } from "firebase-admin/firestore";

type Params = { params: Promise<{ id: string }> };

// Status → event type mapping
const STATUS_EVENT: Record<string, string> = {
    acknowledged: "OFFICER_ACKNOWLEDGED",
    in_progress: "UPDATE_PROVIDED",
    escalated: "ESCALATED",
    closed: "COMPLAINT_CLOSED",
    final_closed: "FINAL_CLOSED",
};

// ── GET ───────────────────────────────────────────────────────────
export async function GET(req: NextRequest, { params }: Params) {
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

    try {
        const doc = await adminDb.collection("grievances").doc(grievanceId).get();
        if (!doc.exists) {
            return NextResponse.json({ error: "Grievance not found" }, { status: 404 });
        }

        const grievance = doc.data()!;
        const isOwner = grievance.citizenId === session.uid;
        const isStaff = ["officer", "dept_admin", "system_admin"].includes(session.role ?? "");
        const isPublic = grievance.privacyLevel === "public";

        if (!isOwner && !isStaff && !isPublic) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        return NextResponse.json({ grievance });
    } catch (err) {
        console.error("[grievance GET]", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// ── PATCH ─────────────────────────────────────────────────────────
export async function PATCH(req: NextRequest, { params }: Params) {
    const { id: grievanceId } = await params;

    let session;
    try {
        session = await validateSession(req);
    } catch (e) {
        if (e instanceof Response) return e;
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!["officer", "dept_admin", "system_admin"].includes(session.role ?? "")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!adminReady) {
        return NextResponse.json({ error: "Admin SDK not configured" }, { status: 503 });
    }

    const body = await req.json();
    const { status, officerId, note, estimatedResolutionDate } = body;

    if (!status) {
        return NextResponse.json({ error: "status is required" }, { status: 400 });
    }

    try {
        const now = new Date();
        const grievanceRef = adminDb.collection("grievances").doc(grievanceId);
        const grievanceSnap = await grievanceRef.get();

        if (!grievanceSnap.exists) {
            return NextResponse.json({ error: "Grievance not found" }, { status: 404 });
        }

        const grievance = grievanceSnap.data()!;

        // Build update payload
        const updates: Record<string, unknown> = {
            status,
            updatedAt: now.toISOString(),
        };

        if (officerId) updates.officerId = officerId;
        if (status === "closed" || status === "final_closed") {
            updates.closedAt = now.toISOString();
            updates.slaStatus = grievance.slaDeadlineAt > now.toISOString() ? "on_track" : "breached";
        }
        if (status === "escalated") {
            // Reset SLA — give 3 more days on escalation
            const newDeadline = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
            updates.slaDeadlineAt = newDeadline.toISOString();
            updates.slaStatus = "on_track";
            updates.reopenCount = FieldValue.increment(0); // no-op, just ensures field exists
        }

        const eventType = STATUS_EVENT[status] ?? "UPDATE_PROVIDED";
        const eventId = `${grievanceId}_${eventType}_${Date.now()}`;
        const event = {
            id: eventId,
            grievanceId,
            eventType,
            actorId: session.uid,
            actorRole: session.role,
            payload: { status, note: note ?? "", estimatedResolutionDate },
            createdAt: now.toISOString(),
        };

        // Atomic batch: update grievance + append event
        const batch = adminDb.batch();
        batch.update(grievanceRef, updates);
        batch.create(adminDb.collection("grievanceEvents").doc(eventId), event);
        await batch.commit();

        return NextResponse.json({ success: true, grievanceId, status, event });
    } catch (err) {
        console.error("[grievance PATCH]", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
