import { NextResponse, type NextRequest } from "next/server";
import { adminDb, adminReady } from "@/lib/firebase-admin";
import { validateSession } from "@/lib/auth-middleware";
import { FieldValue } from "firebase-admin/firestore";

// ── Category → Department routing map ────────────────────────────
const CATEGORY_TO_DEPT: Record<string, string> = {
    roads: "dept_roads",
    water: "dept_water",
    electricity: "dept_electricity",
    sanitation: "dept_sanitation",
    health: "dept_health",
    education: "dept_education",
    housing: "dept_housing",
    transport: "dept_transport",
    environment: "dept_environment",
    other: "dept_general",
};

// ── ID generator ─────────────────────────────────────────────────
function generateGrievanceId(): string {
    const year = new Date().getFullYear();
    const rand = Math.floor(100000 + Math.random() * 900000);
    return `JM-${year}-${rand}`;
}

// ── POST /api/grievances ──────────────────────────────────────────
export async function POST(req: NextRequest) {
    try {
        let session;
        try {
            session = await validateSession(req);
        } catch (e) {
            if (e instanceof Response) return e;
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const {
            citizenId,
            category,
            title,
            description,
            location,
            privacyLevel = "public",
            isDelegated = false,
            delegatedFor,
            evidenceUrls = [],
        } = body;

        if (!citizenId || !category || !title || !description) {
            return NextResponse.json(
                { error: "Missing required fields: citizenId, category, title, description" },
                { status: 400 }
            );
        }

        // Ensure the citizen can only create complaints for themselves
        if (session.uid !== citizenId && session.role !== "system_admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const now = new Date();
        const slaDeadlineAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        const grievanceId = generateGrievanceId();
        const departmentId = CATEGORY_TO_DEPT[category] ?? "dept_general";

        const grievanceData = {
            id: grievanceId,
            citizenId,
            category,
            title,
            description,
            location: location ?? { addressText: "" },
            privacyLevel,
            isDelegated,
            ...(isDelegated && delegatedFor ? { openedForId: delegatedFor } : {}),
            evidenceUrls,
            departmentId,
            status: "submitted",
            slaStatus: "on_track",
            slaDeadlineAt: slaDeadlineAt.toISOString(),
            supportCount: 0,
            reopenCount: 0,
            createdAt: now.toISOString(),
            updatedAt: now.toISOString(),
        };

        const eventData = {
            id: `${grievanceId}_SUBMITTED`,
            grievanceId,
            eventType: "GRIEVANCE_SUBMITTED",
            actorId: citizenId,
            actorRole: "citizen",
            payload: { category, departmentId, privacyLevel },
            createdAt: now.toISOString(),
        };

        if (adminReady) {
            // Atomic batch write: grievance + first event
            const batch = adminDb.batch();
            batch.set(adminDb.collection("grievances").doc(grievanceId), grievanceData);
            batch.set(adminDb.collection("grievanceEvents").doc(eventData.id), eventData);
            // Increment dept stats
            batch.set(
                adminDb.collection("departmentStats").doc(departmentId),
                { totalComplaints: FieldValue.increment(1), updatedAt: now.toISOString() },
                { merge: true }
            );
            await batch.commit();
        }

        return NextResponse.json({ success: true, grievanceId, grievanceData, slaDeadlineAt: slaDeadlineAt.toISOString() });
    } catch (err) {
        console.error("[api/grievances POST]", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// ── GET /api/grievances ───────────────────────────────────────────
// ?citizenId=xxx  — own complaints (citizen)
// ?departmentId=xxx&status=xxx — officer/admin queue
export async function GET(req: NextRequest) {
    // Validate session
    let session;
    try {
        session = await validateSession(req);
    } catch (e) {
        if (e instanceof Response) return e;
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!adminReady) {
        return NextResponse.json({ grievances: [], note: "Admin SDK not configured" });
    }

    const { searchParams } = req.nextUrl;
    const citizenId = searchParams.get("citizenId");
    const departmentId = searchParams.get("departmentId");
    const status = searchParams.get("status");
    const limitVal = Math.min(parseInt(searchParams.get("limit") ?? "20"), 100);

    try {
        let query = adminDb.collection("grievances").limit(limitVal) as FirebaseFirestore.Query;

        if (citizenId) {
            // Citizen viewing their own
            if (session.uid !== citizenId && session.role !== "system_admin") {
                return NextResponse.json({ error: "Forbidden" }, { status: 403 });
            }
            query = query.where("citizenId", "==", citizenId).orderBy("createdAt", "desc");
        } else if (departmentId) {
            // Officer/admin viewing dept queue
            if (!["officer", "dept_admin", "system_admin"].includes(session.role ?? "")) {
                return NextResponse.json({ error: "Forbidden" }, { status: 403 });
            }
            query = query.where("departmentId", "==", departmentId);
            if (status) query = query.where("status", "==", status);
            query = query.orderBy("slaDeadlineAt", "asc");
        } else {
            return NextResponse.json({ error: "citizenId or departmentId required" }, { status: 400 });
        }

        const snap = await query.get();
        const grievances = snap.docs.map((d) => d.data());
        return NextResponse.json({ grievances });
    } catch (err) {
        console.error("[api/grievances GET]", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
