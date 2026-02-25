/**
 * Firestore Seed Script
 * Run with: npx ts-node --project tsconfig.seed.json scripts/seed-firestore.ts
 *
 * Creates: 5 departments, 3 demo users, 10 demo grievances + events + departmentStats
 */
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

// ─── Init ─────────────────────────────────────────────────────────
const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_KEY!);
if (!getApps().length) {
    initializeApp({ credential: cert(serviceAccount) });
}
const db = getFirestore();

// ─── Data ─────────────────────────────────────────────────────────
const DEPARTMENTS = [
    { id: "water-supply", name: "Water Supply", slug: "water-supply", description: "Handles all water distribution and supply issues.", slaDays: 5, headOfficerName: "Ramesh Kumar", active: true },
    { id: "electricity", name: "Electricity Department", slug: "electricity", description: "Power supply, meter, and billing complaints.", slaDays: 3, headOfficerName: "Anjali Singh", active: true },
    { id: "sanitation", name: "Sanitation & Waste", slug: "sanitation", description: "Garbage collection, drainage, and cleanliness.", slaDays: 4, headOfficerName: "Vikram Patel", active: true },
    { id: "roads-transport", name: "Roads & Transport", slug: "roads-transport", description: "Road repairs, potholes, and traffic issues.", slaDays: 7, headOfficerName: "Priya Sharma", active: true },
    { id: "public-parks", name: "Public Parks & Gardens", slug: "public-parks", description: "Maintenance of parks, trees, and green spaces.", slaDays: 10, headOfficerName: "Arjun Mehta", active: true },
];

const USERS = [
    {
        id: "demo-citizen-001",
        firebaseUid: "demo-citizen-001",
        name: "Aarav Sharma",
        email: "citizen@demo.janmitra.in",
        role: "citizen",
        phone: "+91-9876543210",
        createdAt: new Date("2024-01-01").toISOString(),
    },
    {
        id: "demo-officer-001",
        firebaseUid: "demo-officer-001",
        name: "Pooja Nair",
        email: "officer@demo.janmitra.in",
        role: "officer",
        phone: "+91-9876543211",
        departmentId: "water-supply",
        createdAt: new Date("2024-01-01").toISOString(),
    },
    {
        id: "demo-admin-001",
        firebaseUid: "demo-admin-001",
        name: "Rahul Verma",
        email: "admin@demo.janmitra.in",
        role: "dept_admin",
        phone: "+91-9876543212",
        departmentId: "sanitation",
        createdAt: new Date("2024-01-01").toISOString(),
    },
];

const now = new Date();
const daysAgo = (n: number) => new Date(now.getTime() - n * 86400000).toISOString();
const deadlineAt = (startDaysAgo: number, slaDays: number) =>
    new Date(now.getTime() - startDaysAgo * 86400000 + slaDays * 86400000).toISOString();

