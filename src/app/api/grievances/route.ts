import { NextResponse, type NextRequest } from "next/server";

// ── ID generator ─────────────────────────────────────────────────
function generateGrievanceId(): string {
    const year = new Date().getFullYear();
    const rand = Math.floor(100000 + Math.random() * 900000);
    return `JM-${year}-${rand}`;
}

// ── POST /api/grievances ──────────────────────────────────────────
export async function POST(req: NextRequest) {
    try {
        const sessionCookie = req.cookies.get("jm_session")?.value;
        if (!sessionCookie) {
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

        // SLA: 7 days from now
        const now = new Date();
        const slaDeadlineAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        const grievanceId = generateGrievanceId();
        const grievanceData = {
            id: grievanceId,
            citizenId,
            category,
            title,
            description,
            location: location ?? { address: "" },
            privacyLevel,
            isDelegated,
            ...(isDelegated && delegatedFor ? { delegatedFor } : {}),
            evidenceUrls,
            status: "submitted",
            slaStatus: "on_track",
            slaDeadlineAt: slaDeadlineAt.toISOString(),
            supportCount: 0,
            reopenCount: 0,
            createdAt: now.toISOString(),
            updatedAt: now.toISOString(),
        };

        // MVP: returns ID + data for client SDK to write directly to Firestore.
        // Production upgrade: use Firebase Admin SDK with service account for
        // server-side Firestore writes + proper JWT verification.
        return NextResponse.json({
            success: true,
            grievanceId,
            grievanceData,
            slaDeadlineAt: slaDeadlineAt.toISOString(),
        });
    } catch (err) {
        console.error("[api/grievances POST]", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// ── GET /api/grievances?citizenId=xxx ─────────────────────────────
export async function GET(req: NextRequest) {
    const { searchParams } = req.nextUrl;
    const citizenId = searchParams.get("citizenId");

    if (!citizenId) {
        return NextResponse.json({ error: "citizenId required" }, { status: 400 });
    }

    // MVP: Return empty until Phase 3 connects the Firestore query
    return NextResponse.json({ grievances: [] });
}
