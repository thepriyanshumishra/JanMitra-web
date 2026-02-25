/**
 * GET /api/cron/sla-check — runs every hour via Vercel Cron
 * Finds all grievances past their SLA deadline and marks them as breached.
 * Secured with CRON_SECRET header to prevent unauthorized external calls.
 */
import { NextResponse, type NextRequest } from "next/server";
import { adminDb, adminReady } from "@/lib/firebase-admin";

export async function GET(req: NextRequest) {
    // Verify this is called by Vercel Cron (not a random external request)
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!adminReady) {
        return NextResponse.json({ error: "Admin SDK not configured", breached: 0 });
    }

    try {
        const now = new Date().toISOString();

        // Find all non-breached grievances past their deadline
        const snap = await adminDb
            .collection("grievances")
            .where("slaStatus", "!=", "breached")
            .where("status", "not-in", ["closed", "final_closed"])
            .where("slaDeadlineAt", "<", now)
            .limit(100)
            .get();

        if (snap.empty) {
            return NextResponse.json({ message: "No SLA breaches detected", breached: 0 });
        }

        const batch = adminDb.batch();
        let count = 0;

        for (const doc of snap.docs) {
            const grievanceId = doc.id;
            const eventId = `${grievanceId}_SLA_BREACHED_${Date.now()}`;

            // Update grievance status
            batch.update(adminDb.collection("grievances").doc(grievanceId), {
                slaStatus: "breached",
                updatedAt: now,
            });

            // Append SLA_BREACHED event
            batch.create(adminDb.collection("grievanceEvents").doc(eventId), {
                id: eventId,
                grievanceId,
                eventType: "SLA_BREACHED",
                actorId: "system",
                actorRole: "system",
                payload: { breachedAt: now },
                createdAt: now,
            });

            count++;
        }

        await batch.commit();

        console.log(`[cron/sla-check] Marked ${count} grievances as SLA breached`);
        return NextResponse.json({ message: "SLA check complete", breached: count });
    } catch (err) {
        console.error("[cron/sla-check]", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