const GRIEVANCES = [
    {
        id: "JM-DEMO-0001",
        citizenId: "demo-citizen-001",
        category: "Water Supply",
        title: "No water supply in Block 12 for 3 days",
        description: "Water supply has been completely cut off since Monday. Please resolve urgently.",
        departmentId: "water-supply",
        status: "in_progress",
        slaStatus: "at_risk",
        slaDeadlineAt: deadlineAt(4, 5),
        privacyLevel: "public",
        location: { address: "Block 12, Sector 5, Indore", ward: "Sector 5" },
        supportCount: 12,
        createdAt: daysAgo(4),
        updatedAt: daysAgo(1),
    },
    {
        id: "JM-DEMO-0002",
        citizenId: "demo-citizen-001",
        category: "Electricity",
        title: "Frequent power cuts in Lane 7 — transformer issue",
        description: "Daily 4-6 hour power cuts since last week due to faulty transformer.",
        departmentId: "electricity",
        status: "escalated",
        slaStatus: "breached",
        slaDeadlineAt: deadlineAt(10, 3),
        privacyLevel: "public",
        location: { address: "Lane 7, MG Road, Indore", ward: "MG Road" },
        supportCount: 34,
        createdAt: daysAgo(10),
        updatedAt: daysAgo(2),
    },
    {
        id: "JM-DEMO-0003",
        citizenId: "demo-citizen-001",
        category: "Sanitation",
        title: "Garbage not collected for 5 days in Sector 3",
        description: "The scheduled garbage van has not come in 5 days. Waste is overflowing.",
        departmentId: "sanitation",
        status: "closed",
        slaStatus: "on_track",
        slaDeadlineAt: deadlineAt(15, 4),
        privacyLevel: "public",
        location: { address: "Sector 3, Vijay Nagar, Indore", ward: "Vijay Nagar" },
        supportCount: 8,
        closedAt: daysAgo(2),
        createdAt: daysAgo(15),
        updatedAt: daysAgo(2),
        feedback: { rating: 4, comment: "Resolved but took a bit long.", timestamp: daysAgo(2) },
    },
    {
        id: "JM-DEMO-0004",
        citizenId: "demo-citizen-001",
        category: "Roads & Transport",
        title: "Large pothole on Main Road near school causing accidents",
        description: "A 3-foot pothole near City Primary School has already caused 2 bike accidents.",
        departmentId: "roads-transport",
        status: "acknowledged",
        slaStatus: "on_track",
        slaDeadlineAt: deadlineAt(2, 7),
        privacyLevel: "public",
        location: { address: "Main Road, Near City Primary School, Indore", ward: "City Center" },
        supportCount: 56,
        createdAt: daysAgo(2),
        updatedAt: daysAgo(1),
    },
    {
        id: "JM-DEMO-0005",
        citizenId: "demo-citizen-001",
        category: "Water Supply",
        title: "Contaminated drinking water supply — brown water",
        description: "Water from municipal supply has turned brown in color. Unusable.",
        departmentId: "water-supply",
        status: "submitted",
        slaStatus: "on_track",
        slaDeadlineAt: deadlineAt(1, 5),
        privacyLevel: "restricted",
        location: { address: "Flat 302, Green Valley Apartments, Indore", ward: "Green Valley" },
        supportCount: 0,
        createdAt: daysAgo(1),
        updatedAt: daysAgo(1),
    },
    {
        id: "JM-DEMO-0006",
        citizenId: "demo-citizen-001",
        category: "Public Parks",
        title: "Broken playground equipment in Nehru Garden",
        description: "The swings and slide are broken and rusty — children could get injured.",
        departmentId: "public-parks",
        status: "routed",
        slaStatus: "on_track",
        slaDeadlineAt: deadlineAt(1, 10),
        privacyLevel: "public",
        location: { address: "Nehru Garden, Palasia, Indore", ward: "Palasia" },
        supportCount: 3,
        createdAt: daysAgo(1),
        updatedAt: daysAgo(0),
    },
    {
        id: "JM-DEMO-0007",
        citizenId: "demo-citizen-001",
        category: "Electricity",
        title: "Street lights not working on entire Ring Road stretch",
        description: "4 km stretch of Ring Road has no street lighting since 2 weeks. Dangerous at night.",
        departmentId: "electricity",
        status: "closed",
        slaStatus: "on_track",
        slaDeadlineAt: deadlineAt(20, 3),
        privacyLevel: "public",
        location: { address: "Ring Road, Scheme 54, Indore", ward: "Ring Road" },
        supportCount: 28,
        closedAt: daysAgo(10),
        createdAt: daysAgo(20),
        updatedAt: daysAgo(10),
        feedback: { rating: 5, comment: "Excellent response! Fixed in 10 days.", timestamp: daysAgo(10) },
    },
    {
        id: "JM-DEMO-0008",
        citizenId: "demo-citizen-001",
        category: "Sanitation",
        title: "Open drain overflow near hospital causing health hazard",
        description: "The drain has been overflowing for a week near City Hospital. Dengue risk.",
        departmentId: "sanitation",
        status: "escalated",
        slaStatus: "breached",
        slaDeadlineAt: deadlineAt(8, 4),
        privacyLevel: "public",
        location: { address: "Near City Hospital, Snehlataganj, Indore", ward: "Snehlataganj" },
        supportCount: 67,
        createdAt: daysAgo(8),
        updatedAt: daysAgo(1),
    },
    {
        id: "JM-DEMO-0009",
        citizenId: "demo-citizen-001",
        category: "Roads & Transport",
        title: "Missing road sign at dangerous intersection",
        description: "The stop sign at the junction of LIG Main and A.B. Road is missing since a month.",
        departmentId: "roads-transport",
        status: "in_progress",
        slaStatus: "on_track",
        slaDeadlineAt: deadlineAt(3, 7),
        privacyLevel: "public",
        location: { address: "LIG Main Road & AB Road Junction, Indore", ward: "LIG" },
        supportCount: 11,
        createdAt: daysAgo(3),
        updatedAt: daysAgo(1),
    },
    {
        id: "JM-DEMO-0010",
        citizenId: "demo-citizen-001",
        category: "Water Supply",
        title: "Water meter installed incorrectly — billing errors",
        description: "The new water meter installed last month is showing incorrect units leading to ₹2000+ extra bills.",
        departmentId: "water-supply",
        status: "assigned",
        slaStatus: "on_track",
        slaDeadlineAt: deadlineAt(2, 5),
        privacyLevel: "private",
        location: { address: "H-45 Scheme 74C, Vijay Nagar, Indore", ward: "Vijay Nagar" },
        supportCount: 0,
        createdAt: daysAgo(2),
        updatedAt: daysAgo(1),
    },
];

