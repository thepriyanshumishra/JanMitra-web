import { describe, it, expect } from "vitest";

/**
 * Tests for the /api/notify payload validation logic.
 * We test the pure validation function in isolation — no HTTP calls needed.
 */

interface NotifyPayload {
    to?: string;
    citizenName?: string;
    grievanceId?: string;
    eventType?: string;
    extra?: Record<string, string>;
}

const VALID_EVENT_TYPES = new Set([
    "SUBMITTED", "ROUTED", "STATUS_UPDATED",
    "ESCALATED", "PROOF_UPLOADED", "CLOSED", "DELAY_EXPLAINED",
]);

/**
 * Mirrors the validation in the route handler.
 * Returns an error string or null if valid.
 */
function validateNotifyPayload(body: NotifyPayload): string | null {
    if (!body.to) return "Missing field: to";
    if (!body.grievanceId) return "Missing field: grievanceId";
    if (!body.eventType) return "Missing field: eventType";
    if (!VALID_EVENT_TYPES.has(body.eventType)) return `Unknown eventType: ${body.eventType}`;
    return null;
}

// ── Tests ─────────────────────────────────────────────────────────

describe("validateNotifyPayload()", () => {
    it("returns no error for a fully valid payload", () => {
        expect(validateNotifyPayload({
            to: "citizen@example.com",
            citizenName: "Aarav",
            grievanceId: "JM-001",
            eventType: "SUBMITTED",
        })).toBeNull();
    });

    it("returns error when 'to' is missing", () => {
        expect(validateNotifyPayload({
            grievanceId: "JM-001",
            eventType: "CLOSED",
        })).toBe("Missing field: to");
    });

    it("returns error when 'grievanceId' is missing", () => {
        expect(validateNotifyPayload({
            to: "a@b.com",
            eventType: "ESCALATED",
        })).toBe("Missing field: grievanceId");
    });

    it("returns error when 'eventType' is missing", () => {
        expect(validateNotifyPayload({
            to: "a@b.com",
            grievanceId: "JM-007",
        })).toBe("Missing field: eventType");
    });

    it("returns error for unknown eventType", () => {
        expect(validateNotifyPayload({
            to: "a@b.com",
            grievanceId: "JM-007",
            eventType: "HACKED",
        })).toBe("Unknown eventType: HACKED");
    });

    it("accepts all 7 valid event types", () => {
        const types = ["SUBMITTED", "ROUTED", "STATUS_UPDATED", "ESCALATED", "PROOF_UPLOADED", "CLOSED", "DELAY_EXPLAINED"];
        types.forEach((eventType) => {
            expect(validateNotifyPayload({ to: "a@b.com", grievanceId: "JM-001", eventType })).toBeNull();
        });
    });

    it("accepts optional extra field without error", () => {
        expect(validateNotifyPayload({
            to: "a@b.com",
            grievanceId: "JM-001",
            eventType: "STATUS_UPDATED",
            extra: { newStatus: "in_progress", message: "Working on it" },
        })).toBeNull();
    });
});
