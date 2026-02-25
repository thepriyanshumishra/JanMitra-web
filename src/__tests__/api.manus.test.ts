import { describe, it, expect } from "vitest";

/**
 * Tests for POST /api/manus/extract validation logic.
 *
 * We test the pure request/response shaping logic in isolation —
 * no Groq API call, no auth middleware needed.
 * Mirrors src/app/api/manus/extract/route.ts validation and fallback.
 */

const CATEGORIES = [
    "Water Supply",
    "Sanitation & Garbage",
    "Roads & Footpaths",
    "Electricity",
    "Public Transport",
    "Health & Hospital",
    "Education",
    "Parks & Recreation",
    "Pollution",
    "Land & Property",
    "Police & Safety",
    "Other",
];

interface ExtractedComplaint {
    category: string;
    title: string;
    description: string;
    location: string;
}

/** Mirrors the message validation in the route handler. */
function validateExtractBody(body: { message?: unknown }): string | null {
    if (!body.message || typeof body.message !== "string") {
        return "message is required";
    }
    return null;
}

/** Mirrors the structural validation of what Groq returns. */
function validateExtractedOutput(output: Partial<ExtractedComplaint>): string | null {
    if (!output.category || !CATEGORIES.includes(output.category)) {
        return `Invalid category: ${output.category}`;
    }
    if (!output.title || output.title.length > 80) {
        return "Title missing or exceeds 80 characters";
    }
    if (!output.description) {
        return "Description is required";
    }
    return null;
}

// ── Tests ─────────────────────────────────────────────────────────

describe("POST /api/manus/extract — body validation", () => {
    it("returns error when message is missing", () => {
        expect(validateExtractBody({})).toBe("message is required");
    });

    it("returns error when message is not a string", () => {
        expect(validateExtractBody({ message: 12345 })).toBe("message is required");
    });

    it("returns null for a valid string message", () => {
        expect(validateExtractBody({ message: "The road near my house has a big pothole" })).toBeNull();
    });

    it("accepts a long complaint description", () => {
        const longText = "My entire street has been without water for 3 days. The municipal tap near Ward 7 is completely dry. Multiple families are affected and we have lodged verbal complaints but nothing happened.";
        expect(validateExtractBody({ message: longText })).toBeNull();
    });
});

describe("Manus extraction output validation", () => {
    it("accepts a valid extracted complaint", () => {
        const output: ExtractedComplaint = {
            category: "Water Supply",
            title: "No water supply for 3 days in Ward 7",
            description: "Residents of Ward 7 have experienced a complete absence of water supply for three consecutive days.",
            location: "Ward 7, MG Nagar",
        };
        expect(validateExtractedOutput(output)).toBeNull();
    });

    it("rejects an invalid category", () => {
        const output = {
            category: "Moon Dust",
            title: "Something weird",
            description: "This is not a valid complaint category.",
            location: "",
        };
        expect(validateExtractedOutput(output)).toContain("Invalid category");
    });

    it("rejects title that exceeds 80 characters", () => {
        const output = {
            category: "Roads & Footpaths",
            title: "This is an extremely long complaint title that exceeds the maximum allowed eighty characters limit",
            description: "Some description.",
            location: "",
        };
        expect(validateExtractedOutput(output)).toContain("80 characters");
    });

    it("rejects missing description", () => {
        const output = {
            category: "Electricity",
            title: "Power cut in sector 5",
            description: "",
            location: "",
        };
        expect(validateExtractedOutput(output)).toBe("Description is required");
    });

    it("covers all 12 valid categories", () => {
        CATEGORIES.forEach((cat) => {
            const output = {
                category: cat,
                title: "Test issue title here",
                description: "A valid description of the complaint.",
                location: "",
            };
            expect(validateExtractedOutput(output)).toBeNull();
        });
    });
});