// ─── Seeder ───────────────────────────────────────────────────────
async function seed() {
    console.log("🌱 Starting seed...\n");
    const batch = db.batch();

    // Departments
    for (const dept of DEPARTMENTS) {
        batch.set(db.collection("departments").doc(dept.id), {
            ...dept,
            createdAt: daysAgo(60),
            updatedAt: daysAgo(60),
        });
        // Department stats
        const grievancesForDept = GRIEVANCES.filter(g => g.departmentId === dept.id);
        const resolved = grievancesForDept.filter(g => g.status === "closed").length;
        batch.set(db.collection("departmentStats").doc(dept.id), {
            name: dept.name,
            totalComplaints: grievancesForDept.length,
            resolvedOnTime: resolved,
            breachedCount: grievancesForDept.filter(g => g.slaStatus === "breached").length,
            escalatedCount: grievancesForDept.filter(g => g.status === "escalated").length,
            slaScore: grievancesForDept.length > 0 ? Math.round((resolved / grievancesForDept.length) * 100) : 0,
            updatedAt: new Date().toISOString(),
        });
    }
    console.log("✅ Departments + stats queued");

    // Users
    for (const user of USERS) {
        batch.set(db.collection("users").doc(user.id), user);
    }
    console.log("✅ Users queued");

    // Grievances + first events
    for (const g of GRIEVANCES) {
        const { id, ...data } = g;
        batch.set(db.collection("grievances").doc(id), data);
        // GRIEVANCE_SUBMITTED event
        batch.set(db.collection("grievances").doc(id).collection("events").doc(`${id}_SUBMITTED`), {
            type: "GRIEVANCE_SUBMITTED",
            actorId: "demo-citizen-001",
            actorName: "Aarav Sharma",
            timestamp: data.createdAt,
            payload: { category: data.category, departmentId: data.departmentId },
        });
        // ROUTED event if status > submitted
        if (data.status !== "submitted") {
            batch.set(db.collection("grievances").doc(id).collection("events").doc(`${id}_ROUTED`), {
                type: "ROUTED_TO_DEPARTMENT",
                actorId: "system",
                actorName: "JanMitra System",
                timestamp: data.createdAt,
                payload: { departmentId: data.departmentId },
            });
        }
        // CLOSED event if closed
        if (data.status === "closed" && (data as Record<string, unknown>).closedAt) {
            batch.set(db.collection("grievances").doc(id).collection("events").doc(`${id}_CLOSED`), {
                type: "RESOLVED",
                actorId: "demo-officer-001",
                actorName: "Pooja Nair",
                timestamp: (data as Record<string, unknown>).closedAt,
                payload: { message: "Issue has been resolved. Please verify." },
            });
        }
    }
    console.log("✅ Grievances + events queued");

    await batch.commit();
    console.log("\n🎉 Seed complete! All documents written to Firestore.");
}

seed().catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
});
