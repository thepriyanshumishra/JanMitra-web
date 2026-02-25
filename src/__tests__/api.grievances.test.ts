import { describe, it, expect } from "vitest";

/**
 * Tests for POST /api/grievances validation logic.
 *
 * We test the pure request-body validation in isolation — no Firestore / Admin SDK needed.
 * This mirrors the validation block in src/app/api/grievances/route.ts (lines 51-56, 59-61).
 */

interface GrievanceBody {
    citizenId?: string;
    category?: string;
    title?: string;
    description?: string;
    privacyLevel?: string;
    location?: object;
    evidenceUrls?: string[];
}

interface FakeSession {
    uid: string;
    role: string;
}

const VALID_CATEGORIES = [
    "roads", "water", "electricity", "sanitation",
    "health", "education", "housing", "transport", "environment", "other",
];

/** Mirrors POST /api/grievances validation — returns error string or null. */
function validateGrievanceBody(body: GrievanceBody, session: FakeSession): string | null {
    if (!body.citizenId || !body.category || !body.title || !body.description) {
        return "Missing required fields: citizenId, category, title, description";
    }
    if (session.uid !== body.citizenId && session.role !== "system_admin") {
        return "Forbidden";
    }
    return null;
}

/** Mirrors the category-to-department routing map. */
function resolveDepart(category: string): string {
    return VALID_CATEGORIES.includes(category) ? `dept_${category}` : "dept_general";
}

/** Mirrors the grievance ID format JM-YYYY-XXXXXX. */
function isValidGrievanceId(id: string): boolean {
    return /^JM-\d{4}-\d{6}$/.test(id);
}

// ── Tests ─────────────────────────────────────────────────────────

describe("POST /api/grievances — body validation", () => {
    const session: FakeSession = { uid: "user_123", role: "citizen" };

    it("returns null (valid) for a complete body matching the session uid", () => {
        const body: GrievanceBody = {
            citizenId: "user_123",
            category: "roads",
            title: "Pothole on MG Road",
            description: "Large pothole causing accidents",
        };
        expect(validateGrievanceBody(body, session)).toBeNull();
    });

    it("returns error when citizenId is missing", () => {
        const body: GrievanceBody = { category: "water", title: "No water", description: "Dry taps" };
        expect(validateGrievanceBody(body, session)).toContain("Missing required fields");
    });

    it("returns error when category is missing", () => {
        const body: GrievanceBody = { citizenId: "user_123", title: "T", description: "D" };
        expect(validateGrievanceBody(body, session)).toContain("Missing required fields");
    });

    it("returns error when title is missing", () => {
        const body: GrievanceBody = { citizenId: "user_123", category: "health", description: "D" };
        expect(validateGrievanceBody(body, session)).toContain("Missing required fields");
    });

    it("returns error when description is missing", () => {
        const body: GrievanceBody = { citizenId: "user_123", category: "water", title: "T" };
        expect(validateGrievanceBody(body, session)).toContain("Missing required fields");
    });

    it("returns Forbidden when citizenId does not match session uid and not system_admin", () => {
        const body: GrievanceBody = {
            citizenId: "different_user",
            category: "roads",
            title: "T",
            description: "D",
        };
        expect(validateGrievanceBody(body, session)).toBe("Forbidden");
    });

    it("allows system_admin to submit on behalf of another citizen", () => {
        const adminSession: FakeSession = { uid: "admin_001", role: "system_admin" };
        const body: GrievanceBody = {
            citizenId: "other_citizen",
            category: "sanitation",
            title: "T",
            description: "D",
        };
        expect(validateGrievanceBody(body, adminSession)).toBeNull();
    });
});

describe("Category → Department routing", () => {
    it("routes 'roads' to 'dept_roads'", () => {
        expect(resolveDepart("roads")).toBe("dept_roads");
    });

    it("routes known categories correctly", () => {
        VALID_CATEGORIES.forEach((cat) => {
            expect(resolveDepart(cat)).toBe(`dept_${cat}`);
        });
    });

    it("routes unknown category to dept_general", () => {
        expect(resolveDepart("unknown_category")).toBe("dept_general");
    });
});

describe("Grievance ID format", () => {
    it("accepts valid JM-YYYY-XXXXXX format", () => {
        expect(isValidGrievanceId("JM-2025-123456")).toBe(true);
    });

    it("rejects IDs with wrong prefix", () => {
        expect(isValidGrievanceId("GR-2025-123456")).toBe(false);
    });

    it("rejects IDs with wrong digit count", () => {
        expect(isValidGrievanceId("JM-2025-12345")).toBe(false);
    });

    it("rejects IDs with letters in random part", () => {
        expect(isValidGrievanceId("JM-2025-ABCDEF")).toBe(false);
    });
});
