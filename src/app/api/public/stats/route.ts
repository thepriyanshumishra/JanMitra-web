/**
 * GET /api/public/stats — aggregated public stats for landing page & transparency dashboard
 * No auth required — returns only public-level aggregates.
 */
import { NextResponse } from "next/server";
import { adminDb, adminReady } from "@/lib/firebase-admin";

export const revalidate = 300; // ISR: cache for 5 minutes

export async function GET() {
    if (!adminReady) {
        // Return placeholder stats when Admin SDK not configured
        return NextResponse.json({
            totalComplaints: 0,
            resolvedOnTime: 0,
            departments: [],
            heatmapData: [],
        });
    }

    try {
        // 1. Total complaints
        const grievancesSnap = await adminDb.collection("grievances").count().get();
        const totalComplaints = grievancesSnap.data().count;

        // 2. Resolved on time
        const resolvedSnap = await adminDb
            .collection("grievances")
            .where("status", "in", ["closed", "final_closed"])
            .where("slaStatus", "==", "on_track")
            .count()
            .get();
        const resolvedOnTime = resolvedSnap.data().count;

        // 3. Department stats
        const deptStatsSnap = await adminDb.collection("departmentStats").get();
        const departments = deptStatsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

        // 4. Heatmap — count of public complaints grouped by ward
        const heatmapSnap = await adminDb
            .collection("grievances")
            .where("privacyLevel", "==", "public")
            .select("location")
            .limit(500)
            .get();

        // Group by ward for heatmap
        const wardCounts: Record<string, number> = {};
        heatmapSnap.docs.forEach((d) => {
            const ward = (d.data().location as Record<string, string>)?.ward;
            if (ward) wardCounts[ward] = (wardCounts[ward] ?? 0) + 1;
        });

        const heatmapData = Object.entries(wardCounts).map(([ward, count]) => ({ ward, count }));

        return NextResponse.json({
            totalComplaints,
            resolvedOnTime,
            slaHonestyRate: totalComplaints > 0 ? Math.round((resolvedOnTime / totalComplaints) * 100) : 0,
            departments,
            heatmapData,
        });
    } catch (err) {
        console.error("[public/stats GET]", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
