/**
 * GET  /api/grievances/[id]/events — list all events for a grievance
 * POST /api/grievances/[id]/events — append a new event (officer actions etc)
 */
import { NextResponse, type NextRequest } from "next/server";
import { adminDb, adminReady } from "@/lib/firebase-admin";
import { validateSession } from "@/lib/auth-middleware";

type Params = { params: Promise<{ id: string }> };

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
        return NextResponse.json({ events: [], note: "Admin SDK not configured" });
    }

    try {
        // Check grievance exists + caller has access
        const grievanceDoc = await adminDb.collection("grievances").doc(grievanceId).get();
        if (!grievanceDoc.exists) {
            return NextResponse.json({ error: "Grievance not found" }, { status: 404 });
        }
        const grievance = grievanceDoc.data()!;

        const isOwner = grievance.citizenId === session.uid;
        const isStaff = ["officer", "dept_admin", "system_admin"].includes(session.role ?? "");
        const isPublic = grievance.privacyLevel === "public";

        if (!isOwner && !isStaff && !isPublic) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const snap = await adminDb
            .collection("grievanceEvents")
            .where("grievanceId", "==", grievanceId)
            .orderBy("createdAt", "asc")
            .get();

        const events = snap.docs.map((d) => d.data());
        return NextResponse.json({ events });
    } catch (err) {
        console.error("[events GET]", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// ── POST ──────────────────────────────────────────────────────────
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

    const { eventType, payload = {} } = await req.json();

    if (!eventType) {
        return NextResponse.json({ error: "eventType is required" }, { status: 400 });
    }

    // Role-based event type restrictions
    const officerEvents = ["OFFICER_ACKNOWLEDGED", "UPDATE_PROVIDED", "PROOF_UPLOADED", "DELAY_EXPLANATION_SUBMITTED", "COMPLAINT_CLOSED", "ESCALATED"];
    const citizenEvents = ["CITIZEN_FEEDBACK_SUBMITTED", "REOPENED", "SUPPORT_SIGNAL_ADDED"];

    if (officerEvents.includes(eventType) && !["officer", "dept_admin", "system_admin"].includes(session.role ?? "")) {
        return NextResponse.json({ error: "Only officers can write this event type" }, { status: 403 });
    }
    if (citizenEvents.includes(eventType) && !["citizen", "system_admin"].includes(session.role ?? "")) {
        return NextResponse.json({ error: "Only citizens can write this event type" }, { status: 403 });
    }

    try {
        const now = new Date().toISOString();
        const eventId = `${grievanceId}_${eventType}_${Date.now()}`;

        const event = {
            id: eventId,
            grievanceId,
            eventType,
            actorId: session.uid,
            actorRole: session.role ?? "citizen",
            payload,
            createdAt: now,
        };

        // Events are APPEND-ONLY — use create() not set()
        await adminDb.collection("grievanceEvents").doc(eventId).create(event);

        return NextResponse.json({ success: true, event });
    } catch (err) {
        console.error("[events POST]", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
